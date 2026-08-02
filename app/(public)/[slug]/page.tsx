import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { env } from "@/config/env";

type PublicPost = Readonly<{
  id: string;
  title: string;
  slug: string;
  contentHtml: string;
  department: string | null;
  stateName: string | null;
  postType: string;
}>;

async function getPost(slug: string): Promise<PublicPost | null> {
  const response = await fetch(`${env.backendApiUrl}/api/v1/jobs/slug/${encodeURIComponent(slug)}`, {
    next: { revalidate: 60 },
  });
  if (!response.ok) return null;
  const payload = await response.json() as { success?: boolean; data?: PublicPost };
  return payload.success && payload.data ? payload.data : null;
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const post = await getPost((await params).slug);
  return { title: post?.title ?? "Post not found" };
}

export default async function PublicPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const post = await getPost((await params).slug);
  if (!post) redirect("/");

  return <main className="min-h-[70vh] bg-[linear-gradient(180deg,#f8fbff_0%,#ffffff_28rem)] py-4 sm:py-6"><article className="mx-auto w-[min(900px,94vw)] rounded-xl border border-indigo-100 bg-white p-4 shadow-[0_12px_30px_rgba(15,23,42,0.08)] sm:p-6"><Link href="/" className="text-[11px] font-bold text-indigo-700 underline underline-offset-2">← Back to updates</Link><p className="mt-4 text-[10px] font-black uppercase tracking-[0.12em] text-indigo-700">{post.postType}</p><h1 className="mt-1 text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">{post.title}</h1><p className="mt-2 text-xs font-medium text-slate-500">{post.department || "Sarkari Global Result"}{post.stateName ? ` · ${post.stateName}` : ""}</p><div className="prose prose-slate mt-6 max-w-none text-sm leading-relaxed" dangerouslySetInnerHTML={{ __html: post.contentHtml }} /></article></main>;
}
