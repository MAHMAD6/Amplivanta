"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Database, FileText, Plus } from "lucide-react";
import { deleteContentItem, setContentStatus } from "@/app/(admin)/admin/content-actions";
import { CONTENT_STATUSES, STATUS_LABEL, contentTypeMeta } from "@/lib/admin/content";
import { toastResult } from "@/lib/action-toast";
import { cn } from "@/lib/utils";
import { SuperCard, SuperEmptyState } from "./primitives";

export type ContentRow = {
  id: string;
  contentType: string;
  title: string;
  slug: string;
  status: string;
  visibility: string;
  authorName: string | null;
  categories: string[];
  publishedAt: string | null;
  scheduledAt: string | null;
  updatedAt: string;
  versions: number;
};

const btnPrimary = "inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-royal-blue px-5 text-[13.5px] font-bold text-white transition hover:bg-royal-soft disabled:opacity-50";
const small = "inline-flex h-9 items-center gap-1.5 rounded-lg border border-line bg-white px-3 text-[12.5px] font-bold text-admin-navy transition hover:bg-bg-soft disabled:opacity-50";

const TONE: Record<string, string> = {
  PUBLISHED: "bg-emerald-50 text-emerald-700",
  SCHEDULED: "bg-royal-tint text-royal-blue",
  IN_REVIEW: "bg-amber-50 text-amber-700",
  DRAFT: "bg-bg-soft text-ink-soft",
  ARCHIVED: "bg-bg-soft text-ink-muted",
};

export function ContentStatusPill({ status }: { status: string }) {
  return <span className={cn("inline-flex rounded-full px-2.5 py-1 text-[11.5px] font-bold", TONE[status] ?? "bg-bg-soft text-ink-soft")}>{STATUS_LABEL[status] ?? status}</span>;
}

/** List and lifecycle controls shared by every content type. */
export function ContentList({ rows, contentType, connected }: { rows: ContentRow[]; contentType: string; connected: boolean }) {
  const meta = contentTypeMeta(contentType);
  const router = useRouter();
  const [pending, start] = useTransition();
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");

  const run = (fn: () => Promise<{ ok: true; message: string } | { ok: false; error: string }>) =>
    start(async () => {
      if (toastResult(await fn())) router.refresh();
    });

  if (!connected) {
    return (
      <SuperCard>
        <SuperEmptyState icon={Database} title="Data source unavailable" description={`The platform database could not be reached, so ${meta?.plural.toLowerCase() ?? "records"} cannot be shown right now.`} />
      </SuperCard>
    );
  }

  const shown = rows.filter((r) => (!status || r.status === status) && (!q || `${r.title} ${r.slug} ${r.categories.join(" ")}`.toLowerCase().includes(q.toLowerCase())));

  return (
    <SuperCard>
      <div className="flex flex-wrap items-center gap-3 border-b border-line px-6 py-4">
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={`Search ${meta?.plural.toLowerCase() ?? "content"}...`} className="h-11 min-w-[200px] flex-1 rounded-xl border border-line px-3.5 text-[13px] focus:border-royal-blue focus:outline-none" />
        <select value={status} onChange={(e) => setStatus(e.target.value)} className="h-11 rounded-xl border border-line px-3 text-[13px]">
          <option value="">All statuses</option>
          {CONTENT_STATUSES.map((s) => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}
        </select>
        <Link href={`${meta?.href}?new=1`} className={btnPrimary}><Plus className="h-4 w-4" /> New {meta?.label.toLowerCase()}</Link>
      </div>

      {shown.length === 0 ? (
        <SuperEmptyState
          icon={FileText}
          title={rows.length ? "No items match these filters" : `No ${meta?.plural.toLowerCase() ?? "items"} yet`}
          description={rows.length ? "Try another status or search." : `Create the first ${meta?.label.toLowerCase() ?? "item"}; nothing is shown here until real content exists.`}
          action={<Link href={`${meta?.href}?new=1`} className={btnPrimary}><Plus className="h-4 w-4" /> New {meta?.label.toLowerCase()}</Link>}
        />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px] border-collapse">
            <thead>
              <tr className="border-b border-line text-left text-[13px] font-bold text-admin-navy">
                <th className="px-6 py-4">Title</th><th className="px-6 py-4">Categories</th><th className="px-6 py-4">Status</th><th className="px-6 py-4">Published</th><th className="px-6 py-4">Updated</th><th className="px-6 py-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {shown.map((r) => (
                <tr key={r.id} className="border-b border-line text-[13px] text-ink-soft last:border-0">
                  <td className="px-6 py-4">
                    <Link href={`${meta?.href}?edit=${r.id}`} className="font-semibold text-admin-navy hover:text-royal-blue">{r.title}</Link>
                    <div className="text-[12px]">/{r.slug}{r.authorName ? ` · ${r.authorName}` : ""}{r.versions ? ` · ${r.versions} version${r.versions === 1 ? "" : "s"}` : ""}</div>
                  </td>
                  <td className="px-6 py-4">{r.categories.join(", ") || "—"}</td>
                  <td className="px-6 py-4"><ContentStatusPill status={r.status} /></td>
                  <td className="px-6 py-4">{r.publishedAt ?? (r.scheduledAt ? `Scheduled ${r.scheduledAt}` : "—")}</td>
                  <td className="px-6 py-4">{r.updatedAt}</td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-2">
                      <Link href={`${meta?.href}?edit=${r.id}`} className={small}>Edit</Link>
                      {r.status !== "PUBLISHED" && r.status !== "ARCHIVED" && (
                        <button type="button" className={small} disabled={pending} onClick={() => run(() => setContentStatus(r.id, "PUBLISHED"))}>Publish</button>
                      )}
                      {r.status !== "ARCHIVED" && (
                        <button type="button" className={small} disabled={pending} onClick={() => run(() => setContentStatus(r.id, "ARCHIVED"))}>Archive</button>
                      )}
                      {r.status === "ARCHIVED" && (
                        <button type="button" className={small} disabled={pending} onClick={() => run(() => setContentStatus(r.id, "DRAFT"))}>Restore</button>
                      )}
                      {r.status !== "PUBLISHED" && (
                        <button type="button" className={small} disabled={pending} onClick={() => { if (window.confirm(`Delete "${r.title}"?`)) run(() => deleteContentItem(r.id)); }}>Delete</button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </SuperCard>
  );
}
