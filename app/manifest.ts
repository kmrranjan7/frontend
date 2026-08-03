import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: siteConfig.name,
    short_name: siteConfig.shortName,
    description: siteConfig.description,
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: siteConfig.themeColor,
    lang: siteConfig.language,
    categories: ["education", "news", "government"],
    icons: [
      {
        src: "/favicon.ico",
        sizes: "16x16 32x32 48x48 64x64 128x128 256x256",
        type: "image/x-icon",
      },
    ],
  };
}
