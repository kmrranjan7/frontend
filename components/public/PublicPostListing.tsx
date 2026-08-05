"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { PublicListingActions } from "@/components/public/PublicListingActions";
import { Icon, type IconName } from "@/components/ui/Icon";
import { fetchPublishedPostTypeListings, JOBS_BATCH_SIZE } from "@/lib/api/client-post-listings";
import type { PostListingItem } from "@/lib/api/post-listings";

function formatDate(value: string | null) {
  if (!value) return "As per schedule";

  const date = new Date(`${value.slice(0, 10)}T00:00:00`);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

export function PublicPostListing({
  items,
  basePath,
  singularLabel,
  emptyMessage,
  postType,
  icon = "file",
}: {
  items: readonly PostListingItem[];
  basePath: string;
  singularLabel: string;
  emptyMessage: string;
  postType: string;
  icon?: IconName;
}) {
  const [listingItems, setListingItems] = useState(items);
  const [nextPage, setNextPage] = useState(1);
  const [hasMore, setHasMore] = useState(items.length >= JOBS_BATCH_SIZE);
  const [loading, setLoading] = useState(false);
  const loadingRef = useRef(false);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setListingItems(items);
    setNextPage(1);
    setHasMore(items.length >= JOBS_BATCH_SIZE);
  }, [items]);

  const loadMore = useCallback(async () => {
    if (loadingRef.current || !hasMore) return;
    loadingRef.current = true;
    setLoading(true);
    try {
      const page = await fetchPublishedPostTypeListings({ postType, page: nextPage });
      setListingItems((current) => Array.from(new Map([...current, ...page.content].map((item) => [item.id, item])).values()));
      setNextPage((current) => current + 1);
      setHasMore(!page.last);
    } catch {
      setHasMore(false);
    } finally {
      loadingRef.current = false;
      setLoading(false);
    }
  }, [hasMore, nextPage, postType]);

  useEffect(() => {
    const target = loadMoreRef.current;
    if (!target || !hasMore) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) void loadMore();
    }, { rootMargin: "240px 0px" });
    observer.observe(target);
    return () => observer.disconnect();
  }, [hasMore, loadMore]);

  return (
    <section className="public-listing-panel" aria-label={`${singularLabel} listings`}>
      <div className="hidden overflow-x-auto lg:block">
        <table className="min-w-[940px] w-full table-fixed border-separate border-spacing-0 text-left">
          <thead className="bg-gradient-to-r from-indigo-700 via-blue-600 to-cyan-500 text-white">
            <tr>
              <th className="w-[40%] px-4 py-2.5 text-[10px] font-black uppercase tracking-[0.12em]">{singularLabel} update</th>
              <th className="w-[17%] px-3 py-2.5 text-[10px] font-black uppercase tracking-[0.12em]">Organization</th>
              <th className="w-[12%] px-3 py-2.5 text-[10px] font-black uppercase tracking-[0.12em]">State</th>
              <th className="w-[11%] px-3 py-2.5 text-[10px] font-black uppercase tracking-[0.12em]">Published</th>
              <th className="w-[20%] px-3 py-2.5 text-right text-[10px] font-black uppercase tracking-[0.12em]">Actions</th>
            </tr>
          </thead>
          <tbody>
            {listingItems.map((item) => (
              <tr key={item.id} className="group border-t border-slate-100 bg-white transition-colors even:bg-slate-50/55 hover:bg-cyan-50/70">
                <td className="px-4 py-3">
                  <div className="flex items-start gap-2.5">
                    <span className="mt-0.5 inline-flex size-5 shrink-0 items-center justify-center rounded-full border border-indigo-200 bg-indigo-50 text-indigo-700"><Icon name={icon} size={11} /></span>
                    <Link href={`/${encodeURIComponent(item.slug)}`} className="line-clamp-2 text-[13px] font-bold leading-[18px] text-slate-900 transition-colors group-hover:text-indigo-800">{item.title}</Link>
                  </div>
                </td>
                <td className="px-3 py-3"><span className="inline-block max-w-full truncate rounded-full border border-cyan-200 bg-cyan-50 px-2 py-1 text-[9px] font-black uppercase tracking-[0.06em] text-cyan-800">{item.department || "Sarkari Global Result"}</span></td>
                <td className="px-3 py-3 text-[11px] font-semibold text-slate-700"><span className="line-clamp-2">{item.state || "All India"}</span></td>
                <td className="px-3 py-3 text-[11px] font-semibold tabular-nums text-slate-700">{formatDate(item.startDate)}</td>
                <td className="px-3 py-3"><PublicListingActions item={item} viewHref={`/${encodeURIComponent(item.slug)}`} savedLabel={singularLabel.toUpperCase()} /></td>
              </tr>
            ))}
            {listingItems.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-12 text-center text-sm font-semibold text-slate-500">{emptyMessage}</td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>

      <div className="grid gap-2 p-2 sm:grid-cols-2 lg:hidden">
        {listingItems.map((item) => (
          <article key={item.id} className="group flex min-w-0 flex-col rounded-lg border border-slate-200/90 bg-white p-2 shadow-sm transition-shadow hover:border-cyan-200 hover:shadow-md">
            <div className="flex items-start justify-between gap-2">
              <span className="max-w-[62%] truncate rounded-full border border-cyan-200 bg-cyan-50 px-1.5 py-0.5 text-[9px] font-black uppercase tracking-[0.08em] text-cyan-800">{item.department || singularLabel}</span>
              <span className="shrink-0 rounded-full border border-emerald-200 bg-emerald-50 px-1.5 py-0.5 text-[9px] font-bold text-emerald-700">Available</span>
            </div>
            <Link href={`/${encodeURIComponent(item.slug)}`} className="mt-2 line-clamp-2 text-[13px] font-bold leading-[18px] text-slate-900 transition-colors hover:text-cyan-800">{item.title}</Link>
            <div className="mt-2 grid grid-cols-2 gap-1.5 border-t border-slate-100 pt-2 text-[9px] text-slate-600">
              <p className="m-0 min-w-0"><span className="block font-black uppercase tracking-wide text-slate-400">State</span><span className="block truncate font-bold text-slate-700">{item.state || "All India"}</span></p>
              <p className="m-0 min-w-0"><span className="block font-black uppercase tracking-wide text-slate-400">Published</span><span className="block truncate font-bold text-slate-700">{formatDate(item.startDate)}</span></p>
            </div>
            <div className="mt-2 border-t border-slate-100 pt-2"><PublicListingActions item={item} viewHref={`/${encodeURIComponent(item.slug)}`} savedLabel={singularLabel.toUpperCase()} /></div>
          </article>
        ))}

        {listingItems.length === 0 ? (
          <div className="col-span-full public-listing-empty">
            <Icon name={icon} size={22} />
            <strong>{emptyMessage}</strong>
            <span>New official updates will appear here when published.</span>
          </div>
        ) : null}
      </div>
      <div ref={loadMoreRef} className="flex min-h-12 items-center justify-center border-t border-slate-100 px-3 py-3 text-[10px] font-semibold text-slate-500" aria-live="polite">
        {loading ? "Loading 20 more updates..." : hasMore ? "Scroll down for more updates" : listingItems.length ? "All published updates loaded" : null}
      </div>
    </section>
  );
}
