import type { Metadata } from "next";
import Link from "next/link";
import { createMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = createMetadata({
  title: "About Sarkari Global Result",
  description:
    "Learn how Sarkari Global Result helps students and job seekers find timely, accurate government recruitment and examination updates.",
  path: "/about",
});

export default function AboutPage() {
  return (
    <section className="simple-page shell">
      <span className="kicker">ABOUT US</span>
      <h1>Clear information for<br /><em>important opportunities.</em></h1>
      <p>Sarkari Global Result helps students and job seekers discover government recruitment, examinations, admissions, and results. We are an independent information service—not a government website.</p>
      <Link className="button button-primary" href="/jobs">Browse latest jobs</Link>
    </section>
  );
}
