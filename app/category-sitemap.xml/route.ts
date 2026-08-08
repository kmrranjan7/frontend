import { absoluteUrl } from "@/config/site";
import { buildUrlSetXml, CATEGORY_PATHS, xmlResponse } from "@/lib/seo/sitemap";

export function GET(): Response {
  const urls = CATEGORY_PATHS.map((path) => ({
    loc: absoluteUrl(path),
  }));
  return xmlResponse(buildUrlSetXml(urls));
}
