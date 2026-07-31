import type { Metadata } from "next";
import { PublicCategoryPage } from "@/components/public/PublicCategoryPage";
import { createMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = createMetadata({ title: "Government Exam Syllabus", description: "Find government examination syllabus and exam-pattern updates.", path: "/syllabus" });
export default function Page({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  return <PublicCategoryPage searchParams={searchParams} postType="syllabus" path="/syllabus" label="Syllabus" heading="Government Exam Syllabus" description="Review current syllabus notices, subject coverage, and official examination patterns." icon="book" />;
}
