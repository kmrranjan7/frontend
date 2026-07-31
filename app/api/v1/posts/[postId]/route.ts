import { NextResponse } from "next/server";
import { dashboardAuthHeaders } from "@/lib/auth/session";

const backendOrigin = process.env.NEXT_PUBLIC_BACKEND_API_URL?.replace(/\/$/, "");

async function proxyPostRequest(
  request: Request,
  { params }: { params: Promise<{ postId: string }> },
  method: "GET" | "PUT" | "DELETE",
) {
  if (!backendOrigin) {
    return NextResponse.json(
      { success: false, message: "The backend API URL is not configured." },
      { status: 500 },
    );
  }

  const { postId } = await params;

  try {
    const response = await fetch(
      `${backendOrigin}/api/v1/posts/${encodeURIComponent(postId)}`,
      {
        method,
        headers: {
          ...(method === "PUT" ? { "Content-Type": "application/json" } : {}),
          ...(await dashboardAuthHeaders()),
        },
        body: method === "PUT" ? await request.text() : undefined,
        cache: "no-store",
      },
    );
    const responseText = await response.text();
    const payload = responseText ? JSON.parse(responseText) : { success: response.ok };
    return NextResponse.json(payload, { status: response.status });
  } catch (error) {
    console.error(`Post ${method.toLowerCase()} proxy failed`, error);
    return NextResponse.json(
      { success: false, message: "The post service is unavailable. Please try again." },
      { status: 502 },
    );
  }
}

export function GET(request: Request, context: { params: Promise<{ postId: string }> }) {
  return proxyPostRequest(request, context, "GET");
}

export function PUT(request: Request, context: { params: Promise<{ postId: string }> }) {
  return proxyPostRequest(request, context, "PUT");
}

export function DELETE(request: Request, context: { params: Promise<{ postId: string }> }) {
  return proxyPostRequest(request, context, "DELETE");
}
