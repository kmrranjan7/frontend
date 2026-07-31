import type { Metadata } from "next";
import { PublicInfoPage } from "@/components/public/PublicInfoPage";
import { createMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = createMetadata({ title: "Terms and Conditions", description: "Read the terms and conditions for using Sarkari Global Result.", path: "/terms-and-conditions" });
export default function Page() { return <PublicInfoPage title="Terms & Conditions" description="Conditions that apply when using Sarkari Global Result." path="/terms-and-conditions"><h2>Informational service</h2><p>Content is provided for general informational purposes. Users are responsible for checking official notifications, eligibility, deadlines, fees, and submission requirements.</p><h2>Acceptable use</h2><p>Do not misuse the website, attempt unauthorized access, interfere with availability, or reproduce content in a misleading manner.</p><h2>Changes</h2><p>Information and these terms may be updated as the service develops. Continued use means you accept the current terms.</p></PublicInfoPage>; }
