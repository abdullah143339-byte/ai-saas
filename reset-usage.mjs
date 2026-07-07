import { prisma } from "./src/lib/prisma";

async function main() {
  await prisma.profile.updateMany({
    data: { chatUsage: 0, imageUsage: 0, summaryUsage: 0 },
  });
  console.log("All usage counters reset to 0");
}

main().catch(console.error).finally(() => prisma.$disconnect());
