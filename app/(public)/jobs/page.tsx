import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { JobList } from "@/components/public/JobList";
import { Pagination } from "@/components/public/Pagination";
import { jobs } from "@/data/content";
import { createMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = createMetadata({
  title: "Latest Government Jobs 2026",
  description:
    "Browse the latest central and state government job notifications, vacancies, eligibility, deadlines, and official application links.",
  path: "/jobs",
  keywords: ["latest government jobs 2026", "sarkari naukri", "government vacancy"],
});

const PAGE_SIZE = 1;

export default function JobsPage() {
  return (
    <div className="content-page shell">
      <Breadcrumbs items={[
        { name: "Home", path: "/" },
        { name: "Government Jobs", path: "/jobs" },
      ]} />
      <header className="content-hero">
        <p className="content-label">Recruitment updates</p>
        <h1>Latest Government Jobs 2026</h1>
        <p>Verified recruitment information with eligibility, deadlines, vacancies, and direct links to official websites.</p>
      </header>
      <main>
        <JobList jobs={jobs.slice(0, PAGE_SIZE)} />
        <Pagination
          currentPage={1}
          totalPages={Math.ceil(jobs.length / PAGE_SIZE)}
          basePath="/jobs"
          ariaLabel="Government job listing pages"
        />
      </main>
    </div>
  );
}
