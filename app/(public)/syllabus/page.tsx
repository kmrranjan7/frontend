import type { Metadata } from "next";
import { PublicCategoryPage } from "@/components/public/PublicCategoryPage";
import { createMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = createMetadata({
  title: "Government Exam Syllabus & Exam Pattern",
  description: "Find the latest government exam syllabus, subject-wise topics, selection process and official examination patterns.",
  path: "/syllabus",
  keywords: [
    "latest government exam syllabus PDF",
    "government exam pattern and selection process",
    "SSC railway bank exam syllabus",
    "subject wise competitive exam syllabus",
    "government recruitment syllabus download",
    "sarkari exam preparation topics",
  ],
});
export default function Page({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  return <PublicCategoryPage searchParams={searchParams} postType="syllabus" path="/syllabus" label="Syllabus" heading="Government Exam Syllabus" description="Review current syllabus notices, subject coverage, and official examination patterns." icon="book" />;
}
