"use client";

import Link from "next/link";
import {
  FormEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Icon } from "@/components/ui/Icon";
import { POST_SEARCH_MAX_LENGTH } from "@/config/search";
import { getBadgeStyle } from "@/data/badgeStyles";
import { indianStates } from "@/data/indianStates";
import { qualifications } from "@/data/qualifications";
import {
  fetchPublishedJobs,
  JOBS_BATCH_SIZE,
} from "@/lib/api/client-post-listings";
import type { PostListingItem } from "@/lib/api/post-listings";
import { readSavedJobs, SAVED_JOBS_CHANGED_EVENT, SAVED_JOBS_STORAGE_KEY, writeSavedJobs } from "@/lib/saved-jobs";

const searchableJobText = new WeakMap<PostListingItem, string>();

function jobSearchText(job: PostListingItem) {
  const cached = searchableJobText.get(job);
  if (cached) return cached;

  const value = [
    job.title,
    job.department,
    job.state,
    job.qualification,
    job.vacancies,
  ].filter(Boolean).join(" ").toLowerCase();
  searchableJobText.set(job, value);
  return value;
}

function organizationCode(value: string | null) {
  if (!value?.trim()) return "JOB";
  const words = value.match(/[A-Za-z0-9]+/g) ?? [];
  return (words.length === 1
    ? words[0].slice(0, 10)
    : words.slice(0, 4).map((word) => word[0]).join("")
  ).toUpperCase();
}

function parseDate(value: string | null) {
  if (!value) return null;
  const date = new Date(`${value}T00:00:00`);
  return Number.isNaN(date.getTime()) ? null : date;
}

function formatDate(value: string | null) {
  const date = parseDate(value);
  if (!date) return "To Be Announced";
  return [
    String(date.getDate()).padStart(2, "0"),
    String(date.getMonth() + 1).padStart(2, "0"),
    date.getFullYear(),
  ].join("-");
}

function deadlineChip(value: string | null) {
  const deadline = parseDate(value);
  if (!deadline) {
    return {
      label: "To Be Announced",
      className: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
      closingThisWeek: false,
    };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const days = Math.ceil((deadline.getTime() - today.getTime()) / 86_400_000);

  if (days < 0) {
    return {
      label: "Closed",
      className: "bg-slate-100 text-slate-500 ring-1 ring-slate-200",
      closingThisWeek: false,
    };
  }
  if (days <= 7) {
    return {
      label: days === 0 ? "Closing today" : `${days}d left`,
      className: "bg-rose-100 text-rose-800 ring-1 ring-rose-300",
      closingThisWeek: true,
    };
  }
  if (days <= 15) {
    return {
      label: `${days}d left`,
      className: "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
      closingThisWeek: false,
    };
  }
  return {
    label: `${days}d left`,
    className: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
    closingThisWeek: false,
  };
}

export default function LatestJobsExplorer({
  jobs,
  search,
  selectedState,
  selectedQualification,
  basePath = "/",
}: {
  jobs: readonly PostListingItem[];
  search: string;
  selectedState: string;
  selectedQualification: string;
  basePath?: string;
}) {
  const [searchValue, setSearchValue] = useState(search);
  const [stateValue, setStateValue] = useState(selectedState);
  const [qualificationValue, setQualificationValue] = useState(selectedQualification);
  const [allJobs, setAllJobs] = useState<readonly PostListingItem[]>(jobs);
  const [visibleJobs, setVisibleJobs] = useState<readonly PostListingItem[]>(jobs);
  const [isSearching, setIsSearching] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(jobs.length === JOBS_BATCH_SIZE);
  const [currentPage, setCurrentPage] = useState(0);
  const [savedJobs, setSavedJobs] = useState<readonly PostListingItem[]>([]);
  const requestController = useRef<AbortController | null>(null);
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const loadMoreTrigger = useRef<HTMLDivElement | null>(null);
  const renderedJobs = useMemo(
    () => visibleJobs.map((job) => ({
      job,
      deadline: deadlineChip(job.lastDate),
    })),
    [visibleJobs],
  );
  const closingThisWeek = useMemo(
    () => renderedJobs.filter(({ deadline }) => deadline.closingThisWeek).length,
    [renderedJobs],
  );
  const hasFilters = Boolean(searchValue || stateValue || qualificationValue);
  const savedJobIds = useMemo(() => new Set(savedJobs.map((job) => job.id)), [savedJobs]);

  function updateSavedState(savedJobs: readonly PostListingItem[]) {
    setSavedJobs(savedJobs);
  }

  function toggleSavedJob(job: PostListingItem) {
    const savedJobs = readSavedJobs();
    const alreadySaved = savedJobs.some((savedJob) => savedJob.id === job.id);
    const nextSavedJobs = alreadySaved
      ? savedJobs.filter((savedJob) => savedJob.id !== job.id)
      : [job, ...savedJobs];

    try {
      writeSavedJobs(nextSavedJobs);
      updateSavedState(nextSavedJobs);
    } catch {
      // Storage can be unavailable in strict privacy mode; leave the UI unchanged.
    }
  }

  async function shareJob(job: PostListingItem) {
    const url = new URL(`/${encodeURIComponent(job.slug)}`, window.location.origin);
    const shareData = {
      title: job.title,
      text: `${job.title} — view details on Sarkari Global Result.`,
      url: url.toString(),
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(shareData.url);
      }
    } catch (error) {
      if (!(error instanceof DOMException && error.name === "AbortError")) {
        try {
          await navigator.clipboard.writeText(shareData.url);
        } catch {
          // Clipboard access can be unavailable in strict browser privacy modes.
        }
      }
    }
  }

  function matchesLocalFilters(
    job: PostListingItem,
    nextSearch: string,
    nextState: string,
    nextQualification: string,
  ) {
    const normalizedSearch = nextSearch.trim().toLowerCase();
    return (
      (!normalizedSearch || jobSearchText(job).includes(normalizedSearch))
      && (!nextState || job.state?.toLowerCase() === nextState.toLowerCase())
      && (!nextQualification || job.qualification?.toLowerCase().includes(nextQualification.toLowerCase()))
    );
  }

  async function applyFilters(
    nextSearch: string,
    nextState: string,
    nextQualification: string,
  ) {
    requestController.current?.abort();
    const localMatches = allJobs.filter((job) =>
      matchesLocalFilters(job, nextSearch, nextState, nextQualification),
    );

    if (localMatches.length || (!nextSearch && !nextState && !nextQualification)) {
      setVisibleJobs(localMatches.length ? localMatches : allJobs);
      setIsSearching(false);
      return;
    }

    const backendSearch = nextSearch.trim() || nextState || nextQualification;
    const controller = new AbortController();
    requestController.current = controller;
    setVisibleJobs([]);
    setIsSearching(true);

    try {
      const result = await fetchPublishedJobs({
        search: backendSearch,
        signal: controller.signal,
      });
      const remoteJobs = result.content;

      setVisibleJobs(remoteJobs.filter((job) =>
        matchesLocalFilters(job, nextSearch, nextState, nextQualification),
      ));
    } catch (error) {
      if (!(error instanceof DOMException && error.name === "AbortError")) {
        setVisibleJobs([]);
      }
    } finally {
      if (!controller.signal.aborted) setIsSearching(false);
    }
  }

  function submitSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (searchTimer.current) clearTimeout(searchTimer.current);
    void applyFilters(searchValue, stateValue, qualificationValue);
  }

  function updateSearch(value: string) {
    setSearchValue(value);
    if (searchTimer.current) clearTimeout(searchTimer.current);
    requestController.current?.abort();

    const localMatches = allJobs.filter((job) =>
      matchesLocalFilters(job, value, stateValue, qualificationValue),
    );

    if (localMatches.length || (!value && !stateValue && !qualificationValue)) {
      setVisibleJobs(localMatches.length ? localMatches : allJobs);
      setIsSearching(false);
      return;
    }

    setVisibleJobs([]);
    setIsSearching(true);
    searchTimer.current = setTimeout(() => {
      void applyFilters(value, stateValue, qualificationValue);
    }, 350);
  }

  function clearFilters() {
    if (searchTimer.current) clearTimeout(searchTimer.current);
    requestController.current?.abort();
    setSearchValue("");
    setStateValue("");
    setQualificationValue("");
    setVisibleJobs(allJobs);
    setIsSearching(false);
  }

  const loadNextPage = useCallback(async () => {
    if (isLoadingMore || !hasMore || hasFilters) return;

    setIsLoadingMore(true);
    const nextPage = currentPage + 1;

    try {
      const result = await fetchPublishedJobs({ page: nextPage });
      const nextJobs = result.content;
      setAllJobs((current) => {
        const merged = Array.from(
          new Map([...current, ...nextJobs].map((job) => [job.id, job])).values(),
        );
        setVisibleJobs(merged);
        return merged;
      });
      setCurrentPage(nextPage);
      setHasMore(!result.last);
    } catch {
      setHasMore(false);
    } finally {
      setIsLoadingMore(false);
    }
  }, [currentPage, hasFilters, hasMore, isLoadingMore]);

  useEffect(() => {
    const trigger = loadMoreTrigger.current;
    if (!trigger || hasFilters) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) void loadNextPage();
      },
      { rootMargin: "240px 0px" },
    );

    observer.observe(trigger);
    return () => observer.disconnect();
  }, [hasFilters, loadNextPage]);

  useEffect(() => () => {
    requestController.current?.abort();
    if (searchTimer.current) clearTimeout(searchTimer.current);
  }, []);

  useEffect(() => {
    const frame = requestAnimationFrame(() => updateSavedState(readSavedJobs()));
    const syncSavedJobs = (event: StorageEvent) => {
      if (event.key === SAVED_JOBS_STORAGE_KEY) updateSavedState(readSavedJobs());
    };
    const syncSavedJobsInCurrentTab = () => updateSavedState(readSavedJobs());
    window.addEventListener("storage", syncSavedJobs);
    window.addEventListener(SAVED_JOBS_CHANGED_EVENT, syncSavedJobsInCurrentTab);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("storage", syncSavedJobs);
      window.removeEventListener(SAVED_JOBS_CHANGED_EVENT, syncSavedJobsInCurrentTab);
    };
  }, []);

  return (
    <section
      className="relative block w-full min-w-0 max-w-full overflow-x-hidden"
      aria-labelledby="latest-jobs-heading"
      aria-busy={isSearching || isLoadingMore}
    >
      <div className="relative mx-0 w-full max-w-full overflow-hidden rounded-xl border border-indigo-100/90 bg-[radial-gradient(circle_at_top_right,rgba(186,230,253,0.72),transparent_38%),linear-gradient(135deg,#ffffff_0%,#f5f9ff_58%,#eef8ff_100%)] p-2 shadow-[0_10px_24px_rgba(15,23,42,0.07)] ring-1 ring-indigo-50/80 sm:px-2.5 sm:py-2.5">
        <div className="flex flex-col items-stretch gap-1.5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-center gap-1.5">
            <span className="inline-flex size-6 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-500 via-sky-500 to-indigo-600 text-white shadow-sm">
              <Icon name="spark" size={14} />
            </span>
            <div>
              <p className="m-0 text-[9px] font-black uppercase tracking-[0.14em] text-cyan-700">Latest Jobs</p>
              <h2 id="latest-jobs-heading" className="mt-0.5 text-[11px] font-bold tracking-tight text-slate-900 sm:text-[12px]">
                Discover verified government opportunities and apply with confidence.
              </h2>
            </div>
          </div>

          <Link href="/jobs" className="w-full max-w-full shrink-0 rounded-md border border-rose-600 bg-rose-600 px-2 py-1 text-center text-[9px] font-semibold leading-4 text-white transition-colors hover:bg-rose-700 sm:w-auto">
            <span className="inline-flex items-center justify-center gap-1 text-white">Closing This Week: {closingThisWeek}<Icon name="chevron" size={12} /></span>
          </Link>
        </div>

        <form action={basePath} onSubmit={submitSearch} className="mt-2 grid grid-cols-1 gap-1.5 sm:grid-cols-2 lg:grid-cols-[minmax(0,1.2fr)_minmax(130px,0.55fr)_minmax(150px,0.6fr)_auto]">
          <label className="group inline-flex min-w-0 w-full items-center gap-1.5 rounded-lg border border-slate-200 bg-white/95 px-2 py-1.5 text-[11px] font-medium text-slate-600 shadow-sm transition-all focus-within:border-cyan-300 focus-within:ring-2 focus-within:ring-cyan-100 sm:col-span-2 lg:col-span-1">
            <span className="sr-only">Search jobs</span>
            <Icon name="search" size={14} />
            <input
              name="q"
              maxLength={POST_SEARCH_MAX_LENGTH}
              value={searchValue}
              onChange={(event) => updateSearch(event.target.value)}
              placeholder="Search jobs, organization, state..."
              className="min-w-0 w-full bg-transparent text-[12px] font-medium text-slate-700 placeholder:text-slate-400 outline-none"
            />
          </label>

          <label className="inline-flex min-w-0 items-center gap-1.5 rounded-lg border border-emerald-100 bg-white/95 px-2 py-1.5 text-[11px] font-medium text-slate-600 shadow-sm">
            <span className="sr-only">Filter by state</span>
            <Icon name="trend" size={14} />
            <select
              name="state"
              value={stateValue}
              onChange={(event) => {
                const value = event.target.value;
                setStateValue(value);
                void applyFilters(searchValue, value, qualificationValue);
              }}
              className="min-w-0 w-full bg-transparent text-[12px] font-medium text-slate-700 outline-none"
            >
              {indianStates.map((state, index) => (
                <option key={state} value={index === 0 ? "" : state}>{state}</option>
              ))}
            </select>
          </label>

          <label className="inline-flex min-w-0 items-center gap-1.5 rounded-lg border border-violet-100 bg-white/95 px-2 py-1.5 text-[11px] font-medium text-slate-600 shadow-sm">
            <span className="sr-only">Filter by qualification</span>
            <Icon name="graduation" size={14} />
            <select
              name="qualification"
              value={qualificationValue}
              onChange={(event) => {
                const value = event.target.value;
                setQualificationValue(value);
                void applyFilters(searchValue, stateValue, value);
              }}
              className="min-w-0 w-full bg-transparent text-[12px] font-medium text-slate-700 outline-none"
            >
              <option value="">All Qualification</option>
              {qualifications.map((qualification) => (
                <option key={qualification} value={qualification}>{qualification}</option>
              ))}
            </select>
          </label>

          {hasFilters ? (
            <div className="flex min-w-0 items-center justify-end sm:col-span-2 lg:col-span-1">
              <button type="button" onClick={clearFilters} className="inline-flex min-h-8 items-center rounded-md border border-slate-200 bg-white px-2 text-[10px] font-semibold text-slate-600 hover:border-amber-200 hover:bg-amber-50 hover:text-amber-700">
                Clear
              </button>
            </div>
          ) : null}
        </form>
      </div>

      <div className="mt-4 w-full min-w-0">
        <div className="overflow-visible pr-0 lg:max-h-[82vh] lg:overflow-y-auto lg:pr-1 lg:[scrollbar-gutter:stable] lg:[scrollbar-color:#0284c7_#e2e8f0]">
          <div className="hidden overflow-x-auto lg:block">
            <table className="min-w-[940px] w-full table-fixed border-separate border-spacing-0 overflow-hidden rounded-xl border border-slate-200 text-left shadow-sm">
              <thead className="bg-gradient-to-r from-indigo-700 via-blue-600 to-cyan-500 text-white">
                <tr>
                  <th className="w-[40%] px-4 py-2.5 text-[10px] font-black uppercase tracking-[0.12em]">Job opportunity</th>
                  <th className="w-[17%] px-3 py-2.5 text-[10px] font-black uppercase tracking-[0.12em]">Organization</th>
                  <th className="w-[12%] px-3 py-2.5 text-[10px] font-black uppercase tracking-[0.12em]">State</th>
                  <th className="w-[11%] px-3 py-2.5 text-[10px] font-black uppercase tracking-[0.12em]">Last date</th>
                  <th className="w-[20%] px-3 py-2.5 text-right text-[10px] font-black uppercase tracking-[0.12em]">Actions</th>
                </tr>
              </thead>
              <tbody>
                {renderedJobs.map(({ job, deadline }) => {
                  const isSaved = savedJobIds.has(job.id);
                  return (
                    <tr key={job.id} className="group border-t border-slate-100 bg-white transition-colors even:bg-slate-50/55 hover:bg-cyan-50/70">
                      <td className="px-4 py-3"><Link href={`/${encodeURIComponent(job.slug)}`} className="line-clamp-2 text-[13px] font-bold leading-[18px] text-slate-900 transition-colors group-hover:text-indigo-800">{job.title}</Link></td>
                      <td className="px-3 py-3"><span className={`inline-block max-w-full truncate rounded-full px-2 py-1 text-[9px] font-black uppercase tracking-[0.06em] ${getBadgeStyle(job.department || job.title)}`}>{organizationCode(job.department)}</span></td>
                      <td className="px-3 py-3 text-[11px] font-semibold text-slate-700">{job.state || "All India"}</td>
                      <td className="px-3 py-3"><div className="flex items-center gap-3 whitespace-nowrap"><span className="text-[11px] font-semibold tabular-nums text-rose-700">{formatDate(job.lastDate)}</span><span className={`inline-flex rounded-full px-1.5 py-0.5 text-[8px] font-bold ${deadline.className}`}>{deadline.label}</span></div></td>
                      <td className="px-3 py-3"><div className="flex flex-nowrap items-center justify-end gap-1"><Link href={`/${encodeURIComponent(job.slug)}`} className="inline-flex h-6 shrink-0 items-center rounded-md border border-indigo-200 bg-indigo-50 px-2 text-[8px] font-bold whitespace-nowrap text-indigo-700">View Details</Link><button type="button" onClick={() => void shareJob(job)} aria-label={`Share ${job.title}`} className="inline-flex size-6 shrink-0 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-600"><Icon name="share" size={11} /></button><button type="button" onClick={() => toggleSavedJob(job)} aria-label={isSaved ? `Remove ${job.title} from saved jobs` : `Save ${job.title}`} aria-pressed={isSaved} className={`inline-flex size-6 shrink-0 items-center justify-center rounded-md border ${isSaved ? "border-rose-200 bg-rose-50 text-rose-600" : "border-slate-200 bg-white text-slate-500"}`}><Icon name="heart" size={11} filled={isSaved} /></button></div></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="grid min-w-0 grid-cols-1 gap-2 px-0 min-[560px]:grid-cols-2 lg:hidden">
            {renderedJobs.map(({ job, deadline }) => {
              const isSaved = savedJobIds.has(job.id);
              return (
                <article key={job.id} className="group relative flex min-w-0 flex-col rounded-lg border border-slate-200/90 bg-white p-2 shadow-sm transition-shadow hover:border-cyan-200 hover:shadow-md sm:rounded-md sm:p-1.5">
                  <div className="flex items-start justify-between gap-1">
                    <span className={`max-w-[58%] truncate rounded-full px-1.5 py-0.5 text-[9px] font-black uppercase tracking-[0.08em] ${getBadgeStyle(job.department || job.title)}`}>
                      {organizationCode(job.department)}
                    </span>
                    <span className={`shrink-0 rounded-full px-1.5 py-0.5 text-[9px] font-bold ${deadline.className}`}>
                      {deadline.label}
                    </span>
                  </div>

                  <Link href={`/${encodeURIComponent(job.slug)}`} className="mt-1 block text-[11px] font-bold leading-3.5 text-slate-900 transition-colors hover:text-cyan-800 sm:text-[12px]">
                    {job.title}
                  </Link>

                  <div className="mt-1 grid grid-cols-2 gap-x-1.5 gap-y-0.5 border-t border-slate-100 pt-1 pr-7 text-[8px] leading-3 text-slate-600 sm:text-[9px]">
                    <p className="m-0 min-w-0"><span className="block font-bold uppercase tracking-wide text-slate-400">State</span><span className="line-clamp-1 font-semibold text-slate-700">{job.state || "All India"}</span></p>
                    <p className="m-0 min-w-0"><span className="block font-bold uppercase tracking-wide text-slate-400">Seats</span><span className="line-clamp-1 font-semibold text-emerald-700">{job.vacancies?.toLocaleString("en-IN") ?? "Not specified"}</span></p>
                    <p className="m-0 min-w-0"><span className="block font-bold uppercase tracking-wide text-slate-400">Starts</span><span className="line-clamp-1 font-semibold text-slate-700">{formatDate(job.startDate)}</span></p>
                    <div className="min-w-0">
                      <p className="m-0 min-w-0"><span className="block font-bold uppercase tracking-wide text-slate-400">Last date</span><span className="line-clamp-1 font-bold text-rose-700">{formatDate(job.lastDate)}</span></p>
                      <span className="absolute right-1.5 bottom-1.5 flex shrink-0 flex-col items-center gap-1">
                        <button
                          type="button"
                          aria-label={isSaved ? `Remove ${job.title} from saved jobs` : `Save ${job.title}`}
                          aria-pressed={isSaved}
                          title={isSaved ? "Remove from saved jobs" : "Save job"}
                          onClick={() => toggleSavedJob(job)}
                          className={`inline-flex size-6 items-center justify-center rounded-full border transition ${isSaved ? "border-rose-300 bg-rose-50 text-rose-600" : "border-slate-200 bg-white text-slate-500 hover:border-rose-300 hover:bg-rose-50 hover:text-rose-600"}`}
                        >
                          <Icon name="heart" size={11} filled={isSaved} />
                        </button>
                        <button
                          type="button"
                          aria-label={`Share ${job.title}`}
                          title="Share job"
                          onClick={() => void shareJob(job)}
                          className="inline-flex size-6 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 transition hover:border-cyan-300 hover:bg-cyan-50 hover:text-cyan-700"
                        >
                          <Icon name="share" size={11} />
                        </button>
                      </span>
                    </div>
                  </div>
                </article>
              );
            })}

            {visibleJobs.length === 0 ? (
              <div className="col-span-full rounded-xl border border-dashed border-cyan-200 bg-cyan-50/40 px-4 py-8 text-center">
                <p className="m-0 text-sm font-semibold text-slate-700">
                  {isSearching ? "Searching published jobs..." : "No jobs found for selected filters"}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  {isSearching ? "Checking the latest records." : "Try clearing filters or changing search keywords."}
                </p>
                {!isSearching ? (
                  <button type="button" onClick={clearFilters} className="mt-3 inline-flex rounded-md bg-cyan-600 px-3 py-2 text-[10px] font-bold text-white">
                    Clear filters
                  </button>
                ) : null}
              </div>
            ) : null}
          </div>
          {!hasFilters ? (
            <div ref={loadMoreTrigger} className="flex min-h-12 items-center justify-center py-3" aria-live="polite">
              {isLoadingMore ? (
                <span className="text-[10px] font-bold text-cyan-700">Loading 20 more jobs...</span>
              ) : hasMore ? (
                <span className="text-[10px] text-slate-400">Scroll for more jobs</span>
              ) : visibleJobs.length ? (
                <span className="text-[10px] text-slate-400">All published jobs loaded</span>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
