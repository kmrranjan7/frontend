import type { Metadata } from "next";
import { ImageCompressor } from "@/components/public/ImageCompressor";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { createMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = createMetadata({
  title: "Free Image Compressor & Converter Online",
  description:
    "Compress, resize and convert JPG, PNG or WebP images online for free. Create PDFs or convert PDF pages to images securely in your browser.",
  path: "/image-compressor",
  keywords: [
    "free image compressor online without losing quality",
    "compress JPG image size online for free",
    "compress PNG image without quality loss",
    "reduce image size for government job form",
    "resize photo for online application form",
    "compress signature image for government exam form",
    "convert JPG images to PDF online free",
    "convert PDF pages to JPG online",
    "convert PNG to JPG without software",
    "WebP image converter and compressor online",
  ],
});
export default function Page() {
  return (
    <div className="content-page shell image-compressor-page">
      <Breadcrumbs
        items={[
          { name: "Home", path: "/" },
          { name: "Image Compressor", path: "/image-compressor" },
        ]}
      />
      <ImageCompressor />
    </div>
  );
}
