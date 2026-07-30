import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { JsonLd } from "@/components/seo/JsonLd";
import { createMetadata } from "@/lib/seo/metadata";
import { faqJsonLd } from "@/lib/seo/json-ld";

const faqs = [
  {
    question: "Is Sarkari Global Result a government website?",
    answer: "No. Sarkari Global Result is an independent information service. Always verify information on the recruiting organization’s official website.",
  },
  {
    question: "How often are government job updates published?",
    answer: "Updates are published as official recruitment, admit card, answer key, and result notices become available.",
  },
  {
    question: "Where should I submit an application?",
    answer: "Submit applications only through the official application link provided by the recruiting organization.",
  },
];

export const metadata: Metadata = createMetadata({
  title: "Government Job Application FAQ",
  description:
    "Answers to common questions about government job notifications, official applications, admit cards, results, and Sarkari Global Result.",
  path: "/faq",
});

export default function FaqPage() {
  return (
    <div className="content-page shell">
      <Breadcrumbs items={[
        { name: "Home", path: "/" },
        { name: "Frequently Asked Questions", path: "/faq" },
      ]} />
      <header className="content-hero">
        <p className="content-label">Help center</p>
        <h1>Government Job Application FAQ</h1>
        <p>Important answers to help you use recruitment information safely and confidently.</p>
      </header>
      <main className="faq-list">
        {faqs.map((faq) => (
          <details key={faq.question}>
            <summary>{faq.question}</summary>
            <p>{faq.answer}</p>
          </details>
        ))}
      </main>
      <JsonLd data={faqJsonLd(faqs)} />
    </div>
  );
}
