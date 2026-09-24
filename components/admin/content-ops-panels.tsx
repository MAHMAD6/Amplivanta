"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CalendarClock, Database, FolderOpen, Search, Users } from "lucide-react";
import { removeTaxonomy, renameAuthor, renameTaxonomy, saveSeoFields, setContentStatus } from "@/app/(admin)/admin/content-actions";
import { contentTypeMeta, STATUS_LABEL } from "@/lib/admin/content";
import { toastResult } from "@/lib/action-toast";
import { SuperCard, SuperCardHeader, SuperEmptyState } from "./primitives";
import { ContentStatusPill } from "./content-list";

const field = "h-11 w-full rounded-xl border border-line bg-white px-3.5 text-[13px] text-admin-navy focus:border-royal-blue focus:outline-none";
const small = "inline-flex h-9 items-center gap-1.5 rounded-lg border border-line bg-white px-3 text-[12.5px] font-bold text-admin-navy transition hover:bg-bg-soft disabled:opacity-50";

function useAct() {
  const [pending, start] = useTransition();
  const router = useRouter();
  const run = (fn: () => Promise<{ ok: true; message: string } | { ok: false; error: string }>, after?: () => void) =>
    start(async () => {
      if (toastResult(await fn())) {
        after?.();
        router.refresh();
      }
    });
  return { pending, run };
}

function Unavailable({ what }: { what: string }) {
  return (
    <SuperCard>
      <SuperEmptyState icon={Database} title="Data source unavailable" description={`The platform database could not be reached, so ${what} cannot be shown right now.`} />
    </SuperCard>
  );
}

const typeLabel = (t: string) => contentTypeMeta(t)?.label ?? t.replace(/_/g, " ");

/* --------------------------------------------------- categories & tags */

export function TaxonomyPanel({ kind, rows, connected, items }: { kind: "categories" | "tags"; rows: { name: string; count: number; types: string[] }[]; connected: boolean; items: number }) {
  const { pending, run } = useAct();
  const [editing, setEditing] = useState<string | null>(null);
  const [value, setValue] = useState("");
  const noun = kind === "categories" ? "categories" : "tags";

  if (!connected) return <Unavailable what={noun} />;

  return (
    <SuperCard>
      <SuperCardHeader
        title={kind === "categories" ? "Categories" : "Tags"}
        description={`Values in use across ${items} content item${items === 1 ? "" : "s"}. Renaming updates every item that carries the value.`}
      />
      {rows.length === 0 ? (
        <SuperEmptyState icon={FolderOpen} title={`No ${noun} yet`} description={`${kind === "categories" ? "Categories" : "Tags"} appear here as soon as content uses them; they are not created separately.`} />
      ) : (
        <ul className="divide-y divide-line">
          {rows.map((r) => (
            <li key={r.name} className="flex flex-wrap items-center justify-between gap-3 px-6 py-4">
              {editing === r.name ? (
                <form
                  className="flex flex-wrap items-center gap-2"
                  onSubmit={(e) => {
                    e.preventDefault();
                    run(() => renameTaxonomy(kind, r.name, value), () => setEditing(null));
                  }}
                >
                  <input value={value} onChange={(e) => setValue(e.target.value)} className={`${field} w-[220px]`} autoFocus />
                  <button type="submit" className={small} disabled={pending}>Save</button>
                  <button type="button" className={small} onClick={() => setEditing(null)}>Cancel</button>
                </form>
              ) : (
                <div className="min-w-0">
                  <div className="text-[13.5px] font-semibold text-admin-navy">{r.name}</div>
                  <div className="text-[12px] text-ink-soft">{r.count} item{r.count === 1 ? "" : "s"} · {r.types.map(typeLabel).join(", ")}</div>
                </div>
              )}
              {editing !== r.name && (
                <div className="flex flex-wrap gap-2">
                  <button type="button" className={small} onClick={() => { setEditing(r.name); setValue(r.name); }}>Rename or merge</button>
                  <button
                    type="button"
                    className={small}
                    disabled={pending}
                    onClick={() => { if (window.confirm(`Remove "${r.name}" from ${r.count} item${r.count === 1 ? "" : "s"}?`)) run(() => removeTaxonomy(kind, r.name)); }}
                  >
                    Remove
                  </button>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </SuperCard>
  );
}

/* --------------------------------------------------------------- authors */

export function AuthorsPanel({ rows, connected }: { rows: { name: string; total: number; published: number; lastUpdated: string | null }[]; connected: boolean }) {
  const { pending, run } = useAct();
  const [editing, setEditing] = useState<string | null>(null);
  const [value, setValue] = useState("");

  if (!connected) return <Unavailable what="authors" />;

  return (
    <SuperCard>
      <SuperCardHeader title="Authors" description="Authors credited on content. Renaming updates every item they are credited on." />
      {rows.length === 0 ? (
        <SuperEmptyState icon={Users} title="No authors yet" description="Authors appear here once content credits one; no placeholder profiles are created." />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] border-collapse">
            <thead>
              <tr className="border-b border-line text-left text-[13px] font-bold text-admin-navy">
                <th className="px-6 py-4">Author</th><th className="px-6 py-4">Items</th><th className="px-6 py-4">Published</th><th className="px-6 py-4">Last updated</th><th className="px-6 py-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.name} className="border-b border-line text-[13px] text-ink-soft last:border-0">
                  <td className="px-6 py-4">
                    {editing === r.name ? (
                      <form className="flex flex-wrap items-center gap-2" onSubmit={(e) => { e.preventDefault(); run(() => renameAuthor(r.name, value), () => setEditing(null)); }}>
                        <input value={value} onChange={(e) => setValue(e.target.value)} className={`${field} w-[220px]`} autoFocus />
                        <button type="submit" className={small} disabled={pending}>Save</button>
                        <button type="button" className={small} onClick={() => setEditing(null)}>Cancel</button>
                      </form>
                    ) : (
                      <span className="font-semibold text-admin-navy">{r.name}</span>
                    )}
                  </td>
                  <td className="px-6 py-4">{r.total}</td>
                  <td className="px-6 py-4">{r.published}</td>
                  <td className="px-6 py-4">{r.lastUpdated ?? "—"}</td>
                  <td className="px-6 py-4">
                    {editing !== r.name && <button type="button" className={small} onClick={() => { setEditing(r.name); setValue(r.name); }}>Rename</button>}
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

/* --------------------------------------------- publishing and scheduling */

export function PublishingQueuePanel({
  scheduled,
  published,
  drafts,
  connected,
}: {
  scheduled: { id: string; contentType: string; title: string; scheduledAt: string | null }[];
  published: { id: string; contentType: string; title: string; publishedAt: string | null }[];
  drafts: number;
  connected: boolean;
}) {
  const { pending, run } = useAct();
  if (!connected) return <Unavailable what="the publishing queue" />;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {[["Scheduled", scheduled.length], ["Published", published.length], ["Drafts and in review", drafts]].map(([l, v]) => (
          <SuperCard key={String(l)} className="p-5">
            <div className="text-[13px] font-bold text-admin-navy">{l}</div>
            <div className="mt-2 text-[24px] font-extrabold text-admin-navy">{Number(v).toLocaleString("en-US")}</div>
          </SuperCard>
        ))}
      </div>

      <SuperCard>
        <SuperCardHeader title="Scheduled" description="Items that publish automatically at their scheduled time." />
        {scheduled.length === 0 ? (
          <SuperEmptyState icon={CalendarClock} title="Nothing scheduled" description="Schedule an item from its editor and it appears here until it goes live." />
        ) : (
          <ul className="divide-y divide-line">
            {scheduled.map((s) => (
              <li key={s.id} className="flex flex-wrap items-center justify-between gap-3 px-6 py-4">
                <div className="min-w-0">
                  <Link href={`${contentTypeMeta(s.contentType)?.href}?edit=${s.id}`} className="truncate text-[13.5px] font-semibold text-admin-navy hover:text-royal-blue">{s.title}</Link>
                  <div className="text-[12px] text-ink-soft">{typeLabel(s.contentType)} · {s.scheduledAt ?? "no time set"}</div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button type="button" className={small} disabled={pending} onClick={() => run(() => setContentStatus(s.id, "PUBLISHED"))}>Publish now</button>
                  <button type="button" className={small} disabled={pending} onClick={() => run(() => setContentStatus(s.id, "DRAFT"))}>Back to draft</button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </SuperCard>

      <SuperCard>
        <SuperCardHeader title="Recently published" />
        {published.length === 0 ? (
          <SuperEmptyState icon={CalendarClock} title="Nothing published yet" description="Published items appear here with the time they went live." />
        ) : (
          <ul className="divide-y divide-line">
            {published.map((p) => (
              <li key={p.id} className="flex flex-wrap items-center justify-between gap-3 px-6 py-4">
                <div className="min-w-0">
                  <Link href={`${contentTypeMeta(p.contentType)?.href}?edit=${p.id}`} className="truncate text-[13.5px] font-semibold text-admin-navy hover:text-royal-blue">{p.title}</Link>
                  <div className="text-[12px] text-ink-soft">{typeLabel(p.contentType)} · {p.publishedAt ?? "—"}</div>
                </div>
                <button type="button" className={small} disabled={pending} onClick={() => { if (window.confirm(`Archive "${p.title}"?`)) run(() => setContentStatus(p.id, "ARCHIVED")); }}>Archive</button>
              </li>
            ))}
          </ul>
        )}
      </SuperCard>
    </div>
  );
}

/* ------------------------------------------------------------------- SEO */

export function SeoPanel({ rows, connected }: { rows: { id: string; contentType: string; title: string; slug: string; status: string; hasTitle: boolean; hasDescription: boolean }[]; connected: boolean }) {
  const { pending, run } = useAct();
  const [editing, setEditing] = useState<string | null>(null);
  const [onlyGaps, setOnlyGaps] = useState(true);
  if (!connected) return <Unavailable what="SEO metadata" />;

  const shown = rows.filter((r) => !onlyGaps || !r.hasTitle || !r.hasDescription);

  return (
    <SuperCard>
      <SuperCardHeader
        title="SEO & Metadata"
        description="Search title and meta description per item. Items without a meta description fall back to their excerpt."
        action={
          <label className="flex items-center gap-2 text-[12.5px] font-bold text-admin-navy">
            <input type="checkbox" checked={onlyGaps} onChange={(e) => setOnlyGaps(e.target.checked)} className="h-4 w-4" /> Only show gaps
          </label>
        }
      />
      {shown.length === 0 ? (
        <SuperEmptyState icon={Search} title={rows.length ? "No SEO gaps" : "No content yet"} description={rows.length ? "Every item has a search title and a description or excerpt." : "SEO fields appear here once content exists."} />
      ) : (
        <ul className="divide-y divide-line">
          {shown.map((r) => (
            <li key={r.id} className="px-6 py-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="min-w-0">
                  <Link href={`${contentTypeMeta(r.contentType)?.href}?edit=${r.id}`} className="truncate text-[13.5px] font-semibold text-admin-navy hover:text-royal-blue">{r.title}</Link>
                  <div className="text-[12px] text-ink-soft">{typeLabel(r.contentType)} · /{r.slug} · {STATUS_LABEL[r.status] ?? r.status}</div>
                </div>
                <div className="flex flex-wrap items-center gap-2 text-[12px]">
                  <span className={r.hasTitle ? "text-emerald-700" : "text-amber-700"}>{r.hasTitle ? "Title set" : "No search title"}</span>
                  <span className={r.hasDescription ? "text-emerald-700" : "text-amber-700"}>{r.hasDescription ? "Description set" : "No description"}</span>
                  <button type="button" className={small} onClick={() => setEditing(editing === r.id ? null : r.id)}>{editing === r.id ? "Close" : "Edit"}</button>
                </div>
              </div>
              {editing === r.id && (
                <form
                  className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-[minmax(0,1fr)_minmax(0,1.6fr)_auto]"
                  onSubmit={(e) => {
                    e.preventDefault();
                    const fd = new FormData(e.currentTarget);
                    run(() => saveSeoFields(r.id, String(fd.get("seoTitle") ?? ""), String(fd.get("seoDescription") ?? "")), () => setEditing(null));
                  }}
                >
                  <input name="seoTitle" placeholder="Search title" className={field} />
                  <input name="seoDescription" placeholder="Meta description" className={field} />
                  <button type="submit" className={small} disabled={pending}>Save</button>
                </form>
              )}
            </li>
          ))}
        </ul>
      )}
    </SuperCard>
  );
}

/* -------------------------------------------------------------- archived */

export function ArchivedPanel({ rows, connected }: { rows: { id: string; contentType: string; title: string; slug: string; status: string; updatedAt: string }[]; connected: boolean }) {
  const { pending, run } = useAct();
  if (!connected) return <Unavailable what="archived content" />;

  return (
    <SuperCard>
      <SuperCardHeader title="Archived content" description="Archived items stay out of public listings until they are restored." />
      {rows.length === 0 ? (
        <SuperEmptyState icon={FolderOpen} title="Nothing archived" description="Archived items appear here and can be restored to draft." />
      ) : (
        <ul className="divide-y divide-line">
          {rows.map((r) => (
            <li key={r.id} className="flex flex-wrap items-center justify-between gap-3 px-6 py-4">
              <div className="min-w-0">
                <div className="truncate text-[13.5px] font-semibold text-admin-navy">{r.title}</div>
                <div className="text-[12px] text-ink-soft">{typeLabel(r.contentType)} · /{r.slug} · archived {r.updatedAt}</div>
              </div>
              <div className="flex items-center gap-2">
                <ContentStatusPill status={r.status} />
                <button type="button" className={small} disabled={pending} onClick={() => run(() => setContentStatus(r.id, "DRAFT"))}>Restore to draft</button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </SuperCard>
  );
}

/* ------------------------------------------------------------- analytics */

export function ContentAnalyticsPanel({
  data,
}: {
  data: { connected: boolean; total: number; publishedTotal: number; byType: { contentType: string; count: number }[]; cadence: [string, number][]; topCategories: [string, number][]; authors: number };
}) {
  if (!data.connected) return <Unavailable what="content analytics" />;
  const peak = Math.max(1, ...data.cadence.map(([, v]) => v));

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        {[["Content items", data.total], ["Published", data.publishedTotal], ["Content types in use", data.byType.length], ["Authors", data.authors]].map(([l, v]) => (
          <SuperCard key={String(l)} className="p-5">
            <div className="text-[13px] font-bold text-admin-navy">{l}</div>
            <div className="mt-2 text-[24px] font-extrabold text-admin-navy">{Number(v).toLocaleString("en-US")}</div>
          </SuperCard>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <SuperCard>
          <SuperCardHeader title="Publishing cadence" description="Items published per month." />
          <div className="px-6 py-5">
            {data.cadence.every(([, v]) => v === 0) ? (
              <SuperEmptyState icon={CalendarClock} title="Nothing published in this period" description="Published items appear here by month once content goes live." />
            ) : (
              <div className="flex h-40 items-end gap-3">
                {data.cadence.map(([month, count]) => (
                  <div key={month} className="flex flex-1 flex-col items-center gap-1">
                    <span className="text-[11px] font-bold text-admin-navy">{count}</span>
                    <div className="w-full rounded-t bg-royal-blue/80" style={{ height: `${Math.max(2, (count / peak) * 120)}px` }} />
                    <span className="text-[11px] text-ink-muted">{new Intl.DateTimeFormat("en-US", { month: "short", timeZone: "UTC" }).format(new Date(`${month}-01T00:00:00Z`))}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </SuperCard>

        <SuperCard>
          <SuperCardHeader title="By type and category" description="Where content is concentrated." />
          <div className="space-y-4 px-6 py-5">
            <div>
              <div className="text-[13px] font-bold text-admin-navy">Content types</div>
              <ul className="mt-2 space-y-1 text-[12.5px] text-ink-soft">
                {data.byType.length === 0 ? <li>No content yet.</li> : data.byType.map((t) => <li key={t.contentType}>{typeLabel(t.contentType)}: {t.count}</li>)}
              </ul>
            </div>
            <div>
              <div className="text-[13px] font-bold text-admin-navy">Top categories</div>
              <ul className="mt-2 space-y-1 text-[12.5px] text-ink-soft">
                {data.topCategories.length === 0 ? <li>No categories in use yet.</li> : data.topCategories.map(([name, count]) => <li key={name}>{name}: {count}</li>)}
              </ul>
            </div>
          </div>
        </SuperCard>
      </div>
    </div>
  );
}
