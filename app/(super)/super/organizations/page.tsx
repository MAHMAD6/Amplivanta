import type { Metadata } from "next";
import { Building2, CheckCircle2, Users2, DollarSign, HeartPulse, AlertTriangle, Plus, Download, ScrollText, Eye, UserPlus, MoreHorizontal } from "lucide-react";
import { PageHeader } from "@/components/amplivanta/page-header";
import { KpiCard } from "@/components/amplivanta/kpi-card";
import { StatusPill, CompanyIcon } from "@/components/amplivanta/status-pill";
import { LiveBadge } from "@/components/amplivanta/live-badge";
import { CreateButton } from "@/components/amplivanta/crud/create-button";
import { ORGANIZATION_FIELDS } from "@/components/amplivanta/crud/module-fields";
import { loadOrganizations } from "@/lib/server/loaders";

export const metadata: Metadata = { title: "Organizations — Amplivanta Super Admin" };
export const dynamic = "force-dynamic";

const STATUS_TONE: Record<string, "green" | "amber" | "red"> = { Active: "green", Warning: "amber", Suspended: "red" };
const MODULES = [["Email Marketing", 92], ["Automation", 78], ["Landing Pages", 65], ["SMS", 48], ["Web Analytics", 52]] as const;

export default async function OrganizationsPage() {
  const { items: orgs, live } = await loadOrganizations();
  const total = orgs.length;
  const active = orgs.filter((o) => o.status === "Active").length;
  const users = orgs.reduce((s, o) => s + o.users, 0);
  const mrr = orgs.reduce((s, o) => s + o.mrr, 0);
  const avgHealth = Math.round(orgs.reduce((s, o) => s + o.health, 0) / Math.max(total, 1));
  const atRisk = orgs.filter((o) => o.status !== "Active").length;
  const sel = orgs[0];

  return (
    <div className="mx-auto max-w-[1500px]">
      <PageHeader
        title="Organizations"
        subtitle="Manage all organizations, subscriptions, users and security from one place."
        actions={
          <>
            <button className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-line bg-white px-4 text-[13px] font-semibold text-ink hover:border-ink/30"><Download className="h-3.5 w-3.5" /> Export</button>
            <button className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-line bg-white px-4 text-[13px] font-semibold text-ink hover:border-ink/30"><ScrollText className="h-3.5 w-3.5" /> Audit Log</button>
            <CreateButton label="Organization" buttonText="Add Organization" fields={ORGANIZATION_FIELDS} endpoint="/api/organizations" />
          </>
        }
      />
      {live && <LiveBadge label={`Live · ${total} organizations from database`} />}

      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-6">
        <KpiCard icon={Building2} tone="violet" label="Total Organizations" value={total.toLocaleString()} delta="12 this month" />
        <KpiCard icon={CheckCircle2} tone="green" label="Active Organizations" value={active.toLocaleString()} delta={`${Math.round((active / Math.max(total, 1)) * 100)}% of total`} deltaTone="neutral" />
        <KpiCard icon={Users2} tone="blue" label="Total Users" value={users.toLocaleString()} delta="18.3% this month" />
        <KpiCard icon={DollarSign} tone="indigo" label="MRR (All Orgs)" value={`$${mrr.toLocaleString()}`} delta="14.7% this month" />
        <KpiCard icon={HeartPulse} tone="teal" label="Health Score (Avg)" value={`${avgHealth}/100`} delta="Good" deltaTone="neutral" />
        <KpiCard icon={AlertTriangle} tone="orange" label="At Risk Organizations" value={String(atRisk)} delta="Require attention" deltaTone="neutral" />
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_360px]">
        <div className="overflow-hidden rounded-2xl border border-line bg-white shadow-card">
          <div className="flex items-center gap-2 border-b border-line px-4 py-3">
            <input placeholder="Search organizations…" className="h-9 flex-1 rounded-xl border border-line bg-bg-soft px-3 text-[13px] focus:outline-none" />
            <select className="h-9 rounded-xl border border-line bg-white px-3 text-[12.5px]"><option>Status: All</option></select>
            <select className="h-9 rounded-xl border border-line bg-white px-3 text-[12.5px]"><option>Plan: All</option></select>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-[13px]">
              <thead><tr className="border-b border-line text-left text-[11px] uppercase tracking-wide text-ink-muted">
                <th className="px-4 py-2.5 font-semibold">Organization</th><th className="px-3 py-2.5 font-semibold">Plan</th><th className="px-3 py-2.5 font-semibold">Users</th><th className="px-3 py-2.5 font-semibold">Health</th><th className="px-3 py-2.5 font-semibold">MRR</th><th className="px-3 py-2.5 font-semibold">Status</th><th className="px-3 py-2.5 font-semibold">Actions</th>
              </tr></thead>
              <tbody>
                {orgs.map((o, i) => (
                  <tr key={o.id} className={`border-b border-line/60 hover:bg-bg-soft/50 ${i === 0 ? "bg-violet/5" : ""}`}>
                    <td className="px-4 py-2.5"><div className="flex items-center gap-2.5"><CompanyIcon name={o.name} /><div><div className="font-semibold text-ink">{o.name}</div><div className="text-[11px] text-ink-muted">{o.domain}</div></div></div></td>
                    <td className="px-3 py-2.5"><StatusPill tone={o.plan === "Enterprise" ? "indigo" : o.plan === "Pro" ? "violet" : "blue"}>{o.plan}</StatusPill></td>
                    <td className="px-3 py-2.5 text-ink-soft">{o.users.toLocaleString()}</td>
                    <td className="px-3 py-2.5">
                      <div className="flex items-center gap-2"><span className="text-[12px] font-semibold text-ink">{o.health}</span><div className="h-1.5 w-14 overflow-hidden rounded-full bg-bg-soft"><div className={`h-full rounded-full ${o.health >= 80 ? "bg-emerald-500" : o.health >= 60 ? "bg-amber-500" : "bg-red-500"}`} style={{ width: `${o.health}%` }} /></div></div>
                    </td>
                    <td className="px-3 py-2.5 font-semibold text-ink">${o.mrr.toLocaleString()}</td>
                    <td className="px-3 py-2.5"><StatusPill tone={STATUS_TONE[o.status]}>{o.status}</StatusPill></td>
                    <td className="px-3 py-2.5"><div className="flex gap-1.5 text-ink-muted"><Eye className="h-4 w-4" /><UserPlus className="h-4 w-4" /><MoreHorizontal className="h-4 w-4" /></div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-between px-4 py-3 text-[12px] text-ink-muted"><span>Showing 1 to {total} of {total} results</span><div className="flex gap-1"><button className="h-7 w-7 rounded-lg bg-violet text-[12px] font-bold text-white">1</button><button className="h-7 w-7 rounded-lg border border-line text-[12px]">2</button></div></div>
        </div>

        {sel && (
          <div className="rounded-2xl border border-line bg-white p-5 shadow-card">
            <div className="mb-3 flex items-center justify-between"><span className="text-[13px] font-bold text-ink">Organization Details</span><StatusPill tone="green">Active</StatusPill></div>
            <div className="flex items-center gap-3"><CompanyIcon name={sel.name} size={44} className="rounded-xl" /><div><div className="text-[15px] font-bold text-ink">{sel.name}</div><div className="text-[12px] text-ink-muted">{sel.domain}</div><StatusPill tone="violet" className="mt-1">{sel.plan} Plan</StatusPill></div></div>
            <dl className="mt-4 grid grid-cols-2 gap-3 text-[12.5px]">
              <Field label="Health Score" value={`${sel.health}/100`} />
              <Field label="Users" value={sel.users.toLocaleString()} />
              <Field label="MRR" value={`$${sel.mrr.toLocaleString()}`} />
              <Field label="Data Region" value="US East" />
              <Field label="SSO Status" value="Enabled" />
              <Field label="Status" value={sel.status} />
            </dl>
            <div className="mt-4 border-t border-line pt-4">
              <div className="mb-2 text-[12px] font-bold text-ink">Top Modules</div>
              <div className="grid grid-cols-2 gap-2">
                {["Email Marketing", "Automation", "Landing Pages", "SMS"].map((m) => (
                  <div key={m} className="rounded-lg border border-line px-2.5 py-1.5 text-[11.5px]"><div className="font-medium text-ink">{m}</div><span className="text-[10px] text-emerald-600">Active</span></div>
                ))}
              </div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2 border-t border-line pt-4 text-[11.5px] font-semibold">
              <button className="rounded-lg border border-line py-2 text-ink hover:border-violet/40">Impersonate Admin</button>
              <button className="rounded-lg border border-line py-2 text-ink hover:border-violet/40">Manage Plan</button>
              <button className="rounded-lg border border-line py-2 text-orange-brand hover:border-orange-brand/40">Suspend Organization</button>
              <button className="rounded-lg border border-line py-2 text-red-600 hover:border-red-400">Delete Organization</button>
            </div>
          </div>
        )}
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-line bg-white p-5 shadow-card">
          <div className="mb-3 text-[13px] font-bold text-ink">Risk Overview</div>
          <div className="space-y-2 text-[12.5px]">
            <RiskRow label="Suspended" count={orgs.filter((o) => o.status === "Suspended").length} tone="red" />
            <RiskRow label="Overdue Payment" count={3} tone="orange" />
            <RiskRow label="Security Issues" count={2} tone="amber" />
            <RiskRow label="Low Activity" count={1} tone="blue" />
          </div>
        </div>
        <div className="rounded-2xl border border-line bg-white p-5 shadow-card">
          <div className="mb-3 text-[13px] font-bold text-ink">Recent Admin Actions</div>
          <ul className="space-y-2.5 text-[12px] text-ink-soft">
            <li className="flex items-center justify-between">Impersonated admin@petconnect.global <StatusPill tone="violet">Impersonation</StatusPill></li>
            <li className="flex items-center justify-between">Suspended &ldquo;Pet Lovers United&rdquo; <StatusPill tone="red">Suspended</StatusPill></li>
            <li className="flex items-center justify-between">Plan changed to Enterprise <StatusPill tone="blue">Plan Change</StatusPill></li>
            <li className="flex items-center justify-between">SSO enabled for &ldquo;VetCare Plus&rdquo; <StatusPill tone="green">Security</StatusPill></li>
          </ul>
        </div>
        <div className="rounded-2xl border border-line bg-white p-5 shadow-card">
          <div className="mb-3 text-[13px] font-bold text-ink">Module Adoption</div>
          <div className="space-y-2.5">
            {MODULES.map(([m, pct]) => (
              <div key={m}><div className="mb-1 flex justify-between text-[12px]"><span className="text-ink-soft">{m}</span><span className="font-semibold text-ink">{pct}%</span></div><div className="h-1.5 overflow-hidden rounded-full bg-bg-soft"><div className="h-full rounded-full bg-grad-brand" style={{ width: `${pct}%` }} /></div></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return <div><dt className="text-ink-muted">{label}</dt><dd className="mt-0.5 font-semibold text-ink">{value}</dd></div>;
}
function RiskRow({ label, count, tone }: { label: string; count: number; tone: string }) {
  const cls: Record<string, string> = { red: "text-red-600", orange: "text-orange-brand", amber: "text-amber-600", blue: "text-blue-600" };
  return <div className="flex items-center justify-between"><span className="text-ink-soft">{label}</span><span className={`font-bold ${cls[tone]}`}>{count}</span></div>;
}
