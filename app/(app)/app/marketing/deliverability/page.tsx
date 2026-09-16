import type { Metadata } from "next";
import { BookOpen, Globe, MailWarning, Send, ShieldCheck, Star, Users } from "lucide-react";
import { db } from "@/lib/db";
import { EmptyState, Panel, Pill, ScreenHeader, fmtDate } from "@/components/amplivanta/screen-kit";
import { headerOutline, outlineSm } from "@/components/amplivanta/growth-kit";
import { ActButton } from "@/components/amplivanta/growth-ui";
import { FormDialog } from "@/components/amplivanta/creative-ui";
import { addMarketingDomain, checkDomainRecords, removeMarketingDomain, suppressContacts } from "@/app/(app)/app/marketing/actions";
import { daysAgo, marketingContext, pct } from "@/lib/server/marketing-screens";
import { emailProvider } from "@/lib/email";

export const metadata: Metadata = { title: "Email Deliverability" };
export const dynamic = "force-dynamic";

type Checks = { ownership?: boolean; spf?: string | null; dmarc?: string | null };

export default async function DeliverabilityPage() {
  const c = await marketingContext();
  let domains: { id: string; domain: string; isVerified: boolean; verificationToken: string | null; authChecks: unknown; lastCheckedAt: Date | null; createdAt: Date }[] = [];
  let suppressed: { reason: string; n: number }[] = [];
  let sends = { total: 0, sent: 0, suppressed: 0, failed: 0 };
  if (c) {
    try {
      const w = c.workspaceId;
      const since = daysAgo(30);
      const scope = { emailCampaign: { workspaceId: w }, createdAt: { gte: since } };
      const [d, s, total, sent, sup, failed] = await Promise.all([
        db.domain.findMany({ where: { workspaceId: w, purpose: "sending" }, orderBy: { createdAt: "desc" }, select: { id: true, domain: true, isVerified: true, verificationToken: true, authChecks: true, lastCheckedAt: true, createdAt: true } }),
        db.$queryRaw<{ reason: string; n: bigint }[]>`SELECT s.reason, COUNT(DISTINCT s.email) AS n FROM "SuppressionEntry" s JOIN "Contact" c ON LOWER(c.email) = s.email WHERE c."workspaceId" = ${w} GROUP BY s.reason`,
        db.emailSend.count({ where: scope }),
        db.emailSend.count({ where: { ...scope, status: "sent" } }),
        db.emailSend.count({ where: { ...scope, status: "suppressed" } }),
        db.emailSend.count({ where: { ...scope, status: { in: ["failed", "not_sent"] } } }),
      ]);
      domains = d;
      suppressed = s.map((x) => ({ reason: x.reason, n: Number(x.n) }));
      sends = { total, sent, suppressed: sup, failed };
    } catch {
      domains = [];
    }
  }
  const isAdmin = Boolean(c?.isAdmin);
  const provider = emailProvider();
  const add = (cls: string) => <FormDialog title="Add Sender Domain" label="+ Add Sender Domain" className={cls} action={addMarketingDomain} disabled={!isAdmin} submitLabel="Add domain" note="Only workspace admins can add domains. You'll get a TXT record to prove ownership." fields={[{ name: "domain", label: "Domain", kind: "text", required: true, placeholder: "mail.example.com" }, { name: "purpose", kind: "hidden", value: "sending" }]} />;
  const totalSuppressed = suppressed.reduce((n, s) => n + s.n, 0);
  const bounces = suppressed.filter((s) => s.reason === "bounce").reduce((n, s) => n + s.n, 0);
  const complaints = suppressed.filter((s) => s.reason === "complaint").reduce((n, s) => n + s.n, 0);

  return (
    <div className="mx-auto max-w-[1600px]">
      <ScreenHeader
        crumbs={[["Home", "/app"], ["Marketing Automation", "/app/marketing"], ["Email Deliverability"]]}
        title="Email Deliverability"
        subtitle="Configure sender authentication and review deliverability diagnostics when email sending is enabled."
        actions={<a href="#guide" className={headerOutline}>Review Setup Guide</a>}
      />
      {!provider && <p className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-2.5 text-[13px] text-amber-900">Email sending is not configured on this server, so bounce, complaint and reputation data cannot be collected yet.</p>}
      <div className="mb-4 grid grid-cols-1 gap-4 xl:grid-cols-2">
        <Panel title="Sender Domains" subtitle="Manage the domains you'll use to send email." action={domains.length ? add(outlineSm) : undefined}>
          {domains.length ? (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[560px] text-left text-[12.5px]">
                <thead><tr className="border-b border-line bg-bg-soft/70 text-deep-navy">{["Domain", "Status", "Authentication", "Added On", ""].map((h) => <th key={h} className="px-3 py-2.5 font-semibold">{h}</th>)}</tr></thead>
                <tbody>
                  {domains.map((d) => {
                    const a = (d.authChecks ?? {}) as Checks;
                    return (
                      <tr key={d.id} className="border-b border-line last:border-0">
                        <td className="px-3 py-2.5 font-semibold text-deep-navy">{d.domain}</td>
                        <td className="px-3 py-2.5"><Pill tone={d.isVerified ? "green" : "amber"}>{d.isVerified ? "Verified" : "Pending"}</Pill></td>
                        <td className="px-3 py-2.5 text-ink-soft">{d.lastCheckedAt ? `SPF ${a.spf ? "✓" : "✗"} · DMARC ${a.dmarc ? "✓" : "✗"}` : "Not checked"}</td>
                        <td className="px-3 py-2.5 text-ink-soft">{fmtDate(d.createdAt)}</td>
                        <td className="px-3 py-2.5">{isAdmin && <span className="flex gap-1.5"><ActButton action={checkDomainRecords.bind(null, d.id)}>Check DNS</ActButton><ActButton action={removeMarketingDomain.bind(null, d.id)} confirm="Remove this domain?">Remove</ActButton></span>}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState icon={Globe} title="No sender domains added" body="Add a sender domain to get started with email deliverability." action={add(outlineSm)} />
          )}
        </Panel>
        <Panel title="Authentication Records" subtitle="Set up SPF, DKIM, and DMARC to authenticate your domain.">
          {domains.length ? (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[560px] text-left text-[12px]">
                <thead><tr className="border-b border-line bg-bg-soft/70 text-deep-navy">{["Record Type", "Host / Name", "Value", "Status"].map((h) => <th key={h} className="px-3 py-2.5 font-semibold">{h}</th>)}</tr></thead>
                <tbody>
                  {domains.flatMap((d) => {
                    const a = (d.authChecks ?? {}) as Checks;
                    const checked = Boolean(d.lastCheckedAt);
                    return [
                      ["TXT (ownership)", `_amplivanta.${d.domain}`, d.verificationToken ?? "—", d.isVerified ? "Found" : checked ? "Missing" : "Not checked"],
                      ["TXT (SPF)", d.domain, a.spf ?? "v=spf1 include:<your provider> ~all", a.spf ? "Found" : checked ? "Missing" : "Not checked"],
                      ["TXT (DMARC)", `_dmarc.${d.domain}`, a.dmarc ?? `v=DMARC1; p=none; rua=mailto:dmarc@${d.domain}`, a.dmarc ? "Found" : checked ? "Missing" : "Not checked"],
                      ["CNAME (DKIM)", "Provided by your email provider", "Selector records from the sending provider", "Set up with provider"],
                    ].map(([t, host, value, status]) => (
                      <tr key={`${d.id}-${t}`} className="border-b border-line last:border-0">
                        <td className="px-3 py-2 font-semibold text-deep-navy">{t}</td>
                        <td className="break-all px-3 py-2 font-mono text-ink-soft">{host}</td>
                        <td className="break-all px-3 py-2 font-mono text-ink-soft">{value}</td>
                        <td className="px-3 py-2"><Pill tone={status === "Found" ? "green" : status === "Missing" ? "red" : "gray"}>{status}</Pill></td>
                      </tr>
                    ));
                  })}
                </tbody>
              </table>
              <p className="mt-2 text-[11.5px] text-ink-muted">Values shown for SPF and DMARC are the records found in DNS, or a starting point when none exist.</p>
            </div>
          ) : (
            <EmptyState icon={ShieldCheck} title="No authentication records configured" body="Add a sender domain, then check its DNS to see which authentication records are in place." />
          )}
        </Panel>
      </div>
      <div className="mb-4 grid grid-cols-1 gap-4 xl:grid-cols-3">
        <Panel title="Suppression Management" subtitle="Contacts who won't receive marketing email.">
          {totalSuppressed ? (
            <ul className="space-y-2 text-[13px]">
              {suppressed.map((s) => <li key={s.reason} className="flex justify-between"><span className="capitalize">{s.reason === "unsubscribe" ? "Unsubscribed" : s.reason}</span><b>{s.n}</b></li>)}
            </ul>
          ) : (
            <EmptyState icon={Users} title="No suppression data yet" body="Unsubscribes, hard bounces and complaints from your contacts will appear here." compact />
          )}
          <div className="mt-3 text-center">
            <FormDialog title="Manage Suppressions" label="Manage Suppressions" className={outlineSm} action={suppressContacts} disabled={!isAdmin} submitLabel="Suppress" note="Adds an unsubscribe for addresses that are contacts in this workspace. Suppressions can't be lifted here, because the recipient's own opt-out must be respected." fields={[{ name: "emails", label: "Email addresses", kind: "textarea", rows: 5, required: true, placeholder: "one@example.com, two@example.com" }]} />
          </div>
        </Panel>
        <Panel title="Bounce & Complaint Diagnostics" subtitle="Last 30 days of sends plus provider feedback.">
          {sends.total || bounces || complaints ? (
            <ul className="space-y-2 text-[13px]">
              <li className="flex justify-between"><span>Hard bounces (contacts)</span><b>{bounces}</b></li>
              <li className="flex justify-between"><span>Spam complaints (contacts)</span><b>{complaints}</b></li>
              <li className="flex justify-between"><span>Blocked by suppression</span><b>{sends.suppressed}</b></li>
              <li className="flex justify-between"><span>Not delivered</span><b>{sends.failed}</b></li>
            </ul>
          ) : (
            <EmptyState icon={MailWarning} title="No diagnostics available yet" body="Enable email sending to view bounce and complaint diagnostics." compact />
          )}
        </Panel>
        <Panel title="Sending Reputation" subtitle="Based on your last 30 days of sends.">
          {sends.total ? (
            <ul className="space-y-2 text-[13px]">
              <li className="flex justify-between"><span>Delivery rate</span><b>{pct(sends.sent, sends.total)}</b></li>
              <li className="flex justify-between"><span>Complaint share of contacts</span><b>{complaints}</b></li>
              <li className="text-[12px] text-ink-muted">Keep complaints under 0.1% and bounces under 2% of sends.</li>
            </ul>
          ) : (
            <EmptyState icon={Star} title="No reputation data yet" body="Reputation metrics will appear here once email sending is enabled." compact />
          )}
        </Panel>
      </div>
      <Panel title="Deliverability Guidance" subtitle="Follow best practices to improve your email deliverability." id="guide">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          {[
            [ShieldCheck, "Authenticate Your Domain", "Set up SPF, DKIM, and DMARC to build trust and protect your domain."],
            [Users, "Keep Your List Clean", "Remove inactive or invalid addresses to reduce bounces and complaints."],
            [Send, "Send Relevant Content", "Deliver valuable, relevant content that your audience wants to receive."],
            [BookOpen, "Monitor & Improve", "Continuously monitor performance and follow best practices to maintain a strong reputation."],
          ].map(([Icon, t, b]) => {
            const I = Icon as typeof ShieldCheck;
            return <div key={t as string} className="flex gap-3"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-royal-tint text-[#0B5CFF]"><I className="h-5 w-5" /></span><div><h3 className="text-[14px] font-semibold text-deep-navy">{t as string}</h3><p className="text-[12.5px] text-ink-soft">{b as string}</p></div></div>;
          })}
        </div>
      </Panel>
    </div>
  );
}
