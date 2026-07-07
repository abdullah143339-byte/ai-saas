import { auth } from "./auth";
import { prisma } from "./prisma";

const LIMITS = {
  free: { chat: 50, image: 10, summary: 5 },
  pro: { chat: Infinity, image: Infinity, summary: Infinity },
  enterprise: { chat: Infinity, image: Infinity, summary: Infinity },
};

const RESET_INTERVAL = 12 * 60 * 60 * 1000;

type Feature = "chat" | "image" | "summary";

export async function checkAndIncrement(feature: Feature) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Unauthorized. Please log in.", status: 401 };
  }

  let profile = await prisma.profile.findUnique({
    where: { userId: session.user.id },
  });

  if (!profile) {
    profile = await prisma.profile.create({
      data: { userId: session.user.id },
    });
  }

  const adminEmail = process.env.ADMIN_EMAIL;
  if (session.user.email === adminEmail) {
    return { error: null, status: 200 };
  }

  const now = new Date();
  if (now.getTime() - new Date(profile.lastReset).getTime() > RESET_INTERVAL) {
    profile = await prisma.profile.update({
      where: { userId: session.user.id },
      data: { chatUsage: 0, imageUsage: 0, summaryUsage: 0, lastReset: now },
    });
  }

  const tier = (profile.tier || "free") as keyof typeof LIMITS;
  const limits = LIMITS[tier] || LIMITS.free;
  const usageMap = { chat: "chatUsage", image: "imageUsage", summary: "summaryUsage" } as const;
  const fieldForRead = usageMap[feature];
  const current = profile[fieldForRead];
  const limit = limits[feature];

  if (current >= limit) {
    return {
      error: `${feature === "chat" ? "Chat" : feature === "image" ? "Image generation" : "Summary"} limit reached (${current}/${limit === Infinity ? "unlimited" : limit}). Try again after limit reset.`,
      status: 403,
    };
  }

  await prisma.profile.update({
    where: { userId: session.user.id },
    data: { [fieldForRead]: { increment: 1 } },
  });

  return { error: null, status: 200 };
}
