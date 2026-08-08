import { absoluteUrl } from "@/config/site";
import { fetchPostListings, type PostListingItem } from "@/lib/api/post-listings";

const SITEMAP_PAGE_SIZE = 100;
export const POST_URLS_PER_SITEMAP = 1000;
const API_PAGES_PER_SITEMAP = POST_URLS_PER_SITEMAP / SITEMAP_PAGE_SIZE;

export const STATIC_PAGE_PATHS = [
  "/",
  "/about",
  "/contact",
  "/privacy-policy",
  "/terms-and-conditions",
  "/disclaimer",
  "/image-compressor",
] as const;

export const CATEGORY_PATHS = [
  "/jobs",
  "/results",
  "/admit-cards",
  "/exams",
  "/answer-keys",
  "/syllabus",
  "/admissions",
] as const;

export type SitemapUrl = Readonly<{
  loc: string;
  lastmod?: string;
  image?: string;
}>;

export async function fetchPublishedPostChunk(sitemapPage: number): Promise<{
  posts: readonly PostListingItem[];
  totalPosts: number;
}> {
  if (!Number.isInteger(sitemapPage) || sitemapPage < 1) {
    return { posts: [], totalPosts: 0 };
  }

  const firstApiPage = (sitemapPage - 1) * API_PAGES_PER_SITEMAP;
  const firstPage = await fetchPostListings({
    page: firstApiPage,
    size: SITEMAP_PAGE_SIZE,
    status: "PUBLISHED",
  });
  const posts = [...firstPage.content];
  const lastApiPage = Math.min(
    firstApiPage + API_PAGES_PER_SITEMAP,
    firstPage.totalPages,
  );

  for (let page = firstApiPage + 1; page < lastApiPage; page += 1) {
    const nextPage = await fetchPostListings({
      page,
      size: SITEMAP_PAGE_SIZE,
      status: "PUBLISHED",
    });
    posts.push(...nextPage.content);
  }

  return { posts, totalPosts: firstPage.totalElements };
}

export async function fetchPublishedPostSummary(): Promise<{
  totalPosts: number;
}> {
  const page = await fetchPostListings({ page: 0, size: 1, status: "PUBLISHED" });
  return { totalPosts: page.totalElements };
}

export function escapeXml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

export function buildUrlSetXml(urls: readonly SitemapUrl[]): string {
  const body = urls.map(({ loc, lastmod, image }) => {
    const modified = lastmod ? `<lastmod>${escapeXml(lastmod)}</lastmod>` : "";
    const imageXml = image
      ? `<image:image><image:loc>${escapeXml(image)}</image:loc></image:image>`
      : "";
    return `<url><loc>${escapeXml(loc)}</loc>${imageXml}${modified}</url>`;
  }).join("");

  return `<?xml version="1.0" encoding="UTF-8"?>\n<?xml-stylesheet type="text/xsl" href="/sitemap.xsl?v=2"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">${body}</urlset>`;
}

export function buildSitemapIndexXml(totalPosts: number): string {
  const postSitemapCount = Math.max(1, Math.ceil(totalPosts / POST_URLS_PER_SITEMAP));
  const postPaths = Array.from({ length: postSitemapCount }, (_, index) =>
    index === 0 ? "/post-sitemap.xml" : `/post-sitemap${index + 1}.xml`,
  );
  const paths = [...postPaths, "/page-sitemap.xml", "/category-sitemap.xml"];
  const body = paths.map((path) =>
    `<sitemap><loc>${escapeXml(absoluteUrl(path))}</loc></sitemap>`,
  ).join("");

  return `<?xml version="1.0" encoding="UTF-8"?>\n<?xml-stylesheet type="text/xsl" href="/sitemap.xsl?v=2"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${body}</sitemapindex>`;
}

export function xmlResponse(xml: string): Response {
  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=300, s-maxage=300, stale-while-revalidate=600",
    },
  });
}
