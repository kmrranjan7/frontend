"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { getBadgeStyle } from "@/data/badgeStyles";
import { readSavedJobs, SAVED_JOBS_CHANGED_EVENT, SAVED_JOBS_STORAGE_KEY } from "@/lib/saved-jobs";
import type { SavedListingItem } from "@/lib/saved-jobs";
import { announceHeaderPopover, HEADER_POPOVER_OPEN_EVENT, type HeaderPopoverName } from "@/lib/header-popovers";

function formatDate(value: string | null) {
  if (!value) return "As scheduled";
  const date = new Date(`${value}T00:00:00`);
  return Number.isNaN(date.getTime()) ? value : new Intl.DateTimeFormat("en-IN", { day: "2-digit", month: "short", year: "numeric" }).format(date);
}

function badgeLabel(value: string | null) {
  if (!value?.trim()) return "JOB";
  const words = value.match(/[A-Za-z0-9]+/g) ?? [];
  return (words.length === 1 ? words[0].slice(0, 8) : words.slice(0, 4).map((word) => word[0]).join("")).toUpperCase();
}

export function SavedJobsHeaderButton() {
  const [savedJobs, setSavedJobs] = useState<readonly SavedListingItem[]>([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const sync = () => setSavedJobs(readSavedJobs());
    const frame = requestAnimationFrame(sync);
    const onStorage = (event: StorageEvent) => {
      if (event.key === SAVED_JOBS_STORAGE_KEY) sync();
    };
    window.addEventListener("storage", onStorage);
    window.addEventListener(SAVED_JOBS_CHANGED_EVENT, sync);
    const closeForAnotherPopover = (event: Event) => {
      if ((event as CustomEvent<HeaderPopoverName>).detail !== "saved-jobs") setOpen(false);
    };
    window.addEventListener(HEADER_POPOVER_OPEN_EVENT, closeForAnotherPopover);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("storage", onStorage);
      window.removeEventListener(SAVED_JOBS_CHANGED_EVENT, sync);
      window.removeEventListener(HEADER_POPOVER_OPEN_EVENT, closeForAnotherPopover);
    };
  }, []);

  function toggleSavedJobs() {
    const next = !open;
    if (next) announceHeaderPopover("saved-jobs");
    setOpen(next);
  }

  return (
    <div className="relative ml-1 shrink-0">
      <button type="button" aria-label={`Saved updates: ${savedJobs.length}`} aria-expanded={open} onClick={toggleSavedJobs} className={`relative inline-flex size-8 items-center justify-center rounded-full border text-rose-600 transition ${open ? "border-rose-300 bg-rose-50" : "border-rose-200 bg-white hover:border-rose-300 hover:bg-rose-50"}`}>
        <Icon name="heart" size={14} filled />
        {savedJobs.length ? <span className="absolute -right-1 -top-1 grid min-w-4 h-4 place-items-center rounded-full bg-rose-600 px-1 text-[7px] font-bold text-white ring-2 ring-white">{savedJobs.length > 99 ? "99+" : savedJobs.length}</span> : null}
      </button>
      {open ? (
        <section className="fixed right-2 left-2 top-[54px] z-[120] overflow-hidden rounded-lg border border-rose-100 bg-white shadow-[0_18px_45px_rgba(15,23,42,0.2)] sm:absolute sm:right-0 sm:left-auto sm:top-10 sm:w-[320px]" aria-label="Saved jobs">
          <header className="flex items-center justify-between border-b border-slate-100 bg-gradient-to-r from-rose-50 to-white px-2.5 py-1.5"><div><strong className="block text-[10px] text-slate-900">Saved updates</strong><span className="text-[8px] text-slate-500">Available on this browser</span></div><button type="button" onClick={() => setOpen(false)} aria-label="Close saved updates" className="grid size-6 place-items-center rounded-full border border-slate-200 bg-white text-xs text-slate-600">×</button></header>
          <div className="max-h-[min(310px,60vh)] overflow-y-auto p-1 [scrollbar-width:thin]">
            {savedJobs.length ? savedJobs.map((job) => <article key={job.id} className="mb-1 rounded-lg border border-indigo-100/80 bg-white px-1.5 py-1 shadow-[0_6px_14px_rgba(15,23,42,0.06)] transition hover:border-indigo-200 hover:shadow-[0_8px_18px_rgba(99,102,241,0.12)]"><div className="flex items-start justify-between gap-2"><div className="flex min-w-0 items-start gap-1.5"><span className="relative mt-0.5 inline-flex size-[18px] shrink-0 items-center justify-center rounded-full bg-rose-100 text-rose-600"><Icon name="heart" size={9} filled /><span className="absolute -bottom-2.5 left-1/2 h-2 w-px -translate-x-1/2 bg-rose-200/80" aria-hidden="true" /></span><div className="min-w-0"><Link href={job.savedHref || `/jobs?q=${encodeURIComponent(job.title)}`} prefetch={false} onClick={() => setOpen(false)} className="block truncate text-[10px] font-semibold text-slate-800 underline-offset-2 hover:text-indigo-700 hover:underline">{job.title}</Link><span className="block text-[8px] font-medium text-slate-500">{job.savedLabel === "RESULT" ? "Released" : "Last date"}: {formatDate(job.savedLabel === "RESULT" ? job.startDate : job.lastDate)}</span></div></div><span className={`max-w-16 shrink-0 truncate rounded-full px-1.5 py-[2px] text-[7px] font-bold uppercase tracking-[0.08em] ${getBadgeStyle(job.savedLabel || badgeLabel(job.department))}`}>{job.savedLabel || badgeLabel(job.department)}</span></div></article>) : <div className="px-4 py-6 text-center"><span className="inline-flex text-rose-400"><Icon name="heart" size={16} /></span><strong className="mt-1.5 block text-[9px] text-slate-700">No saved updates yet</strong><span className="mt-1 block text-[8px] text-slate-500">Use the heart on a listing card.</span></div>}
          </div>
        </section>
      ) : null}
    </div>
  );
}
