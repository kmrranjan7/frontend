import { NextResponse } from "next/server";

const backendOrigin = process.env.NEXT_PUBLIC_BACKEND_API_URL?.replace(/\/$/, "");

export async function POST(request: Request) {
  if (!backendOrigin) {
    return NextResponse.json(
      { success: false, message: "The backend API URL is not configured." },
      { status: 500 },
    );
  }

  try {
    const payload = await request.json();
    const response = await fetch(`${backendOrigin}/api/v1/posts`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      cache: "no-store",
    });

    const responseText = await response.text();
    const responsePayload = responseText
      ? JSON.parse(responseText)
      : { success: response.ok };

    return NextResponse.json(responsePayload, { status: response.status });
  } catch (error) {
    console.error("Post creation proxy failed", error);
    return NextResponse.json(
      {
        success: false,
        message: "The post service is unavailable. Please check the backend connection and try again.",
      },
      { status: 502 },
    );
  }
}
