import type { Metadata } from "next";
import { ImageCompressor } from "@/components/public/ImageCompressor";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { createMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = createMetadata({
    title: "Free Image Compressor, PDF Converter & Image Converter Online",
    description:
      "Compress JPG, JPEG, PNG, and WebP images online for free. Convert Images to PDF, PDF to JPG, PDF to PNG, JPG to PNG, PNG to JPG, WebP Converter, Image Resizer, and Image Optimizer. Fast, secure, and private browser-based tools.",
    path: "/image-compressor",
  
  });
export default function Page() {
  return (
    <div className="content-page shell">
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
