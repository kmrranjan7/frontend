import type { Metadata } from "next";
import { createMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = createMetadata({
  title: "Contact Us",
  description: "Contact Sarkari Global Result for help with government job updates, online forms, admit cards, results, and website enquiries.",
  path: "/contact",
});

export default function ContactLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
