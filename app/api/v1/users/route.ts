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
    const response = await fetch(`${backendOrigin}/api/v1/users`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: await request.text(),
      cache: "no-store",
    });
    const responseText = await response.text();
    const payload = responseText ? JSON.parse(responseText) : { success: response.ok };
    return NextResponse.json(payload, { status: response.status });
  } catch (error) {
    console.error("User creation proxy failed", error);
    return NextResponse.json(
      { success: false, message: "The user service is unavailable. Please try again." },
      { status: 502 },
    );
  }
}
