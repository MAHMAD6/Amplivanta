import type { Metadata } from "next";
import Link from "next/link";
import { BookOpen, ExternalLink, FileCheck, Globe, Link2, Lock, Rocket, Send, ShieldCheck } from "lucide-react";
import { db } from "@/lib/db";
import { EmptyState, Panel, Pill, ScreenHeader, StatGrid, fmtDate, fmtDateTime, figure } from "@/components/amplivanta/screen-kit";
import { FilterBar, Select, filterSearch, headerOutline, headerPrimary, outlineSm } from "@/components/amplivanta/growth-kit";
import { ActButton } from "@/components/amplivanta/growth-ui";
import { FormDialog } from "@/components/amplivanta/creative-ui";
import { addMarketingDomain, checkDomainRecords, removeMarketingDomain, savePublishPreferences, setDefaultDomain } from "@/app/(app)/app/marketing/actions";
import { marketingContext } from "@/lib/server/marketing-screens";

export const metadata: Metadata = { title: "Publish & Domains" };
export const dynamic = "force-dynamic";

type SP = { q?: string; status?: string; purpose?: string; guide?: string };

export default async function PublishDomainsPage({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams;
  const c = await marketingContext();
  let domains: { id: string; domain: string; purpose: string; isVerified: boolean; isDefault: boolean; verificationToken: string | null; createdAt: Date; lastCheckedAt: Date | null }[] = [];
  let published = 0;
  let deployments: { id: string; version: number; createdAt: Date; title: string; pageId: string }[] = [];
  let prefs = null as { defaultVisibility?: string; analyticsByDefault?: boolean } | null;
  let wsSlug = "";
  if (c) {
    try {
      const w = c.workspaceId;
      const [d, p, v, pr, ws] = await Promise.all([
        db.domain.findMany({ where: { workspaceId: w, ...(sp.q ? { domain: { contains: sp.q.toLowerCase() } } : {}), ...(sp.status ? { isVerified: sp.status === "verified" } : {}), ...(sp.purpose ? { purpose: sp.purpose } : {}) }, orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }], select: { id: true, domain: true, purpose: true, isVerified: true, isDefault: true, verificationToken: true, createdAt: true, lastCheckedAt: true } }),
        db.landingPage.count({ where: { workspaceId: w, status: "published" } }),
        db.landingPageVersion.findMany({ where: { landingPage: { workspaceId: w } }, orderBy: { createdAt: "desc" }, take: 8, select: { id: true, version: true, createdAt: true, landingPage: { select: { id: true, title: true } } } }),
        db.workspacePreference.findUnique({ where: { workspaceId_scope: { workspaceId: w, scope: "publishing" } } }),
        db.workspace.findUnique({ where: { id: w }, select: { slug: true } }),
      ]);
      domains = d;
      published = p;
      deployments = v.map((x) => ({ id: x.id, version: x.version, createdAt: x.createdAt, title: x.landingPage.title, pageId: x.landingPage.id }));
      prefs = (pr?.values as typeof prefs) ?? null;
      wsSlug = ws?.slug ?? "";
    } catch {
      domains = [];
    }
  }
  const isAdmin = Boolean(c?.isAdmin);
  const verified = domains.filter((d) => d.isVerified);
  const connect = (cls: string, text = "Connect Domain") => <FormDialog title="Connect Domain" label={text} className={cls} action={addMarketingDomain} disabled={!isAdmin} submitLabel="Add domain" note="Only workspace admins can add domains. After adding, create the TXT record shown, then use Verify." fields={[{ name: "domain", label: "Domain", kind: "text", required: true, placeholder: "pages.example.com" }, { name: "purpose", label: "Use for", kind: "select", options: [["publishing", "Publishing landing pages"], ["sending", "Sending email"]], defaultValue: "publishing" }]} />;
  const pending = domains.find((d) => !d.isVerified);

  return (
    <div className="mx-auto max-w-[1600px]">
      <ScreenHeader
        crumbs={[["Home", "/app"], ["Marketing Automation", "/app/marketing"], ["Publish & Domains"]]}
        title="Publish & Domains"
        actions={<><Link href="?guide=1#setup" className={headerOutline}><BookOpen className="h-4 w-4" /> View Setup Guide</Link>{pending && isAdmin && <ActButton action={checkDomainRecords.bind(null, pending.id)} className={headerOutline}>Verify {pending.domain}</ActButton>}<Link href="/app/marketing/publishing" className={headerPrimary}>Publish Assets</Link></>}
      />
      <StatGrid
        cols={4}
        stats={[
          { label: "Connected Domains", icon: Globe, value: figure(verified.length), hint: domains.length ? `${domains.length} added, ${verified.length} verified` : "No domains connected" },
          { label: "Published Assets", icon: FileCheck, value: figure(published), hint: published ? "Live landing pages" : "No assets published", tone: "green" },
          { label: "SSL Status", icon: ShieldCheck, value: published ? "Hosted: active" : null, hint: "Hosted URLs use the platform's certificate; custom domains need server setup", tone: "violet" },
          { label: "Last Deployment", icon: Send, value: deployments[0] ? fmtDate(deployments[0].createdAt) : null, hint: deployments[0] ? `${deployments[0].title} v${deployments[0].version}` : "No deployments yet", tone: "orange" },
        ]}
      />
      <div className="mb-4 grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
        <Panel title="Domain Management" action={domains.length ? connect(outlineSm) : undefined}>
          <FilterBar className="border-0 p-0">
            <input name="q" defaultValue={sp.q} placeholder="Search domains..." aria-label="Search domains" className={filterSearch} />
            <Select name="status" value={sp.status} all="All Statuses" options={[["verified", "Verified"], ["pending", "Pending"]]} label="Status" />
            <Select name="purpose" value={sp.purpose} all="All Uses" options={[["publishing", "Publishing"], ["sending", "Sending"]]} label="Use" />
          </FilterBar>
          {domains.length ? (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] text-left text-[12.5px]">
                <thead><tr className="border-b border-line bg-bg-soft/70 text-deep-navy">{["Domain", "Status", "SSL Status", "Default", "Connected On", "Actions"].map((h) => <th key={h} className="px-3 py-2.5 font-semibold">{h}</th>)}</tr></thead>
                <tbody>
                  {domains.map((d) => (
                    <tr key={d.id} className="border-b border-line last:border-0">
                      <td className="px-3 py-2.5"><b className="text-deep-navy">{d.domain}</b><div className="text-[11.5px] capitalize text-ink-muted">{d.purpose}</div>{!d.isVerified && d.verificationToken && <div className="mt-1 break-all font-mono text-[11px] text-ink-soft">TXT _amplivanta.{d.domain} = {d.verificationToken}</div>}</td>
                      <td className="px-3 py-2.5"><Pill tone={d.isVerified ? "green" : "amber"}>{d.isVerified ? "Verified" : "Pending"}</Pill></td>
                      <td className="px-3 py-2.5 text-ink-soft">{d.purpose === "publishing" ? "Needs server setup" : "Not applicable"}</td>
                      <td className="px-3 py-2.5">{d.isDefault ? <Pill tone="blue">Default</Pill> : "—"}</td>
                      <td className="px-3 py-2.5 text-ink-soft">{fmtDate(d.createdAt)}</td>
                      <td className="px-3 py-2.5">{isAdmin && <span className="flex flex-wrap gap-1.5"><ActButton action={checkDomainRecords.bind(null, d.id)}>{d.isVerified ? "Recheck" : "Verify"}</ActButton>{d.isVerified && !d.isDefault && <ActButton action={setDefaultDomain.bind(null, d.id)}>Make default</ActButton>}<ActButton action={removeMarketingDomain.bind(null, d.id)} confirm="Remove this domain?">Remove</ActButton></span>}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState icon={Globe} title="No domains connected yet" body="Connect a custom domain or use a hosted subdomain to publish your assets." action={connect(outlineSm, "+ Connect Domain")} />
          )}
        </Panel>
        <Panel title="Publishing Destinations">
          <ul className="space-y-3">
            <li className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-line p-4"><span className="flex gap-3"><Globe className="h-5 w-5 text-[#0B5CFF]" /><span><b className="block text-[13.5px] text-deep-navy">Custom Domain</b><span className="text-[12.5px] text-ink-soft">Verify a domain you own. Serving pages on it also needs a CNAME and TLS on the Amplivanta server, which support sets up.</span></span></span>{connect(outlineSm)}</li>
            <li className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-line p-4"><span className="flex gap-3"><Link2 className="h-5 w-5 text-[#0B5CFF]" /><span><b className="block text-[13.5px] text-deep-navy">Hosted URL</b><span className="text-[12.5px] text-ink-soft">Every published page is live at <span className="font-mono">/lp/{wsSlug || "workspace"}/page-slug</span> with HTTPS.</span></span></span><Link href="/app/marketing/landing-pages?status=published" className={outlineSm}>Use Hosted URL</Link></li>
            <li className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-line p-4"><span className="flex gap-3"><ExternalLink className="h-5 w-5 text-[#0B5CFF]" /><span><b className="block text-[13.5px] text-deep-navy">Preview Environment</b><span className="text-[12.5px] text-ink-soft">Preview saved drafts privately in the builder before publishing.</span></span></span><Link href="/app/marketing/page-builder?tab=design" className={outlineSm}>Open Preview</Link></li>
          </ul>
        </Panel>
      </div>
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <Panel title="DNS & SSL Setup" id="setup">
          <ol className="space-y-4">
            {[["Connect Domain", "Add your domain to get started.", domains.length > 0], ["Verify DNS", "Add the TXT record shown for the domain, then verify.", verified.length > 0], ["Enable SSL", "For custom domains, point a CNAME at amplivanta.com and ask support to enable TLS.", false], ["Publish Assets", "Publish your pages to make them live.", published > 0]].map(([t, b, done], i) => (
              <li key={t as string} className="flex gap-3"><span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-[12px] font-semibold ${done ? "border-emerald-500 bg-emerald-50 text-emerald-700" : "border-line text-ink-soft"}`}>{i + 1}</span><span><b className="block text-[13.5px] text-deep-navy">{t as string}</b><span className="text-[12.5px] text-ink-soft">{b as string}</span></span></li>
            ))}
          </ol>
          <p className="mt-3 flex items-center gap-2 text-[12px] text-ink-muted"><Lock className="h-3.5 w-3.5" /> Hosted URLs are always served over HTTPS.</p>
        </Panel>
        <Panel title="Deployment Activity">
          {deployments.length ? (
            <ul className="divide-y divide-line">{deployments.map((d) => <li key={d.id} className="flex justify-between gap-2 py-2 text-[13px]"><Link href={`/app/marketing/publishing?id=${d.pageId}`} className="truncate font-semibold text-deep-navy hover:text-[#0B5CFF]">{d.title} · v{d.version}</Link><span className="shrink-0 text-[12px] text-ink-muted">{fmtDateTime(d.createdAt)}</span></li>)}</ul>
          ) : (
            <EmptyState icon={Rocket} title="No deployments yet" body="You haven't published any changes." action={<Link href="/app/marketing/publishing" className={outlineSm}>Publish Changes</Link>} />
          )}
        </Panel>
        <Panel title="Publish Preferences">
          {prefs ? (
            <ul className="mb-3 space-y-2 text-[13px]">
              <li className="flex justify-between"><span>Default visibility</span><b className="capitalize">{prefs.defaultVisibility}</b></li>
              <li className="flex justify-between"><span>Analytics on by default</span><b>{prefs.analyticsByDefault ? "On" : "Off"}</b></li>
            </ul>
          ) : (
            <EmptyState icon={Globe} title="No publish preferences configured" body="Choose a default visibility and tracking setting for new pages." compact />
          )}
          <div className="text-center"><FormDialog title="Publish Preferences" label="Configure Settings" className={outlineSm} action={savePublishPreferences} disabled={!isAdmin} submitLabel="Save" fields={[{ name: "defaultVisibility", label: "Default visibility", kind: "select", options: [["public", "Public"], ["unlisted", "Unlisted"]], defaultValue: prefs?.defaultVisibility ?? "public" }, { name: "analyticsByDefault", label: "Turn analytics on for new pages", kind: "checkbox", defaultChecked: prefs?.analyticsByDefault ?? true }]} /></div>
        </Panel>
      </div>
    </div>
  );
}
