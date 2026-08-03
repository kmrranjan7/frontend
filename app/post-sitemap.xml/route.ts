import { absoluteUrl } from "@/config/site";
import { buildUrlSetXml, fetchPublishedPostChunk, xmlResponse } from "@/lib/seo/sitemap";

export async function GET(): Promise<Response> {
  const { posts } = await fetchPublishedPostChunk(1);
  const urls = posts.map((post) => ({
    loc: absoluteUrl(`/${encodeURIComponent(post.slug)}`),
    ...(post.createdAt ? { lastmod: post.createdAt } : {}),
    ...(post.imageUrl ? { image: absoluteUrl(post.imageUrl) } : {}),
  }));

  return xmlResponse(buildUrlSetXml(urls));
}
