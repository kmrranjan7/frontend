"use client";

import { useEffect, useRef, useState } from "react";
import { Icon } from "@/components/ui/Icon";

export function ShareResultButton({ title, href }: { title: string; href: string }) {
  const [copied, setCopied] = useState(false);
  const timeoutRef = useRef<number | null>(null);

  useEffect(() => () => {
    if (timeoutRef.current !== null) window.clearTimeout(timeoutRef.current);
  }, []);

  async function share() {
    const url = new URL(href, window.location.origin).toString();
    try {
      if (navigator.share) {
        await navigator.share({ title, text: `Government exam result: ${title}`, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      setCopied(true);
      if (timeoutRef.current !== null) window.clearTimeout(timeoutRef.current);
      timeoutRef.current = window.setTimeout(() => {
        setCopied(false);
        timeoutRef.current = null;
      }, 1600);
    } catch {
      if (!navigator.clipboard?.writeText) return;
      try {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        if (timeoutRef.current !== null) window.clearTimeout(timeoutRef.current);
        timeoutRef.current = window.setTimeout(() => {
          setCopied(false);
          timeoutRef.current = null;
        }, 1600);
      } catch {
        setCopied(false);
      }
    }
  }

  return (
    <div className="inline-flex flex-col items-start">
      <button type="button" onClick={() => void share()} className="inline-flex size-[22px] items-center justify-center rounded-md border border-slate-200 bg-white text-slate-600 transition-colors hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/30 lg:h-6 lg:w-auto lg:min-w-[56px] lg:gap-1 lg:rounded-full lg:px-1.5 lg:text-[9px] lg:font-semibold lg:text-slate-700 lg:hover:border-slate-300 lg:hover:bg-slate-100" aria-label={`Share ${title}`}>
        <Icon name="share" size={10} />
        <span className="hidden lg:inline">Share</span>
      </button>
      {copied ? <p className="mt-0.5 text-[8px] font-semibold text-emerald-700">Link copied</p> : null}
    </div>
  );
}
