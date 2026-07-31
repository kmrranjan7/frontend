import type { Metadata } from "next";
import { ImageCompressor } from "@/components/public/ImageCompressor";
import { PublicInfoPage } from "@/components/public/PublicInfoPage";
import { createMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = createMetadata({ title: "Free Image Compressor", description: "Compress JPG, PNG, and WebP images privately in your browser.", path: "/image-compressor" });
export default function Page() { return <PublicInfoPage title="Image Compressor" description="Reduce image file size privately—your image never leaves the browser." path="/image-compressor"><ImageCompressor /></PublicInfoPage>; }
