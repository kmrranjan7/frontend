"use client";

import { useCallback, useEffect, useRef, useState, type UIEvent } from "react";
import { fetchSidebarListings, SIDEBAR_BATCH_SIZE } from "@/lib/api/client-post-listings";
import type { PostListingItem } from "@/lib/api/post-listings";

export function useInfiniteSidebarListings(
  initialItems: readonly PostListingItem[],
  postType?: "OTHERS" | "ADMIT" | "EXAM" | "RESULT",
) {
  const [items, setItems] = useState(initialItems);
  const [hasMore, setHasMore] = useState(initialItems.length >= SIDEBAR_BATCH_SIZE);
  const [isLoading, setIsLoading] = useState(false);
  const [loadFailed, setLoadFailed] = useState(false);
  const nextPageRef = useRef(1);
  const loadingRef = useRef(false);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => () => abortRef.current?.abort(), []);

  const loadMore = useCallback(async () => {
    if (loadingRef.current || !hasMore) return;

    loadingRef.current = true;
    setIsLoading(true);
    setLoadFailed(false);
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const result = await fetchSidebarListings({
        postType,
        page: nextPageRef.current,
        signal: controller.signal,
      });
      setItems((current) => {
        const merged = new Map(current.map((item) => [item.id, item]));
        result.content.forEach((item) => merged.set(item.id, item));
        return Array.from(merged.values());
      });
      nextPageRef.current += 1;
      setHasMore(!result.last && result.content.length > 0);
    } catch (error) {
      if (!(error instanceof DOMException && error.name === "AbortError")) {
        setLoadFailed(true);
      }
    } finally {
      loadingRef.current = false;
      setIsLoading(false);
    }
  }, [hasMore, postType]);

  function onScroll(event: UIEvent<HTMLDivElement>) {
    const element = event.currentTarget;
    if (element.scrollHeight - element.scrollTop - element.clientHeight <= 48) {
      void loadMore();
    }
  }

  return { items, hasMore, isLoading, loadFailed, loadMore, onScroll };
}
