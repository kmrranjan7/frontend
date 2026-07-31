import type { Metadata } from "next";
import { PublicInfoPage } from "@/components/public/PublicInfoPage";
import { createMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = createMetadata({ title: "Disclaimer", description: "Read the Sarkari Global Result information disclaimer.", path: "/disclaimer" });
export default function Page() { return <PublicInfoPage title="Disclaimer" description="Important information about using recruitment and education updates." path="/disclaimer"><h2>Not a government website</h2><p>Sarkari Global Result is an independent information service and is not affiliated with, endorsed by, or operated by any government department.</p><h2>Verify official information</h2><p>Although we work to keep content accurate, official authorities may change dates or requirements. Always read the complete official notification and use the official application website before taking action.</p></PublicInfoPage>; }
