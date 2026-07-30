import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { JsonLd } from "@/components/seo/JsonLd";
import { jobs, getJobBySlug } from "@/data/content";
import { createMetadata } from "@/lib/seo/metadata";
import { faqJsonLd, jobPostingJsonLd } from "@/lib/seo/json-ld";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return jobs.map((job) => ({ slug: job.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const job = await getJobBySlug((await params).slug);
  if (!job) return createMetadata({
    title: "Job Not Found",
    description: "The requested government job notification could not be found.",
    path: "/jobs",
    noIndex: true,
  });

  return createMetadata({
    title: job.title,
    description: job.description,
    path: `/jobs/${job.slug}`,
    image: `/jobs/${job.slug}/opengraph-image`,
    type: "article",
    publishedTime: job.datePosted,
    modifiedTime: job.dateModified,
    authors: ["Sarkari Global Result Editorial Team"],
    keywords: [job.organization, job.title, "government recruitment"],
  });
}

export default async function JobPage({ params }: Props) {
  const job = await getJobBySlug((await params).slug);
  if (!job) notFound();

  const breadcrumbs = [
    { name: "Home", path: "/" },
    { name: "Government Jobs", path: "/jobs" },
    { name: job.title, path: `/jobs/${job.slug}` },
  ];

  return (
    <article className="content-page detail-page shell">
      <Breadcrumbs items={breadcrumbs} />
      <header className="content-hero">
        <p className="content-label">Government recruitment</p>
        <h1>{job.title}</h1>
        <p>{job.description}</p>
        <p className="updated-date">
          Published <time dateTime={job.datePosted}>{job.datePosted}</time> · Updated{" "}
          <time dateTime={job.dateModified}>{job.dateModified}</time>
        </p>
      </header>

      <div className="detail-layout">
        <main>
          <section aria-labelledby="overview">
            <h2 id="overview">Recruitment overview</h2>
            <dl className="detail-facts">
              <div><dt>Organization</dt><dd>{job.organization}</dd></div>
              <div><dt>Total vacancies</dt><dd>{job.vacancies.toLocaleString("en-IN")}</dd></div>
              <div><dt>Qualification</dt><dd>{job.qualification}</dd></div>
              <div><dt>Employment type</dt><dd>Full time</dd></div>
              <div><dt>Application deadline</dt><dd><time dateTime={job.validThrough}>{job.validThrough.slice(0, 10)}</time></dd></div>
            </dl>
          </section>
          <section aria-labelledby="apply">
            <h2 id="apply">How to apply</h2>
            <p>Read the official notification carefully and confirm your eligibility before submitting the online application.</p>
            <a className="button button-primary" href={job.applyUrl} target="_blank" rel="noopener noreferrer nofollow">
              Visit official website
            </a>
          </section>
          {job.faqs.length > 0 && (
            <section aria-labelledby="faq">
              <h2 id="faq">Frequently asked questions</h2>
              {job.faqs.map((faq) => (
                <details key={faq.question}>
                  <summary>{faq.question}</summary>
                  <p>{faq.answer}</p>
                </details>
              ))}
              <JsonLd data={faqJsonLd(job.faqs)} />
            </section>
          )}
          <nav className="related-links" aria-label="Related resources">
            <h2>Related updates</h2>
            <Link href="/jobs">Latest government jobs</Link>
            <Link href="/news">Exam and recruitment news</Link>
            <Link href="/faq">Application help</Link>
          </nav>
        </main>
        <aside className="detail-aside" aria-label="Important notice">
          <h2>Verify before applying</h2>
          <p>Always confirm dates, fees, and eligibility in the official notification. Sarkari Global Result is an information service and is not a government website.</p>
        </aside>
      </div>
      <JsonLd data={jobPostingJsonLd(job)} />
    </article>
  );
}
