import type { Metadata } from "next";
import { PublicInfoPage } from "@/components/public/PublicInfoPage";
import { createMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = createMetadata({ title: "About Us", description: "Learn about Sarkari Global Result and our approach to clear government job and education updates.", path: "/about" });
export default function Page() { return <PublicInfoPage title="About Us" description="Clear, accessible government job and education information." path="/about"><h2>Our purpose</h2><p>Sarkari Global Result organizes recruitment, examination, admit-card, result, syllabus, answer-key, and admission updates so candidates can find important information quickly.</p><h2>Editorial standard</h2><p>We aim to present dates, eligibility, vacancies, and application instructions clearly. Candidates should always verify final details in the linked official notification before applying.</p></PublicInfoPage>; }
