import { env } from "@/config/env";

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
  startDate: string | null;
  lastDate: string | null;
  status: string;
  state: string | null;
  department: string | null;
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
}: {
  postType: PostTypeSlug;
  page?: number;
  size?: number;
  search?: string;
  sortDir?: "asc" | "desc";
}): Promise<PostListingPage> {
  const query = new URLSearchParams({
    postType: postTypeConfig[postType].apiValue,
    page: String(page),
    size: String(size),
    sortDir,
  });

  if (search.trim()) query.set("search", search.trim());

  const response = await fetch(`${env.backendApiUrl}/api/v1/jobs?${query}`, {
    cache: "no-store",
  });
  const payload = await response.json() as ApiResponse;

  if (!response.ok || !payload.success) {
    throw new Error(payload.message || "Unable to load content.");
  }

  return payload.data;
}
