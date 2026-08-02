"use client";

import { useEffect, useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { readSavedJobs, SAVED_JOBS_CHANGED_EVENT, writeSavedJobs, type SavedListingItem } from "@/lib/saved-jobs";

export function SaveResultButton({ item }: { item: SavedListingItem }) {
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const sync = () => setSaved(readSavedJobs().some((savedItem) => savedItem.id === item.id));
    const frame = requestAnimationFrame(sync);
    window.addEventListener(SAVED_JOBS_CHANGED_EVENT, sync);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener(SAVED_JOBS_CHANGED_EVENT, sync);
    };
  }, [item.id]);

  function toggleSaved() {
    const current = readSavedJobs();
    const next = current.some((savedItem) => savedItem.id === item.id)
      ? current.filter((savedItem) => savedItem.id !== item.id)
      : [item, ...current];
    writeSavedJobs(next);
    setSaved(next.some((savedItem) => savedItem.id === item.id));
  }

  return (
    <button type="button" onClick={toggleSaved} aria-label={saved ? `Remove ${item.title} from saved updates` : `Save ${item.title}`} aria-pressed={saved} title={saved ? "Saved update" : "Save update"} className={`inline-flex size-6 items-center justify-center rounded-md border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500/30 ${saved ? "border-rose-200 bg-rose-50 text-rose-600" : "border-slate-200 bg-white text-slate-500 hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600"}`}>
      <Icon name="heart" size={11} filled={saved} />
    </button>
  );
}
