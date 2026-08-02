"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState, type UIEvent } from "react";
import { Icon } from "@/components/ui/Icon";
import { getBadgeStyle } from "@/data/badgeStyles";
import { fetchSidebarListings } from "@/lib/api/client-post-listings";
import type { PostListingItem } from "@/lib/api/post-listings";
import { announceHeaderPopover, HEADER_POPOVER_OPEN_EVENT, type HeaderPopoverName } from "@/lib/header-popovers";

function formatDate(value: string | null) {
  if (!value) return "Date to be announced";
  const date = new Date(`${value}T00:00:00`);
  return Number.isNaN(date.getTime())
    ? value
    : new Intl.DateTimeFormat("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }).format(date);
}

function badgeLabel(value: string | null) {
  if (!value?.trim()) return "UPDATE";
  const words = value.match(/[A-Za-z0-9]+/g) ?? [];
  return (words.length === 1 ? words[0].slice(0, 8) : words.slice(0, 4).map((word) => word[0]).join("")).toUpperCase();
}

export function LatestUpdatesHeaderButton() {
  const [open, setOpen] = useState(false);
  const [updates, setUpdates] = useState<readonly PostListingItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [hasMore, setHasMore] = useState(true);
  const controllerRef = useRef<AbortController | null>(null);
  const nextPageRef = useRef(0);
  const loadingRef = useRef(false);

  const loadLatestUpdates = useCallback(async (reset = false) => {
    if (loadingRef.current || (!reset && !hasMore)) return;

    if (reset) {
      controllerRef.current?.abort();
      nextPageRef.current = 0;
      setHasMore(true);
    }

    const controller = new AbortController();
    controllerRef.current = controller;
    loadingRef.current = true;
    setLoading(true);
    setError("");

    try {
      const page = await fetchSidebarListings({
        page: nextPageRef.current,
        signal: controller.signal,
      });
      setUpdates((current) => {
        const existing = reset ? [] : current;
        const merged = new Map(existing.map((item) => [item.id, item]));
        page.content.forEach((item) => merged.set(item.id, item));
        return Array.from(merged.values());
      });
      nextPageRef.current += 1;
      setHasMore(!page.last && page.content.length > 0);
    } catch (requestError) {
      if (requestError instanceof DOMException && requestError.name === "AbortError") return;
      setError("Latest updates could not be loaded. Please try again.");
    } finally {
      if (controllerRef.current === controller) {
        loadingRef.current = false;
        setLoading(false);
      }
    }
  }, [hasMore]);

  function toggleNotifications() {
    const next = !open;
    if (next) {
      announceHeaderPopover("latest-updates");
      if (updates.length === 0 && !loadingRef.current) void loadLatestUpdates(true);
    }
    setOpen(next);
  }

  function handleScroll(event: UIEvent<HTMLDivElement>) {
    const element = event.currentTarget;
    if (element.scrollHeight - element.scrollTop - element.clientHeight <= 48) {
      void loadLatestUpdates();
    }
  }

  useEffect(() => {
    const closeForAnotherPopover = (event: Event) => {
      if ((event as CustomEvent<HeaderPopoverName>).detail !== "latest-updates") setOpen(false);
    };
    window.addEventListener(HEADER_POPOVER_OPEN_EVENT, closeForAnotherPopover);
    return () => {
      controllerRef.current?.abort();
      window.removeEventListener(HEADER_POPOVER_OPEN_EVENT, closeForAnotherPopover);
    };
  }, []);

  return (
    <div className="relative shrink-0">
      <button
        type="button"
        aria-label="View latest notifications"
        aria-expanded={open}
        onClick={toggleNotifications}
        className={`relative inline-flex size-8 items-center justify-center rounded-full border text-blue-600 transition ${open ? "border-blue-300 bg-blue-50" : "border-blue-200 bg-white hover:border-blue-300 hover:bg-blue-50"}`}
      >
        <Icon name="bell" size={14} />
        <span className="absolute right-1 top-1 size-1.5 rounded-full bg-rose-500 ring-2 ring-white" aria-hidden="true" />
      </button>

      {open ? (
        <section className="fixed left-2 right-2 top-[54px] z-[120] overflow-hidden rounded-lg border border-blue-100 bg-white shadow-[0_18px_45px_rgba(15,23,42,0.2)] sm:absolute sm:left-auto sm:right-0 sm:top-10 sm:w-[320px]" aria-label="Latest updates">
          <header className="flex items-center justify-between border-b border-slate-100 bg-gradient-to-r from-blue-50 to-white px-2.5 py-1.5">
            <div>
              <strong className="block text-[10px] text-slate-900">Latest Updates</strong>
              <span className="text-[8px] text-slate-500">Recently published notifications</span>
            </div>
            <button type="button" onClick={() => setOpen(false)} aria-label="Close latest updates" className="grid size-6 place-items-center rounded-full border border-slate-200 bg-white text-xs text-slate-600">×</button>
          </header>

          <div onScroll={handleScroll} className="max-h-[min(310px,60vh)] overflow-y-auto p-1 [scrollbar-width:thin]" aria-live="polite">
            {loading && updates.length === 0 ? (
              <div className="flex items-center justify-center gap-2 px-4 py-8 text-[10px] font-semibold text-blue-700">
                <span className="size-3 animate-spin rounded-full border-2 border-blue-200 border-t-blue-600" />
                Loading latest updates…
              </div>
            ) : error && updates.length === 0 ? (
              <div className="px-4 py-7 text-center">
                <strong className="block text-[10px] text-slate-700">{error}</strong>
                <button type="button" onClick={() => void loadLatestUpdates(updates.length === 0)} className="mt-2 rounded-full bg-blue-600 px-3 py-1.5 text-[9px] font-bold text-white hover:bg-blue-700">Try again</button>
              </div>
            ) : updates.length ? (
              <>
              {updates.map((update) => (
                <article key={update.id} className="mb-1 rounded-lg border border-indigo-100/80 bg-white px-1.5 py-1 shadow-[0_6px_14px_rgba(15,23,42,0.06)] transition hover:border-indigo-200 hover:shadow-[0_8px_18px_rgba(99,102,241,0.12)]">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex min-w-0 items-start gap-1.5">
                      <span className="relative mt-0.5 inline-flex size-[18px] shrink-0 items-center justify-center rounded-full bg-indigo-100 text-indigo-700">
                        <Icon name="layers" size={10} />
                        <span className="absolute -bottom-2.5 left-1/2 h-2 w-px -translate-x-1/2 bg-indigo-200/80" aria-hidden="true" />
                      </span>
                      <div className="min-w-0">
                        <Link href={`/others?q=${encodeURIComponent(update.title)}`} prefetch={false} onClick={() => setOpen(false)} className="block truncate text-[10px] font-semibold text-slate-800 underline-offset-2 hover:text-indigo-700 hover:underline">{update.title}</Link>
                        <span className="block text-[8px] font-medium text-slate-500">{formatDate(update.startDate ?? update.lastDate)}</span>
                      </div>
                    </div>
                    <span className={`max-w-16 shrink-0 truncate rounded-full px-1.5 py-[2px] text-[7px] font-bold uppercase tracking-[0.08em] ${getBadgeStyle(badgeLabel(update.department))}`}>{badgeLabel(update.department)}</span>
                  </div>
                </article>
              ))}
              {loading ? <div className="flex items-center justify-center gap-2 py-3 text-[9px] font-semibold text-blue-700"><span className="size-3 animate-spin rounded-full border-2 border-blue-200 border-t-blue-600" />Loading more updates…</div> : null}
              {error ? <div className="py-2 text-center"><span className="block text-[8px] font-medium text-rose-600">Could not load more updates.</span><button type="button" onClick={() => void loadLatestUpdates()} className="mt-1 text-[9px] font-bold text-blue-700 underline underline-offset-2">Try again</button></div> : null}
              {!hasMore && updates.length > 10 ? <div className="py-2 text-center text-[8px] font-medium text-slate-400">You have reached the latest available updates.</div> : null}
              </>
            ) : (
              <div className="px-4 py-8 text-center text-[10px] font-semibold text-slate-500">No latest updates are available.</div>
            )}
          </div>
        </section>
      ) : null}
    </div>
  );
}
