import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { env } from "@/config/env";
import { DASHBOARD_SESSION_COOKIE } from "@/lib/auth/session";

type LoginResponse = {
  success: boolean;
  message: string;
  data?: {
    token: string;
    expiresIn: number;
    user: { id: string | number; firstName: string; lastName: string; email: string };
  };
};

export async function POST(request: Request) {
  try {
    const credentials = await request.json();
    const response = await fetch(`${env.backendApiUrl}/api/v1/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(credentials),
      cache: "no-store",
    });
    const payload = await response.json() as LoginResponse;

    if (!response.ok || !payload.success || !payload.data?.token) {
      return NextResponse.json(payload, { status: response.status });
    }

    (await cookies()).set(DASHBOARD_SESSION_COOKIE, payload.data.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: payload.data.expiresIn,
      priority: "high",
    });

    return NextResponse.json({
      success: true,
      message: "Login successful",
      data: { user: payload.data.user },
    });
  } catch {
    return NextResponse.json(
      { success: false, message: "Login service is unavailable. Please try again." },
      { status: 502 },
    );
  }
}
