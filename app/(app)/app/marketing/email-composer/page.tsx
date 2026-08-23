import type { Metadata } from "next";
import { Save, Send, Eye, Sparkles, Type, Image as ImageIcon, Layout, Square as BtnI, Minus, Columns } from "lucide-react";
import { PageHeader } from "@/components/amplivanta/page-header";
import { MarketingSubnav } from "@/components/amplivanta/marketing-subnav";

export const metadata: Metadata = { title: "Email Composer — Amplivanta" };

export default function EmailComposerPage() {
  return (
    <div className="mx-auto max-w-[1500px]">
      <PageHeader
        title="Email Composer"
        subtitle="Drag-and-drop email creation with AI optimization."
        actions={
          <>
            <button className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-line bg-white px-4 text-[13px] font-semibold text-ink"><Save className="h-3.5 w-3.5" /> Save Draft</button>
            <button className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-violet/30 bg-violet/5 px-4 text-[13px] font-bold text-violet"><Eye className="h-3.5 w-3.5" /> Preview</button>
            <button className="inline-flex h-10 items-center gap-1.5 rounded-xl bg-grad-cta px-4 text-[13px] font-bold text-white shadow-violet"><Send className="h-3.5 w-3.5" /> Send / Schedule</button>
          </>
        }
      />
      <MarketingSubnav />

      <div className="grid gap-4 lg:grid-cols-[220px_1fr_260px]">
        {/* Blocks panel */}
        <aside className="rounded-2xl border border-line bg-white p-3 shadow-card">
          <div className="mb-2 text-[11px] font-bold uppercase tracking-wider text-ink-muted">Blocks</div>
          <div className="grid grid-cols-2 gap-2">
            {[
              { icon: Type, label: "Text" },
              { icon: ImageIcon, label: "Image" },
              { icon: BtnI, label: "Button" },
              { icon: Columns, label: "Columns" },
              { icon: Layout, label: "Header" },
              { icon: Minus, label: "Divider" },
            ].map((b) => (
              <button key={b.label} className="flex flex-col items-center gap-1 rounded-xl border border-line p-3 text-[11px] font-semibold text-ink-soft hover:border-violet/30 hover:text-violet">
                <b.icon className="h-4 w-4" />
                {b.label}
              </button>
            ))}
          </div>
          <div className="mt-4 text-[11px] font-bold uppercase tracking-wider text-ink-muted">Saved Sections</div>
          <div className="mt-2 space-y-2">
            {["Header + Logo", "Footer + Social", "CTA Band"].map((s) => (
              <button key={s} className="w-full rounded-lg border border-line bg-white p-2 text-left text-[11.5px] font-semibold text-ink-soft hover:border-violet/30">
                {s}
              </button>
            ))}
          </div>
        </aside>

        {/* Canvas */}
        <div className="rounded-2xl border border-line bg-bg-soft p-6 shadow-card">
          <div className="mx-auto max-w-[600px] rounded-2xl bg-white shadow-card">
            <div className="border-b border-line bg-bg-soft/60 p-3 text-[11px] text-ink-muted">
              <div>From: <span className="font-semibold text-ink">Amplivanta &lt;hello@amplivanta.com&gt;</span></div>
              <div>Subject: <span className="font-semibold text-ink">Growth playbooks for August 🚀</span></div>
              <div>Preheader: <span className="text-ink">3 case studies + AI Advisor tips inside.</span></div>
            </div>
            <div className="p-8">
              <div className="mb-4 h-12 w-40 rounded-md bg-gradient-to-br from-violet/40 to-orange-brand/40" />
              <h1 className="mb-2 text-2xl font-extrabold text-ink">Hi {"{{firstName}}"},</h1>
              <p className="mb-4 text-[14px] leading-relaxed text-ink-soft">
                August is off to a strong start. Here are three growth playbooks our top customers are running right now — you can copy any of them in one click.
              </p>
              <div className="mb-4 aspect-video rounded-xl bg-gradient-to-br from-violet/25 via-fuchsia-200/60 to-orange-brand/25" />
              <p className="mb-4 text-[14px] leading-relaxed text-ink-soft">
                <strong>1. Trial-to-Paid Nurture (42% conversion)</strong> — five emails, one workflow. Steal it.
              </p>
              <button className="rounded-xl bg-grad-cta px-5 py-2.5 text-[13px] font-bold text-white shadow-violet">Get the Playbook →</button>
            </div>
            <div className="border-t border-line p-4 text-center text-[10.5px] text-ink-muted">
              Amplivanta · Remote-first · Global · <a className="text-violet underline">Unsubscribe</a>
            </div>
          </div>
        </div>

        {/* Right: AI + score */}
        <aside className="space-y-4">
          <div className="rounded-2xl border border-violet/20 bg-gradient-to-br from-violet/[0.05] to-orange-brand/[0.05] p-4">
            <div className="mb-2 flex items-center gap-1.5 text-[12px] font-bold text-ink"><Sparkles className="h-3.5 w-3.5 text-violet" /> AI Assistant</div>
            <div className="space-y-2 text-[11px]">
              <button className="w-full rounded-lg border border-line bg-white p-2 text-left font-semibold text-ink-soft hover:border-violet/30">Rewrite subject</button>
              <button className="w-full rounded-lg border border-line bg-white p-2 text-left font-semibold text-ink-soft hover:border-violet/30">Generate 3 variants</button>
              <button className="w-full rounded-lg border border-line bg-white p-2 text-left font-semibold text-ink-soft hover:border-violet/30">Personalize by segment</button>
              <button className="w-full rounded-lg border border-line bg-white p-2 text-left font-semibold text-ink-soft hover:border-violet/30">Translate email</button>
            </div>
          </div>

          <div className="rounded-2xl border border-line bg-white p-4 shadow-card">
            <div className="mb-2 text-[12px] font-bold text-ink">Email Score</div>
            <div className="flex items-baseline gap-2">
              <div className="text-3xl font-extrabold text-emerald-600">82</div>
              <div className="text-[11px] text-ink-muted">/ 100 · Good</div>
            </div>
            <div className="mt-3 space-y-2 text-[11px]">
              {[
                { l: "Subject length", s: "24 chars — great" },
                { l: "Spam score", s: "0.8 — low risk" },
                { l: "Preview text", s: "Present" },
                { l: "Broken links", s: "None" },
                { l: "Alt text on images", s: "Missing on 1", warn: true },
              ].map((c, i) => (
                <div key={i} className={`flex items-center justify-between rounded-lg px-2 py-1 ${c.warn ? "bg-amber-50 text-amber-700" : "text-ink-soft"}`}>
                  <span>{c.l}</span>
                  <span className="font-semibold">{c.s}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-line bg-white p-4 shadow-card">
            <div className="mb-2 text-[12px] font-bold text-ink">A/B Test</div>
            <p className="text-[11px] text-ink-soft">Test subject line variants across 20% of your audience, send winner to remaining 80%.</p>
            <button className="mt-2 w-full rounded-xl border border-violet/30 bg-violet/5 py-2 text-[12px] font-bold text-violet">Enable A/B Test</button>
          </div>
        </aside>
      </div>
    </div>
  );
}
