import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/config/site";
import { articles } from "@/data/content";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages: MetadataRoute.Sitemap = [
    { url: absoluteUrl("/"), changeFrequency: "daily", priority: 1 },
    { url: absoluteUrl("/jobs"), changeFrequency: "hourly", priority: 0.9 },
    { url: absoluteUrl("/news"), changeFrequency: "daily", priority: 0.8 },
    { url: absoluteUrl("/faq"), changeFrequency: "monthly", priority: 0.6 },
    { url: absoluteUrl("/about"), changeFrequency: "monthly", priority: 0.5 },
  ];

  return [
    ...staticPages,
    ...articles.map((article) => ({
      url: absoluteUrl(`/news/${article.slug}`),
      lastModified: article.dateModified,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
  ];
}
