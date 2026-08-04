import { NextResponse } from "next/server";
import { hasValidDashboardSession } from "@/lib/auth/session";

const WINDOW_MS = 10 * 60 * 1000;
const MAX_REQUESTS = 5;
const requests = new Map<string, number[]>();

function sanitizeHtml(value: string) {
  return value
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, "")
    .replace(/\s+on[a-z]+\s*=\s*(?:"[^"]*"|'[^']*')/gi, "")
    .replace(/\s+(?:href|src)\s*=\s*(["'])\s*javascript:[\s\S]*?\1/gi, "");
}

function outputText(payload: unknown): string {
  if (!payload || typeof payload !== "object") return "";
  const value = payload as { output_text?: unknown; output?: Array<{ content?: Array<{ text?: unknown }> }> };
  if (typeof value.output_text === "string") return value.output_text;
  return value.output?.flatMap((item) => item.content ?? [])
    .map((item) => typeof item.text === "string" ? item.text : "")
    .join("") ?? "";
}

export async function POST(request: Request) {
  if (!(await hasValidDashboardSession())) {
    return NextResponse.json({ message: "Your dashboard session has expired." }, { status: 401 });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ message: "OPENAI_API_KEY is not configured on the server." }, { status: 503 });
  }

  const client = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "dashboard";
  const now = Date.now();
  const recent = (requests.get(client) ?? []).filter((time) => now - time < WINDOW_MS);
  if (recent.length >= MAX_REQUESTS) {
    return NextResponse.json({ message: "AI generation limit reached. Try again in a few minutes." }, { status: 429 });
  }
  requests.set(client, [...recent, now]);

  try {
    const body = await request.json() as Record<string, unknown>;
    const title = typeof body.title === "string" ? body.title.trim().slice(0, 180) : "";
    if (!title) return NextResponse.json({ message: "Enter a post title first." }, { status: 400 });

    const facts = JSON.stringify(body.facts ?? {}).slice(0, 5_000);
    const template = typeof body.template === "string" ? body.template.slice(0, 20_000) : "";
    const prompt = `Create an accurate Indian government update post for: ${title}\nPost type: ${String(body.postType ?? "Job")}\nKnown facts: ${facts}\nTemplate structure: ${template}\n\nReturn JSON only with keys contentHtml, seoTitle, seoDescription. Use semantic HTML with an overview, relevant sections, tables, useful links and FAQs. Do not add an H1. Do not invent dates, vacancies, fees, eligibility, organizations, URLs, or claims. If a fact is missing, write \"To Be Announced\" or \"Check Official Notification\". Keep seoTitle at most 60 characters and seoDescription between 120 and 160 characters. Do not include scripts, styles, iframes, or event attributes.`;

    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || "gpt-5.6",
        instructions: "You are a careful government-notification editor. Return valid JSON only and never fabricate facts.",
        input: prompt,
        max_output_tokens: 6_000,
      }),
      cache: "no-store",
    });
    const payload = await response.json() as unknown;
    if (!response.ok) {
      const error = payload as { error?: { message?: string } };
      return NextResponse.json({ message: error.error?.message || "AI generation failed." }, { status: response.status });
    }

    const raw = outputText(payload).trim().replace(/^```json\s*/i, "").replace(/\s*```$/, "");
    const generated = JSON.parse(raw) as { contentHtml?: unknown; seoTitle?: unknown; seoDescription?: unknown };
    if (typeof generated.contentHtml !== "string" || !generated.contentHtml.trim()) {
      throw new Error("AI did not return usable post content.");
    }

    return NextResponse.json({
      contentHtml: sanitizeHtml(generated.contentHtml),
      seoTitle: typeof generated.seoTitle === "string" ? generated.seoTitle.slice(0, 60) : "",
      seoDescription: typeof generated.seoDescription === "string" ? generated.seoDescription.slice(0, 160) : "",
    });
  } catch (error) {
    console.error("AI post generation failed", error);
    return NextResponse.json({ message: error instanceof Error ? error.message : "AI generation failed." }, { status: 502 });
  }
}
