import type { Metadata } from "next";
import Link from "next/link";
import { CircleDot, UserRound, Zap } from "lucide-react";
import { db } from "@/lib/db";
import { cn } from "@/lib/utils";
import { EmptyState, Pill, ScreenHeader } from "@/components/amplivanta/screen-kit";
import { FilterBar, PanelTitle, RowList, Select, filterSearch, giPanel, headerPrimary, outlineSm } from "@/components/amplivanta/growth-kit";
import { ActButton } from "@/components/amplivanta/growth-ui";
import { FormDialog, type FieldSpec } from "@/components/amplivanta/creative-ui";
import { createSegment, deletePersona, savePersona } from "@/app/(app)/app/strategy/actions";
import { growthContext } from "@/lib/server/growth-screens";
import { PERSONA_STATUSES, label } from "@/lib/growth/options";

export const metadata: Metadata = { title: "Audience & Buyer Personas" };
export const dynamic = "force-dynamic";

type SP = { q?: string; segment?: string; status?: string; persona?: string };
type P = { id: string; name: string; role: string | null; status: string; segmentId: string | null; needs: string[]; painPoints: string[]; objections: string[]; channels: string[]; triggers: string[]; goals: string[]; notes: string | null };

export default async function PersonasPage({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams;
  const c = await growthContext();
  let personas: P[] = [];
  let segments: { id: string; name: string; description: string | null; memberCount: number }[] = [];
  let total = 0;
  if (c) {
    try {
      const w = c.workspaceId;
      const [list, segs, n] = await Promise.all([
        db.persona.findMany({
          where: { workspaceId: w, ...(sp.q ? { OR: [{ name: { contains: sp.q, mode: "insensitive" } }, { role: { contains: sp.q, mode: "insensitive" } }] } : {}), ...(sp.segment ? { segmentId: sp.segment } : {}), ...(sp.status ? { status: sp.status } : {}) },
          orderBy: { createdAt: "desc" },
          take: 100,
          select: { id: true, name: true, role: true, status: true, segmentId: true, needs: true, painPoints: true, objections: true, channels: true, triggers: true, goals: true, notes: true },
        }),
        db.segment.findMany({ where: { workspaceId: w, ...(sp.q ? { name: { contains: sp.q, mode: "insensitive" } } : {}) }, orderBy: { updatedAt: "desc" }, take: 50, select: { id: true, name: true, description: true, memberCount: true } }),
        db.persona.count({ where: { workspaceId: w } }),
      ]);
      personas = list;
      segments = segs;
      total = n;
    } catch {
      personas = [];
    }
  }
  const canEdit = Boolean(c?.canEdit);
  const selected = personas.find((p) => p.id === sp.persona) ?? personas[0];
  const segName = (id: string | null) => segments.find((s) => s.id === id)?.name;
  const base = Object.fromEntries(Object.entries({ q: sp.q, segment: sp.segment, status: sp.status }).filter(([, v]) => v)) as Record<string, string>;
  const pick = (id: string) => `?${new URLSearchParams({ ...base, persona: id })}`;
  const fields = (p?: P): FieldSpec[] => [
    ...(p ? [{ name: "id", kind: "hidden", value: p.id } as FieldSpec] : []),
    { name: "name", label: "Persona name", kind: "text", required: true, defaultValue: p?.name },
    { name: "role", label: "Role / title", kind: "text", defaultValue: p?.role ?? undefined },
    { name: "segmentId", label: "Audience segment", kind: "select", options: segments.map((s) => [s.id, s.name]), placeholder: "None", defaultValue: p?.segmentId ?? "" },
    { name: "status", label: "Status", kind: "select", options: PERSONA_STATUSES, defaultValue: p?.status ?? "active" },
    { name: "needs", label: "Needs (one per line)", kind: "textarea", rows: 3, defaultValue: p?.needs.join("\n") },
    { name: "painPoints", label: "Pain points", kind: "textarea", rows: 3, defaultValue: p?.painPoints.join("\n") },
    { name: "objections", label: "Objections", kind: "textarea", rows: 2, defaultValue: p?.objections.join("\n") },
    { name: "channels", label: "Preferred channels", kind: "textarea", rows: 2, defaultValue: p?.channels.join("\n") },
    { name: "triggers", label: "Buying triggers", kind: "textarea", rows: 2, defaultValue: p?.triggers.join("\n") },
    { name: "notes", label: "Research notes", kind: "textarea", rows: 3, defaultValue: p?.notes ?? undefined },
  ];
  const create = (cls: string) => <FormDialog title="Create Persona" label="Create Persona" className={cls} action={savePersona} disabled={!canEdit} submitLabel="Create persona" fields={fields()} />;
  const block = (title: string, items: string[] | string | null | undefined) => {
    const list = Array.isArray(items) ? items : items ? [items] : [];
    return (
      <div className="rounded-md border border-line px-3 py-2.5 text-[12.5px]">
        <div className="font-semibold text-deep-navy">{title}</div>
        {list.length ? <ul className="mt-1 list-disc space-y-0.5 pl-4 text-ink-soft">{list.map((x) => <li key={x} className="whitespace-pre-wrap">{x}</li>)}</ul> : <div className="text-ink-muted">—</div>}
      </div>
    );
  };

  return (
    <div className="mx-auto max-w-[1600px]">
      <ScreenHeader title="Audience & Buyer Personas" subtitle="Centralize target audiences and personas for strategy, content, campaigns, and AI recommendations." actions={create(headerPrimary)} />
      <FilterBar>
        <input name="q" defaultValue={sp.q} placeholder="Search audiences and personas" aria-label="Search audiences and personas" className={filterSearch} />
        <Select name="segment" value={sp.segment} all="All Segments" options={segments.map((s) => [s.id, s.name])} label="Segment" />
        <Select name="status" value={sp.status} all="All Statuses" options={PERSONA_STATUSES} label="Status" />
      </FilterBar>
      <div className="mb-4 grid grid-cols-1 gap-4 xl:grid-cols-3">
        <section className={giPanel}>
          <PanelTitle hint="Select a persona to see its framework">Personas</PanelTitle>
          {personas.length ? (
            <ul className="divide-y divide-line">
              {personas.map((p) => (
                <li key={p.id} className={cn("flex items-center justify-between gap-2 px-2 py-2.5", selected?.id === p.id && "bg-royal-tint/40")}>
                  <Link href={pick(p.id)} className="min-w-0">
                    <div className="truncate text-[13px] font-semibold text-deep-navy">{p.name}</div>
                    <div className="text-[11.5px] text-ink-muted">{[p.role, segName(p.segmentId)].filter(Boolean).join(" · ") || "No role set"}</div>
                  </Link>
                  <Pill tone={p.status === "active" ? "green" : p.status === "draft" ? "amber" : "gray"}>{label(PERSONA_STATUSES, p.status)}</Pill>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState icon={UserRound} title={total ? "No personas match" : "No personas yet"} body="Create a persona to document needs, objections, channels, and buying triggers." action={total ? undefined : create(outlineSm)} />
          )}
        </section>
        <section className={giPanel}>
          <PanelTitle hint="Reusable audience segments" action={segments.length ? <Link href="/app/marketing/segments" className="text-[12px] font-semibold text-[#0B5CFF]">Manage rules</Link> : undefined}>Audience Segments</PanelTitle>
          {segments.length ? (
            <ul className="divide-y divide-line">
              {segments.map((s) => (
                <li key={s.id} className="py-2.5">
                  <div className="flex justify-between text-[13px]"><span className="font-semibold text-deep-navy">{s.name}</span><span className="text-ink-soft">{s.memberCount.toLocaleString("en-US")} members</span></div>
                  {s.description && <p className="text-[12px] text-ink-soft">{s.description}</p>}
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState
              icon={CircleDot}
              title="No audience segments"
              body="Create or connect segments to make targeting reusable across the workspace."
              action={<FormDialog title="Create Segment" label="Create Segment" className={outlineSm} action={createSegment} disabled={!canEdit} submitLabel="Create segment" fields={[{ name: "name", label: "Segment name", kind: "text", required: true }, { name: "description", label: "Description", kind: "textarea", rows: 3 }]} />}
            />
          )}
        </section>
        <section className={giPanel}>
          <PanelTitle hint="Campaigns targeting the selected persona">Campaign Links</PanelTitle>
          <EmptyState icon={Zap} title="No linked campaigns" body="Linking campaigns to a persona is not available yet; campaigns using the selected audience will appear here." />
        </section>
      </div>
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <section className={giPanel}>
          <PanelTitle
            hint={selected ? `For ${selected.name}` : "Select a persona"}
            action={
              selected && canEdit ? (
                <span className="flex gap-1.5">
                  <FormDialog title={`Edit ${selected.name}`} label="Edit" className="rounded-md border border-line px-2.5 py-1 text-[12px] font-semibold text-deep-navy hover:bg-bg-soft" action={savePersona} submitLabel="Save persona" fields={fields(selected)} />
                  <ActButton action={deletePersona.bind(null, selected.id)} confirm="Delete this persona?">Delete</ActButton>
                </span>
              ) : undefined
            }
          >
            Persona Framework
          </PanelTitle>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {block("Needs", selected?.needs)}
            {block("Pain Points", selected?.painPoints)}
            {block("Objections", selected?.objections)}
            {block("Preferred Channels", selected?.channels)}
            {block("Buying Triggers", selected?.triggers)}
            {block("Research Notes", selected?.notes)}
          </div>
        </section>
        <section className={giPanel}>
          <PanelTitle hint="Where persona context is used">Workspace Availability</PanelTitle>
          <RowList
            rows={[
              { label: "Content Ideas", value: "Uses active persona context", href: "/app/content-intelligence" },
              { label: "AI Workspace", value: "Not connected yet" },
              { label: "Creative Studio", value: "Not connected yet" },
              { label: "Marketing Automation", value: "Not connected yet" },
            ]}
          />
        </section>
      </div>
    </div>
  );
}
