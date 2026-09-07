import type { Metadata } from "next";
import { Plus, MoreHorizontal, Users, Star, Palette, Type, Image as ImageIcon, FileText } from "lucide-react";
import { PageHeader } from "@/components/amplivanta/page-header";
import { CreativeSubnav } from "@/components/amplivanta/creative-subnav";
import { StatusPill } from "@/components/amplivanta/status-pill";
import { BRAND_KITS } from "@/lib/creative-data";

export const metadata: Metadata = { title: "Brand Kit — Creative Studio" };

export default function BrandKitPage() {
  const defaultKit = BRAND_KITS.find((b) => b.isDefault)!;
  return (
    <div className="mx-auto max-w-[1500px]">
      <PageHeader
        title="Brand Kit"
        subtitle="Central brand identity. Logos, colors, typography, assets, guidelines."
        actions={
          <button className="inline-flex h-10 items-center gap-1.5 rounded-xl bg-grad-cta px-4 text-[13px] font-bold text-white shadow-violet">
            <Plus className="h-3.5 w-3.5" /> New Kit
          </button>
        }
      />
      <CreativeSubnav />

      {/* Kits selector */}
      <div className="mb-6 flex flex-wrap gap-2">
        {BRAND_KITS.map((k) => (
          <button key={k.id} className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-[12.5px] font-semibold ${k.isDefault ? "border-violet/40 bg-violet/5 text-ink" : "border-line bg-white text-ink-soft"}`}>
            <div className="flex gap-0.5">
              {k.colors.slice(0, 3).map((c) => <span key={c} className="h-4 w-4 rounded-sm" style={{ background: c }} />)}
            </div>
            {k.name}
            {k.isDefault && <StatusPill tone="green">Default</StatusPill>}
          </button>
        ))}
      </div>

      {/* Default kit detail */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_320px]">
        <div className="space-y-4">
          {/* Colors */}
          <div className="rounded-2xl border border-line bg-white p-5 shadow-card">
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2 text-[13px] font-bold text-ink"><Palette className="h-4 w-4 text-violet" /> Colors</div>
              <button className="text-[11px] font-semibold text-violet">+ Add</button>
            </div>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-3 lg:grid-cols-6">
              {defaultKit.colors.map((c) => (
                <div key={c} className="overflow-hidden rounded-xl border border-line bg-white">
                  <div className="h-20" style={{ background: c }} />
                  <div className="p-2">
                    <div className="font-mono text-[11px] font-bold text-ink">{c.toUpperCase()}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Typography */}
          <div className="rounded-2xl border border-line bg-white p-5 shadow-card">
            <div className="mb-3 flex items-center gap-2 text-[13px] font-bold text-ink"><Type className="h-4 w-4 text-violet" /> Typography</div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="rounded-xl border border-line p-4">
                <div className="text-[11px] font-bold uppercase tracking-wider text-ink-muted">Display</div>
                <div className="mt-1 font-display text-3xl font-extrabold text-ink">{defaultKit.fonts.display}</div>
                <div className="mt-1 text-[11px] text-ink-muted">Aa Bb Cc · Manrope 800</div>
              </div>
              <div className="rounded-xl border border-line p-4">
                <div className="text-[11px] font-bold uppercase tracking-wider text-ink-muted">Body</div>
                <div className="mt-1 text-2xl font-semibold text-ink">{defaultKit.fonts.body}</div>
                <div className="mt-1 text-[11px] text-ink-muted">Aa Bb Cc · Inter 400/500/600</div>
              </div>
            </div>
          </div>

          {/* Logos */}
          <div className="rounded-2xl border border-line bg-white p-5 shadow-card">
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2 text-[13px] font-bold text-ink"><ImageIcon className="h-4 w-4 text-violet" /> Logos</div>
              <button className="text-[11px] font-semibold text-violet">+ Upload</button>
            </div>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
              {["Primary", "Monochrome", "Icon", "Reverse (Dark)"].map((v, i) => (
                <div key={v} className="overflow-hidden rounded-xl border border-line bg-white">
                  <div className={`flex aspect-square items-center justify-center ${i === 3 ? "bg-[#0d0b18]" : "bg-white"}`}>
                    <div className="h-10 w-24 rounded bg-gradient-to-br from-violet to-orange-brand" />
                  </div>
                  <div className="border-t border-line p-2 text-[11px] font-semibold text-ink">{v}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Guidelines */}
          <div className="rounded-2xl border border-line bg-white p-5 shadow-card">
            <div className="mb-3 flex items-center gap-2 text-[13px] font-bold text-ink"><FileText className="h-4 w-4 text-violet" /> Guidelines</div>
            <p className="text-[13px] leading-relaxed text-ink-soft">{defaultKit.guidelines}</p>
          </div>
        </div>

        {/* Sidebar */}
        <aside className="space-y-4">
          <div className="rounded-2xl border border-line bg-white p-5 shadow-card">
            <div className="mb-3 flex items-center gap-2 text-[13px] font-bold text-ink"><Users className="h-4 w-4 text-violet" /> Access</div>
            <div className="space-y-2 text-[12px]">
              <div className="flex items-center justify-between"><span className="text-ink-soft">Owners</span><span className="font-bold text-ink">2</span></div>
              <div className="flex items-center justify-between"><span className="text-ink-soft">Editors</span><span className="font-bold text-ink">6</span></div>
              <div className="flex items-center justify-between"><span className="text-ink-soft">Viewers</span><span className="font-bold text-ink">12</span></div>
            </div>
            <button className="mt-3 w-full rounded-xl border border-line py-2 text-[12px] font-semibold text-ink">Manage Access</button>
          </div>

          <div className="rounded-2xl border border-line bg-white p-5 shadow-card">
            <div className="mb-2 text-[12.5px] font-bold text-ink">Where it&apos;s used</div>
            <ul className="space-y-1.5 text-[11.5px] text-ink-soft">
              <li>· 128 projects</li>
              <li>· 34 email templates</li>
              <li>· 12 landing pages</li>
              <li>· 8 social templates</li>
            </ul>
          </div>

          <div className="rounded-2xl border border-line bg-white p-5 shadow-card">
            <div className="mb-2 text-[12.5px] font-bold text-ink">Kit Settings</div>
            <div className="space-y-2 text-[12px]">
              <label className="flex items-center justify-between"><span>Auto-apply to new projects</span><input type="checkbox" defaultChecked className="h-4 w-4 rounded border-line accent-violet" /></label>
              <label className="flex items-center justify-between"><span>Lock colors in editor</span><input type="checkbox" className="h-4 w-4 rounded border-line accent-violet" /></label>
              <label className="flex items-center justify-between"><span>Require brand approval</span><input type="checkbox" defaultChecked className="h-4 w-4 rounded border-line accent-violet" /></label>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
