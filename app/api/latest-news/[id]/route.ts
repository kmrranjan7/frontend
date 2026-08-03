import { NextResponse } from "next/server";
import { env } from "@/config/env";
import { dashboardAuthHeaders } from "@/lib/auth/session";

async function forward(method: "PUT" | "DELETE", request: Request, id: string) {
  try {
    const response = await fetch(`${env.backendApiUrl}/api/v1/latest-news/${encodeURIComponent(id)}`, {
      method,
      headers: { ...(method === "PUT" ? { "Content-Type": "application/json" } : {}), ...(await dashboardAuthHeaders()) },
      ...(method === "PUT" ? { body: await request.text() } : {}),
      cache: "no-store",
    });
    return new NextResponse(await response.text(), { status: response.status, headers: { "Content-Type": response.headers.get("content-type") ?? "application/json" } });
  } catch {
    return NextResponse.json({ success: false, message: "Latest news service is unavailable." }, { status: 502 });
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  return forward("PUT", request, (await params).id);
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  return forward("DELETE", request, (await params).id);
}
