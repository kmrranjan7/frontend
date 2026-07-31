import type { PostListingItem } from "@/lib/api/post-listings";

export const SAVED_JOBS_STORAGE_KEY = "sarkari-global-result:saved-jobs:v1";
export const SAVED_JOBS_CHANGED_EVENT = "sarkari-global-result:saved-jobs-changed";

export type SavedListingItem = PostListingItem & Readonly<{
  savedHref?: string;
  savedLabel?: string;
}>;

export function readSavedJobs(): SavedListingItem[] {
  if (typeof window === "undefined") return [];
  try {
    const value = JSON.parse(localStorage.getItem(SAVED_JOBS_STORAGE_KEY) ?? "[]");
    return Array.isArray(value)
      ? value.filter((item): item is SavedListingItem => Boolean(item && typeof item.id === "string"))
      : [];
  } catch {
    return [];
  }
}

export function writeSavedJobs(jobs: readonly SavedListingItem[]) {
  localStorage.setItem(SAVED_JOBS_STORAGE_KEY, JSON.stringify(jobs));
  window.dispatchEvent(new Event(SAVED_JOBS_CHANGED_EVENT));
}
