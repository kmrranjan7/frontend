import { NextResponse } from "next/server";
import { dashboardAuthHeaders } from "@/lib/auth/session";

const backendOrigin = process.env.NEXT_PUBLIC_BACKEND_API_URL?.replace(/\/$/, "");

async function proxyUserRequest(
  request: Request,
  { params }: { params: Promise<{ userId: string }> },
  method: "PUT" | "DELETE",
) {
  if (!backendOrigin) {
    return NextResponse.json(
      { success: false, message: "The backend API URL is not configured." },
      { status: 500 },
    );
  }

  const { userId } = await params;

  try {
    const response = await fetch(`${backendOrigin}/api/v1/users/${encodeURIComponent(userId)}`, {
      method,
      headers: {
        ...(method === "PUT" ? { "Content-Type": "application/json" } : {}),
        ...(await dashboardAuthHeaders()),
      },
      body: method === "PUT" ? await request.text() : undefined,
      cache: "no-store",
    });
    const responseText = await response.text();
    const payload = responseText ? JSON.parse(responseText) : { success: response.ok };
    return NextResponse.json(payload, { status: response.status });
  } catch (error) {
    console.error(`User ${method.toLowerCase()} proxy failed`, error);
    return NextResponse.json(
      { success: false, message: "The user service is unavailable. Please try again." },
      { status: 502 },
    );
  }
}

export function PUT(request: Request, context: { params: Promise<{ userId: string }> }) {
  return proxyUserRequest(request, context, "PUT");
}

export function DELETE(request: Request, context: { params: Promise<{ userId: string }> }) {
  return proxyUserRequest(request, context, "DELETE");
}
