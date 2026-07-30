import Link from "next/link";
import type { Job } from "@/data/content";

export function JobList({ jobs }: { jobs: Job[] }) {
  return (
    <div className="seo-card-grid">
      {jobs.map((job) => (
        <article className="seo-card" key={job.slug}>
          <p className="content-label">Latest job</p>
          <h2>
            <Link href={`/jobs/${job.slug}`}>{job.title}</Link>
          </h2>
          <p>{job.description}</p>
          <dl className="job-facts">
            <div><dt>Organization</dt><dd>{job.organization}</dd></div>
            <div><dt>Vacancies</dt><dd>{job.vacancies.toLocaleString("en-IN")}</dd></div>
            <div><dt>Last date</dt><dd>{formatDate(job.validThrough)}</dd></div>
          </dl>
          <Link className="content-link" href={`/jobs/${job.slug}`}>
            View notification <span aria-hidden="true">→</span>
          </Link>
        </article>
      ))}
    </div>
  );
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Kolkata",
  }).format(new Date(value));
}
