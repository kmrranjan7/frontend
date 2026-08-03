import { absoluteUrl } from "@/config/site";
import { buildUrlSetXml, CATEGORY_PATHS, fetchPublishedPostSummary, xmlResponse } from "@/lib/seo/sitemap";

export async function GET(): Promise<Response> {
  let lastmod: string | undefined;
  try {
    lastmod = (await fetchPublishedPostSummary()).lastmod;
  } catch {
    // Categories remain discoverable if the content API is temporarily unavailable.
  }

  const urls = CATEGORY_PATHS.map((path) => ({
    loc: absoluteUrl(path),
    ...(lastmod ? { lastmod } : {}),
  }));
  return xmlResponse(buildUrlSetXml(urls));
}
