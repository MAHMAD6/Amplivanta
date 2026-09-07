import type { Metadata } from "next";
import { Search, Sparkles, Star, Plus } from "lucide-react";
import { PageHeader } from "@/components/amplivanta/page-header";
import { CreativeSubnav } from "@/components/amplivanta/creative-subnav";
import { StatusPill } from "@/components/amplivanta/status-pill";
import { CREATIVE_TEMPLATES } from "@/lib/creative-data";

export const metadata: Metadata = { title: "Templates — Creative Studio" };

const CATS = ["All", "Social Media", "Presentations", "Documents", "Marketing", "Videos", "Ads", "Print", "More"];

export default function CreativeTemplatesPage() {
  const featured = CREATIVE_TEMPLATES.filter((t) => t.featured);
  const popular = CREATIVE_TEMPLATES.filter((t) => t.popular);
  const recent = CREATIVE_TEMPLATES.slice(0, 4);

  return (
    <div className="mx-auto max-w-[1500px]">
      <PageHeader
        title="Templates"
        subtitle="Searchable template library for rapid content production."
        actions={
          <button className="inline-flex h-10 items-center gap-1.5 rounded-xl bg-grad-cta px-4 text-[13px] font-bold text-white shadow-violet">
            <Plus className="h-3.5 w-3.5" /> Custom Template
          </button>
        }
      />
      <CreativeSubnav />

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <div className="flex h-10 min-w-[240px] flex-1 items-center gap-2 rounded-xl border border-line bg-white px-3">
          <Search className="h-3.5 w-3.5 text-ink-muted" />
          <input placeholder="Search 5,240 templates…" className="min-w-0 flex-1 bg-transparent text-[13px] focus:outline-none" />
        </div>
        {["Any Industry", "Any Platform", "Any Style", "Any Color"].map((l) => (
          <button key={l} className="inline-flex h-10 items-center rounded-xl border border-line bg-white px-3 text-[12px] font-semibold text-ink-soft">{l}</button>
        ))}
      </div>

      {/* Categories */}
      <div className="mb-6 flex flex-wrap gap-2">
        {CATS.map((c, i) => (
          <button key={c} className={`rounded-full border px-3 py-1.5 text-[12px] font-semibold ${i === 0 ? "border-violet/40 bg-violet/10 text-violet" : "border-line bg-white text-ink-soft hover:border-violet/30"}`}>{c}</button>
        ))}
      </div>

      {/* Featured */}
      <Section title="Featured" items={featured} />

      {/* Popular */}
      <Section title="Popular" items={popular} />

      {/* Recently Used */}
      <Section title="Recently Used" items={recent} />
    </div>
  );
}

function Section({ title, items }: { title: string; items: typeof CREATIVE_TEMPLATES }) {
  return (
    <div className="mb-8">
      <div className="mb-3 flex items-center justify-between">
        <div className="text-[14px] font-bold text-ink">{title}</div>
        <button className="text-[12px] font-semibold text-violet">See all →</button>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {items.map((t) => (
          <div key={t.id} className="group overflow-hidden rounded-2xl border border-line bg-white shadow-card transition hover:-translate-y-1 hover:border-violet/30">
            <div className={`relative aspect-[4/5] bg-gradient-to-br ${t.thumb}`}>
              {t.featured && <StatusPill tone="pink" className="absolute left-2 top-2"><Star className="mr-0.5 h-2.5 w-2.5" />Featured</StatusPill>}
              {t.popular && !t.featured && <StatusPill tone="amber" className="absolute left-2 top-2">Popular</StatusPill>}
            </div>
            <div className="p-3">
              <div className="text-[12.5px] font-semibold text-ink">{t.name}</div>
              <div className="mt-0.5 text-[10.5px] text-ink-muted">{t.category} · {t.size}</div>
              <div className="mt-2 flex items-center justify-between border-t border-line pt-2">
                <span className="text-[10px] text-ink-muted">{t.uses} uses</span>
                <button className="inline-flex items-center gap-1 rounded-lg bg-grad-cta px-2 py-1 text-[10.5px] font-bold text-white shadow-violet">
                  <Sparkles className="h-3 w-3" /> Use
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
