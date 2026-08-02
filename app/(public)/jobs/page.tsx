import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { PublicExploreSections } from "@/components/public/PublicExploreSections";
import { POST_SEARCH_MAX_LENGTH } from "@/config/search";
import { jobs as fallbackJobs } from "@/data/content";
import { JOBS_BATCH_SIZE } from "@/lib/api/client-post-listings";
import {
  fetchPostListings,
  type PostListingItem,
} from "@/lib/api/post-listings";
import { createMetadata } from "@/lib/seo/metadata";
import LatestJobsExplorer from "@/components/public/home/LatestJobsExplorer";

export const metadata: Metadata = createMetadata({
  title: "Latest Government Jobs",
  description:
    "Browse the latest government job notifications, application dates, qualifications, departments, and recruitment opportunities across India.",
  path: "/jobs",
  keywords: [
    "latest government jobs",
    "sarkari jobs",
    "government recruitment",
    "online job forms",
  ],
});

async function loadJobs(search: string) {
  try {
    const result = await fetchPostListings({
      postType: "job",
      search,
      size: JOBS_BATCH_SIZE,
      status: "PUBLISHED",
    });
    return result.content;
  } catch {
    return [];
  }
}

export default async function JobsPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
    state?: string;
    qualification?: string;
  }>;
}) {
  const query = await searchParams;
  const search = query.q?.trim().slice(0, POST_SEARCH_MAX_LENGTH) ?? "";
  const selectedState = query.state?.trim() ?? "";
  const selectedQualification = query.qualification?.trim() ?? "";
  const liveJobs = await loadJobs(search);
  const jobs: readonly PostListingItem[] = liveJobs.length
    ? liveJobs
    : fallbackJobs.map((job, index) => ({
        id: `fallback-${index}`,
        title: job.title,
        slug: job.slug,
        startDate: job.datePosted,
        lastDate: job.validThrough.slice(0, 10),
        status: "PUBLISHED",
        state: job.region,
        vacancies: job.vacancies,
        department: job.organization,
        qualification: job.qualification,
      }));
  const filteredJobs = jobs.filter(
    (job) =>
      (!selectedState || job.state === selectedState) &&
      (!selectedQualification || job.qualification === selectedQualification),
  );

  return (
    <div className="content-page shell jobs-listing-page">
      <Breadcrumbs
        items={[
          { name: "Home", path: "/" },
          { name: "Latest Jobs", path: "/jobs" },
        ]}
      />
      <header className="jobs-listing-heading">
        <p className="content-label">LATEST OPPORTUNITIES</p>
        <h1>Latest Government Jobs</h1>
        <p>
          Find current recruitment updates, important dates, eligibility details,
          and official application information in one place.
        </p>
      </header>
      <LatestJobsExplorer
        jobs={filteredJobs}
        search={search}
        selectedState={selectedState}
        selectedQualification={selectedQualification}
        basePath="/jobs"
      />
      <div className="mt-5 sm:mt-6">
        <PublicExploreSections />
      </div>
    </div>
  );
}
