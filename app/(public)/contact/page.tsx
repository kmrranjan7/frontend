import type { Metadata } from "next";
import { PublicInfoPage } from "@/components/public/PublicInfoPage";
import { siteConfig } from "@/config/site";
import { createMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = createMetadata({ title: "Contact Us", description: "Contact Sarkari Global Result for corrections, feedback, or general enquiries.", path: "/contact" });
export default function Page() { return <PublicInfoPage title="Contact Us" description="Send feedback, report an incorrect detail, or ask a general question." path="/contact"><h2>Email support</h2><p>Contact us at <a href={`mailto:${siteConfig.email}`}>{siteConfig.email}</a>. Include the post title and official notification link when reporting a correction.</p><h2>Response information</h2><p>We review genuine editorial and technical enquiries. Never send passwords, payment information, identity documents, or application credentials by email.</p></PublicInfoPage>; }
