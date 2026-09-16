import type { Metadata } from "next";
import Link from "next/link";
import { LayoutTemplate, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { db } from "@/lib/db";
import { EmptyState, fmtDate, kitField } from "@/components/amplivanta/screen-kit";
import { FormDialog, TemplateActions } from "@/components/amplivanta/creative-ui";
import { createTemplate } from "@/app/(app)/app/creative-studio/actions";
import { TEMPLATE_CATEGORIES, TEMPLATE_CHANNELS, TEMPLATE_TYPES } from "@/lib/creative/options";
import { creativeContext } from "@/lib/server/creative-screens";

export const metadata: Metadata = { title: "Templates — Creative Studio" };
export const dynamic = "force-dynamic";

const BASE = "/app/creative-studio/templates";
type SP = { q?: string; category?: string; type?: string; channel?: string };

export default async function TemplatesPage({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams;
  const c = await creativeContext();
  let reachable = Boolean(c);
  let rows: { id: string; name: string; category: string; type: string; channel: string | null; content: unknown; createdAt: Date }[] = [];
  if (c) {
    try {
      rows = await db.template.findMany({
        where: {
          workspaceId: c.workspaceId,
          ...(sp.category ? { category: sp.category } : {}),
          ...(sp.type ? { type: sp.type } : {}),
          ...(sp.channel ? { channel: sp.channel } : {}),
          ...(sp.q ? { name: { contains: sp.q, mode: "insensitive" } } : {}),
        },
        orderBy: { createdAt: "desc" },
        take: 200,
        select: { id: true, name: true, category: true, type: true, channel: true, content: true, createdAt: true },
      });
    } catch {
      reachable = false;
    }
  }
  const qs = (patch: Partial<SP>) => {
    const u = new URLSearchParams();
    for (const [k, v] of Object.entries({ ...sp, ...patch })) if (v) u.set(k, v);
    const s = u.toString();
    return s ? `${BASE}?${s}` : BASE;
  };
  const create = (label = "Create from Blank", cls?: string) => (
    <FormDialog
      title="Create Template"
      label={label}
      className={cls}
      action={createTemplate}
      disabled={!c?.canEdit}
      submitLabel="Create template"
      fields={[
        { name: "name", label: "Template name", kind: "text", required: true },
        { name: "category", label: "Category", kind: "select", required: true, options: TEMPLATE_CATEGORIES, defaultValue: sp.category },
        { name: "type", label: "Type", kind: "select", options: TEMPLATE_TYPES, defaultValue: "document" },
        { name: "channel", label: "Channel", kind: "select", options: TEMPLATE_CHANNELS, placeholder: "Optional" },
        { name: "content", label: "Content", kind: "textarea", rows: 6, placeholder: "Reusable text with [placeholders]" },
      ]}
    />
  );
  const excerpt = (content: unknown) => {
    const t = typeof (content as { text?: unknown })?.text === "string" ? (content as { text: string }).text : "";
    return t.length > 140 ? `${t.slice(0, 139)}…` : t;
  };

  return (
    <div className="mx-auto max-w-[1600px]">
      <h1 className="font-display text-[30px] font-bold text-deep-navy">Templates</h1>
      <p className="mt-1 text-[14.5px] text-ink-soft">Browse reusable creative templates when template content is available.</p>

      <form method="get" className="my-6 flex flex-wrap items-center gap-3 rounded-xl border border-line bg-white px-6 py-4">
        {sp.category && <input type="hidden" name="category" value={sp.category} />}
        <label className="relative w-full max-w-[520px] flex-1">
          <span className="sr-only">Search templates</span>
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" />
          <input name="q" defaultValue={sp.q ?? ""} placeholder="Search templates..." className={cn(kitField, "h-11 pl-9")} />
        </label>
        <select name="type" defaultValue={sp.type ?? ""} aria-label="Type" className={cn(kitField, "h-10 w-[150px] rounded-full")}>
          <option value="">All Types</option>
          {TEMPLATE_TYPES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
        <select name="channel" defaultValue={sp.channel ?? ""} aria-label="Channel" className={cn(kitField, "h-10 w-[160px] rounded-full")}>
          <option value="">All Channels</option>
          {TEMPLATE_CHANNELS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
        <button type="submit" className="h-10 rounded-md border border-line px-4 text-[13px] font-semibold text-deep-navy hover:bg-bg-soft">Apply</button>
      </form>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[290px_minmax(0,1fr)]">
        <aside className="h-fit rounded-xl border border-line bg-white p-5">
          <h2 className="mb-4 text-[16px] font-semibold text-deep-navy">Categories</h2>
          <nav className="space-y-3" aria-label="Template categories">
            {[["", "All Templates"] as [string, string], ...TEMPLATE_CATEGORIES].map(([v, l]) => (
              <Link key={l} href={qs({ category: v || undefined })} className={cn("block rounded-md border px-4 py-3 text-[13.5px]", (sp.category ?? "") === v ? "border-line bg-bg-soft font-semibold text-deep-navy" : "border-line text-deep-navy hover:bg-bg-soft/60")}>{l}</Link>
            ))}
          </nav>
        </aside>
        <section className="min-h-[720px] rounded-xl border border-line bg-white p-5">
          {rows.length ? (
            <>
              <div className="mb-4 flex justify-end">{create()}</div>
              <ul className="grid grid-cols-1 gap-4 md:grid-cols-2 2xl:grid-cols-3">
                {rows.map((t) => (
                  <li key={t.id} className="flex flex-col rounded-lg border border-line p-4">
                    <div className="text-[14.5px] font-semibold text-deep-navy">{t.name}</div>
                    <div className="text-[12px] text-ink-muted">{TEMPLATE_CATEGORIES.find(([v]) => v === t.category)?.[1] ?? t.category} · {TEMPLATE_TYPES.find(([v]) => v === t.type)?.[1] ?? t.type}{t.channel ? ` · ${t.channel}` : ""} · {fmtDate(t.createdAt)}</div>
                    <p className="mt-2 flex-1 whitespace-pre-wrap text-[12.5px] text-ink-soft">{excerpt(t.content) || "No content"}</p>
                    <div className="mt-3"><TemplateActions id={t.id} type={t.type} canEdit={Boolean(c?.canEdit)} /></div>
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <EmptyState icon={LayoutTemplate} title={reachable ? "No templates available yet" : "Templates unavailable"} body="Templates will appear here when they are added to the Creative Studio library." action={reachable ? create() : undefined} />
          )}
        </section>
      </div>
    </div>
  );
}
