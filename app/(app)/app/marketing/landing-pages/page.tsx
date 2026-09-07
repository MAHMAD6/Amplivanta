import type { Metadata } from "next";
import Link from "next/link";
import { Plus, Upload, LayoutGrid, List, MoreHorizontal } from "lucide-react";
import { PageHeader } from "@/components/amplivanta/page-header";
import { MarketingSubnav } from "@/components/amplivanta/marketing-subnav";
import { StatusPill } from "@/components/amplivanta/status-pill";
import { LANDING_PAGES, PAGE_STATUS_TONE } from "@/lib/marketing-auto-data";
import { CreateButton } from "@/components/amplivanta/crud/create-button";
import { LANDING_PAGE_FIELDS } from "@/components/amplivanta/crud/module-fields";

export const metadata: Metadata = { title: "Landing Pages" };

export default function LandingPagesPage() {
  return (
    <div className="mx-auto max-w-[1500px]">
      <PageHeader
        title="Landing Pages"
        subtitle="Create, host, publish and measure conversion-focused pages."
        actions={
          <>
            <button className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-line bg-white px-4 text-[13px] font-semibold text-ink"><Upload className="h-3.5 w-3.5" /> Import Template</button>
            <CreateButton label="Landing Page" fields={LANDING_PAGE_FIELDS} endpoint="/api/landing-pages" />
          </>
        }
      />
      <MarketingSubnav />

      <div className="mb-4 flex flex-wrap gap-2">
        {["All", "Published", "Ready", "Draft", "Scheduled", "Archived"].map((f, i) => (
          <button key={f} className={`rounded-full px-3 py-1.5 text-[12px] font-semibold ${i === 0 ? "bg-violet/10 text-violet" : "text-ink-soft hover:bg-bg-soft"}`}>{f}</button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {LANDING_PAGES.map((p) => (
          <div key={p.id} className="flex flex-col overflow-hidden rounded-2xl border border-line bg-white shadow-card">
            <div className="relative aspect-[16/10] bg-gradient-to-br from-violet/25 via-fuchsia-200/60 to-orange-brand/25">
              <StatusPill tone={PAGE_STATUS_TONE[p.status]} className="absolute left-3 top-3">{p.status}</StatusPill>
            </div>
            <div className="flex-1 p-4">
              <div className="mb-1 flex items-start justify-between">
                <div>
                  <div className="text-[14px] font-bold text-ink">{p.name}</div>
                  <div className="font-mono text-[11px] text-ink-muted">{p.slug}</div>
                </div>
                <button className="text-ink-muted"><MoreHorizontal className="h-4 w-4" /></button>
              </div>
              <div className="mt-3 grid grid-cols-3 gap-2 border-t border-line pt-3 text-center">
                <div>
                  <div className="text-[10px] text-ink-muted">Visitors</div>
                  <div className="text-[13px] font-bold text-ink">{p.visitors.toLocaleString()}</div>
                </div>
                <div>
                  <div className="text-[10px] text-ink-muted">Conv.</div>
                  <div className="text-[13px] font-bold text-ink">{p.conversions.toLocaleString()}</div>
                </div>
                <div>
                  <div className="text-[10px] text-ink-muted">Rate</div>
                  <div className="text-[13px] font-bold text-emerald-600">{p.conversionRate}%</div>
                </div>
              </div>
              <div className="mt-3 flex gap-2">
                <Link href="/app/marketing/page-builder" className="flex-1 rounded-xl border border-line py-1.5 text-center text-[12px] font-semibold text-ink">Edit</Link>
                <Link href="/app/marketing/publishing" className="flex-1 rounded-xl bg-grad-cta py-1.5 text-center text-[12px] font-bold text-white shadow-violet">Publish</Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
