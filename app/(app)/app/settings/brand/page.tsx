import type { Metadata } from "next";
import { Check, Plus, Type, Upload } from "lucide-react";

export const metadata: Metadata = { title: "Brand Settings" };

const COLORS = [
  { name: "Primary", value: "#6D3BF5" },
  { name: "Secondary", value: "#1D5FD6" },
  { name: "Accent", value: "#F5731A" },
  { name: "Success", value: "#0F9D77" },
  { name: "Ink", value: "#14121F" },
];

const FONTS = [
  { role: "Headings", family: "Sora", weight: "700 · Extrabold" },
  { role: "Body", family: "Inter", weight: "400 / 600" },
];

const KITS = [
  { name: "Amplivanta (Default)", primary: "#6D3BF5", isDefault: true },
  { name: "Amplivanta Dark", primary: "#0B2350", isDefault: false },
  { name: "Client · BrightWave", primary: "#0F9D77", isDefault: false },
];

export default function BrandSettingsPage() {
  return (
    <div className="space-y-5">
      <Section title="Brand Kits" desc="Manage multiple brand kits. One is the workspace default applied to new creatives.">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {KITS.map((k) => (
            <div key={k.name} className="rounded-2xl border border-line p-4">
              <div className="flex items-center justify-between">
                <span className="h-9 w-9 rounded-lg" style={{ backgroundColor: k.primary }} />
                {k.isDefault && (
                  <span className="inline-flex items-center gap-1 rounded-md bg-emerald-500/10 px-2 py-0.5 text-[10.5px] font-semibold text-emerald-700">
                    <Check className="h-3 w-3" /> Default
                  </span>
                )}
              </div>
              <div className="mt-3 text-[13px] font-bold text-ink">{k.name}</div>
              <button className="mt-2 text-[12px] font-semibold text-violet">Edit kit</button>
            </div>
          ))}
          <button className="flex min-h-[112px] items-center justify-center gap-2 rounded-2xl border border-dashed border-line text-[12.5px] font-semibold text-ink-soft hover:border-violet/30 hover:text-violet">
            <Plus className="h-4 w-4" /> New Brand Kit
          </button>
        </div>
      </Section>

      <Section title="Logos" desc="Uploaded once and exposed to every editor — image, graphic, video, email, landing page.">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {["Primary Logo", "Icon Mark", "Dark Background"].map((l) => (
            <div key={l} className="rounded-2xl border border-line p-4 text-center">
              <div className="flex h-24 items-center justify-center rounded-xl bg-bg-soft text-ink-muted">
                <Upload className="h-6 w-6" />
              </div>
              <div className="mt-3 text-[12.5px] font-semibold text-ink">{l}</div>
              <button className="mt-1.5 text-[11.5px] font-semibold text-violet">Upload</button>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Colors" desc="Brand tokens available as presets across every generation and editor.">
        <div className="flex flex-wrap gap-4">
          {COLORS.map((c) => (
            <div key={c.name} className="text-center">
              <span className="block h-14 w-14 rounded-2xl ring-1 ring-line" style={{ backgroundColor: c.value }} />
              <div className="mt-2 text-[11.5px] font-semibold text-ink">{c.name}</div>
              <div className="text-[10.5px] font-mono text-ink-muted">{c.value}</div>
            </div>
          ))}
          <button className="flex h-14 w-14 items-center justify-center rounded-2xl border border-dashed border-line text-ink-soft hover:border-violet/30 hover:text-violet">
            <Plus className="h-5 w-5" />
          </button>
        </div>
      </Section>

      <Section title="Typography" desc="Fonts applied to on-brand generation and templates.">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {FONTS.map((f) => (
            <div key={f.role} className="flex items-center gap-3 rounded-2xl border border-line p-4">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet/10 text-violet">
                <Type className="h-5 w-5" />
              </span>
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-wide text-ink-muted">{f.role}</div>
                <div className="text-[15px] font-bold text-ink">{f.family}</div>
                <div className="text-[11px] text-ink-muted">{f.weight}</div>
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Brand Guidelines" desc="Voice, tone, and usage rules the AI follows when it writes on your behalf.">
        <textarea
          rows={4}
          defaultValue="Confident, plain-spoken, growth-focused. Avoid jargon and hype. Lead with the customer outcome. Use sentence case for headings."
          className="w-full rounded-xl border border-line bg-white px-3 py-2.5 text-[13px] leading-relaxed focus:border-violet focus:outline-none"
        />
      </Section>

      <div className="flex justify-end gap-2">
        <button className="rounded-xl border border-line bg-white px-4 py-2 text-[13px] font-semibold text-ink">Cancel</button>
        <button className="rounded-xl bg-grad-cta px-4 py-2 text-[13px] font-bold text-white shadow-violet">Save Changes</button>
      </div>
    </div>
  );
}

function Section({ title, desc, children }: { title: string; desc: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-line bg-white p-5 shadow-card">
      <div className="mb-4">
        <div className="text-[14px] font-bold text-ink">{title}</div>
        <div className="text-[11.5px] text-ink-muted">{desc}</div>
      </div>
      {children}
    </div>
  );
}
