"use client";

import Link from "next/link";
import type { UIEventHandler } from "react";
import { Icon } from "@/components/ui/Icon";
import type { IconName } from "@/components/ui/Icon";
import { getBadgeStyle } from "@/data/badgeStyles";
import { useInfiniteSidebarListings } from "@/components/public/home/useInfiniteSidebarListings";
import type { PostListingItem } from "@/lib/api/post-listings";

function badgeLabel(value: string | null, fallback: string) {
  if (!value?.trim()) return fallback;
  const words = value.match(/[A-Za-z0-9]+/g) ?? [];
  return (words.length === 1
    ? words[0].slice(0, 8)
    : words.slice(0, 4).map((word) => word[0]).join("")
  ).toUpperCase();
}

function formatDate(value: string | null) {
  if (!value) return "Date TBA";
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return "Date TBA";
  return [
    String(date.getDate()).padStart(2, "0"),
    String(date.getMonth() + 1).padStart(2, "0"),
    date.getFullYear(),
  ].join("-");
}

function SidebarCard({
  title,
  status,
  icon,
  items,
  onScroll,
  isLoading = false,
  loadFailed = false,
  hasMore = true,
  onRetry,
}: {
  title: string;
  status: string;
  icon: Extract<IconName, "admit" | "chart">;
  items: readonly PostListingItem[];
  onScroll?: UIEventHandler<HTMLDivElement>;
  isLoading?: boolean;
  loadFailed?: boolean;
  hasMore?: boolean;
  onRetry?: () => void;
}) {
  return (
    <section className="overflow-hidden rounded-xl border-2 border-indigo-200/90 bg-white shadow-[0_14px_30px_rgba(15,23,42,0.1)] ring-1 ring-indigo-100/80">
      <header className="relative overflow-hidden border-b border-white/10 bg-gradient-to-br from-indigo-700 via-blue-600 to-cyan-500 px-2 py-1.5 text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(255,255,255,0.22),transparent_45%)]" />
        <div className="absolute -right-5 -top-8 size-14 rounded-full bg-white/10 blur-sm" />
        <div className="relative flex items-center justify-between gap-1.5">
          <div className="flex items-center gap-1.5">
            <span className="inline-flex size-5 items-center justify-center rounded-full bg-white/20 ring-1 ring-white/30">
              <Icon name={icon} size={12} />
            </span>
            <h2 className="m-0 text-[11px] font-extrabold uppercase tracking-[0.1em] text-indigo-50">{title}</h2>
          </div>
          <span className="rounded-full bg-white/20 px-1.5 py-[2px] text-[8px] font-bold uppercase tracking-[0.08em] ring-1 ring-white/25">
            {status}
          </span>
        </div>
      </header>

      <div onScroll={onScroll} className="max-h-[280px] overflow-y-auto bg-gradient-to-b from-white to-indigo-50/20 p-1.5 [content-visibility:auto] [contain-intrinsic-size:360px] [scrollbar-color:#a5b4fc_transparent] [scrollbar-width:thin]">
        <ul className="m-0 space-y-1 p-0" aria-label={`${title} list`}>
          {items.length ? items.map((item) => {
            const organization = badgeLabel(item.department, title);
            return (
              <li key={item.id}>
                <article className="group rounded-lg border border-indigo-100/80 bg-white/85 px-1.5 py-1 shadow-[0_10px_18px_rgba(15,23,42,0.07)] transition-all duration-200 hover:-translate-y-[1px] hover:border-indigo-200 hover:bg-white hover:shadow-[0_14px_26px_rgba(99,102,241,0.14)] focus-within:border-indigo-300">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex min-w-0 items-start gap-1.5">
                      <span className="relative mt-0.5 inline-flex size-[18px] shrink-0 items-center justify-center rounded-full bg-indigo-100 text-indigo-700">
                        <Icon name={icon} size={10} />
                        <span className="absolute -bottom-2.5 left-1/2 h-2 w-px -translate-x-1/2 bg-indigo-200/80" aria-hidden="true" />
                      </span>
                      <div className="min-w-0">
                        <Link
                          href={`/${encodeURIComponent(item.slug)}`}
                          prefetch={false}
                          className="block truncate text-[10px] font-semibold text-slate-800 underline-offset-2 transition-colors hover:text-indigo-700 hover:underline focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/60"
                        >
                          {item.title}
                        </Link>
                        <p className="m-0 text-[9px] font-medium text-slate-500">{formatDate(item.startDate ?? item.lastDate)}</p>
                      </div>
                    </div>

                    <span className={`max-w-16 shrink-0 truncate rounded-full px-1.5 py-[2px] text-[8px] font-bold uppercase tracking-[0.08em] ${getBadgeStyle(organization)}`}>
                      {organization}
                    </span>
                  </div>
                </article>
              </li>
            );
          }) : (
            <li className="grid min-h-24 place-items-center rounded-lg border border-dashed border-indigo-200 bg-indigo-50/40 p-4 text-center text-[10px] font-semibold text-slate-500">
              <span className="grid gap-2 justify-items-center"><Icon name={icon} size={18} />No published {title.toLowerCase()} yet.</span>
            </li>
          )}
          {isLoading ? (
            <li className="py-1.5 text-center text-[9px] font-semibold text-indigo-600" aria-live="polite">Loading more updates…</li>
          ) : null}
          {loadFailed && onRetry ? (
            <li className="py-1 text-center">
              <button type="button" onClick={onRetry} className="text-[9px] font-semibold text-indigo-700 underline underline-offset-2">Try again</button>
            </li>
          ) : null}
          {!hasMore && items.length > 10 ? (
            <li className="py-1.5 text-center text-[8px] font-medium text-slate-400">You have reached the latest available updates.</li>
          ) : null}
        </ul>
      </div>
    </section>
  );
}

export default function HomeRightSidebar({
  admitCards,
  results,
}: {
  admitCards: readonly PostListingItem[];
  results: readonly PostListingItem[];
}) {
  const admitFeed = useInfiniteSidebarListings(admitCards, "ADMIT");
  const resultFeed = useInfiniteSidebarListings(results, "RESULT");

  return (
    <aside className="public-dashboard-right w-full space-y-2.5 max-md:max-w-none md:ml-auto md:max-w-[272px] lg:sticky lg:top-[108px] lg:self-start">
      <SidebarCard
        title="Admit Card"
        status="New"
        icon="admit"
        items={admitFeed.items}
        onScroll={admitFeed.onScroll}
        isLoading={admitFeed.isLoading}
        loadFailed={admitFeed.loadFailed}
        hasMore={admitFeed.hasMore}
        onRetry={() => void admitFeed.loadMore()}
      />
      <SidebarCard
        title="Result"
        status="Hot"
        icon="chart"
        items={resultFeed.items}
        onScroll={resultFeed.onScroll}
        isLoading={resultFeed.isLoading}
        loadFailed={resultFeed.loadFailed}
        hasMore={resultFeed.hasMore}
        onRetry={() => void resultFeed.loadMore()}
      />
    </aside>
  );
}
