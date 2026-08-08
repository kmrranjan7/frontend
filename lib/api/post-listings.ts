import { env } from "@/config/env";
import { dashboardAuthHeaders } from "@/lib/auth/session";

export const postTypeConfig = {
  job: { label: "Job", apiValue: "JOB" },
  admit: { label: "Admit", apiValue: "ADMIT" },
  exam: { label: "Exam", apiValue: "EXAM" },
  result: { label: "Result", apiValue: "RESULT" },
  admission: { label: "Admission", apiValue: "ADMISSION" },
  syllabus: { label: "Syllabus", apiValue: "SYLLABUS" },
  "answer-key": { label: "Answer Key", apiValue: "ANSWER_KEY" },
  other: { label: "Others", apiValue: "OTHERS" },
} as const;

export type PostTypeSlug = keyof typeof postTypeConfig;

export type PostListingItem = Readonly<{
  id: string;
  title: string;
  slug: string;
  postType?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
  imageUrl?: string | null;
  startDate: string | null;
  lastDate: string | null;
  status: string;
  state: string | null;
  vacancies: number | null;
  department: string | null;
  qualification: string | null;
  priorityScore: number;
}>;

export type PostListingPage = Readonly<{
  content: readonly PostListingItem[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  sort: string;
  first: boolean;
  last: boolean;
}>;

export function sortListingsByPriority(page: PostListingPage): PostListingPage {
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

type ApiResponse = Readonly<{
  success: boolean;
  message: string;
  data: PostListingPage;
}>;

export function isPostTypeSlug(value: string): value is PostTypeSlug {
  return value in postTypeConfig;
}

export async function fetchPostListings({
  postType,
  page = 0,
  size = 20,
  search = "",
  sortDir = "desc",
  status,
}: {
  postType?: PostTypeSlug;
  page?: number;
  size?: number;
  search?: string;
  sortDir?: "asc" | "desc";
  status?: "PUBLISHED" | "DRAFT";
}): Promise<PostListingPage> {
  const query = new URLSearchParams({
    page: String(page),
    size: String(size),
    sortDir,
  });

  if (postType) query.set("postType", postTypeConfig[postType].apiValue);
  if (search.trim()) query.set("search", search.trim());
  if (status) {
    query.set("status", status);
    if (status === "PUBLISHED") query.set("priorityFirst", "true");
  }

  const response = await fetch(`${env.backendApiUrl}/api/v1/jobs?${query}`, {
    headers: status === "PUBLISHED" ? undefined : await dashboardAuthHeaders(),
    cache: "no-store",
  });
  const payload = await response.json() as ApiResponse;

  if (!response.ok || !payload.success) {
    throw new Error(payload.message || "Unable to load content.");
  }

  return status === "PUBLISHED" ? sortListingsByPriority(payload.data) : payload.data;
}
