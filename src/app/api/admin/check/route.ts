import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export async function GET() {
  const session = await auth();
  const adminEmail = process.env.ADMIN_EMAIL;
  const isAdmin = !!adminEmail && session?.user?.email === adminEmail;
  return NextResponse.json({ isAdmin });
}
