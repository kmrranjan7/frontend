import { absoluteUrl } from "@/config/site";
import { buildUrlSetXml, fetchPublishedPostChunk, xmlResponse } from "@/lib/seo/sitemap";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ page: string }> },
): Promise<Response> {
  const page = Number((await params).page);
  if (!Number.isInteger(page) || page < 2) {
    return new Response("Sitemap not found", { status: 404 });
  }

  const { posts, totalPosts } = await fetchPublishedPostChunk(page);
  if ((page - 1) * 1000 >= totalPosts) {
    return new Response("Sitemap not found", { status: 404 });
  }

  const urls = posts.map((post) => ({
    loc: absoluteUrl(`/${encodeURIComponent(post.slug)}`),
    ...(post.updatedAt
      ? { lastmod: post.updatedAt }
      : post.createdAt ? { lastmod: post.createdAt } : {}),
    ...(post.imageUrl ? { image: absoluteUrl(post.imageUrl) } : {}),
  }));
  return xmlResponse(buildUrlSetXml(urls));
}
