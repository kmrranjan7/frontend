import { buildSitemapIndexXml, fetchPublishedPostSummary, xmlResponse } from "@/lib/seo/sitemap";

export async function GET(): Promise<Response> {
  try {
    const { totalPosts, lastmod } = await fetchPublishedPostSummary();
    return xmlResponse(buildSitemapIndexXml(totalPosts, lastmod));
  } catch {
    return xmlResponse(buildSitemapIndexXml(0));
  }
}
