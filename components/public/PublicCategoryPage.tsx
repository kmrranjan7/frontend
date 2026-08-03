import { PublicPostListing } from "@/components/public/PublicPostListing";
import { PublicExploreSections } from "@/components/public/PublicExploreSections";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import type { IconName } from "@/components/ui/Icon";
import { POST_SEARCH_MAX_LENGTH } from "@/config/search";
import { JOBS_BATCH_SIZE } from "@/lib/api/client-post-listings";
import { fetchPostListings, postTypeConfig, type PostTypeSlug } from "@/lib/api/post-listings";

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
    size: JOBS_BATCH_SIZE,
    status: "PUBLISHED",
  }).then((page) => page.content).catch(() => []);

  return (
    <main className="w-full bg-[linear-gradient(180deg,#f8fbff_0%,#ffffff_26rem)] py-2 sm:py-3 lg:py-4">
      <section className="mx-auto w-[min(1240px,96vw)] space-y-2.5 sm:w-[min(1240px,94vw)] sm:space-y-3">
        <Breadcrumbs items={[{ name: "Home", path: "/" }, { name: label, path }]} />

        <section className="relative overflow-hidden rounded-xl border border-indigo-100 bg-gradient-to-br from-white via-indigo-50/80 to-cyan-50/90 p-3.5 shadow-[0_10px_26px_rgba(15,23,42,0.07)] sm:p-4 lg:p-5">
          <p className="text-[10px] font-black uppercase tracking-[0.14em] text-indigo-700 sm:text-[11px]">{label} updates</p>
          <h1 className="mt-1 text-[22px] font-black leading-tight tracking-tight text-slate-900 sm:text-[26px] lg:text-[30px]">{heading}</h1>
          <p className="mt-1.5 max-w-4xl text-[12px] leading-relaxed text-slate-700 sm:text-[13px] lg:text-sm">{description}</p>
          <div className="mt-3 flex flex-wrap gap-1.5">
            <span className="rounded-full border border-indigo-200 bg-indigo-50 px-2.5 py-1 text-[10px] font-bold text-indigo-700">Official Updates</span>
            <span className="rounded-full border border-cyan-200 bg-cyan-50 px-2 py-1 text-[10px] font-bold text-cyan-700">Latest Notices</span>
            <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-1 text-[10px] font-bold text-emerald-700">Candidate Friendly</span>
          </div>
        </section>

        <section className="flex items-center justify-between gap-2 rounded-xl border border-amber-100 bg-white/90 p-2 shadow-[0_6px_18px_rgba(15,23,42,0.04)] sm:px-3">
          <p className="text-[10px] font-semibold text-slate-600 sm:text-[11px]"><strong className="text-slate-800">Before you continue:</strong> Check the official notice and keep your application details ready.</p>
          <span className="shrink-0 rounded-full border border-emerald-100 bg-emerald-50 px-2 py-0.5 text-[9px] font-bold text-emerald-700 sm:text-[10px]">Official information</span>
        </section>

        <PublicPostListing
          items={items}
          basePath={path}
          singularLabel={label}
          emptyMessage={`No ${label.toLowerCase()} updates found`}
          postType={postTypeConfig[postType].apiValue}
          icon={icon}
        />
        <PublicExploreSections />
      </section>
    </main>
  );
}
