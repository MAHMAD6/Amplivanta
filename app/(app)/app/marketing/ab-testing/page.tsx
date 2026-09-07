import type { Metadata } from "next";
import { FlaskConical, Trophy, TrendingUp, ShieldCheck, Users2, UserPlus, Percent, DollarSign, Plus, Copy, Download, Pause, Square } from "lucide-react";
import { PageHeader } from "@/components/amplivanta/page-header";
import { MarketingSubnav } from "@/components/amplivanta/marketing-subnav";
import { KpiCard } from "@/components/amplivanta/kpi-card";
import { StatusPill } from "@/components/amplivanta/status-pill";

export const metadata: Metadata = { title: "A/B Testing" };

const VARIANT_A = { visitors: 24376, conversions: 1284, rate: 5.26, confidence: 88.0, bounce: 39.4, scroll: 62, revenue: 2.21 };
const VARIANT_B = { visitors: 24376, conversions: 1325, rate: 6.66, confidence: 94.5, bounce: 35.8, scroll: 68, revenue: 2.78 };
const SEGMENTS = [
  ["Desktop", 31482, 5.12, 6.41, 25.2], ["Mobile", 12156, 4.32, 5.84, 35.2], ["Paid Search", 8742, 4.21, 7.46, 32.3], ["Organic Search", 10285, 4.81, 6.02, 25.2], ["Email", 3087, 5.43, 6.77, 24.7],
] as const;
const RECS = [["Test a shorter headline in Variant B", "High"], ["Try orange CTA button color", "High"], ["Simplify the hero form", "Medium"], ["Shorten social proof section", "Low"]] as const;
const EXPERIMENTS = [
  ["Spring Lead Magnet Campaign", "Running", "94.5%", "Variant B", "May 14, 2024", "Review Results"],
  ["Webinar Registration Page", "Winner Selected", "97.2%", "Variant A", "May 2, 2024", "Publish"],
  ["Product Launch LP Test", "Running", "71.3%", "—", "May 7, 2024", "View Test"],
  ["Q2 Lead Gen Campaign", "Published", "—", "Variant B", "Apr 20, 2024", "View Report"],
] as const;

export default function ABTestingPage() {
  return (
    <div className="mx-auto max-w-[1500px]">
      <PageHeader
        title="A/B Testing"
        subtitle="Optimize landing page performance through data-driven experimentation."
        actions={
          <>
            <button className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-line bg-white px-4 text-[13px] font-semibold text-ink hover:border-ink/30"><Copy className="h-3.5 w-3.5" /> Duplicate Test</button>
            <button className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-line bg-white px-4 text-[13px] font-semibold text-ink hover:border-ink/30"><Download className="h-3.5 w-3.5" /> Export Report</button>
            <button className="inline-flex h-10 items-center gap-1.5 rounded-xl bg-grad-cta px-4 text-[13px] font-bold text-white shadow-violet"><Plus className="h-3.5 w-3.5" /> Create Test</button>
          </>
        }
      />
      <MarketingSubnav />

      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4 xl:grid-cols-8">
        <KpiCard icon={FlaskConical} tone="violet" label="Active Tests" value={null} />
        <KpiCard icon={Trophy} tone="amber" label="Winning Variants" value={null} deltaTone="neutral" />
        <KpiCard icon={TrendingUp} tone="green" label="Avg. Conversion Lift" value={null} />
        <KpiCard icon={ShieldCheck} tone="blue" label="Statistical Confidence" value={null} />
        <KpiCard icon={Users2} tone="indigo" label="Total Visitors" value={null} />
        <KpiCard icon={UserPlus} tone="teal" label="Signups" value={null} />
        <KpiCard icon={Percent} tone="orange" label="Bounce Rate" value={null} deltaTone="down" />
        <KpiCard icon={DollarSign} tone="pink" label="Revenue Impact" value={null} />
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.4fr_1fr_0.9fr]">
        {/* Current experiment */}
        <div className="rounded-2xl border border-line bg-white p-5 shadow-card">
          <div className="mb-1 flex items-center justify-between">
            <span className="text-[13px] font-bold text-ink">Current Experiment</span>
            <div className="flex gap-2">
              <button className="inline-flex items-center gap-1 rounded-lg border border-line px-2.5 py-1 text-[11.5px] font-semibold text-ink"><Pause className="h-3 w-3" /> Pause</button>
              <button className="inline-flex items-center gap-1 rounded-lg bg-red-500 px-2.5 py-1 text-[11.5px] font-semibold text-white"><Square className="h-3 w-3" /> Stop</button>
            </div>
          </div>
          <div className="flex items-center gap-2"><span className="text-[15px] font-bold text-ink">Spring Lead Magnet Campaign</span><StatusPill tone="green">Running</StatusPill></div>
          <div className="mt-0.5 text-[11.5px] text-ink-muted">Started May 14, 2024 · 12 days remaining</div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <VariantCard label="Variant A" tag="Control" tone="violet" v={VARIANT_A} />
            <VariantCard label="Variant B" tag="Challenger" tone="green" v={VARIANT_B} winning />
          </div>

          <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50/60 p-3">
            <div className="flex items-center gap-2 text-[13px] font-bold text-emerald-700"><Trophy className="h-4 w-4" /> Variant B is winning</div>
            <div className="mt-1.5 flex flex-wrap gap-3 text-[11.5px] text-emerald-700">
              <span>✓ Minimum sample size reached</span><span>✓ Statistical significance: 94.5% confidence</span>
            </div>
            <button className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-grad-cta px-3 py-1.5 text-[12px] font-bold text-white shadow-violet"><Trophy className="h-3.5 w-3.5" /> Apply Winning Variant</button>
          </div>
        </div>

        {/* Conversion chart */}
        <div className="rounded-2xl border border-line bg-white p-5 shadow-card">
          <div className="mb-2 flex items-center justify-between"><span className="text-[13px] font-bold text-ink">Conversion Rate Over Time</span></div>
          <div className="mb-2 flex gap-3 text-[10px]"><span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-violet" /> Variant A</span><span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Variant B</span></div>
          <LineChart a={[4.2, 4.5, 4.8, 5.0, 5.1, 5.2, 5.26]} b={[4.6, 5.1, 5.6, 6.0, 6.3, 6.5, 6.66]} />
          <div className="mt-3 flex justify-between border-t border-line pt-3 text-[12px]">
            <div><div className="text-ink-muted">Conversion lift</div><div className="font-bold text-emerald-600">+19.4%</div></div>
            <div><div className="text-ink-muted">Confidence</div><div className="font-bold text-ink">94.5%</div></div>
          </div>
        </div>

        {/* Traffic allocation */}
        <div className="rounded-2xl border border-line bg-white p-5 shadow-card">
          <div className="mb-3 text-[13px] font-bold text-ink">Traffic Allocation</div>
          <div className="flex items-center gap-4">
            <div className="relative h-28 w-28 rounded-full" style={{ background: "conic-gradient(#6A35F0 0% 50%, #16A56A 50% 100%)" }}>
              <div className="absolute inset-[24%] flex flex-col items-center justify-center rounded-full bg-white"><span className="text-[13px] font-extrabold text-ink">48,752</span><span className="text-[9px] text-ink-muted">Total</span></div>
            </div>
            <ul className="space-y-2 text-[12px]">
              <li className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-violet" /> Variant A<br /><span className="ml-3.5 text-ink-muted">50% (24,376)</span></li>
              <li className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-emerald-500" /> Variant B<br /><span className="ml-3.5 text-ink-muted">50% (24,376)</span></li>
            </ul>
          </div>
          <button className="mt-4 h-9 w-full rounded-xl border border-line text-[12.5px] font-semibold text-ink hover:border-violet/40">Adjust Split</button>
        </div>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_1.2fr_1fr]">
        <div className="rounded-2xl border border-line bg-white p-5 shadow-card">
          <div className="mb-3 text-[13px] font-bold text-ink">Goals &amp; Hypothesis</div>
          <dl className="space-y-3 text-[12.5px]">
            <div><dt className="text-ink-muted">Primary Goal</dt><dd className="font-semibold text-ink">Increase lead signups</dd></div>
            <div><dt className="text-ink-muted">Success Metric</dt><dd className="font-semibold text-ink">Conversion Rate</dd></div>
            <div><dt className="text-ink-muted">Hypothesis</dt><dd className="text-ink-soft">Simplifying the headline and CTA placement in Variant B will increase conversion rate by reducing cognitive load.</dd></div>
          </dl>
        </div>
        <div className="rounded-2xl border border-line bg-white shadow-card">
          <div className="border-b border-line px-4 py-3 text-[13px] font-bold text-ink">Audience Segment Performance</div>
          <table className="w-full text-[12px]">
            <thead><tr className="border-b border-line text-left text-[10.5px] uppercase tracking-wide text-ink-muted"><th className="px-4 py-2 font-semibold">Segment</th><th className="px-2 py-2 font-semibold">Visitors</th><th className="px-2 py-2 font-semibold">Conv. A</th><th className="px-2 py-2 font-semibold">Conv. B</th><th className="px-2 py-2 font-semibold">Lift</th></tr></thead>
            <tbody>
              {SEGMENTS.map(([s, v, a, b, lift]) => (
                <tr key={s} className="border-b border-line/60"><td className="px-4 py-2 font-medium text-ink">{s}</td><td className="px-2 py-2 text-ink-soft">{v.toLocaleString()}</td><td className="px-2 py-2 text-ink-soft">{a}%</td><td className="px-2 py-2 text-ink-soft">{b}%</td><td className="px-2 py-2 font-semibold text-emerald-600">+{lift}%</td></tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="rounded-2xl border border-line bg-white p-5 shadow-card">
          <div className="mb-3 flex items-center justify-between text-[13px] font-bold text-ink"><span>AI Recommendations</span><StatusPill tone="violet">New</StatusPill></div>
          <div className="space-y-2.5">
            {RECS.map(([t, tag]) => (
              <div key={t} className="flex items-center justify-between text-[12.5px]"><span className="text-ink-soft">{t}</span><StatusPill tone={tag === "High" ? "orange" : tag === "Medium" ? "amber" : "blue"}>{tag}</StatusPill></div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent experiments */}
      <div className="mt-4 rounded-2xl border border-line bg-white shadow-card">
        <div className="border-b border-line px-4 py-3 text-[13px] font-bold text-ink">Recent Experiments</div>
        <table className="w-full text-[12.5px]">
          <thead><tr className="border-b border-line text-left text-[10.5px] uppercase tracking-wide text-ink-muted"><th className="px-4 py-2 font-semibold">Test Name</th><th className="px-3 py-2 font-semibold">Status</th><th className="px-3 py-2 font-semibold">Confidence</th><th className="px-3 py-2 font-semibold">Winner</th><th className="px-3 py-2 font-semibold">Start Date</th><th className="px-3 py-2 font-semibold">Next Action</th></tr></thead>
          <tbody>
            {EXPERIMENTS.map(([name, status, conf, winner, date, action]) => (
              <tr key={name} className="border-b border-line/60 hover:bg-bg-soft/50">
                <td className="px-4 py-2.5 font-medium text-ink">{name}</td>
                <td className="px-3 py-2.5"><StatusPill tone={status === "Running" ? "green" : status === "Winner Selected" ? "violet" : "blue"}>{status}</StatusPill></td>
                <td className="px-3 py-2.5 text-ink-soft">{conf}</td>
                <td className="px-3 py-2.5 text-ink-soft">{winner}</td>
                <td className="px-3 py-2.5 text-ink-muted">{date}</td>
                <td className="px-3 py-2.5"><button className="rounded-lg border border-line px-2.5 py-1 text-[11.5px] font-semibold text-violet hover:border-violet/40">{action}</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function VariantCard({ label, tag, tone, v, winning }: { label: string; tag: string; tone: "violet" | "green"; v: typeof VARIANT_A; winning?: boolean }) {
  return (
    <div className={`rounded-xl border p-3 ${winning ? "border-emerald-300 bg-emerald-50/40" : "border-line bg-white"}`}>
      <div className="mb-2 flex items-center gap-2"><span className={`flex h-5 w-5 items-center justify-center rounded text-[10px] font-bold text-white ${tone === "violet" ? "bg-violet" : "bg-emerald-500"}`}>{label.slice(-1)}</span><span className="text-[13px] font-bold text-ink">{label}</span><StatusPill tone={tone === "violet" ? "gray" : "green"}>{winning ? "Winning" : tag}</StatusPill></div>
      <dl className="space-y-1 text-[11.5px]">
        {([["Visitors", v.visitors.toLocaleString()], ["Conversions", v.conversions.toLocaleString()], ["Conversion Rate", `${v.rate}%`], ["Confidence", `${v.confidence}%`], ["Bounce Rate", `${v.bounce}%`], ["Avg. Scroll Depth", `${v.scroll}%`], ["Revenue / Visitor", `$${v.revenue}`]] as const).map(([k, val]) => (
          <div key={k} className="flex justify-between"><dt className="text-ink-muted">{k}</dt><dd className="font-semibold text-ink">{val}</dd></div>
        ))}
      </dl>
    </div>
  );
}

function LineChart({ a, b }: { a: number[]; b: number[] }) {
  const max = Math.max(...a, ...b) * 1.15, w = 300, h = 130, pad = 4;
  const x = (i: number) => pad + (i * (w - pad * 2)) / (a.length - 1);
  const y = (v: number) => h - pad - (v / max) * (h - pad * 2);
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full">
      <polyline fill="none" stroke="#6A35F0" strokeWidth="2" points={a.map((v, i) => `${x(i)},${y(v)}`).join(" ")} />
      <polyline fill="none" stroke="#16A56A" strokeWidth="2" points={b.map((v, i) => `${x(i)},${y(v)}`).join(" ")} />
    </svg>
  );
}
