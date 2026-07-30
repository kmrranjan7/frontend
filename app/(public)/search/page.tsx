import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { jobs } from "@/data/content";
import { createMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = createMetadata({
  title: "Search",
  description: "Search Sarkari Global Result.",
  path: "/search",
  noIndex: true,
});

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string | string[] }>;
}) {
  const rawQuery = (await searchParams).q;
  const query = (Array.isArray(rawQuery) ? rawQuery[0] : rawQuery)?.trim().slice(0, 100) ?? "";
  const results = query
    ? jobs.filter((job) =>
        `${job.title} ${job.organization}`.toLowerCase().includes(query.toLowerCase()),
      )
    : [];

  return (
    <div className="content-page shell">
      <Breadcrumbs items={[
        { name: "Home", path: "/" },
        { name: "Search", path: "/search" },
      ]} />
      <header className="content-hero">
        <p className="content-label">Site search</p>
        <h1>{query ? `Search results for “${query}”` : "Search Sarkari Global Result"}</h1>
      </header>
      <main>
        <form className="site-search" action="/search" role="search">
          <label htmlFor="site-search-query">Search jobs and updates</label>
          <div><input id="site-search-query" name="q" defaultValue={query} maxLength={100} required /><button type="submit">Search</button></div>
        </form>
        {query && (
          <section aria-live="polite">
            <h2>{results.length} result{results.length === 1 ? "" : "s"} found</h2>
            <ul className="search-results">
              {results.map((job) => <li key={job.slug}><Link href={`/jobs/${job.slug}`}>{job.title}</Link><p>{job.organization}</p></li>)}
            </ul>
          </section>
        )}
      </main>
    </div>
  );
}
