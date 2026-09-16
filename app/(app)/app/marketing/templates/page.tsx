import type { Metadata } from "next";
import Link from "next/link";
import { Bookmark, BookmarkCheck, ChevronRight, Clock, FileText, LayoutGrid, List, Wrench } from "lucide-react";
import { db } from "@/lib/db";
import { cn } from "@/lib/utils";
import { EmptyState, Panel, ScreenHeader, StatGrid, figure } from "@/components/amplivanta/screen-kit";
import { FilterBar, Select, filterSearch, headerOutline, primarySm } from "@/components/amplivanta/growth-kit";
import { ActButton } from "@/components/amplivanta/growth-ui";
import { FormDialog } from "@/components/amplivanta/creative-ui";
import { createWorkflow, toggleSavedTemplate, applyAutomationTemplate } from "@/app/(app)/app/marketing/actions";
import { marketingContext, triggerLabel, triggerOptions } from "@/lib/server/marketing-screens";
import { AUTOMATION_TEMPLATES, NODE_LABELS, parseNodes } from "@/lib/marketing/workflow";
import { TEMPLATE_CATEGORIES, TEMPLATE_OBJECTIVES, label } from "@/lib/marketing/options";

export const metadata: Metadata = { title: "Automation Templates" };
export const dynamic = "force-dynamic";

type SP = { q?: string; category?: string; channel?: string; objective?: string; view?: string; show?: string; preview?: string };

export default async function AutomationTemplatesPage({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams;
  const c = await marketingContext();
  let saved: string[] = [];
  let recent: string[] = [];
  let custom: { id: string; name: string; content: unknown }[] = [];
  let triggers: [string, string][] = [];
  if (c) {
    try {
      const [p, t, tr] = await Promise.all([
        db.workspacePreference.findUnique({ where: { workspaceId_scope: { workspaceId: c.workspaceId, scope: "automation_templates" } } }),
        db.template.findMany({ where: { workspaceId: c.workspaceId, type: "automation" }, orderBy: { createdAt: "desc" }, select: { id: true, name: true, content: true } }),
        triggerOptions(c.workspaceId),
      ]);
      const v = (p?.values ?? {}) as { saved?: string[]; recent?: string[] };
      saved = v.saved ?? [];
      recent = v.recent ?? [];
      custom = t;
      triggers = tr;
    } catch {
      /* empty */
    }
  }
  const canEdit = Boolean(c?.canEdit);
  const q = sp.q?.toLowerCase();
  const all = [
    ...AUTOMATION_TEMPLATES.map((t) => ({ ...t, custom: false })),
    ...custom.map((t) => {
      const nodes = parseNodes((t.content as { nodes?: unknown })?.nodes);
      return { key: t.id, name: t.name, description: `Custom template with ${nodes.length} nodes.`, category: "internal", objective: "", channel: "email", tags: ["Custom"], trigger: nodes[0]?.config.event ?? "", nodes, custom: true };
    }),
  ];
  const list = all.filter(
    (t) =>
      (!q || `${t.name} ${t.description} ${t.tags.join(" ")}`.toLowerCase().includes(q)) &&
      (!sp.category || t.category === sp.category) &&
      (!sp.objective || t.objective === sp.objective) &&
      (!sp.channel || t.channel === sp.channel) &&
      (sp.show !== "saved" || saved.includes(t.key)) &&
      (sp.show !== "custom" || t.custom) &&
      (sp.show !== "recent" || recent.includes(t.key)),
  );
  const preview = all.find((t) => t.key === sp.preview);
  const base = Object.fromEntries(Object.entries({ q: sp.q, category: sp.category, channel: sp.channel, objective: sp.objective, show: sp.show }).filter(([, v]) => v)) as Record<string, string>;
  const grid = sp.view !== "list";
  const link = (extra: Record<string, string>) => `?${new URLSearchParams({ ...base, ...(grid ? {} : { view: "list" }), ...extra })}`;
  const templateButton = (key: string) => canEdit && <ActButton action={applyAutomationTemplate.bind(null, key)} goTo="/app/marketing/workflows?id=" className="border-[#0B5CFF] bg-[#0B5CFF] text-white hover:bg-[#0A4FE0]">Use Template</ActButton>;

  return (
    <div className="mx-auto max-w-[1600px]">
      <ScreenHeader
        crumbs={[["Home", "/app"], ["Marketing Automation", "/app/marketing"], ["Automation Templates"]]}
        title="Automation Templates"
        subtitle="Start with customizable workflow templates and adapt them to your process."
        actions={
          <>
            <Link href="#categories" className={headerOutline}>Browse Categories</Link>
            <FormDialog title="Create Workflow" label="+ Create Workflow" action={createWorkflow} disabled={!canEdit} goTo="/app/marketing/workflows?id=" submitLabel="Open builder" fields={[{ name: "name", label: "Workflow name", kind: "text", required: true }, { name: "trigger", label: "Trigger", kind: "select", options: triggers, placeholder: "Choose later" }]} />
          </>
        }
      />
      <FilterBar>
        <input name="q" defaultValue={sp.q} placeholder="Search templates..." aria-label="Search templates" className={filterSearch} />
        <Select name="category" value={sp.category} all="All Categories" options={TEMPLATE_CATEGORIES} label="Category" />
        <Select name="channel" value={sp.channel} all="All Channels" options={[["email", "Email"]]} label="Channel" />
        <Select name="objective" value={sp.objective} all="All Objectives" options={TEMPLATE_OBJECTIVES} label="Objective" />
        {!grid && <input type="hidden" name="view" value="list" />}
        <span className="ml-auto flex gap-1">
          <Link aria-label="Grid view" href={`?${new URLSearchParams(base)}`} className={cn("rounded-md border p-2", grid ? "border-[#0B5CFF] bg-royal-tint text-[#0B5CFF]" : "border-line text-ink-muted")}><LayoutGrid className="h-4 w-4" /></Link>
          <Link aria-label="List view" href={`?${new URLSearchParams({ ...base, view: "list" })}`} className={cn("rounded-md border p-2", !grid ? "border-[#0B5CFF] bg-royal-tint text-[#0B5CFF]" : "border-line text-ink-muted")}><List className="h-4 w-4" /></Link>
        </span>
      </FilterBar>
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="min-w-0">
          <StatGrid
            cols={4}
            stats={[
              { label: "Available Templates", icon: FileText, value: figure(AUTOMATION_TEMPLATES.length), hint: "Ready-to-use workflows", tone: "green" },
              { label: "Saved Templates", icon: Bookmark, value: figure(saved.length), hint: "Your saved templates", tone: "violet" },
              { label: "Custom Templates", icon: Wrench, value: figure(custom.length), hint: "Built from your workflows" },
              { label: "Recently Used", icon: Clock, value: figure(recent.length), hint: "Used in this workspace", tone: "orange" },
            ]}
          />
          <div className="mb-3 flex flex-wrap gap-2 text-[12.5px]">
            {[["", "All"], ["saved", "Saved"], ["custom", "Custom"], ["recent", "Recently used"]].map(([v, l]) => <Link key={v} href={`?${new URLSearchParams(Object.fromEntries(Object.entries({ ...base, show: v }).filter(([, x]) => x)))}`} className={cn("rounded-full border px-3 py-1", (sp.show ?? "") === v ? "border-[#0B5CFF] bg-royal-tint font-semibold text-[#0B5CFF]" : "border-line text-ink-soft")}>{l}</Link>)}
          </div>
          {preview && (
            <Panel title={`Preview: ${preview.name}`} className="mb-4" action={<Link href={link({})} className="text-[12.5px] font-semibold text-[#0B5CFF]">Close</Link>}>
              <p className="mb-3 text-[13px] text-ink-soft">{preview.description} Trigger: {triggerLabel(preview.trigger)}.</p>
              <ol className="space-y-2">{preview.nodes.map((n, i) => <li key={i} className="rounded-lg border border-line px-3 py-2 text-[13px]"><span className="text-[11px] font-semibold uppercase text-ink-muted">{NODE_LABELS[n.type]}</span> <span className="font-semibold text-deep-navy">{n.name}</span>{n.type === "email" && <span className="text-ink-soft"> · “{n.config.subject}”</span>}</li>)}</ol>
              <div className="mt-3">{templateButton(preview.key)}</div>
            </Panel>
          )}
          {list.length ? (
            <div className={cn("grid gap-4", grid ? "grid-cols-1 md:grid-cols-2 2xl:grid-cols-4" : "grid-cols-1")}>
              {list.map((t) => (
                <article key={t.key} className={cn("flex rounded-xl border border-line bg-white p-5", grid ? "flex-col" : "flex-wrap items-center justify-between gap-3")}>
                  <div className="min-w-0">
                    <h3 className="text-[16px] font-semibold text-deep-navy">{t.name}</h3>
                    <p className="mt-2 text-[13px] text-ink-soft">{t.description}</p>
                    <div className="mt-3 flex flex-wrap gap-1.5">{t.tags.map((x) => <span key={x} className="rounded-md bg-bg-soft px-2 py-0.5 text-[11.5px] text-ink-soft">{x}</span>)}<span className="rounded-md bg-bg-soft px-2 py-0.5 text-[11.5px] text-ink-soft">{t.nodes.length} steps</span></div>
                  </div>
                  <div className={cn("flex flex-wrap gap-2", grid && "mt-4")}>
                    <Link href={link({ preview: t.key })} className="inline-flex items-center rounded-md border border-line px-2.5 py-1 text-[12px] font-semibold text-deep-navy hover:bg-bg-soft">Preview</Link>
                    {templateButton(t.key)}
                    {canEdit && !t.custom && <ActButton action={toggleSavedTemplate.bind(null, t.key)} title={saved.includes(t.key) ? "Remove from saved" : "Save template"}>{saved.includes(t.key) ? <BookmarkCheck className="h-3.5 w-3.5 text-[#0B5CFF]" /> : <Bookmark className="h-3.5 w-3.5" />}</ActButton>}
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <Panel><EmptyState icon={FileText} title="No templates match" body={sp.show === "custom" ? "Save a workflow as a template from the Workflow Builder." : "Try a different search or category."} /></Panel>
          )}
        </div>
        <div className="space-y-4">
          <Panel title="Categories" id="categories">
            <ul className="space-y-1">
              {TEMPLATE_CATEGORIES.map(([k, l]) => {
                const n = all.filter((t) => t.category === k).length;
                return <li key={k}><Link href={`?${new URLSearchParams({ category: k })}`} className={cn("flex items-center justify-between rounded-md px-2 py-2 text-[13px] hover:bg-bg-soft", sp.category === k ? "font-semibold text-[#0B5CFF]" : "text-deep-navy")}><span>{l}</span><span className="flex items-center gap-1 text-ink-muted">{n}<ChevronRight className="h-4 w-4" /></span></Link></li>;
              })}
            </ul>
          </Panel>
          <Panel title="Recommended Starting Points">
            <ul className="space-y-3 text-[13px]">
              {[["New to automation?", "Start with our most popular basics.", "welcome-series"], ["Drive more conversions", "Explore templates focused on results.", "lead-nurture"], ["Improve customer experience", "Build stronger relationships at scale.", "post-purchase"]].map(([t, b, k]) => (
                <li key={t}><Link href={link({ preview: k })} className="block rounded-md p-1 hover:bg-bg-soft"><span className="font-semibold text-deep-navy">{t}</span><span className="block text-ink-soft">{b}</span></Link></li>
              ))}
            </ul>
            <Link href="/app/marketing/workflows" className={cn(primarySm, "mt-4 w-full")}>Open Workflow Builder</Link>
          </Panel>
          {!AUTOMATION_TEMPLATES.length && <EmptyState icon={FileText} title="No templates" />}
          <p className="text-[12px] text-ink-muted">{label(TEMPLATE_CATEGORIES, sp.category) !== "—" ? `Filtered by ${label(TEMPLATE_CATEGORIES, sp.category)}. ` : ""}Using a template creates a draft; nothing runs until you publish it.</p>
        </div>
      </div>
    </div>
  );
}
