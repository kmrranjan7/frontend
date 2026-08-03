import type { Metadata } from "next";
import { PublicCategoryPage } from "@/components/public/PublicCategoryPage";
import { createMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = createMetadata({
  title: "Latest College & University Admissions",
  description: "Browse current university, college and entrance admission forms, eligibility requirements, application dates and official notices.",
  path: "/admissions",
  keywords: [
    "latest college admission forms online",
    "university admission notification in India",
    "government college admission application",
    "entrance exam admission important dates",
    "UG PG admission eligibility and fees",
    "latest admission form last date",
  ],
});
export default function Page({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  return <PublicCategoryPage searchParams={searchParams} postType="admission" path="/admissions" label="Admission" heading="Admission Updates" description="Browse current admission forms, entrance notices, eligibility details, and important dates." icon="graduation" />;
}
