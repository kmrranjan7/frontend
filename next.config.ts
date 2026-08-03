import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    qualities: [55, 75],
  },
  poweredByHeader: false,
  async rewrites() {
    return [
      {
        source: String.raw`/post-sitemap:page(\d+).xml`,
        destination: "/api/sitemaps/posts/:page",
      },
    ];
  },
  async headers() {
    const securityHeaders = [
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "X-Frame-Options", value: "DENY" },
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=()" },
      { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" },
      { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
      { key: "Cross-Origin-Resource-Policy", value: "same-origin" },
    ];

    return [
      { source: "/:path*", headers: securityHeaders },
      {
        source: "/tinymce/:path*",
        headers: [{ key: "Cache-Control", value: "private, no-store, max-age=0" }],
      },
    ];
  },
};

export default nextConfig;
