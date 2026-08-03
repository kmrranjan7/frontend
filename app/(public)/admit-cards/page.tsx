import type { Metadata } from "next";
import { PublicCategoryPage } from "@/components/public/PublicCategoryPage";
import { createMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = createMetadata({
  title: "Latest Government Exam Admit Cards",
  description: "Download the latest government exam admit cards, hall tickets, exam dates and official candidate instructions.",
  path: "/admit-cards",
  keywords: [
    "latest government exam admit card download",
    "sarkari exam hall ticket online",
    "government recruitment exam call letter",
    "SSC railway bank admit card download",
    "competitive exam date and admit card",
    "government exam city intimation slip",
  ],
});
export default function Page({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  return <PublicCategoryPage searchParams={searchParams} postType="admit" path="/admit-cards" label="Admit Card" heading="Government Exam Admit Cards" description="Find recently released admit cards, hall tickets, exam dates, and candidate instructions." icon="admit" />;
}
