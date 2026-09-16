import type { Metadata } from "next";
import Link from "next/link";
import { Columns3, Sparkles, Square, Star } from "lucide-react";
import { db } from "@/lib/db";
import { isAiConfigured } from "@/lib/ai";
import { EmptyState, Pill, ScreenHeader, fmtDate } from "@/components/amplivanta/screen-kit";
import { PanelTitle, filterSelect, giPanel, headerPrimary, outlineSm } from "@/components/amplivanta/growth-kit";
import { ActButton, ActionForm, SubmitButton } from "@/components/amplivanta/growth-ui";
import { FormDialog } from "@/components/amplivanta/creative-ui";
import { addIdea, deleteIdea, generateIdeas, ideaToDraft, setIdeaSaved } from "@/app/(app)/app/strategy/actions";
import { growthContext } from "@/lib/server/growth-screens";
import { EVENT_TYPES, IDEA_CHANNELS, IDEA_TYPES, label } from "@/lib/growth/options";

export const metadata: Metadata = { title: "Content Ideas" };
export const dynamic = "force-dynamic";

type Idea = { id: string; title: string; description: string | null; channel: string | null; type: string | null; source: string; status: string; saved: boolean; createdAt: Date };

export default async function ContentIdeasPage() {
  const c = await growthContext();
  const ai = isAiConfigured();
  let generated: Idea[] = [];
  let saved: Idea[] = [];
  let goals: string[] = [];
  let events: { id: string; title: string; date: Date; type: string }[] = [];
  let themes: [string, number][] = [];
  if (c) {
    try {
      const w = c.workspaceId;
      const sel = { id: true, title: true, description: true, channel: true, type: true, source: true, status: true, saved: true, createdAt: true } as const;
      const [g, s, gl, ev, grouped] = await Promise.all([
        db.contentIdea.findMany({ where: { workspaceId: w, saved: false }, orderBy: { createdAt: "desc" }, take: 30, select: sel }),
        db.contentIdea.findMany({ where: { workspaceId: w, saved: true }, orderBy: { createdAt: "desc" }, take: 30, select: sel }),
        db.goal.findMany({ where: { workspaceId: w, status: { not: "completed" } }, take: 20, select: { title: true } }),
        db.eventItem.findMany({ where: { workspaceId: w, date: { gte: new Date(new Date().toISOString().slice(0, 10)), lte: new Date(Date.now() + 90 * 86400000) } }, orderBy: { date: "asc" }, take: 6, select: { id: true, title: true, date: true, type: true } }),
        db.contentIdea.groupBy({ by: ["channel"], where: { workspaceId: w, status: "drafted" }, _count: true }),
      ]);
      generated = g;
      saved = s;
      goals = gl.map((x) => x.title);
      events = ev;
      themes = grouped.filter((x) => x.channel).map((x) => [label(IDEA_CHANNELS, x.channel), x._count] as [string, number]).sort((a, b) => b[1] - a[1]);
    } catch {
      /* unavailable: panels show their empty states */
    }
  }
  const canEdit = Boolean(c?.canEdit);
  const row = (i: Idea) => (
    <li key={i.id} className="py-3">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="text-[13.5px] font-semibold text-deep-navy">{i.title}</div>
          {i.description && <p className="mt-0.5 text-[12px] text-ink-soft">{i.description}</p>}
          <div className="mt-1 flex flex-wrap gap-1.5">
            {i.channel && <Pill tone="blue">{label(IDEA_CHANNELS, i.channel)}</Pill>}
            {i.type && <Pill>{label(IDEA_TYPES, i.type)}</Pill>}
            {i.source === "ai" && <Pill tone="violet">AI</Pill>}
            {i.status === "drafted" && <Pill tone="green">Drafted</Pill>}
          </div>
        </div>
        {canEdit && (
          <div className="flex shrink-0 gap-1.5">
            <ActButton action={setIdeaSaved.bind(null, i.id, !i.saved)}>{i.saved ? "Unsave" : "Save"}</ActButton>
            <ActButton action={ideaToDraft.bind(null, i.id)} goTo="/app/creative-studio/documents/">Draft</ActButton>
            <ActButton action={deleteIdea.bind(null, i.id)} confirm="Remove this idea?">Remove</ActButton>
          </div>
        )}
      </div>
    </li>
  );

  return (
    <div className="mx-auto max-w-[1600px]">
      <ScreenHeader
        title="Content Ideas"
        subtitle="Generate channel-aware ideas from goals, trends, audience context, and connected data."
        actions={
          <>
            <FormDialog
              title="Add Idea"
              label="Add Idea"
              className="inline-flex h-10 items-center rounded-md border border-line bg-white px-5 text-[13px] font-semibold text-[#0B5CFF] disabled:opacity-50"
              action={addIdea}
              disabled={!canEdit}
              submitLabel="Save idea"
              fields={[
                { name: "title", label: "Idea", kind: "text", required: true },
                { name: "description", label: "Details", kind: "textarea", rows: 3 },
                { name: "channel", label: "Channel", kind: "select", options: IDEA_CHANNELS },
                { name: "type", label: "Type", kind: "select", options: IDEA_TYPES },
              ]}
            />
            <a href="#generator" className={headerPrimary}>Generate Ideas</a>
          </>
        }
      />
      <section id="generator" className={`${giPanel} mb-4`}>
        <PanelTitle hint="Uses your brief plus active personas and goals">Idea Generator</PanelTitle>
        <ActionForm action={generateIdeas}>
          <textarea name="brief" rows={4} maxLength={2000} required disabled={!ai || !canEdit} placeholder="Describe the topic, campaign goal, audience, or offer you want ideas for..." className="w-full rounded-lg border border-line px-3 py-2.5 text-[13.5px] text-deep-navy placeholder:text-ink-muted focus:border-[#0B5CFF] focus:outline-none disabled:bg-bg-soft/60" />
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <select name="channel" aria-label="Channel" className={`${filterSelect} w-[150px]`}><option value="">All Channels</option>{IDEA_CHANNELS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select>
            <select name="goal" aria-label="Goal" className={`${filterSelect} w-[150px]`}><option value="">All Goals</option>{goals.map((g) => <option key={g} value={g}>{g}</option>)}</select>
            <select name="type" aria-label="Type" className={`${filterSelect} w-[150px]`}><option value="">All Types</option>{IDEA_TYPES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select>
            {ai && canEdit ? <SubmitButton>Generate Ideas</SubmitButton> : <span className="text-[12px] text-ink-muted">{ai ? "Editors can generate ideas." : "AI idea generation is not available yet: no AI provider is configured."}</span>}
          </div>
        </ActionForm>
      </section>
      <div className="mb-4 grid grid-cols-1 gap-4 xl:grid-cols-2">
        <section className={giPanel}>
          <PanelTitle hint="Unsaved ideas from the generator">Generated Ideas</PanelTitle>
          {generated.length ? <ul className="divide-y divide-line">{generated.map(row)}</ul> : <EmptyState icon={Sparkles} title="No ideas generated yet" body="Describe what you want to create, then generate ideas." action={<a href="#generator" className={outlineSm}>Generate Ideas</a>} />}
        </section>
        <section className={giPanel}>
          <PanelTitle hint="Bookmarked ideas">Saved Ideas</PanelTitle>
          {saved.length ? <ul className="divide-y divide-line">{saved.map(row)}</ul> : <EmptyState icon={Star} title="No saved ideas yet" body="Bookmark useful ideas to keep them available here." />}
        </section>
      </div>
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <section className={giPanel}>
          <PanelTitle hint="Channels of ideas turned into drafts">Theme Signals</PanelTitle>
          {themes.length ? (
            <ul className="space-y-2">
              {themes.map(([t, n]) => <li key={t} className="flex justify-between rounded-md border border-line px-3 py-2 text-[12.5px]"><span className="font-semibold text-deep-navy">{t}</span><span className="text-ink-soft">{n} drafted</span></li>)}
              <li className="text-[11.5px] text-ink-muted">Theme performance needs connected content analytics, which are not available yet.</li>
            </ul>
          ) : (
            <EmptyState icon={Columns3} title="No theme data available" body="Theme performance appears when connected content analytics are available." />
          )}
        </section>
        <section className={giPanel}>
          <PanelTitle hint="Next 90 days from Events & Holidays" action={events.length ? <Link href="/app/content-intelligence/events" className="text-[12px] font-semibold text-[#0B5CFF]">Calendar</Link> : undefined}>Upcoming Opportunities</PanelTitle>
          {events.length ? (
            <ul className="divide-y divide-line">
              {events.map((e) => (
                <li key={e.id} className="flex items-center justify-between py-2.5 text-[13px]">
                  <Link href={`/app/content-intelligence/events?event=${e.id}`} className="font-semibold text-deep-navy hover:text-[#0B5CFF]">{e.title}</Link>
                  <span className="text-[12px] text-ink-soft">{label(EVENT_TYPES, e.type)} · {fmtDate(e.date)}</span>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState icon={Square} title="No event opportunities available" body="Relevant events and dates will appear when events are added to the calendar." />
          )}
        </section>
      </div>
    </div>
  );
}
