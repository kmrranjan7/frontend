import { NextResponse } from "next/server";
import { env } from "@/config/env";
import { dashboardAuthHeaders } from "@/lib/auth/session";

export async function GET() {
  try {
    const response = await fetch(`${env.backendApiUrl}/api/v1/latest-news`, { cache: "no-store" });
    return new NextResponse(await response.text(), {
      status: response.status,
      headers: { "Content-Type": response.headers.get("content-type") ?? "application/json" },
    });
  } catch {
    return NextResponse.json({ success: false, message: "Latest news service is unavailable." }, { status: 502 });
  }
}

export async function POST(request: Request) {
  try {
    const response = await fetch(`${env.backendApiUrl}/api/v1/latest-news`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...(await dashboardAuthHeaders()) },
      body: await request.text(),
      cache: "no-store",
    });
    return new NextResponse(await response.text(), {
      status: response.status,
      headers: { "Content-Type": response.headers.get("content-type") ?? "application/json" },
    });
  } catch {
    return NextResponse.json({ success: false, message: "Latest news service is unavailable." }, { status: 502 });
  }
}
