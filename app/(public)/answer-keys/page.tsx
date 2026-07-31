import type { Metadata } from "next";
import { PublicCategoryPage } from "@/components/public/PublicCategoryPage";
import { createMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = createMetadata({ title: "Latest Answer Keys", description: "Check official and provisional government examination answer keys.", path: "/answer-keys" });
export default function Page({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  return <PublicCategoryPage searchParams={searchParams} postType="answer-key" path="/answer-keys" label="Answer Key" heading="Government Exam Answer Keys" description="Check provisional and final answer keys, objection dates, and official notices." icon="answerKey" />;
}
