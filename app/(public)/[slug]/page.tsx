import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cache } from "react";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { JsonLd } from "@/components/seo/JsonLd";
import { env } from "@/config/env";
import { articleJsonLd, faqJsonLd, type FaqItem } from "@/lib/seo/json-ld";
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
  faqSchemaJson?: string | null;
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

function escapeHtmlAttribute(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function redesignPostIntro(html: string, title: string): string {
  const titleWords = new Set(
    plainText(title).toLowerCase().match(/[a-z0-9]+/g) ?? [],
  );
  let redesigned = html.replace(/<h2\b[^>]*>([\s\S]*?)<\/h2>/i, (heading, headingContent: string) => {
    const headingWords = new Set(
      plainText(headingContent).toLowerCase().match(/[a-z0-9]+/g) ?? [],
    );
    const sharedWords = [...titleWords].filter((word) => headingWords.has(word)).length;
    const comparisonSize = Math.min(titleWords.size, headingWords.size);
    const isDuplicateTitle = comparisonSize >= 3 && sharedWords / comparisonSize >= 0.75;
    return isDuplicateTitle ? "" : heading;
  });

  redesigned = redesigned.replace(/<table\b[^>]*>[\s\S]*?<\/table>/i, (table) => {
    const rows = [...table.matchAll(/<tr\b[^>]*>([\s\S]*?)<\/tr>/gi)];
    const summaryRow = rows.find((row) => /short\s+information/i.test(plainText(row[1])));
    if (!summaryRow || !rows.some((row) => /name\s+of\s+post/i.test(plainText(row[1])))) return table;

    const cells = [...summaryRow[1].matchAll(/<t[dh]\b[^>]*>([\s\S]*?)<\/t[dh]>/gi)];
    if (cells.length < 2) return table;

    return `<section class="post-recruitment-overview" aria-labelledby="recruitment-overview-heading"><h2 id="recruitment-overview-heading">Recruitment overview</h2><div>${cells[1][1]}</div></section>`;
  });

  redesigned = redesigned.replace(
    /<h[1-6]\b[^>]*>\s*(<img\b[^>]*>)\s*<\/h[1-6]>/gi,
    '<figure class="post-content-image">$1</figure>',
  );
  redesigned = redesigned.replace(
    /<p\b[^>]*>(?:\s|&nbsp;|<br\s*\/?\s*>)*<\/p>(?=\s*<h3\b)/gi,
    "",
  );

  return redesigned;
}

function enhancePostHtml(html: string, imageAlt: string): string {
  const currentLinksHtml = html
    .replace(
      /https:\/\/t\.me\/(?:SarkariResult2012|sarkariglobalresult\.com)/gi,
      "https://t.me/sarkariglobalresult",
    )
    .replace(
      /https:\/\/whatsapp\.com\/channel\/0029Va5IElwBlHpVBd6i5a18/gi,
      "https://whatsapp.com/channel/0029VbCd7pX2ER6btYssot1V",
    )
    .replace(
      /https:\/\/sarkariresultportal\.com\/?/gi,
      "https://sarkariglobalresult.com/image-compressor",
    );
  const redesignedHtml = redesignPostIntro(currentLinksHtml, imageAlt);
  const linksEnhanced = redesignedHtml.replace(/<a\b([^>]*)>/gi, (_tag, rawAttributes: string) => {
    let attributes = rawAttributes;
    const targetPattern = /\btarget\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/i;

    attributes = targetPattern.test(attributes)
      ? attributes.replace(targetPattern, 'target="_blank"')
      : `${attributes} target="_blank"`;

    const relPattern = /\brel\s*=\s*(["'])(.*?)\1/i;
    const relMatch = attributes.match(relPattern);
    if (relMatch) {
      const relValues = new Set(relMatch[2].split(/\s+/).filter(Boolean));
      relValues.add("noopener");
      relValues.add("noreferrer");
      attributes = attributes.replace(relPattern, `rel="${[...relValues].join(" ")}"`);
    } else {
      attributes += ' rel="noopener noreferrer"';
    }

    return `<a${attributes}>`;
  });

  const imagesEnhanced = linksEnhanced.replace(/<img\b([^>]*)>/gi, (_tag, rawAttributes: string) => {
    let attributes = rawAttributes.replace(
      /\bsrc\s*=\s*(["'])\.\.\/(?:\.\.\/)*uploads\//i,
      "src=$1/uploads/",
    );

    if (!/\balt\s*=/i.test(attributes)) {
      attributes += ` alt="${escapeHtmlAttribute(imageAlt)}"`;
    }
    if (!/\bloading\s*=/i.test(attributes)) attributes += ' loading="lazy"';
    if (!/\bdecoding\s*=/i.test(attributes)) attributes += ' decoding="async"';

    return `<img${attributes}>`;
  });

  // Keep the original table markup and visual design. The wrapper is used only
  // by the mobile stylesheet to let cell content wrap inside the viewport.
  return imagesEnhanced.replace(
    /<table\b[^>]*>[\s\S]*?<\/table>/gi,
    (table) => `<div class="post-table-mobile-responsive">${table}</div>`,
  );
}

function fallbackDescription(post: PublicPost): string {
  const summary = plainText(post.contentHtml);
  if (!summary) return `Latest ${post.title} notification, important dates, eligibility and application details.`;
  return summary.length <= 160 ? summary : `${summary.slice(0, 157).trimEnd()}...`;
}

function seoDescription(post: PublicPost): string {
  const description = (post.seoDescription?.trim() || fallbackDescription(post))
    .replace(/\s+/g, " ");
  if (description.length < 160 || /[.!?]$/.test(description)) return description;

  const completeSentenceEnd = Math.max(
    description.lastIndexOf("."),
    description.lastIndexOf("!"),
    description.lastIndexOf("?"),
  );
  if (completeSentenceEnd >= 100) return description.slice(0, completeSentenceEnd + 1);

  const shortened = description.slice(0, 157);
  const lastSpace = shortened.lastIndexOf(" ");
  return `${shortened.slice(0, lastSpace > 100 ? lastSpace : 157).trimEnd()}...`;
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

function faqItems(value?: string | null): FaqItem[] {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.flatMap((item) => {
      if (!item || typeof item !== "object") return [];
      const candidate = item as { question?: unknown; answer?: unknown };
      if (typeof candidate.question !== "string" || typeof candidate.answer !== "string") return [];
      const question = candidate.question.trim();
      const answer = candidate.answer.trim();
      return question && answer ? [{ question, answer }] : [];
    }).slice(0, 10);
  } catch {
    return [];
  }
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

const getPost = cache(async (slug: string): Promise<PublicPost | null> => {
  const response = await fetch(`${env.backendApiUrl}/api/v1/jobs/slug/${encodeURIComponent(slug)}`, {
    next: { revalidate: 300 },
  });
  if (!response.ok) return null;
  const payload = await response.json() as { success?: boolean; data?: PublicPost };
  return payload.success && payload.data ? payload.data : null;
});

function validDate(value?: string | null): string | undefined {
  if (!value) return undefined;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date.toISOString();
}

function displayDate(value: string): string {
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(value));
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
  const publishedTime = validDate(post.createdAt);
  const modifiedTime = validDate(post.updatedAt);
  return createMetadata({
    title: post.seoTitle?.trim() || post.title,
    description: seoDescription(post),
    path: `/${encodeURIComponent(post.slug)}`,
    ...(image ? { image } : {}),
    type: "article",
    ...(publishedTime ? { publishedTime } : {}),
    ...(modifiedTime ? { modifiedTime } : {}),
    authors: [post.organization?.trim() || post.department?.trim() || "Sarkari Global Result"],
    keywords: longTailKeywords(post),
  });
}

export default async function PublicPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const post = await getPost((await params).slug);
  if (!post) notFound();

  const contentHtml = enhancePostHtml(post.contentHtml, post.title);
  const description = seoDescription(post);
  const category = categoryForPostType(post.postType);
  const publishedTime = validDate(post.createdAt) || validDate(post.updatedAt) || new Date().toISOString();
  const modifiedTime = validDate(post.updatedAt) || publishedTime;
  const author = post.organization?.trim() || post.department?.trim() || "Sarkari Global Result";
  const image = firstImageUrl(post.imageUrls);
  const faqs = faqItems(post.faqSchemaJson);
  const keywords = longTailKeywords(post);
  const breadcrumbItems = [
    { name: "Home", path: "/" },
    ...(category.path === "/" ? [] : [category]),
    { name: post.title, path: `/${post.slug}` },
  ];

  return (
    <div className="public-post-page min-h-[70vh] bg-[linear-gradient(180deg,#f8fbff_0%,#ffffff_28rem)] py-6">
      <div className="public-post-shell mx-auto w-[min(900px,94vw)]">
        <Breadcrumbs items={breadcrumbItems} />
        <article className="public-post-article mt-3 rounded-xl border border-indigo-100 bg-white p-6 shadow-[0_12px_30px_rgba(15,23,42,0.08)]">
          <header className="public-post-header mt-5 border-b border-indigo-100 pb-5">
            {/* <p className="public-post-category mb-2 text-xs font-extrabold uppercase tracking-[0.12em] text-indigo-700">{category.name}</p> */}
            <h1 className="public-post-title m-0 rounded-lg border border-blue-950 bg-[#1e3a8a] px-4 py-3 text-3xl font-extrabold leading-tight tracking-[-0.025em] text-white shadow-sm">{post.title}</h1>
            <div className="public-post-meta mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs font-semibold text-red-700">
              <span>Published by <strong className="font-extrabold text-red-800">{author}</strong></span>
              <span className="public-post-meta-separator" aria-hidden="true">•</span>
              <time dateTime={publishedTime}>Published {displayDate(publishedTime)}</time>
              {displayDate(modifiedTime) !== displayDate(publishedTime) && (
                <>
                  <span className="public-post-meta-separator" aria-hidden="true">•</span>
                  <time dateTime={modifiedTime}>Updated {displayDate(modifiedTime)}</time>
                </>
              )}
            </div>
          </header>
          <div className="public-post-content prose prose-slate mt-6 max-w-none text-sm leading-relaxed" dangerouslySetInnerHTML={{ __html: contentHtml }} />
        </article>
      </div>
      <JsonLd data={articleJsonLd({
        title: post.title,
        description,
        slug: post.slug,
        datePublished: publishedTime,
        dateModified: modifiedTime,
        author,
        keywords,
        ...(image ? { image } : {}),
      })} />
      {faqs.length > 0 && <JsonLd data={faqJsonLd(faqs)} />}
    </div>
  );
}
