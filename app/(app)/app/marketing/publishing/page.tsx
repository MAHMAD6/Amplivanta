import type { Metadata } from "next";
import { Eye, Send, History, CheckCircle2, AlertTriangle, ExternalLink } from "lucide-react";
import { PageHeader } from "@/components/amplivanta/page-header";
import { MarketingSubnav } from "@/components/amplivanta/marketing-subnav";
import { StatusPill } from "@/components/amplivanta/status-pill";
import { LANDING_PAGES, PAGE_STATUS_TONE } from "@/lib/marketing-auto-data";

export const metadata: Metadata = { title: "Landing Page Publishing" };

const CHECKS = [
  { label: "Domain configured", ok: true },
  { label: "SSL valid", ok: true },
  { label: "Meta title present", ok: true },
  { label: "Meta description present", ok: true },
  { label: "OpenGraph image", ok: false },
  { label: "Form connected", ok: true },
  { label: "Analytics tracker", ok: true },
  { label: "Mobile-friendly", ok: true },
];

export default function PublishingPage() {
  const page = LANDING_PAGES[0];
  return (
    <div className="mx-auto max-w-[1500px]">
      <PageHeader
        title="Landing Page Publishing"
        subtitle="Final pre-publish and post-publish control center."
        actions={
          <>
            <button className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-line bg-white px-4 text-[13px] font-semibold text-ink"><Eye className="h-3.5 w-3.5" /> Preview</button>
            <button className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-line bg-white px-4 text-[13px] font-semibold text-ink"><History className="h-3.5 w-3.5" /> History</button>
            <button className="inline-flex h-10 items-center gap-1.5 rounded-xl bg-grad-cta px-4 text-[13px] font-bold text-white shadow-violet"><Send className="h-3.5 w-3.5" /> Publish</button>
          </>
        }
      />
      <MarketingSubnav />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-line bg-white p-5 shadow-card lg:col-span-2">
          <div className="mb-3 flex items-start justify-between">
            <div>
              <div className="text-[15px] font-bold text-ink">{page.name}</div>
              <div className="font-mono text-[11px] text-ink-muted">https://go.amplivanta.com{page.slug}</div>
            </div>
            <StatusPill tone={PAGE_STATUS_TONE[page.status]}>{page.status}</StatusPill>
          </div>
          <div className="aspect-video overflow-hidden rounded-xl border border-line bg-gradient-to-br from-violet/25 via-fuchsia-200/60 to-orange-brand/25" />

          <div className="mt-4 grid grid-cols-4 gap-3 border-t border-line pt-3">
            <Stat label="Visitors" value={page.visitors.toLocaleString()} />
            <Stat label="Conversions" value={page.conversions.toLocaleString()} />
            <Stat label="Conv. Rate" value={`${page.conversionRate}%`} tone="text-emerald-600" />
            <Stat label="Version" value="v42" />
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl border border-line bg-white p-5 shadow-card">
            <div className="mb-3 text-[13px] font-bold text-ink">Launch Readiness</div>
            <div className="space-y-2">
              {CHECKS.map((c) => (
                <div key={c.label} className={`flex items-center gap-2 rounded-lg px-2 py-1.5 text-[12px] ${c.ok ? "text-ink-soft" : "bg-amber-50 text-amber-700"}`}>
                  {c.ok ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> : <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />}
                  {c.label}
                </div>
              ))}
            </div>
            <div className="mt-3 text-[11px] text-ink-muted">7 of 8 checks passing.</div>
          </div>

          <div className="rounded-2xl border border-line bg-white p-5 shadow-card">
            <div className="mb-2 text-[13px] font-bold text-ink">Schedule</div>
            <div className="space-y-2 text-[12px]">
              <label className="block"><span className="text-ink-muted">Publish on</span><input defaultValue="Aug 15, 2026" className="mt-1 w-full rounded-lg border border-line px-3 py-1.5" /></label>
              <label className="block"><span className="text-ink-muted">Time</span><input defaultValue="10:00 AM PST" className="mt-1 w-full rounded-lg border border-line px-3 py-1.5" /></label>
            </div>
          </div>

          <div className="rounded-2xl border border-line bg-white p-5 shadow-card">
            <div className="mb-2 text-[13px] font-bold text-ink">Recent Deploys</div>
            <div className="space-y-1.5 text-[11.5px]">
              {[
                { v: "v42", when: "Aug 12 · 09:32 AM", by: "Alex Johnson", ok: true },
                { v: "v41", when: "Aug 10 · 03:12 PM", by: "Sarah Chen", ok: true },
                { v: "v40", when: "Aug 8 · 11:48 AM", by: "Alex Johnson", ok: false },
              ].map((d) => (
                <div key={d.v} className="flex items-center justify-between rounded-lg border border-line p-2">
                  <div>
                    <span className="font-bold text-ink">{d.v}</span>
                    <span className="ml-2 text-ink-muted">{d.when} · {d.by}</span>
                  </div>
                  {d.ok ? <StatusPill tone="green">OK</StatusPill> : <StatusPill tone="red">Failed</StatusPill>}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, tone = "text-ink" }: { label: string; value: string; tone?: string }) {
  return (
    <div>
      <div className="text-[10.5px] text-ink-muted">{label}</div>
      <div className={"text-[16px] font-bold " + tone}>{value}</div>
    </div>
  );
}
