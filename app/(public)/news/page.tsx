import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { articles } from "@/data/content";
import { createMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = createMetadata({
  title: "Government Exam and Recruitment News",
  description:
    "Read practical government exam guidance, recruitment news, application help, and important updates for students and job seekers.",
  path: "/news",
});

export default function NewsPage() {
  return (
    <div className="content-page shell">
      <Breadcrumbs items={[
        { name: "Home", path: "/" },
        { name: "News", path: "/news" },
      ]} />
      <header className="content-hero">
        <p className="content-label">Guides and updates</p>
        <h1>Government Exam and Recruitment News</h1>
        <p>Clear explanations and practical guidance for every stage of your application journey.</p>
      </header>
      <main className="seo-card-grid">
        {articles.map((article) => (
          <article className="seo-card" key={article.slug}>
            <p className="content-label">Application guide</p>
            <h2><Link href={`/news/${article.slug}`}>{article.title}</Link></h2>
            <p>{article.description}</p>
            <time dateTime={article.datePublished}>{article.datePublished.slice(0, 10)}</time>
            <Link className="content-link" href={`/news/${article.slug}`}>Read article →</Link>
          </article>
        ))}
      </main>
    </div>
  );
}
