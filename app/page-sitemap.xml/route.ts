import { absoluteUrl } from "@/config/site";
import { buildUrlSetXml, STATIC_PAGE_PATHS, xmlResponse } from "@/lib/seo/sitemap";

export function GET(): Response {
  return xmlResponse(buildUrlSetXml(STATIC_PAGE_PATHS.map((path) => ({
    loc: absoluteUrl(path),
  }))));
}
