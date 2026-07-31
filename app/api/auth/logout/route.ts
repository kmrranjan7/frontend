import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { DASHBOARD_SESSION_COOKIE } from "@/lib/auth/session";

export async function POST() {
  (await cookies()).delete(DASHBOARD_SESSION_COOKIE);
  return NextResponse.json({ success: true, message: "Signed out successfully" });
}
