import Link from "next/link";

const primaryLinks = [
  { label: "Latest Jobs", href: "/jobs" },
  { label: "Admit Cards", href: "/admit-cards" },
  { label: "Exams", href: "/exams" },
  { label: "Answer Keys", href: "/answer-keys" },
] as const;

const resourceLinks = [
  { label: "All India Updates", href: "/jobs" },
  { label: "Admissions", href: "/admissions" },
  { label: "Syllabus", href: "/syllabus" },
  { label: "Contact Support", href: "/contact" },
] as const;

export function PublicExploreSections() {
  return (
    <section className="space-y-2">
      <div className="grid gap-2 md:grid-cols-2">
        <article className="rounded-xl border border-cyan-100/90 bg-white/92 p-2.5 shadow-[0_8px_20px_rgba(15,23,42,0.06)] sm:p-3">
          <h2 className="text-[13px] font-black uppercase tracking-[0.08em] text-slate-900 sm:text-sm">Explore Important Sections</h2>
          <p className="mt-1 text-[11px] text-slate-600">Quickly access recruitment, examination, admit-card, and answer-key updates.</p>
          <ul className="mt-2 grid grid-cols-1 gap-1 min-[440px]:grid-cols-2">
            {primaryLinks.map((item) => <li key={item.label}><Link href={item.href} prefetch={false} className="inline-flex w-full justify-center rounded-full border border-cyan-200 bg-cyan-50 px-2 py-1 text-center text-[9px] font-bold text-cyan-800 transition-colors hover:bg-cyan-100">{item.label}</Link></li>)}
          </ul>
        </article>

        <article className="rounded-xl border border-blue-100/90 bg-white/92 p-2.5 shadow-[0_8px_20px_rgba(15,23,42,0.06)] sm:p-3">
          <h2 className="text-[13px] font-black uppercase tracking-[0.08em] text-slate-900 sm:text-sm">More Useful Resources</h2>
          <p className="mt-1 text-[11px] text-slate-600">Discover national opportunities, admissions, syllabus updates, and assistance.</p>
          <ul className="mt-2 grid grid-cols-1 gap-1 min-[440px]:grid-cols-2">
            {resourceLinks.map((item) => <li key={item.label}><Link href={item.href} prefetch={false} className="inline-flex w-full justify-center rounded-full border border-blue-200 bg-blue-50 px-2 py-1 text-center text-[9px] font-bold text-blue-800 transition-colors hover:bg-blue-100">{item.label}</Link></li>)}
          </ul>
        </article>
      </div>

      <article className="rounded-xl border border-blue-200/70 bg-gradient-to-br from-blue-50 via-indigo-50 to-cyan-50 p-2.5 shadow-[0_8px_20px_rgba(15,23,42,0.06)] sm:p-3">
        <p className="text-[11px] font-black uppercase tracking-[0.12em] text-blue-800">Related Sections</p>
        <div className="mt-1.5 grid gap-1.5 sm:grid-cols-2">
          <Link href="/jobs" prefetch={false} className="rounded-md border border-blue-200 bg-white px-2 py-1.5 text-center text-[11px] font-bold text-slate-800 transition-colors hover:border-blue-400 hover:text-blue-800">Browse Latest Government Jobs</Link>
          <Link href="/results" prefetch={false} className="rounded-md border border-blue-200 bg-white px-2 py-1.5 text-center text-[11px] font-bold text-slate-800 transition-colors hover:border-blue-400 hover:text-blue-800">Check Latest Government Results</Link>
        </div>
      </article>
    </section>
  );
}
