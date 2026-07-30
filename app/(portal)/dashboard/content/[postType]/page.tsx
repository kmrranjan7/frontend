import { notFound } from "next/navigation";
import { PostTypeListing } from "@/components/dashboard/PostTypeListing";
import { isPostTypeSlug } from "@/lib/api/post-listings";

export default async function PostTypePage({
  params,
  searchParams,
}: {
  params: Promise<{ postType: string }>;
  searchParams: Promise<{ page?: string; search?: string; sortDir?: string }>;
}) {
  const { postType } = await params;
  const query = await searchParams;

  if (!isPostTypeSlug(postType)) notFound();

  const parsedPage = Number(query.page ?? 0);
  const page = Number.isInteger(parsedPage) && parsedPage >= 0 ? parsedPage : 0;
  const sortDir = query.sortDir === "asc" ? "asc" : "desc";

  return (
    <PostTypeListing
      postType={postType}
      page={page}
      search={query.search?.trim() ?? ""}
      sortDir={sortDir}
    />
  );
}
