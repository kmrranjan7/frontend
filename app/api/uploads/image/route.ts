import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

import { NextResponse } from "next/server";
import { hasValidDashboardSession } from "@/lib/auth/session";

const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;

const mimeToExtension: Readonly<Record<string, string>> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
  "image/gif": "gif",
};

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

    const extension = mimeToExtension[file.type];
    const fileName = `${Date.now()}-${randomUUID()}.${extension}`;
    const uploadsDirectory = path.join(process.cwd(), "public", "uploads");

    await mkdir(uploadsDirectory, { recursive: true });
    await writeFile(
      path.join(uploadsDirectory, fileName),
      Buffer.from(await file.arrayBuffer()),
    );

    return NextResponse.json({ location: `/uploads/${fileName}` });
  } catch (error) {
    console.error("Image upload failed", error);
    return NextResponse.json(
      { message: "The image could not be uploaded. Please try again." },
      { status: 500 },
    );
  }
}
