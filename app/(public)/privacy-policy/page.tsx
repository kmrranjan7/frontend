import type { Metadata } from "next";
import { PublicInfoPage } from "@/components/public/PublicInfoPage";
import { createMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = createMetadata({ title: "Privacy Policy", description: "Read the Sarkari Global Result privacy policy.", path: "/privacy-policy" });
export default function Page() { return <PublicInfoPage title="Privacy Policy" description="How information is handled when you use this website." path="/privacy-policy"><h2>Information we process</h2><p>Basic technical information may be processed for security, reliability, and aggregate traffic measurement. Information submitted through contact channels is used to respond to the enquiry.</p><h2>Cookies and security</h2><p>Administrative login cookies are secure, HTTP-only, and used only to maintain an authenticated session. We do not ask public visitors for government account passwords or payment credentials.</p><h2>Data requests</h2><p>Contact us to request correction or deletion of personal information that you previously submitted directly to us.</p></PublicInfoPage>; }
