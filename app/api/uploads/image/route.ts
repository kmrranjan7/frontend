import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

import { NextResponse } from "next/server";
import sharp from "sharp";
import { hasValidDashboardSession } from "@/lib/auth/session";

const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;

const mimeToExtension: Readonly<Record<string, string>> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
  "image/gif": "gif",
};

async function optimizeImage(input: Buffer, mimeType: string) {
  // Keep GIF bytes unchanged so animated uploads do not lose their frames.
  if (mimeType === "image/gif") return input;

  const pipeline = sharp(input, { failOn: "error" })
    .rotate()
    .resize({
      width: 2400,
      height: 2400,
      fit: "inside",
      withoutEnlargement: true,
    });

  const optimized = mimeType === "image/jpeg"
    ? await pipeline.jpeg({ quality: 82, mozjpeg: true }).toBuffer()
    : mimeType === "image/png"
      ? await pipeline.png({ compressionLevel: 9, effort: 8, palette: true, quality: 88 }).toBuffer()
      : await pipeline.webp({ quality: 82, effort: 5 }).toBuffer();

  return optimized.length < input.length ? optimized : input;
}

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!(await hasValidDashboardSession())) {
    return NextResponse.json(
      { success: false, message: "Authentication is required." },
      { status: 401 },
    );
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ message: "Please select an image to upload." }, { status: 400 });
    }

    if (!(file.type in mimeToExtension)) {
      return NextResponse.json(
        { message: "Use a PNG, JPG, WEBP, or GIF image." },
        { status: 415 },
      );
    }

    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      return NextResponse.json(
        { message: "The image must be 5 MB or smaller." },
        { status: 413 },
      );
    }

    const original = Buffer.from(await file.arrayBuffer());
    const optimized = await optimizeImage(original, file.type);
    const extension = mimeToExtension[file.type];
    const fileName = `${Date.now()}-${randomUUID()}.${extension}`;
    const uploadsDirectory = path.join(process.cwd(), "public", "uploads");

    await mkdir(uploadsDirectory, { recursive: true });
    await writeFile(path.join(uploadsDirectory, fileName), optimized);

    return NextResponse.json({
      location: `/uploads/${fileName}`,
      originalSize: original.length,
      size: optimized.length,
      savedBytes: original.length - optimized.length,
      compressed: optimized.length < original.length,
    });
  } catch (error) {
    console.error("Image upload failed", error);
    return NextResponse.json(
      { message: "The image could not be uploaded. Please try again." },
      { status: 500 },
    );
  }
}
