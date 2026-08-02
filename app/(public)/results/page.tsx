import type { Metadata } from "next";
import Link from "next/link";
import { createMetadata } from "@/lib/seo/metadata";
import { POST_SEARCH_MAX_LENGTH } from "@/config/search";
import { fetchPostListings } from "@/lib/api/post-listings";
import { PublicListingActions } from "@/components/public/PublicListingActions";
import { PublicPostListing } from "@/components/public/PublicPostListing";

export const metadata: Metadata = createMetadata({
  title: "Latest Government Exam Results",
  description: "Find government exam results, scorecards, merit lists, and selection updates across India.",
  path: "/results",
});

const categoryLinks = [
  { label: "Latest Jobs", href: "/jobs" },
  { label: "Admit Cards", href: "/admit-cards" },
  { label: "Exams", href: "/exams" },
  { label: "Answer Keys", href: "/answer-keys" },
] as const;

const stateLinks = [
  { label: "All India Updates", href: "/jobs" },
  { label: "Admissions", href: "/admissions" },
  { label: "Syllabus", href: "/syllabus" },
  { label: "Contact Support", href: "/contact" },
] as const;

function formatDate(value: string | null) {
  if (!value) return "To Be Announced";
  const date = new Date(`${value.slice(0, 10)}T00:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  return [
    String(date.getDate()).padStart(2, "0"),
    String(date.getMonth() + 1).padStart(2, "0"),
    date.getFullYear(),
  ].join("-");
}

export default async function ResultsPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const query = await searchParams;
  const search = query.q?.trim().slice(0, POST_SEARCH_MAX_LENGTH) ?? "";
  const rows = await fetchPostListings({
    postType: "result",
    status: "PUBLISHED",
    search,
    page: 0,
    size: 20,
    sortDir: "desc",
  }).then((page) => page.content).catch(() => []);

  return (
    <main className="w-full bg-[linear-gradient(180deg,#f8fbff_0%,#ffffff_26rem)] py-2 sm:py-3 lg:py-4">
      <section className="mx-auto w-[min(1240px,96vw)] space-y-2.5 sm:w-[min(1240px,94vw)] sm:space-y-3">
        <section className="relative overflow-hidden rounded-xl border border-indigo-100 bg-gradient-to-br from-white via-indigo-50/80 to-cyan-50/90 p-3.5 shadow-[0_10px_26px_rgba(15,23,42,0.07)] sm:p-4 lg:p-5">
          <p className="text-[10px] font-black uppercase tracking-[0.14em] text-indigo-700 sm:text-[11px]">Results</p>
          <h1 className="mt-1 text-[22px] font-black leading-tight tracking-tight text-slate-900 sm:text-[26px] lg:text-[30px]">Latest Government Exam Results</h1>
          <p className="mt-1.5 max-w-4xl text-[12px] leading-relaxed text-slate-700 sm:text-[13px] lg:text-sm">
            Stay informed about result announcements for competitive exams, recruitment tests, and major government selections. Find important merit-list, scorecard, and selection updates in one clear workspace.
          </p>
          <div className="mt-3 flex flex-wrap gap-1.5">
            <span className="rounded-full border border-indigo-200 bg-indigo-50 px-2.5 py-1 text-[10px] font-bold text-indigo-700">Official Results</span>
            <span className="rounded-full border border-cyan-200 bg-cyan-50 px-2 py-1 text-[10px] font-bold text-cyan-700">Merit Lists</span>
            <span className="rounded-full border border-blue-200 bg-blue-50 px-2 py-1 text-[10px] font-bold text-blue-700">Selection Updates</span>
            <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-1 text-[10px] font-bold text-emerald-700">Candidate Friendly</span>
          </div>
        </section>

        <section className="flex items-center justify-between gap-2 rounded-xl border border-amber-100 bg-white/90 p-2 shadow-[0_6px_18px_rgba(15,23,42,0.04)] sm:px-3">
          <p className="text-[10px] font-semibold text-slate-600 sm:text-[11px]"><strong className="text-slate-800">Before you check:</strong> Keep your roll number and date of birth ready.</p>
          <span className="shrink-0 rounded-full border border-emerald-100 bg-emerald-50 px-2 py-0.5 text-[9px] font-bold text-emerald-700 sm:text-[10px]">Candidate guidance</span>
        </section>

        <section className="hidden overflow-hidden rounded-xl border border-cyan-100/90 bg-white/92 shadow-[0_10px_24px_rgba(15,23,42,0.08)]">
          {rows.length ? (
            <>
              <div className="hidden overflow-x-auto lg:block">
                <table className="min-w-[940px] w-full table-fixed border-separate border-spacing-0 text-left">
                  <thead className="bg-gradient-to-r from-indigo-700 via-blue-600 to-cyan-500 text-white">
                    <tr>
                      <th className="w-[40%] px-4 py-2.5 text-[10px] font-black uppercase tracking-[0.12em]">Result update</th>
                      <th className="w-[17%] px-3 py-2.5 text-[10px] font-black uppercase tracking-[0.12em]">Organization</th>
                      <th className="w-[12%] px-3 py-2.5 text-[10px] font-black uppercase tracking-[0.12em]">State</th>
                      <th className="w-[11%] px-3 py-2.5 text-[10px] font-black uppercase tracking-[0.12em]">Released</th>
                      <th className="w-[20%] px-3 py-2.5 text-right text-[10px] font-black uppercase tracking-[0.12em]">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row) => (
                      <tr key={row.id} className="group border-t border-slate-100 bg-white transition-colors even:bg-slate-50/55 hover:bg-cyan-50/70">
                        <td className="px-4 py-3">
                          <div className="flex items-start gap-2.5">
                            <span className="mt-0.5 inline-flex h-5 shrink-0 items-center rounded-full border border-emerald-200 bg-emerald-50 px-1.5 text-[8px] font-black uppercase tracking-[0.08em] text-emerald-700">New</span>
                            <strong className="line-clamp-2 text-[13px] leading-[18px] text-slate-900 transition-colors group-hover:text-indigo-800">{row.title}</strong>
                          </div>
                        </td>
                        <td className="px-3 py-3"><span className="inline-block max-w-full truncate rounded-full border border-cyan-200 bg-cyan-50 px-2 py-1 text-[9px] font-black uppercase tracking-[0.06em] text-cyan-800">{row.department || "Sarkari Global Result"}</span></td>
                        <td className="px-3 py-3 text-[11px] font-semibold text-slate-700"><span className="line-clamp-2">{row.state || "All India"}</span></td>
                        <td className="px-3 py-3 text-[11px] font-semibold tabular-nums text-slate-700">{formatDate(row.startDate)}</td>
                        <td className="px-3 py-3"><PublicListingActions item={row} viewHref={`/results?q=${encodeURIComponent(row.title)}`} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="grid gap-1 p-1 sm:grid-cols-2 sm:p-1.5 lg:hidden">
                {rows.map((row) => (
                  <article key={row.id} className="rounded-lg border border-slate-200/90 bg-white p-1.5 shadow-[0_4px_12px_rgba(15,23,42,0.04)]">
                    <div className="flex items-start justify-between gap-2">
                      <span className="max-w-[58%] truncate rounded-full border border-cyan-200 bg-cyan-50 px-2 py-0.5 text-[9px] font-black uppercase tracking-[0.06em] text-cyan-800">{row.department || "Result"}</span>
                      <span className="shrink-0 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[9px] font-bold text-emerald-700">Result Released</span>
                    </div>
                    <h2 className="mt-1.5 text-[13px] font-bold leading-[18px] text-slate-900">{row.title}</h2>
                    <div className="mt-1 grid grid-cols-2 gap-1 text-[10px] text-slate-600">
                      <p><span className="font-bold text-slate-700">State:</span> {row.state || "All India"}</p>
                      <p><span className="font-bold text-slate-700">Released:</span> {formatDate(row.startDate)}</p>
                    </div>
                    <div className="mt-1.5 border-t border-slate-100 pt-1.5"><PublicListingActions item={row} viewHref={`/results?q=${encodeURIComponent(row.title)}`} /></div>
                  </article>
                ))}
              </div>
              <div className="border-t border-slate-200 bg-white/90 px-3 py-1.5 text-center text-[9px] font-semibold text-slate-600">You have reached the end.</div>
            </>
          ) : (
            <div className="px-4 py-10 text-center">
              <p className="text-base font-bold text-slate-800">No results available right now</p>
              <p className="mt-1 text-sm text-slate-500">New published result notifications will appear here.</p>
            </div>
          )}
        </section>

        <PublicPostListing
          items={rows}
          basePath="/results"
          singularLabel="Result"
          emptyMessage="No results available right now"
          postType="RESULT"
          icon="trophy"
        />

        <section className="grid gap-2 md:grid-cols-2">
          <article className="rounded-xl border border-cyan-100/90 bg-white/92 p-2.5 shadow-[0_8px_20px_rgba(15,23,42,0.06)] sm:p-3">
            <h2 className="text-[13px] font-black uppercase tracking-[0.08em] text-slate-900 sm:text-sm">Explore Important Sections</h2>
            <p className="mt-1 text-[11px] text-slate-600">Quickly access recruitment, examination, admit-card, and answer-key updates.</p>
            <ul className="mt-2 grid grid-cols-1 gap-1 min-[440px]:grid-cols-2">
              {categoryLinks.map((item) => <li key={item.label}><Link href={item.href} prefetch={false} className="inline-flex w-full justify-center rounded-full border border-cyan-200 bg-cyan-50 px-2 py-1 text-center text-[9px] font-bold text-cyan-800 transition-colors hover:bg-cyan-100">{item.label}</Link></li>)}
            </ul>
          </article>

          <article className="rounded-xl border border-blue-100/90 bg-white/92 p-2.5 shadow-[0_8px_20px_rgba(15,23,42,0.06)] sm:p-3">
            <h2 className="text-[13px] font-black uppercase tracking-[0.08em] text-slate-900 sm:text-sm">More Useful Resources</h2>
            <p className="mt-1 text-[11px] text-slate-600">Discover national opportunities, admissions, syllabus updates, and assistance.</p>
            <ul className="mt-2 grid grid-cols-1 gap-1 min-[440px]:grid-cols-2">
              {stateLinks.map((item) => <li key={item.label}><Link href={item.href} prefetch={false} className="inline-flex w-full justify-center rounded-full border border-blue-200 bg-blue-50 px-2 py-1 text-center text-[9px] font-bold text-blue-800 transition-colors hover:bg-blue-100">{item.label}</Link></li>)}
            </ul>
          </article>
        </section>

        <section className="rounded-xl border border-blue-200/70 bg-gradient-to-br from-blue-50 via-indigo-50 to-cyan-50 p-2.5 shadow-[0_8px_20px_rgba(15,23,42,0.06)] sm:p-3 lg:p-4">
          <p className="text-[11px] font-black uppercase tracking-[0.12em] text-blue-800">Related Sections</p>
          <div className="mt-1.5 grid gap-1.5 sm:grid-cols-2">
            <Link href="/jobs" prefetch={false} className="rounded-md border border-blue-200 bg-white px-2 py-1.5 text-center text-[11px] font-bold text-slate-800 transition-colors hover:border-blue-400 hover:text-blue-800">Browse Latest Government Jobs</Link>
            <Link href="/admit-cards" prefetch={false} className="rounded-md border border-blue-200 bg-white px-2 py-1.5 text-center text-[11px] font-bold text-slate-800 transition-colors hover:border-blue-400 hover:text-blue-800">Download Latest Admit Cards</Link>
          </div>
        </section>
      </section>
    </main>
  );
}
