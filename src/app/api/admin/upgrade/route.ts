import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const session = await auth();
    const adminEmail = process.env.ADMIN_EMAIL;
    if (!adminEmail || session?.user?.email !== adminEmail) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { email, tier } = await request.json();

    if (!email || !tier || !["pro", "enterprise"].includes(tier)) {
      return NextResponse.json({ error: "Invalid email or tier" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    await prisma.profile.upsert({
      where: { userId: user.id },
      update: { tier, chatUsage: 0, imageUsage: 0, summaryUsage: 0, lastReset: new Date() },
      create: { userId: user.id, tier },
    });

    return NextResponse.json({ success: true, message: `${email} upgraded to ${tier}` });
  } catch (error) {
    console.error("Upgrade error:", error);
    return NextResponse.json(
      { error: "Failed to upgrade user" },
      { status: 500 }
    );
  }
}
