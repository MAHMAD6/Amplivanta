import type { Metadata } from "next";
import { Save, Eye, Sparkles, Type, Image as ImageIcon, Layout, Columns, Minus, Video, Smartphone, Tablet, Monitor, Undo2, Redo2 } from "lucide-react";
import { PageHeader } from "@/components/amplivanta/page-header";
import { MarketingSubnav } from "@/components/amplivanta/marketing-subnav";

export const metadata: Metadata = { title: "Landing Page Builder — Amplivanta" };

export default function PageBuilderPage() {
  return (
    <div className="mx-auto max-w-[1600px]">
      <PageHeader
        title="Landing Page Builder"
        subtitle="Design, publish and optimize hosted landing pages."
        actions={
          <>
            <div className="flex items-center gap-1 rounded-xl border border-line bg-white p-1">
              <button className="rounded-lg p-1.5 text-ink-muted"><Undo2 className="h-3.5 w-3.5" /></button>
              <button className="rounded-lg p-1.5 text-ink-muted"><Redo2 className="h-3.5 w-3.5" /></button>
            </div>
            <div className="flex items-center gap-1 rounded-xl border border-line bg-white p-1">
              <button className="rounded-lg bg-violet/10 p-1.5 text-violet"><Monitor className="h-3.5 w-3.5" /></button>
              <button className="rounded-lg p-1.5 text-ink-muted"><Tablet className="h-3.5 w-3.5" /></button>
              <button className="rounded-lg p-1.5 text-ink-muted"><Smartphone className="h-3.5 w-3.5" /></button>
            </div>
            <button className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-line bg-white px-4 text-[13px] font-semibold text-ink"><Eye className="h-3.5 w-3.5" /> Preview</button>
            <button className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-line bg-white px-4 text-[13px] font-semibold text-ink"><Save className="h-3.5 w-3.5" /> Save</button>
            <button className="inline-flex h-10 items-center gap-1.5 rounded-xl bg-grad-cta px-4 text-[13px] font-bold text-white shadow-violet">Publish</button>
          </>
        }
      />
      <MarketingSubnav />

      <div className="mb-4 flex gap-4 border-b border-line text-[12.5px] font-semibold">
        {["Builder", "Design", "Settings", "A/B Test", "Analytics", "History"].map((t, i) => (
          <button key={t} className={`relative pb-2 ${i === 0 ? "text-violet" : "text-ink-muted"}`}>
            {t}
            {i === 0 && <span className="absolute inset-x-0 -bottom-px h-0.5 rounded-full bg-violet" />}
          </button>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-[220px_1fr_280px]">
        <aside className="rounded-2xl border border-line bg-white p-3 shadow-card">
          <div className="mb-2 text-[11px] font-bold uppercase tracking-wider text-ink-muted">Sections</div>
          <div className="space-y-1.5">
            {["Hero", "Features", "Social Proof", "Pricing", "Testimonials", "FAQ", "CTA", "Footer"].map((s) => (
              <button key={s} className="w-full rounded-lg border border-line bg-white p-2 text-left text-[11.5px] font-semibold text-ink-soft hover:border-violet/30">{s}</button>
            ))}
          </div>
          <div className="mt-4 text-[11px] font-bold uppercase tracking-wider text-ink-muted">Elements</div>
          <div className="mt-2 grid grid-cols-2 gap-2">
            {[
              { icon: Type, label: "Heading" },
              { icon: Type, label: "Text" },
              { icon: ImageIcon, label: "Image" },
              { icon: Video, label: "Video" },
              { icon: Columns, label: "Columns" },
              { icon: Minus, label: "Divider" },
              { icon: Layout, label: "Button" },
              { icon: Sparkles, label: "AI Block" },
            ].map((e) => (
              <button key={e.label} className="flex flex-col items-center gap-1 rounded-xl border border-line p-2 text-[10.5px] font-semibold text-ink-soft hover:border-violet/30">
                <e.icon className="h-3.5 w-3.5" />
                {e.label}
              </button>
            ))}
          </div>
        </aside>

        <div className="rounded-2xl border border-line bg-bg-soft p-6 shadow-card">
          <div className="mx-auto max-w-[900px] rounded-2xl bg-white shadow-card">
            <div className="border-b border-line p-4 text-center text-[11px] text-ink-muted">
              Preview: <span className="font-mono text-ink">go.amplivanta.com/ai-advisor</span>
            </div>
            {/* Hero */}
            <div className="relative overflow-hidden rounded-t-2xl bg-gradient-to-br from-violet/[0.06] to-orange-brand/[0.06] p-10 text-center">
              <div className="mx-auto max-w-lg">
                <span className="rounded-full border border-violet/20 bg-white px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-violet">AI Advisor</span>
                <h1 className="mt-4 text-3xl font-extrabold text-ink">Your always-on growth strategist.</h1>
                <p className="mt-3 text-[13px] text-ink-soft">Ask any business question. Get scored answers, projected impact, one-click execution.</p>
                <button className="mt-5 rounded-xl bg-grad-cta px-5 py-2.5 text-[13px] font-bold text-white shadow-violet">Start Free</button>
              </div>
            </div>
            {/* Features */}
            <div className="grid grid-cols-3 gap-4 border-t border-line p-8">
              {["Conversational", "Growth Score", "Take Action"].map((f) => (
                <div key={f} className="rounded-xl border border-line p-4 text-center">
                  <div className="mx-auto h-8 w-8 rounded-xl bg-violet/10" />
                  <div className="mt-2 text-[12px] font-bold text-ink">{f}</div>
                </div>
              ))}
            </div>
            {/* Form section */}
            <div className="border-t border-line bg-bg-soft/40 p-8">
              <div className="mx-auto max-w-md rounded-2xl border border-line bg-white p-5">
                <div className="text-[14px] font-bold text-ink">Get Early Access</div>
                <div className="mt-3 space-y-2">
                  <input placeholder="Work email" className="w-full rounded-lg border border-line px-3 py-2 text-[13px]" />
                  <input placeholder="Company" className="w-full rounded-lg border border-line px-3 py-2 text-[13px]" />
                  <button className="w-full rounded-xl bg-grad-cta py-2 text-[13px] font-bold text-white">Request Access</button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <aside className="space-y-4">
          <div className="rounded-2xl border border-line bg-white p-4 shadow-card">
            <div className="mb-2 text-[12px] font-bold text-ink">Page Settings</div>
            <div className="space-y-2 text-[11.5px]">
              <div>
                <label className="mb-1 block font-semibold text-ink-muted">URL slug</label>
                <input defaultValue="/lp/ai-advisor" className="w-full rounded-lg border border-line px-2 py-1.5" />
              </div>
              <div>
                <label className="mb-1 block font-semibold text-ink-muted">Meta title</label>
                <input defaultValue="AI Advisor — Amplivanta" className="w-full rounded-lg border border-line px-2 py-1.5" />
              </div>
              <div>
                <label className="mb-1 block font-semibold text-ink-muted">Meta description</label>
                <textarea rows={2} defaultValue="Your always-on growth strategist, powered by AI." className="w-full resize-none rounded-lg border border-line px-2 py-1.5" />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-line bg-white p-4 shadow-card">
            <div className="mb-2 text-[12px] font-bold text-ink">SEO Score</div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-extrabold text-emerald-600">88</span>
              <span className="text-[11px] text-ink-muted">/ 100</span>
            </div>
            <div className="mt-2 space-y-1 text-[11px] text-ink-soft">
              <div>✓ Title within 55 chars</div>
              <div>✓ Description present</div>
              <div>✓ H1 detected</div>
              <div className="text-amber-700">△ Missing OpenGraph image</div>
            </div>
          </div>

          <div className="rounded-2xl border border-violet/20 bg-gradient-to-br from-violet/[0.05] to-orange-brand/[0.05] p-4">
            <div className="mb-1 flex items-center gap-1 text-[12px] font-bold text-ink"><Sparkles className="h-3 w-3 text-violet" /> AI CRO Suggestions</div>
            <ul className="mt-2 space-y-1 text-[11px] text-ink-soft">
              <li>· Move form above the fold for +14% CR.</li>
              <li>· Add customer logo strip below hero.</li>
              <li>· Shorten headline to under 50 chars.</li>
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}
