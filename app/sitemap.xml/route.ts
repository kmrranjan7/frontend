import { buildSitemapIndexXml, fetchPublishedPostSummary, xmlResponse } from "@/lib/seo/sitemap";

export async function GET(): Promise<Response> {
  try {
    const { totalPosts } = await fetchPublishedPostSummary();
    return xmlResponse(buildSitemapIndexXml(totalPosts));
  } catch {
    return xmlResponse(buildSitemapIndexXml(0));
  }
}
