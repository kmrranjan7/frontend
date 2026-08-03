"use client";

import { FormEvent, useEffect, useState } from "react";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";

type NewsRecord = { id: string; title: string; link: string; updatedAt?: string };
type Payload = { message?: string; data?: NewsRecord | NewsRecord[] | null };

export default function LatestNewsPage() {
  const [records, setRecords] = useState<NewsRecord[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [link, setLink] = useState("");
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  async function load() {
    const response = await fetch("/api/latest-news", { cache: "no-store" });
    const payload = await response.json() as Payload;
    if (!response.ok) throw new Error(payload.message);
    setRecords(Array.isArray(payload.data) ? payload.data : []);
  }

  useEffect(() => { void load().catch(() => setMessage("Unable to fetch latest-news records.")); }, []);

  function reset() { setEditingId(null); setTitle(""); setLink(""); }
  function edit(record: NewsRecord) { setEditingId(record.id); setTitle(record.title); setLink(record.link); window.scrollTo({ top: 0, behavior: "smooth" }); }

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setSaving(true); setMessage("");
    try {
      const response = await fetch(editingId ? `/api/latest-news/${editingId}` : "/api/latest-news", { method: editingId ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ title, link }) });
      const payload = await response.json() as Payload;
      if (!response.ok) throw new Error(payload.message);
      setMessage(editingId ? "Record updated successfully." : "Record created successfully.");
      reset(); await load();
    } catch (error) { setMessage(error instanceof Error ? error.message : "Unable to save record."); }
    finally { setSaving(false); }
  }

  async function remove(record: NewsRecord) {
    if (!window.confirm(`Delete “${record.title}”?`)) return;
    const response = await fetch(`/api/latest-news/${record.id}`, { method: "DELETE" });
    const payload = await response.json() as Payload;
    setMessage(response.ok ? "Record deleted successfully." : payload.message ?? "Unable to delete record.");
    if (response.ok) { if (editingId === record.id) reset(); await load(); }
  }

  return <><DashboardHeader title="Latest News" eyebrow="Public Website" /><div className="dashboard-content grid gap-5">
    <section className="panel p-5 sm:p-6"><h1 className="text-lg font-black text-slate-900">{editingId ? "Edit ticker record" : "Create ticker record"}</h1><p className="mt-1 text-xs text-slate-500">All records appear in the public Latest News ticker.</p>
      <form className="mt-5 grid gap-4 md:grid-cols-2" onSubmit={save}>
        <label className="grid gap-2 text-xs font-bold text-slate-700">Title<input className="min-h-11 rounded-lg border border-slate-300 px-3 text-sm" value={title} onChange={(e) => setTitle(e.target.value)} minLength={3} maxLength={180} required /></label>
        <label className="grid gap-2 text-xs font-bold text-slate-700">Link<input className="min-h-11 rounded-lg border border-slate-300 px-3 text-sm" value={link} onChange={(e) => setLink(e.target.value)} maxLength={500} placeholder="/jobs or https://..." required /></label>
        <div className="flex flex-wrap gap-3 md:col-span-2"><button className="button button-primary" disabled={saving}>{saving ? "Saving…" : editingId ? "Save changes" : "Create record"}</button>{editingId ? <button className="button button-quiet" type="button" onClick={reset}>Cancel</button> : null}<button className="button button-quiet" type="button" onClick={() => void load()}>Fetch records</button></div>
      </form>{message ? <p className="mt-4 rounded-lg bg-blue-50 p-3 text-xs font-semibold text-blue-800" role="status">{message}</p> : null}
    </section>
    <section className="panel overflow-hidden"><div className="flex items-center justify-between border-b border-slate-200 p-4"><div><h2 className="font-black text-slate-900">Latest News records</h2><p className="text-xs text-slate-500">{records.length} total</p></div></div>
      <div className="overflow-x-auto"><table className="w-full min-w-[720px] text-left text-xs"><thead className="bg-slate-50 text-slate-600"><tr><th className="p-3">Title</th><th className="p-3">Link</th><th className="p-3">Updated</th><th className="p-3 text-right">Actions</th></tr></thead><tbody>{records.map((record) => <tr className="border-t border-slate-100" key={record.id}><td className="p-3 font-bold text-slate-900">{record.title}</td><td className="max-w-xs break-all p-3 text-blue-700">{record.link}</td><td className="p-3 text-slate-500">{record.updatedAt ? new Date(record.updatedAt).toLocaleString("en-IN") : "—"}</td><td className="p-3"><div className="flex justify-end gap-2"><button className="rounded-md border border-blue-200 px-3 py-1.5 font-bold text-blue-700" onClick={() => edit(record)}>Edit</button><button className="rounded-md border border-red-200 px-3 py-1.5 font-bold text-red-700" onClick={() => void remove(record)}>Delete</button></div></td></tr>)}</tbody></table>{!records.length ? <p className="p-8 text-center text-sm text-slate-500">No latest-news records found.</p> : null}</div>
    </section>
  </div></>;
}
