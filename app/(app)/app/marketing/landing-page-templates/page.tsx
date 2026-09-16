import type { Metadata } from "next";
import Link from "next/link";
import { CalendarDays, CheckCircle2, Circle, FileText, Info, LayoutGrid, List, Magnet, Package, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Panel, ScreenHeader } from "@/components/amplivanta/screen-kit";
import { filterSearch, filterSelect, headerOutline, headerPrimary } from "@/components/amplivanta/growth-kit";
import { FormDialog } from "@/components/amplivanta/creative-ui";
import { createLandingPage } from "@/app/(app)/app/marketing/actions";
import { marketingContext } from "@/lib/server/marketing-screens";
import { LANDING_TEMPLATES, LANDING_TEMPLATE_CATEGORIES, PAGE_SECTIONS } from "@/lib/marketing/blocks";

export const metadata: Metadata = { title: "Landing Page Templates" };
export const dynamic = "force-dynamic";

type SP = { q?: string; category?: string; t?: string; view?: string; tip?: string };
const ICONS: Record<string, typeof Magnet> = { lead_gen: Magnet, events: CalendarDays, product: Package, thank_you: CheckCircle2, blank: FileText };
const TINT: Record<string, string> = { lead_gen: "from-violet-50 to-violet-100", events: "from-blue-50 to-blue-100", product: "from-orange-50 to-orange-100", thank_you: "from-emerald-50 to-emerald-100", blank: "from-slate-50 to-slate-100" };

export default async function LandingPageTemplatesPage({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams;
  const c = await marketingContext();
  const canEdit = Boolean(c?.canEdit);
  const q = sp.q?.toLowerCase();
  const list = LANDING_TEMPLATES.filter((t) => (!sp.category || t.category === sp.category) && (!q || `${t.name} ${t.description}`.toLowerCase().includes(q)));
  const selected = LANDING_TEMPLATES.find((t) => t.key === sp.t);
  const base = Object.fromEntries(Object.entries({ q: sp.q, category: sp.category, view: sp.view, tip: sp.tip }).filter(([, v]) => v)) as Record<string, string>;
  const href = (extra: Record<string, string | undefined>) => `?${new URLSearchParams(Object.fromEntries(Object.entries({ ...base, ...extra }).filter(([, v]) => v)) as Record<string, string>)}`;
  const grid = sp.view !== "list";
  const templateButton = (key: string, text: string, cls: string, disabled?: boolean) => <FormDialog title={key === "blank" ? "Start Blank" : "Use Template"} label={text} className={cls} action={createLandingPage} disabled={!canEdit || disabled} goTo="/app/marketing/page-builder?id=" submitLabel="Create page" fields={[{ name: "templateKey", kind: "hidden", value: key }, { name: "title", label: "Page name", kind: "text", required: true, defaultValue: key === "blank" ? "" : LANDING_TEMPLATES.find((t) => t.key === key)?.name }, { name: "slug", label: "URL slug (optional)", kind: "text" }]} />;

  return (
    <div className="mx-auto max-w-[1600px]">
      <ScreenHeader
        crumbs={[["Home", "/app"], ["Marketing Automation", "/app/marketing"], ["Landing Page Templates"]]}
        title="Landing Page Templates"
        subtitle="Start from a reusable template or begin with a blank page."
        actions={<>{templateButton(selected?.key ?? "", "Use Selected Template", headerPrimary, !selected)}{templateButton("blank", "Start Blank", headerOutline)}</>}
      />
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_380px]">
        <div className="min-w-0">
          {sp.tip !== "0" && (
            <div className="mb-4 flex items-start justify-between gap-3 rounded-xl border border-line bg-white p-4">
              <span className="flex gap-3"><Info className="mt-0.5 h-5 w-5 text-[#0B5CFF]" /><span><b className="block text-[14px] text-deep-navy">Choose a template, then customize it to fit your goals.</b><span className="text-[13px] text-ink-soft">All templates are fully customizable in the landing page builder.</span></span></span>
              <Link href={href({ tip: "0" })} aria-label="Dismiss" className="text-ink-muted hover:text-deep-navy"><X className="h-4 w-4" /></Link>
            </div>
          )}
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-[180px_minmax(0,1fr)]">
            <nav aria-label="Categories">
              <h2 className="mb-2 text-[15px] font-semibold text-deep-navy">Categories</h2>
              <ul className="space-y-1">
                {[["", "All"], ...LANDING_TEMPLATE_CATEGORIES].map(([k, l]) => {
                  const I = ICONS[k] ?? LayoutGrid;
                  return <li key={k}><Link href={href({ category: k || undefined })} className={cn("flex items-center gap-2 rounded-lg px-3 py-2 text-[13.5px]", (sp.category ?? "") === k ? "bg-royal-tint font-semibold text-[#0B5CFF]" : "text-deep-navy hover:bg-bg-soft")}><I className="h-4 w-4" />{l}</Link></li>;
                })}
              </ul>
            </nav>
            <div className="min-w-0">
              <form method="get" className="mb-3 flex flex-wrap items-center gap-2">
                <input name="q" defaultValue={sp.q} placeholder="Search templates..." aria-label="Search templates" className={filterSearch} />
                <select name="category" defaultValue={sp.category ?? ""} aria-label="Category" className={filterSelect}><option value="">All Categories</option>{LANDING_TEMPLATE_CATEGORIES.map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select>
                <button className="h-9 rounded-md border border-line px-4 text-[12.5px] font-semibold">Apply</button>
                <span className="ml-auto flex gap-1">
                  <Link aria-label="Grid view" href={href({ view: undefined })} className={cn("rounded-md border p-2", grid ? "border-[#0B5CFF] bg-royal-tint text-[#0B5CFF]" : "border-line text-ink-muted")}><LayoutGrid className="h-4 w-4" /></Link>
                  <Link aria-label="List view" href={href({ view: "list" })} className={cn("rounded-md border p-2", !grid ? "border-[#0B5CFF] bg-royal-tint text-[#0B5CFF]" : "border-line text-ink-muted")}><List className="h-4 w-4" /></Link>
                </span>
              </form>
              <div className={cn("grid gap-4", grid ? "grid-cols-1 md:grid-cols-2 2xl:grid-cols-3" : "grid-cols-1")}>
                {list.map((t) => (
                  <Link key={t.key} href={href({ t: t.key })} className={cn("block rounded-xl border bg-white p-4 hover:border-[#0B5CFF]/50", selected?.key === t.key ? "border-[#0B5CFF] ring-2 ring-[#0B5CFF]/15" : "border-line", !grid && "flex items-center gap-4")}>
                    <div className={cn("rounded-lg bg-gradient-to-br p-3", TINT[t.category], grid ? "h-36" : "h-20 w-32 shrink-0")} aria-hidden>
                      <div className="mb-2 h-2.5 w-2/3 rounded bg-white/90" />
                      {t.blocks.slice(0, grid ? 4 : 2).map((b, i) => <div key={i} className="mb-1.5 h-2 rounded bg-white/70" style={{ width: `${80 - i * 12}%` }} />)}
                      {t.blocks.some((b) => b.type === "form") && grid && <div className="mt-2 h-5 w-16 rounded bg-[#0B5CFF]/70" />}
                    </div>
                    <div className={cn("flex items-start justify-between gap-2", grid && "mt-3")}>
                      <span><b className="block text-[15px] text-deep-navy">{t.name}</b><span className="text-[13px] text-ink-soft">{t.description}</span></span>
                      {selected?.key === t.key ? <CheckCircle2 className="h-5 w-5 shrink-0 text-[#0B5CFF]" /> : <Circle className="h-5 w-5 shrink-0 text-ink-muted" />}
                    </div>
                  </Link>
                ))}
                {!list.length && <p className="text-[13px] text-ink-soft">No templates match your search.</p>}
              </div>
            </div>
          </div>
        </div>
        <Panel title="Template Details">
          {selected ? (
            <div className="space-y-4">
              <div className={cn("rounded-lg bg-gradient-to-br p-4", TINT[selected.category])}><b className="text-[16px] text-deep-navy">{selected.name}</b><p className="text-[13px] text-ink-soft">{selected.description}</p></div>
              <div><h3 className="text-[13px] font-semibold text-deep-navy">Layout Type</h3><p className="text-[13px] text-ink-soft">{selected.layout}</p></div>
              <div><h3 className="text-[13px] font-semibold text-deep-navy">Recommended Use</h3><p className="text-[13px] text-ink-soft">{selected.use}</p></div>
              <div><h3 className="text-[13px] font-semibold text-deep-navy">Included Sections</h3><p className="text-[13px] text-ink-soft">{selected.blocks.length ? selected.blocks.map((b) => PAGE_SECTIONS.find(([k]) => k === b.type)?.[1] ?? "Lead Form").join(", ") : "None"}</p></div>
              {templateButton(selected.key, "Use This Template", headerPrimary)}
            </div>
          ) : (
            <div className="py-10 text-center text-[13.5px] text-ink-soft">
              <FileText className="mx-auto mb-3 h-10 w-10 text-ink-muted" />
              Select a template to preview details and start customizing.
              <dl className="mt-6 space-y-4 text-left">{["Layout Type", "Recommended Use", "Included Sections"].map((l) => <div key={l}><dt className="font-semibold text-deep-navy">{l}</dt><dd>—</dd></div>)}</dl>
            </div>
          )}
        </Panel>
      </div>
    </div>
  );
}
