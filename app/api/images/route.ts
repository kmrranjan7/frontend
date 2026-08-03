import { readdir, unlink } from "node:fs/promises";
import path from "node:path";

import { NextResponse } from "next/server";
import { dashboardAuthHeaders, hasValidDashboardSession } from "@/lib/auth/session";

export const runtime = "nodejs";

const backendOrigin = process.env.NEXT_PUBLIC_BACKEND_API_URL?.replace(/\/$/, "");
const uploadsDirectory = path.join(process.cwd(), "public", "uploads");
const allowedExtensions = new Set([".gif", ".jpeg", ".jpg", ".png", ".webp"]);

type PostReference = {
  id?: string;
  postTitle?: string;
  postSlug?: string;
  postType?: string;
  postStatus?: string;
  contentHtml?: string;
  imageUrls?: string;
};

type PostPage = {
  content?: PostReference[];
  totalPages?: number;
};

function positiveInteger(value: string | null, fallback: number) {
  const parsed = Number.parseInt(value ?? "", 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function searchablePost(post: PostReference) {
  const raw = `${post.contentHtml ?? ""}\n${post.imageUrls ?? ""}`.toLowerCase();
  try {
    return `${raw}\n${decodeURIComponent(raw)}`;
  } catch {
    return raw;
  }
}

async function fetchPostPage(page: number): Promise<PostPage> {
  if (!backendOrigin) throw new Error("Backend API URL is not configured.");

  const query = new URLSearchParams({
    page: String(page),
    size: "100",
    sortDir: "desc",
  });
  const response = await fetch(`${backendOrigin}/api/v1/posts?${query}`, {
    headers: await dashboardAuthHeaders(),
    cache: "no-store",
  });
  if (!response.ok) throw new Error("Post references could not be loaded.");

  const payload = (await response.json()) as { data?: PostPage };
  return payload.data ?? {};
}

async function fetchAllPosts() {
  const first = await fetchPostPage(0);
  const remaining = await Promise.all(
    Array.from({ length: Math.max((first.totalPages ?? 1) - 1, 0) }, (_, index) => fetchPostPage(index + 1)),
  );
  return [first, ...remaining].flatMap((page) => page.content ?? []);
}

export async function GET(request: Request) {
  if (!(await hasValidDashboardSession())) {
    return NextResponse.json({ message: "Authentication is required." }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const page = positiveInteger(searchParams.get("page"), 1);
  const size = Math.min(positiveInteger(searchParams.get("size"), 20), 50);
  const mode = searchParams.get("mode") === "unmatched" ? "unmatched" : "matched";

  let fileNames: string[] = [];
  try {
    fileNames = (await readdir(uploadsDirectory, { withFileTypes: true }))
      .filter((entry) => entry.isFile() && allowedExtensions.has(path.extname(entry.name).toLowerCase()))
      .map((entry) => entry.name)
      .sort((left, right) => right.localeCompare(left));
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
  }

  let posts: PostReference[] = [];
  let referencesUnavailable = false;
  try {
    posts = await fetchAllPosts();
  } catch {
    referencesUnavailable = true;
  }

  const withReferences = fileNames.map((name) => ({
    name,
    url: `/uploads/${name}`,
    references: posts
      .filter((post) => searchablePost(post).includes(name.toLowerCase()))
      .map((post) => ({
        id: post.id ?? "",
        title: post.postTitle ?? "Untitled post",
        slug: post.postSlug ?? "",
        postType: post.postType ?? "",
        postStatus: post.postStatus ?? "",
      })),
  }));
  const filtered = referencesUnavailable
    ? []
    : withReferences.filter((image) => mode === "matched" ? image.references.length > 0 : image.references.length === 0);
  const start = (page - 1) * size;
  const totalPages = Math.max(Math.ceil(filtered.length / size), 1);

  return NextResponse.json({
    images: filtered.slice(start, start + size),
    page,
    totalPages,
    hasMore: page < totalPages,
    referencesUnavailable,
  });
}

export async function DELETE(request: Request) {
  if (!(await hasValidDashboardSession())) {
    return NextResponse.json({ message: "Authentication is required." }, { status: 401 });
  }

  const name = new URL(request.url).searchParams.get("name")?.trim() ?? "";
  if (!name || path.basename(name) !== name || !allowedExtensions.has(path.extname(name).toLowerCase())) {
    return NextResponse.json({ message: "A valid image name is required." }, { status: 400 });
  }

  try {
    await unlink(path.join(uploadsDirectory, name));
    return NextResponse.json({ success: true });
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return NextResponse.json({ message: "Image not found." }, { status: 404 });
    }
    return NextResponse.json({ message: "The image could not be deleted." }, { status: 500 });
  }
}
