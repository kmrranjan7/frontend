import Link from "next/link";

const recoveryLinks = [
  { href: "/jobs", label: "Latest Jobs", description: "Browse current government vacancies" },
  { href: "/results", label: "Results", description: "Check recently announced results" },
  { href: "/admit-cards", label: "Admit Cards", description: "Find exam hall tickets and updates" },
  { href: "/answer-keys", label: "Answer Keys", description: "View official and provisional keys" },
] as const;

export default function PostNotFound() {
  return (
    <section className="relative isolate overflow-hidden bg-[radial-gradient(circle_at_top,#eef2ff_0%,#f8fafc_38%,#fff_75%)] px-4 py-14 sm:py-20">
      <div className="absolute left-1/2 top-10 -z-10 h-52 w-52 -translate-x-1/2 rounded-full bg-indigo-200/35 blur-3xl" />
      <div className="mx-auto max-w-3xl text-center">
        <span className="inline-flex rounded-full border border-indigo-200 bg-white px-3 py-1 text-[11px] font-black uppercase tracking-[0.18em] text-indigo-700 shadow-sm">
          Error 404
        </span>
        <p className="mt-5 bg-gradient-to-r from-indigo-700 via-violet-600 to-rose-600 bg-clip-text text-7xl font-black leading-none text-transparent sm:text-8xl">
          404
        </p>
        <h1 className="mt-5 text-2xl font-black tracking-tight text-slate-900 sm:text-4xl">
          This update is no longer available
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-slate-600 sm:text-base">
          The link may be outdated, the post may have moved, or the notification may have been removed. Try one of the sections below to find the latest information.
        </p>

        <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
          <Link href="/" className="rounded-lg bg-indigo-700 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-200 transition hover:-translate-y-0.5 hover:bg-indigo-800">
            Go to homepage
          </Link>
          <Link href="/jobs" className="rounded-lg border border-slate-300 bg-white px-5 py-3 text-sm font-bold text-slate-800 shadow-sm transition hover:-translate-y-0.5 hover:border-indigo-300 hover:text-indigo-700">
            Browse latest jobs
          </Link>
        </div>

        <div className="mt-10 grid gap-3 text-left sm:grid-cols-2">
          {recoveryLinks.map((item) => (
            <Link key={item.href} href={item.href} className="group rounded-xl border border-slate-200 bg-white/90 p-4 shadow-[0_8px_24px_rgba(15,23,42,0.06)] transition hover:-translate-y-0.5 hover:border-indigo-300 hover:shadow-[0_12px_28px_rgba(79,70,229,0.12)]">
              <span className="flex items-center justify-between text-sm font-black text-slate-900 group-hover:text-indigo-700">
                {item.label}
                <span aria-hidden="true">→</span>
              </span>
              <span className="mt-1 block text-xs leading-5 text-slate-500">{item.description}</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
