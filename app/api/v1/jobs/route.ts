import { NextResponse } from "next/server";

const backendOrigin = process.env.NEXT_PUBLIC_BACKEND_API_URL?.replace(/\/$/, "");
const allowedParameters = new Set([
  "postType",
  "status",
  "search",
  "sortDir",
  "page",
  "size",
]);

export async function GET(request: Request) {
  if (!backendOrigin) {
    return NextResponse.json(
      { success: false, message: "The backend API URL is not configured." },
      { status: 500 },
    );
  }

  const incoming = new URL(request.url).searchParams;
  const query = new URLSearchParams();

  incoming.forEach((value, key) => {
    if (allowedParameters.has(key)) query.set(key, value);
  });

  try {
    const response = await fetch(`${backendOrigin}/api/v1/jobs?${query}`, {
      cache: "no-store",
    });
    const body = await response.text();

    return new NextResponse(body, {
      status: response.status,
      headers: {
        "Content-Type": response.headers.get("Content-Type") ?? "application/json",
        "X-Cache": response.headers.get("X-Cache") ?? "",
      },
    });
  } catch {
    return NextResponse.json(
      {
        success: false,
        message: "The jobs service is temporarily unavailable. Please try again.",
      },
      { status: 502 },
    );
  }
}
