import { absoluteUrl } from "@/config/site";
import { buildUrlSetXml, STATIC_PAGE_PATHS, STATIC_SITEMAP_LAST_MODIFIED, xmlResponse } from "@/lib/seo/sitemap";

export function GET(): Response {
  return xmlResponse(buildUrlSetXml(STATIC_PAGE_PATHS.map((path) => ({
    loc: absoluteUrl(path),
    lastmod: STATIC_SITEMAP_LAST_MODIFIED,
  }))));
}
