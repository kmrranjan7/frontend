import type { Metadata } from "next";
import HomeJobsExplorer from "@/components/public/home/HomeJobsExplorer";
import HomeLeftSidebar from "@/components/public/home/HomeLeftSidebar";
import HomeRightSidebar from "@/components/public/home/HomeRightSidebar";
import { PublicExploreSections } from "@/components/public/PublicExploreSections";
import { POST_SEARCH_MAX_LENGTH } from "@/config/search";
import { JOBS_BATCH_SIZE } from "@/lib/api/client-post-listings";
import {
  fetchPostListings,
  type PostListingItem,
  type PostTypeSlug,
} from "@/lib/api/post-listings";
import { createMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = createMetadata({
  title: "Government Jobs, Results & Admit Cards 2026",
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

async function loadPublishedPosts(postType?: PostTypeSlug, search = "", size = 10) {
  try {
    const result = await fetchPostListings({
      postType,
      search,
      size,
      status: "PUBLISHED",
    });
    return result.content;
  } catch {
    return [];
  }
}

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; state?: string; qualification?: string }>;
}) {
  const query = await searchParams;
  const search = query.q?.trim().slice(0, POST_SEARCH_MAX_LENGTH) ?? "";
  const selectedState = query.state?.trim() ?? "";
  const selectedQualification = query.qualification?.trim() ?? "";
  const [jobPosts, otherPosts, examPosts, admitPosts, resultPosts] = await Promise.all([
    loadPublishedPosts("job", search, JOBS_BATCH_SIZE),
    loadPublishedPosts(),
    loadPublishedPosts("exam"),
    loadPublishedPosts("admit"),
    loadPublishedPosts("result"),
  ]);
  const latestUpdates = otherPosts;

  const jobs: readonly PostListingItem[] = jobPosts;
  const filteredJobs = jobs.filter((job) => (
    (!selectedState || job.state === selectedState)
    && (!selectedQualification || job.qualification === selectedQualification)
  ));
  return (
    <div className="public-dashboard-home">
      <div className="public-dashboard-layout">
        <HomeLeftSidebar latestUpdates={latestUpdates} exams={examPosts} />

        <div className="public-jobs-column">
          <HomeJobsExplorer
            jobs={filteredJobs}
            search={search}
            selectedState={selectedState}
            selectedQualification={selectedQualification}
          />
        </div>

        <HomeRightSidebar admitCards={admitPosts} results={resultPosts} />
      </div>
      <div className="shell mt-5 sm:mt-6">
        <PublicExploreSections />
      </div>
    </div>
  );
}
