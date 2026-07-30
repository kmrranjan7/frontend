import type { Metadata } from "next";
import Link from "next/link";
import { jobs, articles } from "@/data/content";
import { createMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = createMetadata({
  title: "Latest Government Jobs, Results & Admit Cards",
  description:
    "Find the latest government jobs, online forms, admit cards, exam results, answer keys, syllabus, admissions, and recruitment updates across India.",
  path: "/",
  keywords: [
    "government jobs",
    "sarkari result",
    "latest recruitment",
    "admit card",
    "exam result",
  ],
});

const categories = [
  ["Latest Jobs", "/jobs", "Central and state government recruitment"],
  ["Admit Cards", "/jobs", "Download exam hall tickets"],
  ["Results", "/jobs", "Check recently declared results"],
  ["Answer Keys", "/jobs", "Official and provisional answer keys"],
  ["Syllabus", "/news", "Exam patterns and detailed syllabus"],
  ["Admissions", "/news", "University and entrance updates"],
];

export default function HomePage() {
  return (
    <>
      <section className="sgr-hero">
        <div className="shell">
          <p className="content-label">Government jobs and education updates</p>
          <h1>Build your future with the right information</h1>
          <p>
            Discover current government vacancies, official application forms,
            admit cards, results, and exam updates—all organized in one place.
          </p>
          <form className="hero-search" action="/search" role="search">
            <label className="sr-only" htmlFor="home-search">Search government jobs and exams</label>
            <input id="home-search" name="q" placeholder="Search SSC, Railway, Banking, UPSC..." maxLength={100} required />
            <button type="submit">Search updates</button>
          </form>
          <nav className="quick-links" aria-label="Popular searches">
            <span>Popular:</span>
            <Link href="/jobs/ssc-cgl-recruitment-2026">SSC CGL</Link>
            <Link href="/jobs/railway-rrb-technician-recruitment-2026">Railway RRB</Link>
            <Link href="/jobs">Latest jobs</Link>
          </nav>
        </div>
      </section>

      <section className="home-section shell" aria-labelledby="browse-heading">
        <header className="home-heading">
          <div><p className="content-label">Browse by update</p><h2 id="browse-heading">Find what you need quickly</h2></div>
          <p>Clear categories and readable URLs help people and search engines understand every section.</p>
        </header>
        <div className="category-grid">
          {categories.map(([title, href, description]) => (
            <Link className="category-card" href={href} key={title}>
              <h3>{title}</h3>
              <p>{description}</p>
              <span aria-hidden="true">→</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="home-section home-tint">
        <div className="shell">
          <header className="home-heading">
            <div><p className="content-label">New notifications</p><h2>Latest Government Jobs</h2></div>
            <Link className="content-link" href="/jobs">View all jobs →</Link>
          </header>
          <div className="home-job-list">
            {jobs.map((job) => (
              <article key={job.slug}>
                <div>
                  <p>{job.organization}</p>
                  <h3><Link href={`/jobs/${job.slug}`}>{job.title}</Link></h3>
                </div>
                <dl><div><dt>Vacancies</dt><dd>{job.vacancies.toLocaleString("en-IN")}</dd></div><div><dt>Last date</dt><dd>{job.validThrough.slice(0, 10)}</dd></div></dl>
                <Link aria-label={`View ${job.title}`} href={`/jobs/${job.slug}`}>View details →</Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="home-section shell" aria-labelledby="guides-heading">
        <header className="home-heading"><div><p className="content-label">Helpful resources</p><h2 id="guides-heading">Application guides</h2></div></header>
        <div className="seo-card-grid">
          {articles.map((article) => (
            <article className="seo-card" key={article.slug}>
              <h3><Link href={`/news/${article.slug}`}>{article.title}</Link></h3>
              <p>{article.description}</p>
              <Link className="content-link" href={`/news/${article.slug}`}>Read guide →</Link>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}
