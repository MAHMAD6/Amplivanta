import Link from "next/link";
import { Activity, AlertTriangle, BarChart3, Database, Filter, Gauge, Megaphone, Percent, Settings2, Users } from "lucide-react";
import { SuperCard, SuperCardHeader, SuperEmptyState, SuperTable } from "@/components/admin/primitives";
import type { AttributionInsights, Breakdown, CampaignInsights, ExecutiveSummary, FunnelInsights, Metric, PartnerInsights, TrafficInsights } from "@/lib/server/admin-insights";
import type { AffiliateCommandCenter } from "@/lib/server/admin-insights";

/**
 * Board and settings presentation for the Super Admin screens that summarise
 * many tables. Each panel takes a `connected` flag and renders the approved
 * "Data source unavailable" state rather than a zero when the read failed, so
 * a broken connection never looks like a real measurement.
 */

const cell = "px-6 py-4 text-[13px] text-ink";
const cellStrong = "px-6 py-4 text-[13px] font-semibold text-admin-navy";

function Unavailable({ what }: { what: string }) {
  return (
    <SuperCard>
      <SuperEmptyState
        icon={Database}
        title="Data source unavailable"
        description={`The platform database could not be reached, so ${what} cannot be shown right now. This is a connection problem, not an empty result — retry once the service is available.`}
      />
    </SuperCard>
  );
}

/** Metric tiles that name their own source table, so any figure is checkable. */
export function MetricGrid({ metrics }: { metrics: Metric[] }) {
  if (!metrics.length) return null;
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {metrics.map((m) => (
        <SuperCard key={m.label} className="p-5">
          <div className="text-[13px] font-bold text-admin-navy">{m.label}</div>
          <div className={m.value ? "mt-2 text-[24px] font-extrabold leading-none text-admin-navy" : "mt-2 text-[13px] text-ink-muted"}>
            {m.value ?? "Not recorded"}
          </div>
          {m.note && <p className="mt-2 text-[12px] text-ink-soft">{m.note}</p>}
          <p className="mt-2 text-[11.5px] uppercase tracking-wide text-ink-muted">Source: {m.source}</p>
        </SuperCard>
      ))}
    </div>
  );
}

function BreakdownCard({ title, description, rows, unit = "records" }: { title: string; description: string; rows: Breakdown[]; unit?: string }) {
  const top = rows[0]?.count ?? 0;
  return (
    <SuperCard>
      <SuperCardHeader title={title} description={description} />
      {rows.length === 0 ? (
        <SuperEmptyState icon={Filter} title={`No ${unit} recorded`} description={`Values appear here as soon as ${unit} exist.`} />
      ) : (
        <ul className="divide-y divide-line">
          {rows.map((r) => (
            <li key={r.name} className="px-6 py-3.5">
              <div className="flex items-center justify-between gap-4">
                <span className="truncate text-[13px] font-semibold text-admin-navy">{r.name}</span>
                <span className="text-[13px] font-semibold text-ink">{r.extra ?? new Intl.NumberFormat("en-US").format(r.count)}</span>
              </div>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-bg-soft">
                <div className="h-full rounded-full bg-royal-blue" style={{ width: `${top > 0 ? Math.max(2, Math.round((r.count / top) * 100)) : 0}%` }} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </SuperCard>
  );
}

/* ---------------------------------------------------- executive dashboard */

export function ExecutivePanel({ data }: { data: ExecutiveSummary }) {
  if (!data.connected) return <Unavailable what="the executive summary" />;
  return (
    <div className="space-y-6">
      <MetricGrid metrics={data.metrics} />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <SuperCard>
          <SuperCardHeader title="Open pipeline by stage" description="Deals currently open, grouped by the stage they sit in." />
          {data.pipeline.length === 0 ? (
            <SuperEmptyState icon={BarChart3} title="No open deals" description="Stages appear here once deals are created in a workspace pipeline." />
          ) : (
            <table className="w-full border-collapse">
              <tbody>
                {data.pipeline.map((p) => (
                  <tr key={p.stage} className="border-b border-line last:border-0">
                    <td className={cellStrong}>{p.stage}</td>
                    <td className={cell}>{p.deals} deals</td>
                    <td className={`${cell} text-right`}>{p.value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </SuperCard>

        <SuperCard>
          <SuperCardHeader title="Platform health" description="The most recent check recorded for each service." />
          {data.health.length === 0 ? (
            <SuperEmptyState icon={Gauge} title="No health checks recorded" description="Run a health check from System Management to populate this panel." />
          ) : (
            <table className="w-full border-collapse">
              <tbody>
                {data.health.map((h) => (
                  <tr key={h.service} className="border-b border-line last:border-0">
                    <td className={cellStrong}>{h.service}</td>
                    <td className={cell}>{h.status}</td>
                    <td className={cell}>{h.latencyMs == null ? "—" : `${h.latencyMs} ms`}</td>
                    <td className={`${cell} text-right`}>{h.checked ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </SuperCard>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <SuperCard>
          <SuperCardHeader title="Unresolved incidents" description="Every incident that has not been closed." />
          {data.incidents.length === 0 ? (
            <SuperEmptyState icon={AlertTriangle} title="No unresolved incidents" description="Nothing is currently open in the Command Center." />
          ) : (
            <ul className="divide-y divide-line">
              {data.incidents.map((i) => (
                <li key={i.id} className="flex items-center justify-between gap-4 px-6 py-4">
                  <div className="min-w-0">
                    <div className="truncate text-[13.5px] font-semibold text-admin-navy">{i.title}</div>
                    <div className="text-[12px] text-ink-soft">Severity {i.severity} · detected {i.detected ?? "—"}</div>
                  </div>
                  <Link href="/admin/command-center/command-center" className="text-[12.5px] font-bold text-royal-blue hover:underline">Open</Link>
                </li>
              ))}
            </ul>
          )}
        </SuperCard>

        <SuperCard>
          <SuperCardHeader title="Next best actions" description="Derived only from records that need attention right now." />
          {data.actions.length === 0 ? (
            <SuperEmptyState icon={Activity} title="Nothing needs attention" description="No open incidents, failing integrations, waiting tickets or unaccepted invitations." />
          ) : (
            <ul className="divide-y divide-line">
              {data.actions.map((a) => (
                <li key={a.title} className="flex items-center justify-between gap-4 px-6 py-4">
                  <div className="min-w-0">
                    <div className="truncate text-[13.5px] font-semibold text-admin-navy">{a.title}</div>
                    <div className="text-[12px] text-ink-soft">{a.detail}</div>
                  </div>
                  <Link href={a.href} className="shrink-0 text-[12.5px] font-bold text-royal-blue hover:underline">Go</Link>
                </li>
              ))}
            </ul>
          )}
        </SuperCard>
      </div>
    </div>
  );
}

/* ------------------------------------------------- affiliate command centre */

export function AffiliateCommandCenterPanel({ data }: { data: AffiliateCommandCenter }) {
  if (!data.connected) return <Unavailable what="affiliate program performance" />;
  return (
    <div className="space-y-6">
      <MetricGrid metrics={data.metrics} />

      <SuperCard>
        <SuperCardHeader title="Affiliates by earnings" description="Referral volume, conversions and commission recorded per affiliate." />
        {data.topAffiliates.length === 0 ? (
          <SuperEmptyState icon={Users} title="No affiliates yet" description="Approved affiliates appear here with their referral and commission totals." />
        ) : (
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-line">
                {["Affiliate", "Code", "Referrals", "Converted", "Commission"].map((c) => (
                  <th key={c} scope="col" className="px-6 py-4 text-left text-[13px] font-bold text-admin-navy">{c}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.topAffiliates.map((a) => (
                <tr key={a.id} className="border-b border-line last:border-0">
                  <td className={cellStrong}>{a.name}</td>
                  <td className={cell}>{a.code}</td>
                  <td className={cell}>{a.referrals}</td>
                  <td className={cell}>{a.converted}</td>
                  <td className={cell}>{a.earned}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </SuperCard>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <SuperCard>
          <SuperCardHeader title="Applications waiting for review" description="Pending affiliate applications, oldest first in the queue." />
          {data.pendingApplications.length === 0 ? (
            <SuperEmptyState icon={Users} title="Nothing pending" description="All affiliate applications have been decided." />
          ) : (
            <ul className="divide-y divide-line">
              {data.pendingApplications.map((a) => (
                <li key={a.id} className="flex items-center justify-between gap-4 px-6 py-4">
                  <div className="min-w-0">
                    <div className="truncate text-[13.5px] font-semibold text-admin-navy">{a.name}</div>
                    <div className="text-[12px] text-ink-soft">{a.email} · applied {a.created ?? "—"}</div>
                  </div>
                  <Link href="/admin/affiliate-management/applications" className="shrink-0 text-[12.5px] font-bold text-royal-blue hover:underline">Review</Link>
                </li>
              ))}
            </ul>
          )}
        </SuperCard>

        <SuperCard>
          <SuperCardHeader title="Open fraud signals" description="Signals recorded against affiliates or referrals and not yet resolved." />
          {data.openSignals.length === 0 ? (
            <SuperEmptyState icon={AlertTriangle} title="No open signals" description="Nothing has been flagged for review." />
          ) : (
            <ul className="divide-y divide-line">
              {data.openSignals.map((s) => (
                <li key={s.id} className="px-6 py-4">
                  <div className="text-[13.5px] font-semibold text-admin-navy">{s.signal}</div>
                  <div className="text-[12px] text-ink-soft">Severity {s.severity} · raised {s.created ?? "—"}</div>
                </li>
              ))}
            </ul>
          )}
        </SuperCard>
      </div>
    </div>
  );
}

/* ------------------------------------------------------- partner insights */

export function PartnerGrowthPanel({ data, view }: { data: PartnerInsights; view: "growth" | "analytics" }) {
  if (!data.connected) return <Unavailable what="partner program performance" />;
  return (
    <div className="space-y-6">
      <MetricGrid metrics={data.metrics} />

      {view === "growth" ? (
        <SuperCard>
          <SuperCardHeader title="Programs" description="Every partner program and how many partners it holds." />
          {data.programs.length === 0 ? (
            <SuperEmptyState icon={Megaphone} title="No programs yet" description="Create a partner program to start recruiting partners." />
          ) : (
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-line">
                  {["Program", "Status", "Partners", "Approved"].map((c) => (
                    <th key={c} scope="col" className="px-6 py-4 text-left text-[13px] font-bold text-admin-navy">{c}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.programs.map((p) => (
                  <tr key={p.id} className="border-b border-line last:border-0">
                    <td className={cellStrong}>{p.name}</td>
                    <td className={cell}>{p.status}</td>
                    <td className={cell}>{p.partners}</td>
                    <td className={cell}>{p.approved}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </SuperCard>
      ) : (
        <SuperCard>
          <SuperCardHeader title="Partner contribution" description="Referrals and commission recorded per partner account." />
          {data.contribution.length === 0 ? (
            <SuperEmptyState icon={BarChart3} title="No attributable activity" description="Contribution appears once referrals or commissions are recorded." />
          ) : (
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-line">
                  {["Partner", "Referrals", "Converted", "Commission"].map((c) => (
                    <th key={c} scope="col" className="px-6 py-4 text-left text-[13px] font-bold text-admin-navy">{c}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.contribution.map((r) => (
                  <tr key={r.name} className="border-b border-line last:border-0">
                    <td className={cellStrong}>{r.name}</td>
                    <td className={cell}>{r.referrals}</td>
                    <td className={cell}>{r.converted}</td>
                    <td className={cell}>{r.earned}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </SuperCard>
      )}

      <BreakdownCard title="Partners by tier" description="Tier assignments across every program." rows={data.tiers} unit="partners" />
    </div>
  );
}

/* ---------------------------------------------------- reports & analytics */

export function AnalyticsHubPanel({ rows, connected, columns }: { rows: { metric: string; value: string | null; period: string; source: string }[]; connected: boolean; columns: string[] }) {
  if (!connected) return <Unavailable what="platform analytics" />;
  return (
    <SuperTable
      columns={columns}
      rows={
        rows.length
          ? rows.map((r) => (
              <tr key={`${r.metric}-${r.period}`} className="border-b border-line last:border-0">
                <td className={cellStrong}>{r.metric}</td>
                <td className={cell}>{r.value ?? "Not recorded"}</td>
                <td className={cell}>{r.period}</td>
                <td className={cell}>{r.source}</td>
              </tr>
            ))
          : undefined
      }
      empty={<SuperEmptyState icon={BarChart3} title="No analytics recorded" description="Metrics appear here as soon as traffic, campaign or revenue records exist." />}
    />
  );
}

export function TrafficPanel({ data }: { data: TrafficInsights }) {
  if (!data.connected) return <Unavailable what="traffic analytics" />;
  const peak = Math.max(1, ...data.daily.map(([, n]) => n));
  return (
    <div className="space-y-6">
      <MetricGrid metrics={data.metrics} />

      <SuperCard>
        <SuperCardHeader title="Events per day" description="Recorded site events across the reporting window." />
        {data.daily.length === 0 ? (
          <SuperEmptyState icon={Activity} title="No events recorded" description="Daily volume appears once site events are aggregated." />
        ) : (
          <div className="flex items-end gap-1 px-6 py-6" style={{ height: 160 }}>
            {data.daily.map(([day, n]) => (
              <div key={day} className="flex-1" title={`${day}: ${n}`}>
                <div className="w-full rounded-t bg-royal-blue" style={{ height: `${Math.max(2, Math.round((n / peak) * 130))}px` }} />
              </div>
            ))}
          </div>
        )}
      </SuperCard>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <BreakdownCard title="Top paths" description="Page views by path." rows={data.topPaths} unit="page views" />
        <BreakdownCard title="Traffic sources" description="Landing page visits by recorded source." rows={data.sources} unit="visits" />
        <BreakdownCard title="Devices" description="Landing page visits by device." rows={data.devices} unit="visits" />
      </div>
    </div>
  );
}

export function CampaignAnalyticsPanel({ data }: { data: CampaignInsights }) {
  if (!data.connected) return <Unavailable what="campaign analytics" />;
  return (
    <div className="space-y-6">
      <MetricGrid metrics={data.metrics} />

      <SuperCard>
        <SuperCardHeader title="Campaign performance" description="Campaigns with recorded metrics. Campaigns with no metrics are omitted rather than shown as zero." />
        {data.rows.length === 0 ? (
          <SuperEmptyState icon={Megaphone} title="No campaign metrics recorded" description="Performance appears here once campaign metrics are written for a campaign." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] border-collapse">
              <thead>
                <tr className="border-b border-line">
                  {["Campaign", "Channel", "Status", "Impressions", "Clicks", "CTR", "Conversions", "Spend", "Revenue", "ROAS"].map((c) => (
                    <th key={c} scope="col" className="whitespace-nowrap px-6 py-4 text-left text-[13px] font-bold text-admin-navy">{c}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.rows.map((r) => (
                  <tr key={r.id} className="border-b border-line last:border-0">
                    <td className={cellStrong}>{r.name}</td>
                    <td className={cell}>{r.channel ?? "—"}</td>
                    <td className={cell}>{r.status}</td>
                    <td className={cell}>{r.impressions}</td>
                    <td className={cell}>{r.clicks}</td>
                    <td className={cell}>{r.ctr ?? "—"}</td>
                    <td className={cell}>{r.conversions}</td>
                    <td className={cell}>{r.spend}</td>
                    <td className={cell}>{r.revenue}</td>
                    <td className={cell}>{r.roas ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </SuperCard>

      <SuperCard>
        <SuperCardHeader title="Channel mix" description="Spend, revenue and conversions grouped by campaign channel." />
        {data.channels.length === 0 ? (
          <SuperEmptyState icon={Filter} title="No channel data" description="Channels appear once campaigns with a channel record metrics." />
        ) : (
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-line">
                {["Channel", "Spend", "Revenue", "Conversions"].map((c) => (
                  <th key={c} scope="col" className="px-6 py-4 text-left text-[13px] font-bold text-admin-navy">{c}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.channels.map((c) => (
                <tr key={c.name} className="border-b border-line last:border-0">
                  <td className={cellStrong}>{c.name}</td>
                  <td className={cell}>{c.spend}</td>
                  <td className={cell}>{c.revenue}</td>
                  <td className={cell}>{c.conversions}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </SuperCard>
    </div>
  );
}

export function FunnelPanel({ data }: { data: FunnelInsights }) {
  if (!data.connected) return <Unavailable what="the conversion funnel" />;
  const top = Math.max(1, data.stages[0]?.count ?? 0);
  return (
    <SuperCard>
      <SuperCardHeader title="Conversion funnel" description="Each step counts the records in the table named beside it. A step with no records means that step is not instrumented yet." />
      {data.note && <p className="px-6 pb-2 text-[13px] text-ink-soft">{data.note}</p>}
      <ul className="divide-y divide-line">
        {data.stages.map((s) => (
          <li key={s.stage} className="px-6 py-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span className="text-[13.5px] font-semibold text-admin-navy">{s.stage}</span>
              <span className="text-[13px] text-ink">
                {s.label}
                {s.ofPrevious ? ` · ${s.ofPrevious} of previous step` : ""}
                {s.ofTop ? ` · ${s.ofTop} of visits` : ""}
              </span>
            </div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-bg-soft">
              <div className="h-full rounded-full bg-royal-blue" style={{ width: `${Math.max(1, Math.round((s.count / top) * 100))}%` }} />
            </div>
            <p className="mt-1.5 text-[11.5px] uppercase tracking-wide text-ink-muted">Source: {s.source}</p>
          </li>
        ))}
      </ul>
    </SuperCard>
  );
}

export function AttributionPanel({ data }: { data: AttributionInsights }) {
  if (!data.connected) return <Unavailable what="revenue attribution" />;
  return (
    <div className="space-y-6">
      <MetricGrid metrics={data.metrics} />

      <SuperCard>
        <SuperCardHeader title="Revenue by channel" description="Attributed from campaign metrics. Invoiced revenue is reported separately because it is not channel-attributed." />
        {data.byChannel.length === 0 ? (
          <SuperEmptyState icon={Percent} title="No attributable revenue" description="Channel attribution appears once campaigns record revenue or spend." />
        ) : (
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-line">
                {["Channel", "Conversions", "Revenue", "Spend", "ROAS", "Share of revenue"].map((c) => (
                  <th key={c} scope="col" className="px-6 py-4 text-left text-[13px] font-bold text-admin-navy">{c}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.byChannel.map((c) => (
                <tr key={c.name} className="border-b border-line last:border-0">
                  <td className={cellStrong}>{c.name}</td>
                  <td className={cell}>{c.conversions}</td>
                  <td className={cell}>{c.revenue}</td>
                  <td className={cell}>{c.spend}</td>
                  <td className={cell}>{c.roas ?? "—"}</td>
                  <td className={cell}>{c.share ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </SuperCard>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <SuperCard>
          <SuperCardHeader title="Top campaigns by revenue" description="Campaign-level attribution with return on spend." />
          {data.byCampaign.length === 0 ? (
            <SuperEmptyState icon={Megaphone} title="No campaign revenue" description="Campaigns appear here once they record revenue." />
          ) : (
            <table className="w-full border-collapse">
              <tbody>
                {data.byCampaign.map((c) => (
                  <tr key={c.name} className="border-b border-line last:border-0">
                    <td className={cellStrong}>{c.name}<span className="block text-[12px] font-normal text-ink-soft">{c.channel ?? "No channel set"}</span></td>
                    <td className={cell}>{c.revenue}</td>
                    <td className={cell}>{c.spend}</td>
                    <td className={`${cell} text-right`}>{c.roi ? `${c.roi} ROI` : "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </SuperCard>

        <SuperCard>
          <SuperCardHeader title="Invoiced revenue by month" description="Paid invoices, from the billing records themselves." />
          <table className="w-full border-collapse">
            <tbody>
              {data.invoiced.map((m) => (
                <tr key={m.period} className="border-b border-line last:border-0">
                  <td className={cellStrong}>{m.period}</td>
                  <td className={cell}>{m.invoices} invoices</td>
                  <td className={`${cell} text-right`}>{m.amount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </SuperCard>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------- settings */

type SettingRow = { key: string; label: string; help: string; value: string; set: boolean; updatedAt: string | null };

/**
 * Read-only view of stored configuration. A key that has never been written
 * says so rather than showing a default that is not actually in effect.
 */
export function StoredSettingsPanel({
  title,
  description,
  settings,
  connected,
  scope,
  otherKeys,
  editHref,
}: {
  title: string;
  description: string;
  settings: SettingRow[];
  connected: boolean;
  scope?: { label: string; value: string }[];
  otherKeys?: { key: string; updatedAt: string | null }[];
  editHref?: string;
}) {
  if (!connected) return <Unavailable what="stored settings" />;
  return (
    <div className="space-y-6">
      {scope && scope.length > 0 && (
        <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
          {scope.map((s) => (
            <SuperCard key={s.label} className="p-5">
              <div className="text-[13px] font-bold text-admin-navy">{s.label}</div>
              <div className="mt-2 text-[22px] font-extrabold leading-none text-admin-navy">{s.value}</div>
            </SuperCard>
          ))}
        </div>
      )}

      <SuperCard>
        <SuperCardHeader
          title={title}
          description={description}
          action={editHref ? <Link href={editHref} className="text-[12.5px] font-bold text-royal-blue hover:underline">Open editor</Link> : undefined}
        />
        <ul className="divide-y divide-line">
          {settings.map((s) => (
            <li key={s.key} className="px-6 py-4">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="text-[13.5px] font-semibold text-admin-navy">{s.label}</div>
                  <p className="mt-1 text-[12px] text-ink-soft">{s.help}</p>
                  <p className="mt-1 text-[11.5px] uppercase tracking-wide text-ink-muted">Key: {s.key}</p>
                </div>
                <div className="text-right">
                  <div className={s.set ? "text-[13px] font-semibold text-ink" : "text-[13px] text-ink-muted"}>
                    {s.set ? s.value || "(empty string)" : "Not configured"}
                  </div>
                  {s.updatedAt && <div className="text-[12px] text-ink-soft">Updated {s.updatedAt}</div>}
                </div>
              </div>
            </li>
          ))}
        </ul>
      </SuperCard>

      {otherKeys && otherKeys.length > 0 && (
        <SuperCard>
          <SuperCardHeader title="Other stored keys" description="Settings written by other parts of the platform." />
          <ul className="divide-y divide-line">
            {otherKeys.map((k) => (
              <li key={k.key} className="flex items-center justify-between gap-4 px-6 py-3">
                <span className="text-[13px] font-semibold text-admin-navy">{k.key}</span>
                <span className="text-[12px] text-ink-soft">{k.updatedAt ? `Updated ${k.updatedAt}` : "—"}</span>
              </li>
            ))}
          </ul>
        </SuperCard>
      )}
    </div>
  );
}

export function NotificationOverviewPanel({
  data,
}: {
  data: { connected: boolean; metrics: Metric[]; categories: Breakdown[]; severities: Breakdown[] };
}) {
  if (!data.connected) return <Unavailable what="notification delivery" />;
  return (
    <div className="space-y-6">
      <MetricGrid metrics={data.metrics} />
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <BreakdownCard title="By category" description="Notifications raised in the reporting window, by event category." rows={data.categories} unit="notifications" />
        <BreakdownCard title="By severity" description="How urgent the platform judged each notification to be." rows={data.severities} unit="notifications" />
      </div>
      <SuperCard>
        <SuperCardHeader title="Per-member preferences" description="Delivery preferences belong to each member and are edited on their own settings screen." />
        <div className="px-6 pb-6">
          <Link href="/app/settings/notifications" className="inline-flex items-center gap-2 text-[13px] font-bold text-royal-blue hover:underline">
            <Settings2 className="h-4 w-4" /> Open notification settings
          </Link>
        </div>
      </SuperCard>
    </div>
  );
}
