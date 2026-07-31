import type { Metadata } from "next";
import { PublicCategoryPage } from "@/components/public/PublicCategoryPage";
import { createMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = createMetadata({ title: "Latest Admit Cards", description: "Download the latest government examination admit cards and hall-ticket updates.", path: "/admit-cards" });
export default function Page({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  return <PublicCategoryPage searchParams={searchParams} postType="admit" path="/admit-cards" label="Admit Card" heading="Government Exam Admit Cards" description="Find recently released admit cards, hall tickets, exam dates, and candidate instructions." icon="admit" />;
}
