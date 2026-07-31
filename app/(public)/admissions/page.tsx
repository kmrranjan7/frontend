import type { Metadata } from "next";
import { PublicCategoryPage } from "@/components/public/PublicCategoryPage";
import { createMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = createMetadata({ title: "Latest Admissions", description: "Browse current university, college, and entrance admission updates.", path: "/admissions" });
export default function Page({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  return <PublicCategoryPage searchParams={searchParams} postType="admission" path="/admissions" label="Admission" heading="Admission Updates" description="Browse current admission forms, entrance notices, eligibility details, and important dates." icon="graduation" />;
}
