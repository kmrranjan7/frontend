import type { Metadata } from "next";
import { PublicCategoryPage } from "@/components/public/PublicCategoryPage";
import { createMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = createMetadata({ title: "Latest Government Exams", description: "Track government exam notifications, schedules, and important examination updates.", path: "/exams" });
export default function Page({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  return <PublicCategoryPage searchParams={searchParams} postType="exam" path="/exams" label="Exam" heading="Government Examination Updates" description="Track examination notices, schedules, important dates, and official candidate instructions." icon="exam" />;
}
