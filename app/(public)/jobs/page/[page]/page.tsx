import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { JobList } from "@/components/public/JobList";
import { Pagination } from "@/components/public/Pagination";
import { jobs } from "@/data/content";
import { createMetadata } from "@/lib/seo/metadata";

const PAGE_SIZE = 1;
const totalPages = Math.ceil(jobs.length / PAGE_SIZE);

type Props = { params: Promise<{ page: string }> };

export function generateStaticParams() {
  return Array.from({ length: Math.max(0, totalPages - 1) }, (_, index) => ({
    page: String(index + 2),
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const page = Number((await params).page);

  return createMetadata({
    title: `Latest Government Jobs 2026 — Page ${page}`,
    description: `Browse page ${page} of the latest government recruitment notifications, vacancies, eligibility details, and application deadlines.`,
    path: `/jobs/page/${page}`,
    noIndex: !Number.isInteger(page) || page < 2 || page > totalPages,
  });
}

export default async function PaginatedJobsPage({ params }: Props) {
  const page = Number((await params).page);
  if (page === 1) permanentRedirect("/jobs");
  if (!Number.isInteger(page) || page < 2 || page > totalPages) notFound();

  const start = (page - 1) * PAGE_SIZE;

  return (
    <div className="content-page shell">
      <Breadcrumbs items={[
        { name: "Home", path: "/" },
        { name: "Government Jobs", path: "/jobs" },
        { name: `Page ${page}`, path: `/jobs/page/${page}` },
      ]} />
      <header className="content-hero">
        <p className="content-label">Recruitment updates</p>
        <h1>Latest Government Jobs — Page {page}</h1>
        <p>Continue browsing recent government recruitment notifications across India.</p>
      </header>
      <main>
        <JobList jobs={jobs.slice(start, start + PAGE_SIZE)} />
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          basePath="/jobs"
          ariaLabel="Government job listing pages"
        />
      </main>
    </div>
  );
}
