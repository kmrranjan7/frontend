import type { PostListingPage } from "@/lib/api/post-listings";

export const JOBS_BATCH_SIZE = 20;
export const SIDEBAR_BATCH_SIZE = 10;

type ListingApiResponse = Readonly<{
  success: boolean;
  message?: string;
  data?: PostListingPage;
}>;

function sortListingsByPriority(page: PostListingPage): PostListingPage {
  return {
    ...page,
    content: [...page.content].sort((left, right) => {
      const priorityDifference = (right.priorityScore ?? 0) - (left.priorityScore ?? 0);
      if (priorityDifference) return priorityDifference;

      const leftDate = left.startDate || left.createdAt || "";
      const rightDate = right.startDate || right.createdAt || "";
      return rightDate.localeCompare(leftDate);
    }),
  };
}

async function requestPublishedListings({
  postType,
  page,
  size,
  search = "",
  signal,
}: {
  postType?: string;
  page: number;
  size: number;
  search?: string;
  signal?: AbortSignal;
}): Promise<PostListingPage> {
  const query = new URLSearchParams({
    status: "PUBLISHED",
    sortDir: "desc",
    page: String(page),
    size: String(size),
  });

  if (postType) query.set("postType", postType);
  query.set("priorityFirst", "true");
  if (search.trim()) query.set("search", search.trim());

  const response = await fetch(`/api/v1/jobs?${query}`, {
    cache: "no-store",
    signal,
  });
  const payload = await response.json() as ListingApiResponse;

  if (!response.ok || !payload.success || !payload.data) {
    throw new Error(payload.message || "Unable to load published updates.");
  }

  return sortListingsByPriority(payload.data);
}

export async function fetchPublishedJobs({
  page = 0,
  search = "",
  signal,
}: {
  page?: number;
  search?: string;
  signal?: AbortSignal;
}): Promise<PostListingPage> {
  return requestPublishedListings({
    postType: "JOB",
    page,
    size: JOBS_BATCH_SIZE,
    search,
    signal,
  });
}

export function fetchPublishedPostTypeListings({
  postType,
  page = 0,
  signal,
}: {
  postType: string;
  page?: number;
  signal?: AbortSignal;
}) {
  return requestPublishedListings({
    postType,
    page,
    size: JOBS_BATCH_SIZE,
    signal,
  });
}

export function fetchSidebarListings({
  postType,
  page,
  signal,
}: {
  postType?: "OTHERS" | "ADMIT" | "EXAM" | "RESULT";
  page: number;
  signal?: AbortSignal;
}) {
  return requestPublishedListings({
    postType,
    page,
    size: SIDEBAR_BATCH_SIZE,
    signal,
  });
}
