import type { Metadata } from "next";
import { Plus, Upload, Filter, Download, Building2, Users2, Snowflake, TrendingUp, DollarSign, HeartPulse, MoreHorizontal, ExternalLink, Pencil, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/amplivanta/page-header";
import { CrmSubnav } from "@/components/amplivanta/crm-subnav";
import { KpiCard } from "@/components/amplivanta/kpi-card";
import { StatusPill, Avatar, CompanyIcon } from "@/components/amplivanta/status-pill";
import { LiveBadge } from "@/components/amplivanta/live-badge";
import { ResourceDialog } from "@/components/amplivanta/crud/resource-dialog";
import { DeleteAction } from "@/components/amplivanta/crud/delete-action";
import { COMPANY_FIELDS } from "@/components/amplivanta/crm/crm-fields";
import { loadCompanies } from "@/lib/server/loaders";
import { HEALTH_TONE } from "@/lib/part2-data";

export const metadata: Metadata = { title: "Companies" };
export const dynamic = "force-dynamic";

function money(n: number) {
  if (n >= 1000) return `$${(n / 1000).toFixed(n >= 10000 ? 0 : 1)}K`;
  return `$${n}`;
}

export default async function CompaniesPage() {
  const { items: companies, live } = await loadCompanies();
  const total = companies.length;
  const active = companies.filter((c) => c.health !== "Critical").length;
  const totalArr = companies.reduce((s, c) => s + c.arr, 0);
  const openDeals = companies.reduce((s, c) => s + c.openDeals, 0);
  const avgHealth = Math.round(companies.reduce((s, c) => s + (c.health === "Healthy" ? 90 : c.health === "Neutral" ? 70 : c.health === "At Risk" ? 50 : 30), 0) / Math.max(total, 1));
  const selected = companies[0];

  return (
    <div className="mx-auto max-w-[1500px]">
      <PageHeader
        title="Companies"
        subtitle="Manage company accounts, segments, contacts, opportunities, and relationship health in one place."
        actions={
          <>
            <ResourceDialog
              title="New Company"
              description="Add a company account to this workspace."
              fields={COMPANY_FIELDS}
              endpoint="/api/companies"
              submitLabel="Create company"
              successMessage="Company created"
              trigger={
                <button className="inline-flex h-10 items-center gap-1.5 rounded-xl bg-grad-cta px-4 text-[13px] font-bold text-white shadow-violet"><Plus className="h-3.5 w-3.5" /> Add Company</button>
              }
            />
            <button className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-line bg-white px-4 text-[13px] font-semibold text-ink hover:border-ink/30"><Upload className="h-3.5 w-3.5" /> Import</button>
            <button className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-line bg-white px-4 text-[13px] font-semibold text-ink hover:border-ink/30"><Filter className="h-3.5 w-3.5" /> Filter</button>
            <button className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-line bg-white px-4 text-[13px] font-semibold text-ink hover:border-ink/30"><Download className="h-3.5 w-3.5" /> Export</button>
          </>
        }
      />
      <CrmSubnav />
      {live && <LiveBadge label={`Live · ${total} companies from database`} />}

      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-6">
        <KpiCard icon={Building2} tone="violet" label="Total Companies" value={total.toLocaleString()} />
        <KpiCard icon={Users2} tone="green" label="Active Accounts" value={active.toLocaleString()} />
        <KpiCard icon={Snowflake} tone="blue" label="New This Month" value={String(Math.max(1, Math.round(total * 0.06)))} />
        <KpiCard icon={TrendingUp} tone="orange" label="Expansion Opps" value={String(openDeals)} />
        <KpiCard icon={DollarSign} tone="indigo" label="Total ARR" value={money(totalArr)} />
        <KpiCard icon={HeartPulse} tone="pink" label="Health Score" value={String(avgHealth)} />
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_360px]">
        {/* Table */}
        <div className="overflow-hidden rounded-2xl border border-line bg-white shadow-card">
          <div className="flex items-center justify-between border-b border-line px-4 py-3">
            <input placeholder="Search companies…" className="h-9 w-64 rounded-xl border border-line bg-bg-soft px-3 text-[13px] focus:outline-none" />
            <span className="text-[12px] text-ink-muted">{total.toLocaleString()} companies</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="border-b border-line text-left text-[11px] uppercase tracking-wide text-ink-muted">
                  <th className="px-4 py-2.5 font-semibold">Company Name</th>
                  <th className="px-3 py-2.5 font-semibold">Industry</th>
                  <th className="px-3 py-2.5 font-semibold">Plan</th>
                  <th className="px-3 py-2.5 font-semibold">ARR / Value</th>
                  <th className="px-3 py-2.5 font-semibold">Deals</th>
                  <th className="px-3 py-2.5 font-semibold">Contacts</th>
                  <th className="px-3 py-2.5 font-semibold">Health</th>
                  <th className="px-3 py-2.5 font-semibold">Last Activity</th>
                  <th className="px-3 py-2.5" />
                </tr>
              </thead>
              <tbody>
                {companies.map((c, i) => (
                  <tr key={c.id} className={`border-b border-line/60 transition hover:bg-bg-soft/50 ${i === 0 ? "bg-violet/5" : ""}`}>
                    <td className="px-4 py-2.5">
                      <div className="flex items-center gap-2.5">
                        <CompanyIcon name={c.name} />
                        <span className="font-semibold text-ink">{c.name}</span>
                      </div>
                    </td>
                    <td className="px-3 py-2.5 text-ink-soft">{c.industry}</td>
                    <td className="px-3 py-2.5"><StatusPill tone={c.plan === "Enterprise" ? "indigo" : "violet"}>{c.plan}</StatusPill></td>
                    <td className="px-3 py-2.5 font-semibold text-ink">${c.arr.toLocaleString()}</td>
                    <td className="px-3 py-2.5 text-ink-soft">{c.openDeals}</td>
                    <td className="px-3 py-2.5 text-ink-soft">{c.contacts}</td>
                    <td className="px-3 py-2.5"><StatusPill tone={HEALTH_TONE[c.health]}>{c.health}</StatusPill></td>
                    <td className="px-3 py-2.5 text-ink-muted">{c.lastActivity}</td>
                    <td className="px-3 py-2.5 text-ink-muted"><MoreHorizontal className="h-4 w-4" /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-between px-4 py-3 text-[12px] text-ink-muted">
            <span>Showing 1 to {total} of {total.toLocaleString()} companies</span>
            <div className="flex items-center gap-1">
              <button className="h-7 w-7 rounded-lg bg-violet text-[12px] font-bold text-white">1</button>
              <button className="h-7 w-7 rounded-lg border border-line text-[12px]">2</button>
              <button className="h-7 w-7 rounded-lg border border-line text-[12px]">3</button>
            </div>
          </div>
        </div>

        {/* Detail drawer */}
        {selected && (
          <div className="rounded-2xl border border-line bg-white p-5 shadow-card">
            <div className="mb-4 flex items-start justify-between">
              <div className="flex items-center gap-3">
                <CompanyIcon name={selected.name} size={44} className="rounded-xl" />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[15px] font-bold text-ink">{selected.name}</span>
                    <StatusPill tone={HEALTH_TONE[selected.health]}>{selected.health}</StatusPill>
                  </div>
                  <a className="mt-0.5 inline-flex items-center gap-1 text-[12px] text-violet">{selected.domain} <ExternalLink className="h-3 w-3" /></a>
                </div>
              </div>
              {live && (
                <div className="flex items-center gap-1">
                  <ResourceDialog
                    title="Edit Company"
                    fields={COMPANY_FIELDS}
                    endpoint={`/api/companies/${selected.id}`}
                    method="PATCH"
                    submitLabel="Save changes"
                    successMessage="Company updated"
                    initial={{
                      name: selected.name,
                      domain: selected.domain !== "—" ? selected.domain : "",
                      industry: selected.industry !== "—" ? selected.industry : "",
                      size: selected.plan === "Enterprise" ? "enterprise" : "growth",
                    }}
                    trigger={
                      <button className="rounded-lg p-1.5 text-ink-muted hover:bg-bg-soft hover:text-violet" aria-label="Edit company"><Pencil className="h-3.5 w-3.5" /></button>
                    }
                  />
                  <DeleteAction
                    endpoint={`/api/companies/${selected.id}`}
                    label="company"
                    name={selected.name}
                    successMessage="Company deleted"
                    trigger={
                      <button className="rounded-lg p-1.5 text-ink-muted hover:bg-red-50 hover:text-red-600" aria-label="Delete company"><Trash2 className="h-3.5 w-3.5" /></button>
                    }
                  />
                </div>
              )}
            </div>
            <dl className="space-y-3 text-[13px]">
              <Row label="Account Owner" value={<span className="inline-flex items-center gap-1.5"><Avatar name={selected.owner} size={20} /> {selected.owner}</span>} />
              <Row label="Lifecycle Stage" value={<StatusPill tone="green">{selected.plan}</StatusPill>} />
              <Row label="Last Touch" value={selected.lastActivity} />
              <Row label="ARR / Value" value={<span className="font-semibold">${selected.arr.toLocaleString()}</span>} />
              <Row label="Open Opportunities" value={`${selected.openDeals} · View pipeline`} />
              <Row label="Primary Contacts" value={`${selected.contacts} contacts`} />
            </dl>
            <div className="mt-4 border-t border-line pt-4">
              <div className="text-[12px] font-bold text-ink">About</div>
              <p className="mt-1 text-[12.5px] leading-relaxed text-ink-soft">{selected.name} operates in {selected.industry.toLowerCase()} and is an active {selected.plan} account with {selected.contacts} tracked contacts.</p>
            </div>
            <div className="mt-4 rounded-xl border border-line bg-bg-soft/50 p-3">
              <div className="text-[12px] font-bold text-ink">Next Actions</div>
              <ul className="mt-2 space-y-1.5 text-[12.5px] text-ink-soft">
                <li>☐ Follow up on expansion proposal</li>
                <li>☑ Send case study from similar client</li>
                <li>☐ Check in on onboarding progress</li>
              </ul>
            </div>
          </div>
        )}
      </div>

      {/* Bottom analytics panels */}
      <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Panel title="Segments">
          <Donut segments={[["Enterprise", 32, "#6A35F0"], ["Growth", 31, "#16A56A"], ["Mid-Market", 20, "#F59E0B"], ["Small Business", 11, "#3B82F6"], ["Other", 6, "#94A3B8"]]} total={total} />
        </Panel>
        <Panel title="Pipeline by Company">
          <div className="space-y-2.5">
            {companies.slice(0, 5).map((c) => (
              <div key={c.id}>
                <div className="mb-1 flex justify-between text-[12px]"><span className="text-ink-soft">{c.name}</span><span className="font-semibold text-ink">${c.arr.toLocaleString()}</span></div>
                <div className="h-1.5 overflow-hidden rounded-full bg-bg-soft"><div className="h-full rounded-full bg-grad-brand" style={{ width: `${Math.min(100, (c.arr / (companies[0]?.arr || 1)) * 100)}%` }} /></div>
              </div>
            ))}
          </div>
        </Panel>
        <Panel title="Account Health Overview">
          <Donut segments={[["Healthy", 42, "#16A56A"], ["Neutral", 31, "#F59E0B"], ["At Risk", 17, "#F97316"], ["Critical", 10, "#EF4444"]]} total={total} />
        </Panel>
        <Panel title="Top Growing Accounts">
          <div className="space-y-2.5 text-[12.5px]">
            {[...companies].sort((a, b) => b.arr - a.arr).slice(0, 5).map((c) => (
              <div key={c.id} className="flex items-center justify-between">
                <span className="text-ink-soft">{c.name}</span>
                <span className="font-semibold text-emerald-600">↑ ${(c.arr / 1000).toFixed(0)}K</span>
              </div>
            ))}
          </div>
        </Panel>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between">
      <dt className="text-ink-muted">{label}</dt>
      <dd className="font-medium text-ink">{value}</dd>
    </div>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-line bg-white p-4 shadow-card">
      <div className="mb-3 text-[13px] font-bold text-ink">{title}</div>
      {children}
    </div>
  );
}

function Donut({ segments, total }: { segments: [string, number, string][]; total: number }) {
  let acc = 0;
  const grad = segments
    .map(([, pct, color]) => {
      const start = acc;
      acc += pct;
      return `${color} ${start}% ${acc}%`;
    })
    .join(", ");
  return (
    <div className="flex items-center gap-4">
      <div className="relative h-24 w-24 shrink-0 rounded-full" style={{ background: `conic-gradient(${grad})` }}>
        <div className="absolute inset-[22%] flex flex-col items-center justify-center rounded-full bg-white">
          <span className="text-[15px] font-extrabold text-ink">{total}</span>
          <span className="text-[9px] text-ink-muted">Total</span>
        </div>
      </div>
      <ul className="space-y-1 text-[11.5px]">
        {segments.map(([label, pct, color]) => (
          <li key={label} className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full" style={{ background: color }} />
            <span className="text-ink-soft">{label}</span>
            <span className="ml-auto font-semibold text-ink">{pct}%</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
