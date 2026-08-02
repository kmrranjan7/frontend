import Link from "next/link";
import { SaveResultButton } from "@/components/public/SaveResultButton";
import { ShareResultButton } from "@/components/public/ShareResultButton";
import type { PostListingItem } from "@/lib/api/post-listings";

export function PublicListingActions({
  item,
  viewHref,
  savedLabel = "RESULT",
}: {
  item: PostListingItem;
  viewHref: string;
  savedLabel?: string;
}) {
  return (
    <div className="flex w-full flex-nowrap items-center justify-between gap-1 lg:justify-end">
      <Link href={viewHref} prefetch={false} className="inline-flex h-6 shrink-0 items-center justify-center whitespace-nowrap rounded-md border border-indigo-200 bg-indigo-50 px-2 text-[8px] font-bold text-indigo-700 transition-colors hover:border-indigo-300 hover:bg-indigo-100">View Details</Link>
      <div className="flex shrink-0 items-center justify-end gap-1">
        <ShareResultButton title={item.title} href={viewHref} />
        <SaveResultButton item={{ ...item, savedHref: viewHref, savedLabel }} />
      </div>
    </div>
  );
}
