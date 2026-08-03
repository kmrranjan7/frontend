import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { JsonLd } from "@/components/seo/JsonLd";
import { env } from "@/config/env";
import { articleJsonLd } from "@/lib/seo/json-ld";
import { createMetadata } from "@/lib/seo/metadata";

type PublicPost = Readonly<{
  id: string;
  title: string;
  slug: string;
  contentHtml: string;
  department: string | null;
  stateName: string | null;
  postType: string;
  seoTitle?: string | null;
  seoDescription?: string | null;
  seoFocusKeyword?: string | null;
  imageUrls?: string | null;
  organization?: string | null;
  qualification?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
}>;

function plainText(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\s+/g, " ")
    .trim();
}

function fallbackDescription(post: PublicPost): string {
  const summary = plainText(post.contentHtml);
  if (!summary) return `Latest ${post.title} notification, important dates, eligibility and application details.`;
  return summary.length <= 160 ? summary : `${summary.slice(0, 157).trimEnd()}...`;
}

function firstImageUrl(value?: string | null): string | undefined {
  if (!value?.trim()) return undefined;
  try {
    const parsed = JSON.parse(value) as unknown;
    if (Array.isArray(parsed)) {
      return parsed.find((item): item is string => typeof item === "string" && Boolean(item.trim()))?.trim();
    }
    if (typeof parsed === "string" && parsed.trim()) return parsed.trim();
  } catch {
    // Existing records may store comma-separated URLs.
  }
  return value.split(",").map((item) => item.trim()).find(Boolean);
}

function categoryForPostType(postType: string): { name: string; path: string } {
  const normalized = postType.trim().toUpperCase().replace(/[\s-]+/g, "_");
  const categories: Record<string, { name: string; path: string }> = {
    JOB: { name: "Latest Jobs", path: "/jobs" },
    RESULT: { name: "Results", path: "/results" },
    ADMIT: { name: "Admit Cards", path: "/admit-cards" },
    EXAM: { name: "Exams", path: "/exams" },
    ANSWER_KEY: { name: "Answer Keys", path: "/answer-keys" },
    SYLLABUS: { name: "Syllabus", path: "/syllabus" },
    ADMISSION: { name: "Admissions", path: "/admissions" },
  };
  return categories[normalized] ?? { name: "Latest Updates", path: "/" };
}

function longTailKeywords(post: PublicPost): string[] {
  const category = categoryForPostType(post.postType).name.toLowerCase();
  const organization = post.organization?.trim() || post.department?.trim();
  const state = post.stateName?.trim();
  const qualification = post.qualification?.trim();
  const phrases = [
    post.seoFocusKeyword?.trim(),
    post.title,
    `${post.title} latest update`,
    `${post.title} official notification`,
    `${post.title} important dates and eligibility`,
    organization ? `${organization} ${category}` : undefined,
    state ? `${state} ${category} latest update` : undefined,
    qualification ? `${qualification} ${category}` : undefined,
  ];

  return [...new Set(phrases.filter((phrase): phrase is string => Boolean(phrase)))];
}

async function getPost(slug: string): Promise<PublicPost | null> {
  const response = await fetch(`${env.backendApiUrl}/api/v1/jobs/slug/${encodeURIComponent(slug)}`, {
    next: { revalidate: 60 },
  });
  if (!response.ok) return null;
  const payload = await response.json() as { success?: boolean; data?: PublicPost };
  return payload.success && payload.data ? payload.data : null;
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const slug = (await params).slug;
  const post = await getPost(slug);
  if (!post) {
    return {
      title: "Post not found",
      robots: { index: false, follow: false },
    };
  }

  const image = firstImageUrl(post.imageUrls);
  return createMetadata({
    title: post.seoTitle?.trim() || post.title,
    description: post.seoDescription?.trim() || fallbackDescription(post),
    path: `/${encodeURIComponent(post.slug)}`,
    ...(image ? { image } : {}),
    type: "article",
    ...(post.createdAt ? { publishedTime: post.createdAt } : {}),
    ...(post.updatedAt ? { modifiedTime: post.updatedAt } : {}),
    authors: [post.organization?.trim() || post.department?.trim() || "Sarkari Global Result"],
    keywords: longTailKeywords(post),
  });
}

export default async function PublicPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const post = await getPost((await params).slug);
  if (!post) notFound();

  const title = post.seoTitle?.trim() || post.title;
  const description = post.seoDescription?.trim() || fallbackDescription(post);
  const category = categoryForPostType(post.postType);
  const publishedTime = post.createdAt || post.updatedAt || new Date().toISOString();
  const modifiedTime = post.updatedAt || publishedTime;
  const author = post.organization?.trim() || post.department?.trim() || "Sarkari Global Result";
  const image = firstImageUrl(post.imageUrls);
  const breadcrumbItems = [
    { name: "Home", path: "/" },
    ...(category.path === "/" ? [] : [category]),
    { name: post.title, path: `/${post.slug}` },
  ];

  return (
    <div className="min-h-[70vh] bg-[linear-gradient(180deg,#f8fbff_0%,#ffffff_28rem)] py-4 sm:py-6">
      <div className="mx-auto w-[min(900px,94vw)]">
        <Breadcrumbs items={breadcrumbItems} />
        <article className="mt-3 rounded-xl border border-indigo-100 bg-white p-4 shadow-[0_12px_30px_rgba(15,23,42,0.08)] sm:p-6">
          <Link href={category.path} className="text-[11px] font-bold text-indigo-700 underline underline-offset-2">← Back to {category.name}</Link>
          <p className="mt-4 text-[10px] font-black uppercase tracking-[0.12em] text-indigo-700">{post.postType}</p>
          <h1 className="mt-1 text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">{post.title}</h1>
          <p className="mt-2 text-xs font-medium text-slate-500">{post.department || "Sarkari Global Result"}{post.stateName ? ` · ${post.stateName}` : ""}</p>
          <div className="prose prose-slate mt-6 max-w-none text-sm leading-relaxed" dangerouslySetInnerHTML={{ __html: post.contentHtml }} />
        </article>
      </div>
      <JsonLd data={articleJsonLd({
        title,
        description,
        slug: post.slug,
        datePublished: publishedTime,
        dateModified: modifiedTime,
        author,
        ...(image ? { image } : {}),
      })} />
    </div>
  );
}
