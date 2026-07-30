import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { JsonLd } from "@/components/seo/JsonLd";
import { articles, getArticleBySlug } from "@/data/content";
import { createMetadata } from "@/lib/seo/metadata";
import { articleJsonLd } from "@/lib/seo/json-ld";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return articles.map((article) => ({ slug: article.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const article = await getArticleBySlug((await params).slug);
  if (!article) return createMetadata({
    title: "Article Not Found",
    description: "The requested article could not be found.",
    path: "/news",
    noIndex: true,
  });

  return createMetadata({
    title: article.title,
    description: article.description,
    path: `/news/${article.slug}`,
    type: "article",
    publishedTime: article.datePublished,
    modifiedTime: article.dateModified,
    authors: [article.author],
  });
}

export default async function ArticlePage({ params }: Props) {
  const article = await getArticleBySlug((await params).slug);
  if (!article) notFound();

  return (
    <article className="content-page detail-page shell">
      <Breadcrumbs items={[
        { name: "Home", path: "/" },
        { name: "News", path: "/news" },
        { name: article.title, path: `/news/${article.slug}` },
      ]} />
      <header className="content-hero">
        <p className="content-label">Application guide</p>
        <h1>{article.title}</h1>
        <p>{article.description}</p>
        <p className="updated-date">
          By {article.author} · <time dateTime={article.dateModified}>Updated {article.dateModified.slice(0, 10)}</time>
        </p>
      </header>
      <main className="article-body">
        {article.body.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
        <section aria-labelledby="next-steps">
          <h2 id="next-steps">Continue your preparation</h2>
          <p>Review current opportunities and read each official notification before starting an application.</p>
          <Link className="content-link" href="/jobs">Browse latest government jobs →</Link>
        </section>
      </main>
      <JsonLd data={articleJsonLd(article)} />
    </article>
  );
}
