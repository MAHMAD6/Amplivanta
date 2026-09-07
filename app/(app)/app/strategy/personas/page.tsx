import type { Metadata } from "next";
import { Plus, Sparkles, Users } from "lucide-react";
import { PageHeader } from "@/components/amplivanta/page-header";
import { StrategySubnav } from "@/components/amplivanta/strategy-subnav";
import { StatusPill } from "@/components/amplivanta/status-pill";
import { PERSONAS } from "@/lib/strategy-data";
import { CreateButton } from "@/components/amplivanta/crud/create-button";
import { PERSONA_FIELDS } from "@/components/amplivanta/crud/module-fields";

export const metadata: Metadata = { title: "Audience & Personas" };

export default function PersonasPage() {
  return (
    <div className="mx-auto max-w-[1500px]">
      <PageHeader
        title="Audience & Buyer Personas"
        subtitle="Central personas for strategy, content, campaigns, AI recommendations."
        actions={
          <>
            <button className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-violet/30 bg-violet/5 px-4 text-[13px] font-bold text-violet"><Sparkles className="h-3.5 w-3.5" /> AI Generate Persona</button>
            <CreateButton label="Persona" fields={PERSONA_FIELDS} endpoint="/api/personas" />
          </>
        }
      />
      <StrategySubnav />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {PERSONAS.map((p) => (
          <div key={p.id} className="rounded-2xl border border-line bg-white p-5 shadow-card">
            <div className="mb-3 flex items-start gap-3">
              <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-lg font-bold ${p.tone}`}>{p.logoLetter}</div>
              <div className="min-w-0 flex-1">
                <div className="text-[15px] font-bold text-ink">{p.name}</div>
                <div className="text-[12px] text-ink-soft">{p.role}</div>
                <div className="mt-1 flex items-center gap-1 text-[11px] text-ink-muted"><Users className="h-3 w-3" /> {(p.size / 1000).toFixed(1)}K addressable</div>
              </div>
            </div>
            <div className="text-[11.5px] text-ink-muted">{p.demographics}</div>

            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <PersonaBlock title="Needs" items={p.needs} tone="bg-emerald-500/10 text-emerald-700" />
              <PersonaBlock title="Pain Points" items={p.painPoints} tone="bg-red-500/10 text-red-700" />
              <PersonaBlock title="Preferred Channels" items={p.channels} tone="bg-blue-500/10 text-blue-700" />
              <PersonaBlock title="Buying Triggers" items={p.triggers} tone="bg-violet/10 text-violet" />
            </div>

            <div className="mt-4 flex gap-2">
              <button className="flex-1 rounded-xl border border-line py-1.5 text-[12px] font-semibold text-ink">Edit</button>
              <button className="flex-1 rounded-xl bg-grad-cta py-1.5 text-[12px] font-bold text-white shadow-violet">Link to Campaign</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function PersonaBlock({ title, items, tone }: { title: string; items: string[]; tone: string }) {
  return (
    <div className={`rounded-xl p-3 ${tone}`}>
      <div className="mb-1 text-[10.5px] font-bold uppercase tracking-wider">{title}</div>
      <ul className="space-y-0.5 text-[11.5px]">
        {items.map((i) => <li key={i}>· {i}</li>)}
      </ul>
    </div>
  );
}
