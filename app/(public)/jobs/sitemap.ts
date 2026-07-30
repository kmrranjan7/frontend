import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/config/site";
import { jobs } from "@/data/content";

const MAX_URLS_PER_SITEMAP = 50_000;

export function generateSitemaps() {
  const count = Math.max(1, Math.ceil(jobs.length / MAX_URLS_PER_SITEMAP));
  return Array.from({ length: count }, (_, id) => ({ id }));
}

export default async function sitemap({
  id,
}: {
  id: Promise<string>;
}): Promise<MetadataRoute.Sitemap> {
  const page = Number(await id);
  const start = page * MAX_URLS_PER_SITEMAP;

  return jobs
    .slice(start, start + MAX_URLS_PER_SITEMAP)
    .map((job) => ({
      url: absoluteUrl(`/jobs/${job.slug}`),
      lastModified: job.dateModified,
      changeFrequency: "daily" as const,
      priority: 0.9,
    }));
}
