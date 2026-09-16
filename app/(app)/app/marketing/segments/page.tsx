import type { Metadata } from "next";
import Link from "next/link";
import { CloudUpload, Filter, ListChecks, PieChart, SlidersHorizontal, Sparkles, TrendingUp, Users } from "lucide-react";
import { db } from "@/lib/db";
import { cn } from "@/lib/utils";
import { BarList, EmptyState, Panel, Pill, ScreenHeader, StatGrid, TrendColumns, fmtDateTime, figure } from "@/components/amplivanta/screen-kit";
import { FilterBar, Select, filterSearch, headerOutline, outlineSm, primarySm } from "@/components/amplivanta/growth-kit";
import { ActButton } from "@/components/amplivanta/growth-ui";
import { FormDialog, type FieldSpec } from "@/components/amplivanta/creative-ui";
import { createSegment, deleteSegment, importAudience, setSegmentStatus, syncSegments } from "@/app/(app)/app/marketing/actions";
import { dailySeries, marketingContext } from "@/lib/server/marketing-screens";
import { SEGMENT_FIELDS, SEGMENT_OPERATORS, parseRules, rulesToWhere } from "@/lib/marketing/logic";
import { SEGMENT_SOURCES, SEGMENT_STATUSES, SEGMENT_TYPES, label } from "@/lib/marketing/options";

export const metadata: Metadata = { title: "Segments & Audiences" };
export const dynamic = "force-dynamic";

type SP = { q?: string; type?: string; size?: string; source?: string; status?: string; s?: string };

export default async function SegmentsPage({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams;
  const c = await marketingContext();
  type Row = { id: string; name: string; description: string | null; type: string; source: string; status: string; memberCount: number; filterCriteria: unknown; refreshedAt: Date | null; updatedAt: Date };
  let all: Row[] = [];
  let growth: Date[] = [];
  let sample: { id: string; name: string | null; email: string | null }[] = [];
  const suggestions: { title: string; body: string }[] = [];
  if (c) {
    try {
      const w = c.workspaceId;
      all = await db.segment.findMany({ where: { workspaceId: w }, orderBy: { updatedAt: "desc" }, select: { id: true, name: true, description: true, type: true, source: true, status: true, memberCount: true, filterCriteria: true, refreshedAt: true, updatedAt: true } });
      const sel = all.find((x) => x.id === sp.s);
      const where = sel ? (sel.type === "static" ? { workspaceId: w, id: { in: ((await db.segment.findUnique({ where: { id: sel.id }, select: { contactIds: true } }))?.contactIds ?? []) } } : rulesToWhere(w, parseRules((sel.filterCriteria as { rules?: unknown })?.rules))) : { workspaceId: w };
      const [g, s, hot, recent, total] = await Promise.all([
        db.contact.findMany({ where: { ...(where as object), createdAt: { gte: new Date(Date.now() - 30 * 86400000) } } as never, select: { createdAt: true }, take: 20000 }).then((r) => r.map((x) => x.createdAt)),
        sel ? db.contact.findMany({ where: where as never, select: { id: true, name: true, email: true }, take: 6, orderBy: { updatedAt: "desc" } }) : Promise.resolve([]),
        db.contact.count({ where: { workspaceId: w, leadScore: { gte: 50 } } }),
        db.contact.count({ where: { workspaceId: w, createdAt: { gte: new Date(Date.now() - 7 * 86400000) } } }),
        db.contact.count({ where: { workspaceId: w } }),
      ]);
      growth = g;
      sample = s;
      if (hot && !all.some((x) => (x.filterCriteria as { rules?: { field: string }[] })?.rules?.some((r) => r.field === "leadScore"))) suggestions.push({ title: `High-intent leads (${hot})`, body: "Contacts with a lead score of 50 or more. Good audience for sales follow-up." });
      if (recent) suggestions.push({ title: `New this week (${recent})`, body: "Contacts added in the last 7 days, for a welcome or onboarding email." });
      if (total && !all.length) suggestions.push({ title: `All contacts (${total})`, body: "Start with a broad audience, then narrow it with rules." });
    } catch {
      all = [];
    }
  }
  const canEdit = Boolean(c?.canEdit);
  const rulesOf = (r: Row) => parseRules((r.filterCriteria as { rules?: unknown })?.rules);
  const size = (n: number) => (n === 0 ? "empty" : n <= 100 ? "small" : "large");
  const rows = all.filter((r) => (!sp.q || `${r.name} ${r.description ?? ""}`.toLowerCase().includes(sp.q.toLowerCase())) && (!sp.type || r.type === sp.type) && (!sp.source || r.source === sp.source) && (!sp.status || r.status === sp.status) && (!sp.size || size(r.memberCount) === sp.size));
  const selected = all.find((r) => r.id === sp.s);
  const active = all.filter((r) => r.status === "active");
  const ruleFields: FieldSpec[] = [0, 1, 2].flatMap((i): FieldSpec[] => [
    { name: `field${i}`, label: `Rule ${i + 1}: field`, kind: "select", options: SEGMENT_FIELDS, placeholder: i ? "Optional" : "Choose", required: i === 0 },
    { name: `operator${i}`, label: "Operator", kind: "select", options: SEGMENT_OPERATORS, placeholder: "Choose", required: i === 0 },
    { name: `value${i}`, label: "Value", kind: "text", required: i === 0 },
  ]);
  const createDynamic = (cls: string, text = "+ Create Segment") => <FormDialog title="Create Segment" label={text} className={cls} action={createSegment} disabled={!canEdit} submitLabel="Create segment" note="Contacts must match every rule. Tags are compared in lowercase; “Created within” takes a number of days." fields={[{ name: "type", kind: "hidden", value: "dynamic" }, { name: "name", label: "Segment name", kind: "text", required: true }, { name: "description", label: "Description", kind: "text" }, ...ruleFields]} />;
  const createStatic = (cls: string) => <FormDialog title="Create Static List" label="Create Static List" className={cls} action={createSegment} disabled={!canEdit} submitLabel="Create list" note="Only addresses that already exist as contacts are added. Use Import Audience to add new people." fields={[{ name: "type", kind: "hidden", value: "static" }, { name: "name", label: "List name", kind: "text", required: true }, { name: "emails", label: "Contact emails", kind: "textarea", rows: 6, required: true, placeholder: "one@example.com\ntwo@example.com" }]} />;

  return (
    <div className="mx-auto max-w-[1600px]">
      <ScreenHeader
        crumbs={[["Home", "/app"], ["Marketing Automation", "/app/marketing"], ["Segments & Audiences"]]}
        title="Segments & Audiences"
        actions={
          <>
            {createDynamic(headerOutline)}
            <FormDialog title="Import Audience" label="Import Audience" className={headerOutline} action={importAudience} disabled={!canEdit} submitLabel="Import" note="One contact per line: email, first name, last name. Missing contacts are created in the CRM; only import people who agreed to hear from you." fields={[{ name: "name", label: "List name", kind: "text", required: true }, { name: "csv", label: "Contacts", kind: "textarea", rows: 8, required: true, placeholder: "ana@example.com,Ana,Lopez" }]} />
            {canEdit && <ActButton action={syncSegments} className={headerOutline}>Sync Contacts</ActButton>}
          </>
        }
      />
      <StatGrid
        cols={4}
        stats={[
          { label: "Dynamic Segments", icon: Users, value: figure(active.filter((r) => r.type === "dynamic").length), hint: "Active dynamic segments", tone: "violet" },
          { label: "Static Lists", icon: ListChecks, value: figure(all.filter((r) => r.type === "static").length), hint: "Static contact lists", tone: "green" },
          { label: "Synced Audiences", icon: CloudUpload, value: figure(all.filter((r) => r.source === "import").length), hint: "Imported audiences" },
          { label: "Active Rules", icon: SlidersHorizontal, value: figure(active.reduce((n, r) => n + rulesOf(r).length, 0)), hint: "Segment rules running", tone: "orange" },
        ]}
      />
      <Panel className="mb-4">
        <FilterBar className="border-0 p-0">
          <input name="q" defaultValue={sp.q} placeholder="Search segments or description..." aria-label="Search segments" className={filterSearch} />
          <Select name="type" value={sp.type} all="All Types" options={SEGMENT_TYPES} label="Type" />
          <Select name="size" value={sp.size} all="All Memberships" options={[["empty", "No members"], ["small", "1-100 members"], ["large", "Over 100 members"]]} label="Membership" />
          <Select name="source" value={sp.source} all="All Sources" options={SEGMENT_SOURCES} label="Source" />
          <Select name="status" value={sp.status} all="All Statuses" options={SEGMENT_STATUSES} label="Status" />
          <Link href="/app/marketing/segments" className="h-9 rounded-md border border-line px-4 py-2 text-[12.5px] font-semibold text-deep-navy">Clear</Link>
        </FilterBar>
        {rows.length ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left text-[12.5px]">
              <thead><tr className="border-b border-line bg-bg-soft/70 text-deep-navy">{["Segment", "Type", "Members", "Rules", "Source", "Status", "Refreshed", ""].map((h) => <th key={h} className="px-3 py-2.5 font-semibold">{h}</th>)}</tr></thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id} className={cn("border-b border-line last:border-0", sp.s === r.id && "bg-royal-tint/30")}>
                    <td className="px-3 py-2.5"><Link href={`?s=${r.id}`} className="font-semibold text-deep-navy hover:text-[#0B5CFF]">{r.name}</Link>{r.description && <div className="text-[11.5px] text-ink-muted">{r.description}</div>}</td>
                    <td className="px-3 py-2.5 text-ink-soft">{label(SEGMENT_TYPES, r.type)}</td>
                    <td className="px-3 py-2.5 text-deep-navy">{r.memberCount.toLocaleString("en-US")}</td>
                    <td className="px-3 py-2.5 text-ink-soft">{r.type === "dynamic" ? rulesOf(r).length : "—"}</td>
                    <td className="px-3 py-2.5 text-ink-soft">{label(SEGMENT_SOURCES, r.source)}</td>
                    <td className="px-3 py-2.5"><Pill tone={r.status === "active" ? "green" : "amber"}>{label(SEGMENT_STATUSES, r.status)}</Pill></td>
                    <td className="px-3 py-2.5 text-ink-soft">{fmtDateTime(r.refreshedAt)}</td>
                    <td className="px-3 py-2.5">{canEdit && <span className="flex gap-1.5">{r.status === "active" ? <ActButton action={setSegmentStatus.bind(null, r.id, "paused")}>Pause</ActButton> : <ActButton action={setSegmentStatus.bind(null, r.id, "active")}>Activate</ActButton>}<ActButton action={deleteSegment.bind(null, r.id)} confirm="Delete this segment? Contacts are not deleted.">Delete</ActButton></span>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState icon={Users} title={all.length ? "No segments match these filters" : "No segments yet"} body="Create a segment to organize audiences using rules or a static list." action={all.length ? undefined : <span className="flex gap-2">{createDynamic(primarySm, "Create Segment")}{createStatic(outlineSm)}</span>} />
        )}
      </Panel>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Panel title="Segment Builder Summary">
          {selected ? (
            <div className="text-[13px]">
              <b className="text-deep-navy">{selected.name}</b>
              {selected.type === "dynamic" ? (
                <ul className="mt-2 space-y-1">{rulesOf(selected).map((r, i) => <li key={i} className="rounded-md bg-bg-soft px-2 py-1">{label(SEGMENT_FIELDS, r.field)} {label(SEGMENT_OPERATORS, r.operator)} <b>{r.value}</b></li>)}</ul>
              ) : (
                <p className="mt-1 text-ink-soft">Static list of {selected.memberCount} contacts.</p>
              )}
              <h4 className="mb-1 mt-3 font-semibold text-deep-navy">Sample members</h4>
              {sample.length ? <ul className="space-y-0.5 text-ink-soft">{sample.map((m) => <li key={m.id} className="truncate">{m.name ?? m.email}</li>)}</ul> : <p className="text-ink-soft">No matching contacts.</p>}
            </div>
          ) : (
            <EmptyState icon={Filter} tone="violet" title="No segment selected" body="Select or create a segment to view builder summary and rule details." compact action={createDynamic(outlineSm, "Create Segment")} />
          )}
        </Panel>
        <Panel title="Audience Growth" subtitle={selected ? `${selected.name}, last 30 days` : "All contacts, last 30 days"}>
          {growth.length ? <TrendColumns points={dailySeries(growth, 30)} label="New contacts" /> : <EmptyState icon={TrendingUp} tone="green" title="No data to display" body="Audience growth will appear here once data becomes available." compact />}
        </Panel>
        <Panel title="Distribution">
          {all.length ? <BarList rows={[...SEGMENT_TYPES.map(([k, l]): [string, number] => [l, all.filter((r) => r.type === k).length]), ...SEGMENT_SOURCES.map(([k, l]): [string, number] => [`Source: ${l}`, all.filter((r) => r.source === k).length])].filter(([, n]) => n > 0)} /> : <EmptyState icon={PieChart} title="No data to display" body="Segment distribution by source or type will appear here." compact />}
        </Panel>
        <Panel title="Suggestions" subtitle="Based on your CRM data">
          {suggestions.length ? <ul className="space-y-2 text-[13px]">{suggestions.map((s) => <li key={s.title} className="rounded-lg border border-line p-2.5"><b className="block text-deep-navy">{s.title}</b><span className="text-ink-soft">{s.body}</span></li>)}</ul> : <EmptyState icon={Sparkles} tone="orange" title="No suggestions yet" body="Suggestions appear as contacts, scores and activity build up." compact />}
        </Panel>
      </div>
    </div>
  );
}
