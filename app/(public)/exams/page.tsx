import type { Metadata } from "next";
import { PublicCategoryPage } from "@/components/public/PublicCategoryPage";
import { createMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = createMetadata({
  title: "Latest Government Exam Notifications",
  description: "Track the latest government exam notifications, application schedules, exam dates and official candidate updates.",
  path: "/exams",
  keywords: [
    "latest government exam notifications",
    "upcoming competitive exams in India",
    "government exam calendar and dates",
    "SSC UPSC railway bank exam schedule",
    "government entrance examination updates",
    "new sarkari exam online application",
  ],
});
export default function Page({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  return <PublicCategoryPage searchParams={searchParams} postType="exam" path="/exams" label="Exam" heading="Government Examination Updates" description="Track examination notices, schedules, important dates, and official candidate instructions." icon="exam" />;
}
