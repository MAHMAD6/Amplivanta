import type { Metadata } from "next";
import Link from "next/link";
import { Users, UserPlus, DollarSign, CheckCircle2, TrendingUp, Plus, Filter, MoreHorizontal } from "lucide-react";
import { KpiCard } from "@/components/amplivanta/kpi-card";
import { PageHeader } from "@/components/amplivanta/page-header";
import { StatusPill, Avatar, CompanyIcon } from "@/components/amplivanta/status-pill";
import { CrmSubnav } from "@/components/amplivanta/crm-subnav";
import { PIPELINE_STAGES, STAGE_TONE } from "@/lib/crm-data";
import { loadDeals, loadContacts, loadActivities } from "@/lib/server/loaders";

export const metadata: Metadata = { title: "CRM Dashboard" };

export default async function CrmDashboardPage() {
  const [{ items: DEALS }, { items: CONTACTS }, { items: ACTIVITIES }] = await Promise.all([
    loadDeals(), loadContacts(), loadActivities()
  ]);

  const topDeals = [...DEALS].sort((a, b) => b.value - a.value).slice(0, 5);
  const recentContacts = CONTACTS.slice(0, 5);
  return (
    <div className="mx-auto max-w-[1400px]">
      <PageHeader
        title="CRM Dashboard"
        subtitle="Pipeline, leads, deals, tasks, and activity — reconciled from every source."
        actions={
          <>
            <button className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-line bg-white px-4 text-[13px] font-semibold text-ink hover:border-ink/30">
              <Filter className="h-3.5 w-3.5" /> All Pipelines
            </button>
            <Link href="/app/crm/contacts?new=1" className="inline-flex h-10 items-center gap-1.5 rounded-xl bg-grad-cta px-4 text-[13px] font-bold text-white shadow-violet">
              <Plus className="h-3.5 w-3.5" /> Add Contact
            </Link>
          </>
        }
      />
      <CrmSubnav />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <KpiCard icon={Users} label="Total Contacts" value={null} tone="violet" />
        <KpiCard icon={UserPlus} label="New Contacts" value={null} tone="blue" />
        <KpiCard icon={DollarSign} label="Active Deals" value={null} tone="orange" />
        <KpiCard icon={CheckCircle2} label="Won Deals" value={null} tone="green" />
        <KpiCard icon={TrendingUp} label="Total Revenue" value={null} tone="pink" />
      </div>

      <div className="mt-6 rounded-2xl border border-line bg-white p-5 shadow-card">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <div className="text-[14px] font-bold text-ink">Pipeline Overview</div>
            <div className="text-[11px] text-ink-muted">Amplivanta Sales · All owners</div>
          </div>
          <Link href="/app/crm/deals" className="text-[12px] font-semibold text-violet">View pipeline →</Link>
        </div>
        <div className="grid gap-3 lg:grid-cols-5">
          {PIPELINE_STAGES.map((s) => (
            <div key={s.key} className="rounded-xl border border-line bg-bg-soft/60 p-4">
              <div className="flex items-center justify-between">
                <StatusPill tone={STAGE_TONE[s.key]}>{s.label}</StatusPill>
                <span className="text-[10px] text-ink-muted">↓</span>
              </div>
              <div className="mt-3 text-[22px] font-extrabold text-ink">{s.deals}</div>
              <div className="text-[11px] font-semibold text-emerald-600">${s.value.toLocaleString()}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-line bg-white p-5 shadow-card lg:col-span-2">
          <div className="mb-3 flex items-center justify-between">
            <div className="text-[14px] font-bold text-ink">Top Deals</div>
            <Link href="/app/crm/deals" className="text-[12px] font-semibold text-violet">View all →</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-line text-[11px] font-semibold uppercase tracking-wider text-ink-muted">
                  <th className="pb-2">Deal</th>
                  <th className="pb-2">Value</th>
                  <th className="pb-2">Stage</th>
                  <th className="pb-2">Owner</th>
                  <th className="pb-2">Close</th>
                </tr>
              </thead>
              <tbody>
                {topDeals.map((d) => (
                  <tr key={d.id} className="border-b border-line last:border-0">
                    <td className="py-3">
                      <Link href={`/app/crm/deals/${d.id}`} className="text-[13px] font-semibold text-ink hover:text-violet">
                        {d.name}
                      </Link>
                    </td>
                    <td className="py-3 text-[13px] font-bold text-emerald-600">${d.value.toLocaleString()}</td>
                    <td className="py-3"><StatusPill tone={STAGE_TONE[d.stage]}>{d.stage}</StatusPill></td>
                    <td className="py-3 text-[12.5px] text-ink-soft">{d.owner}</td>
                    <td className="py-3 text-[12.5px] text-ink-soft">{d.expectedClose}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="rounded-2xl border border-line bg-white p-5 shadow-card">
          <div className="mb-3 flex items-center justify-between">
            <div className="text-[14px] font-bold text-ink">Recent Activity</div>
            <Link href="/app/crm/activities" className="text-[12px] font-semibold text-violet">View all →</Link>
          </div>
          <div className="space-y-3.5">
            {ACTIVITIES.slice(0, 5).map((a) => (
              <div key={a.id} className="flex gap-2.5">
                <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-violet/10 text-[13px]">
                  {a.type === "email" ? "✉️" : a.type === "call" ? "📞" : a.type === "meeting" ? "📅" : a.type === "note" ? "📝" : a.type === "sms" ? "💬" : "✅"}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-[12.5px] font-semibold leading-snug text-ink">{a.title}</div>
                  <div className="mt-0.5 text-[11px] text-ink-muted">{a.contact} · {a.when}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-line bg-white p-5 shadow-card">
        <div className="mb-3 flex items-center justify-between">
          <div className="text-[14px] font-bold text-ink">Recent Leads</div>
          <Link href="/app/crm/contacts" className="text-[12px] font-semibold text-violet">View contacts →</Link>
        </div>
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-5">
          {recentContacts.map((c) => (
            <Link
              key={c.id}
              href={`/app/crm/contacts?id=${c.id}`}
              className="flex items-center gap-3 rounded-xl border border-line bg-white p-3 transition hover:border-violet/30 hover:shadow-card"
            >
              <Avatar name={c.name} size={40} />
              <div className="min-w-0 flex-1">
                <div className="truncate text-[13px] font-semibold text-ink">{c.name}</div>
                <div className="truncate text-[11px] text-ink-muted">{c.role}</div>
                <div className="mt-1 flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  <span className="text-[10.5px] font-bold text-ink">{c.leadScore}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
