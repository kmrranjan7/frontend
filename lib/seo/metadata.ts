import type { Metadata } from "next";
import { absoluteUrl, siteConfig } from "@/config/site";

type SeoMetadataInput = {
  title: string;
  description: string;
  path: string;
  image?: string;
  type?: "website" | "article";
  publishedTime?: string;
  modifiedTime?: string;
  authors?: string[];
  keywords?: string[];
  noIndex?: boolean;
};

const DEFAULT_OG_IMAGE = "/opengraph-image";

export function createMetadata({
  title,
  description,
  path,
  image = DEFAULT_OG_IMAGE,
  type = "website",
  publishedTime,
  modifiedTime,
  authors,
  keywords,
  noIndex = false,
}: SeoMetadataInput): Metadata {
  const canonical = absoluteUrl(path);
  const imageUrl = absoluteUrl(image);

  const openGraph: Metadata["openGraph"] =
    type === "article"
      ? {
          type: "article",
          title,
          description,
          url: canonical,
          siteName: siteConfig.name,
          locale: siteConfig.locale,
          images: [{ url: imageUrl, width: 1200, height: 630, alt: title }],
          publishedTime,
          modifiedTime,
          authors,
        }
      : {
          type: "website",
          title,
          description,
          url: canonical,
          siteName: siteConfig.name,
          locale: siteConfig.locale,
          images: [{ url: imageUrl, width: 1200, height: 630, alt: title }],
        };

  return {
    title,
    description,
    keywords,
    alternates: { canonical },
    openGraph,
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [{ url: imageUrl, alt: title }],
    },
    robots: noIndex
      ? { index: false, follow: false, nocache: true }
      : {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
            "max-image-preview": "large",
            "max-snippet": -1,
            "max-video-preview": -1,
          },
        },
  };
}
