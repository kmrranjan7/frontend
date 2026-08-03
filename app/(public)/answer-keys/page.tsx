import type { Metadata } from "next";
import { PublicCategoryPage } from "@/components/public/PublicCategoryPage";
import { createMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = createMetadata({
  title: "Latest Government Exam Answer Keys",
  description: "Check provisional and final government exam answer keys, response sheets, objection dates and official notices.",
  path: "/answer-keys",
  keywords: [
    "latest government exam answer key PDF",
    "official answer key and response sheet",
    "provisional answer key objection date",
    "SSC railway bank answer key download",
    "competitive exam final answer key",
    "government exam question paper solutions",
  ],
});
export default function Page({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  return <PublicCategoryPage searchParams={searchParams} postType="answer-key" path="/answer-keys" label="Answer Key" heading="Government Exam Answer Keys" description="Check provisional and final answer keys, objection dates, and official notices." icon="answerKey" />;
}
