import type { Metadata } from "next";
import { PublicPostListing } from "@/components/public/PublicPostListing";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { POST_SEARCH_MAX_LENGTH } from "@/config/search";
import { fetchPostListings } from "@/lib/api/post-listings";
import { createMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = createMetadata({
  title: "Latest Government Exam Results",
  description:
    "Check the latest government recruitment and examination results, score cards, merit lists, and result announcements across India.",
  path: "/results",
  keywords: [
    "sarkari result",
    "government exam results",
    "latest results",
    "merit list",
    "score card",
  ],
});

export default async function ResultsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const query = await searchParams;
  const search = query.q?.trim().slice(0, POST_SEARCH_MAX_LENGTH) ?? "";
  const items = await fetchPostListings({
    postType: "result",
    search,
    size: 100,
    status: "PUBLISHED",
  })
    .then((result) => result.content)
    .catch(() => []);

  return (
    <div className="content-page shell public-listing-page">
      <Breadcrumbs
        items={[
          { name: "Home", path: "/" },
          { name: "Results", path: "/results" },
        ]}
      />
      <header className="jobs-listing-heading">
        <p className="content-label">LATEST RESULTS</p>
        <h1>Government Exam Results</h1>
        <p>
          Check recently published results, score cards, and merit-list updates
          from government recruitment and examination authorities.
        </p>
      </header>
      <PublicPostListing
        items={items}
        search={search}
        basePath="/results"
        singularLabel="Result"
        emptyMessage="No results found"
        icon="trophy"
      />
    </div>
  );
}
