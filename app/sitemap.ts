import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/config/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages: MetadataRoute.Sitemap = [
    { url: absoluteUrl("/"), changeFrequency: "daily", priority: 1 },
    { url: absoluteUrl("/jobs"), changeFrequency: "hourly", priority: 0.9 },
    { url: absoluteUrl("/results"), changeFrequency: "hourly", priority: 0.9 },
    { url: absoluteUrl("/admit-cards"), changeFrequency: "hourly", priority: 0.9 },
    { url: absoluteUrl("/exams"), changeFrequency: "daily", priority: 0.8 },
    { url: absoluteUrl("/answer-keys"), changeFrequency: "daily", priority: 0.8 },
    { url: absoluteUrl("/syllabus"), changeFrequency: "weekly", priority: 0.7 },
    { url: absoluteUrl("/admissions"), changeFrequency: "daily", priority: 0.8 },
    { url: absoluteUrl("/image-compressor"), changeFrequency: "monthly", priority: 0.5 },
    { url: absoluteUrl("/about"), changeFrequency: "monthly", priority: 0.5 },
    { url: absoluteUrl("/contact"), changeFrequency: "monthly", priority: 0.5 },
    { url: absoluteUrl("/privacy-policy"), changeFrequency: "yearly", priority: 0.3 },
    { url: absoluteUrl("/terms-and-conditions"), changeFrequency: "yearly", priority: 0.3 },
    { url: absoluteUrl("/disclaimer"), changeFrequency: "yearly", priority: 0.3 },
  ];

  return staticPages;
}
