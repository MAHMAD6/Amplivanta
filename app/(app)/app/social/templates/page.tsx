import type { Metadata } from "next";
import Link from "next/link";
import { CirclePlus, CopyPlus, FilePlus2, LayoutGrid, Lightbulb, Megaphone, MessageCircle, Search, ShieldCheck, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { EmptyState, InfoList, fmtDate, kitField } from "@/components/amplivanta/screen-kit";
import { ResourceDialog, type Field } from "@/components/amplivanta/crud/resource-dialog";
import { DeleteAction } from "@/components/amplivanta/crud/delete-action";
import { db } from "@/lib/db";
import { excerpt, socialContext } from "@/lib/server/social-screens";

export const metadata: Metadata = { title: "Content Templates" };
export const dynamic = "force-dynamic";

const CATEGORY_OPTIONS = [
  { value: "social", label: "Social" },
  { value: "campaign", label: "Campaign" },
  { value: "approval", label: "Approval" },
];
const FIELDS: Field[] = [
  { name: "name", label: "Template name", required: true },
  { name: "category", label: "Category", type: "select", options: CATEGORY_OPTIONS },
  { name: "content", label: "Post structure", type: "textarea", required: true, placeholder: "Headline\n\nKey message\n\n{link}" },
];

const CATS: [string, string, typeof LayoutGrid][] = [["", "All Templates", LayoutGrid], ["social", "Social", MessageCircle], ["campaign", "Campaign", Megaphone], ["approval", "Approval", ShieldCheck]];

export default async function TemplatesPage({ searchParams }: { searchParams: Promise<{ q?: string; category?: string }> }) {
  const sp = await searchParams;
  const c = await socialContext();
  let reachable = Boolean(c);
  let templates: { id: string; name: string; content: string; category: string | null; createdAt: Date }[] = [];
  if (c) {
    try {
      templates = await db.socialTemplate.findMany({
        where: { workspaceId: c.workspaceId, ...(sp.category ? { category: sp.category } : {}), ...(sp.q ? { name: { contains: sp.q, mode: "insensitive" } } : {}) },
        orderBy: { createdAt: "desc" },
        take: 200,
      });
    } catch {
      reachable = false;
    }
  }

  const create = (label: string, variant: "primary" | "outline", Icon = CirclePlus, preset?: Record<string, string>) => (
    <ResourceDialog
      title="Create Template"
      fields={FIELDS}
      endpoint="/api/social-templates"
      initial={preset}
      submitLabel="Create template"
      successMessage="Template created"
      trigger={
        <button type="button" className={cn("inline-flex h-12 items-center gap-2.5 rounded-md px-6 text-[14px] font-semibold", variant === "primary" ? "bg-[#0B5CFF] text-white hover:bg-[#0A4FE0]" : "border border-line bg-white text-[#0B5CFF] hover:bg-bg-soft")}>
          <Icon className="h-5 w-5" /> {label}
        </button>
      }
    />
  );

  return (
    <div className="mx-auto max-w-[1600px]">
      <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-[30px] font-bold text-deep-navy">Content Templates</h1>
          <p className="mt-1 text-[14.5px] text-ink-soft">Build reusable post structures for your publishing workflow.</p>
        </div>
        <div className="flex gap-3">
          {create("Create from Blank", "outline", FilePlus2)}
          {create("Create Template", "primary")}
        </div>
      </div>

      <section className="rounded-xl border border-line bg-white p-6">
        <form method="get" className="mb-5 flex flex-wrap items-center gap-3">
          {sp.category && <input type="hidden" name="category" value={sp.category} />}
          <label className="relative w-full max-w-[360px]">
            <span className="sr-only">Search templates</span>
            <input name="q" defaultValue={sp.q ?? ""} placeholder="Search templates..." className={cn(kitField, "h-11 pr-9")} />
            <Search className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" />
          </label>
          <button type="submit" className="h-11 rounded-md border border-line px-4 text-[13px] font-semibold text-deep-navy hover:bg-bg-soft">Search</button>
          {(sp.q || sp.category) && <Link href="/app/social/templates" className="text-[13.5px] font-semibold text-[#0B5CFF]">Clear Filters</Link>}
        </form>

        <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_440px]">
          <div className="min-w-0">
            <nav aria-label="Template categories" className="mb-4 flex flex-wrap gap-3">
              {CATS.map(([value, label, Icon]) => (
                <Link key={label} href={value ? `/app/social/templates?category=${value}` : "/app/social/templates"} className={cn("inline-flex items-center gap-2 rounded-md border px-4 py-2.5 text-[14px]", (sp.category ?? "") === value ? "border-transparent bg-royal-tint font-semibold text-[#0B5CFF]" : "border-line text-deep-navy hover:bg-bg-soft")}>
                  <Icon className="h-4 w-4" /> {label}
                </Link>
              ))}
            </nav>
            <div className="min-h-[480px] rounded-xl border border-line p-5">
              {templates.length ? (
                <ul className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {templates.map((t) => (
                    <li key={t.id} className="flex flex-col rounded-lg border border-line p-4">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="text-[14.5px] font-semibold text-deep-navy">{t.name}</div>
                          <div className="text-[12px] capitalize text-ink-muted">{t.category ?? "Uncategorized"} · {fmtDate(t.createdAt)}</div>
                        </div>
                        <DeleteAction endpoint={`/api/social-templates/${t.id}`} label="Template" name={t.name} trigger={<button type="button" aria-label={`Delete ${t.name}`} className="rounded p-1.5 text-ink-muted hover:bg-red-50 hover:text-red-600"><Trash2 className="h-4 w-4" /></button>} />
                      </div>
                      <p className="mt-2 flex-1 whitespace-pre-wrap text-[12.5px] text-ink-soft">{excerpt(t.content, 220)}</p>
                    </li>
                  ))}
                </ul>
              ) : (
                <EmptyState
                  icon={CopyPlus}
                  title={reachable ? "No templates available yet" : "Templates unavailable"}
                  body={reachable ? "Create reusable post structures for your publishing workflow." : "Templates could not be loaded right now."}
                  action={reachable ? <div className="flex flex-wrap justify-center gap-3">{create("Create Template", "primary")}{create("Create from Blank", "outline", FilePlus2)}</div> : undefined}
                />
              )}
            </div>
          </div>
          <aside className="space-y-5">
            <div className="rounded-xl border border-line p-5">
              <h2 className="text-[15px] font-semibold text-deep-navy">About Content Templates</h2>
              <InfoList
                rows={[
                  { title: "Reusable structures", body: "Create repeatable layouts and content blocks for future social posts." },
                  { title: "Organize by context", body: "Filter templates by category or search by name." },
                  { title: "Workspace consistency", body: "Use templates to support consistent formatting and publishing processes." },
                ]}
              />
            </div>
            <div className="rounded-xl border border-line p-5">
              <h2 className="mb-4 flex items-center gap-3 text-[16px] font-semibold text-deep-navy"><span className="flex h-10 w-10 items-center justify-center rounded-full bg-royal-tint text-[#3B3FD8]"><Lightbulb className="h-5 w-5" /></span> Helpful Tips</h2>
              <InfoList
                rows={[
                  { title: "Start from blank", body: "Create a template from scratch with your own layout and content blocks." },
                  { title: "Use placeholders", body: "Add text, media, and links as placeholders to guide your team." },
                  { title: "Organize templates", body: "Categorize templates as social, campaign or approval for easy access." },
                ]}
              />
            </div>
          </aside>
        </div>
      </section>
    </div>
  );
}
