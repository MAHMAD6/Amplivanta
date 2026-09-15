import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, Check, Globe, ShieldCheck } from "lucide-react";
import { db } from "@/lib/db";
import { SettingsHeader } from "@/components/amplivanta/settings-header";
import { AddDomainForm, DomainActions } from "@/components/amplivanta/settings-ui";
import { DataTable, EmptyState, InfoList, Pill, StatGrid, fmtDate, fmtInt } from "@/components/amplivanta/screen-kit";
import { settingsContext } from "@/lib/server/settings-screens";

export const metadata: Metadata = { title: "API & Domains" };
export const dynamic = "force-dynamic";

export default async function ApiDomainsPage() {
  const c = await settingsContext();
  let reachable = Boolean(c);
  let domains: { id: string; domain: string; isVerified: boolean; verificationToken: string | null; createdAt: Date }[] = [];
  let keys = 0;
  if (c) {
    try {
      [domains, keys] = await Promise.all([
        db.domain.findMany({ where: { workspaceId: c.workspaceId }, orderBy: { createdAt: "desc" } }),
        db.apiKey.count({ where: { workspaceId: c.workspaceId } }),
      ]);
    } catch {
      reachable = false;
    }
  }
  const verified = domains.filter((d) => d.isVerified).length;
  const canEdit = Boolean(c?.isAdmin);

  return (
    <>
      <SettingsHeader title="API & Domains" subtitle="Manage workspace API access and domain configuration for web and marketing capabilities." />
      <StatGrid
        stats={[
          { label: "Domains", icon: Globe, value: domains.length ? fmtInt(domains.length) : null },
          { label: "Verified", icon: Check, value: domains.length ? fmtInt(verified) : null },
          { label: "SSL Status", icon: ShieldCheck, value: null, hint: "Shown when certificate information is available" },
          { label: "API Access", icon: ArrowUpRight, value: keys ? `${fmtInt(keys)} key${keys === 1 ? "" : "s"}` : null },
        ]}
      />
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.2fr)_1fr]">
        <section className="rounded-xl border border-line bg-white p-5">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-[18px] font-semibold text-deep-navy">Domains</h2>
            {domains.length > 0 && <AddDomainForm canEdit={canEdit} />}
          </div>
          <DataTable
            columns={["Domain", "Verification", "SSL", "Added", "Actions"]}
            minWidth={760}
            rows={domains.map((d) => [
              d.domain,
              <Pill key="v" tone={d.isVerified ? "green" : "amber"}>{d.isVerified ? "Verified" : "Pending"}</Pill>,
              "Not available",
              fmtDate(d.createdAt),
              <DomainActions key="a" id={d.id} verified={d.isVerified} record={`_amplivanta.${d.domain}`} token={d.verificationToken} canEdit={canEdit} />,
            ])}
            empty={
              <EmptyState
                icon={Globe}
                title={reachable ? "No domains configured" : "Domains unavailable"}
                body={reachable ? "Add a domain to begin ownership and DNS verification." : "Domains could not be loaded right now."}
                action={reachable ? <AddDomainForm canEdit={canEdit} /> : undefined}
              />
            }
          />
        </section>
        <section className="flex flex-col rounded-xl border border-line bg-white p-5">
          <h2 className="text-[18px] font-semibold text-deep-navy">API &amp; Domain Guidance</h2>
          <div className="flex-1">
            <InfoList
              rows={[
                { title: "Verification", body: "Add the TXT record shown for a domain, then verify. Ownership is checked against live DNS." },
                { title: "SSL", body: "SSL state is shown only when certificate information is available." },
                { title: "Activation", body: "Only domains that complete verification should be used for publishing." },
                { title: "Linked usage", body: "Landing page, tracking, or email relationships appear where applicable." },
                { title: "Auditability", body: "Domain and API configuration changes are recorded in the audit log." },
              ]}
            />
          </div>
          <Link href="/app/integrations/api-keys" className="mx-auto mt-4 inline-flex h-11 items-center rounded-md border border-line px-16 text-[14px] font-semibold text-deep-navy hover:bg-bg-soft">Manage API Access</Link>
        </section>
      </div>
    </>
  );
}
