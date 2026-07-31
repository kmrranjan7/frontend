import { PublicPostListing } from "@/components/public/PublicPostListing";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import type { IconName } from "@/components/ui/Icon";
import { POST_SEARCH_MAX_LENGTH } from "@/config/search";
import { fetchPostListings, type PostTypeSlug } from "@/lib/api/post-listings";

export async function PublicCategoryPage({
  searchParams,
  postType,
  path,
  label,
  heading,
  description,
  icon,
}: {
  searchParams: Promise<{ q?: string }>;
  postType: PostTypeSlug;
  path: string;
  label: string;
  heading: string;
  description: string;
  icon: IconName;
}) {
  const query = await searchParams;
  const search = query.q?.trim().slice(0, POST_SEARCH_MAX_LENGTH) ?? "";
  const items = await fetchPostListings({
    postType,
    search,
    size: 30,
    status: "PUBLISHED",
  }).then((page) => page.content).catch(() => []);

  return (
    <div className="content-page shell public-listing-page">
      <Breadcrumbs items={[{ name: "Home", path: "/" }, { name: label, path }]} />
      <header className="jobs-listing-heading">
        <p className="content-label">LATEST UPDATES</p>
        <h1>{heading}</h1>
        <p>{description}</p>
      </header>
      <PublicPostListing
        items={items}
        search={search}
        basePath={path}
        singularLabel={label}
        emptyMessage={`No ${label.toLowerCase()} updates found`}
        icon={icon}
      />
    </div>
  );
}
