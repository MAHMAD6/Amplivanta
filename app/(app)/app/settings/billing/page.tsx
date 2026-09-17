import type { Metadata } from "next";
import Link from "next/link";
import { CalendarClock, CreditCard, Diamond, Gauge, Receipt } from "lucide-react";
import { db } from "@/lib/db";
import { SettingsHeader } from "@/components/amplivanta/settings-header";
import { UpgradeDialog } from "@/components/amplivanta/settings/upgrade-dialog";
import { DataTable, EmptyState, KeyList, Pill, StatGrid, fmtDate, fmtInt, fmtMoney } from "@/components/amplivanta/screen-kit";
import { settingsContext } from "@/lib/server/settings-screens";

export const metadata: Metadata = { title: "Billing & Subscription" };
export const dynamic = "force-dynamic";

export default async function BillingPage() {
  const c = await settingsContext();
  let data = null as null | {
    sub: { planName: string; price: number; status: string; periodEnd: Date; cancelAtPeriodEnd: boolean; stripeCustomerId: string | null; planId: string; features: string[] } | null;
    plans: { id: string; name: string; price: number; features: string[] }[];
    invoices: { id: string; amount: number; status: string; paidAt: Date; pdfUrl: string | null }[];
    wallet: { planCredits: number; purchasedCredits: number } | null;
    owner: string | null;
  };
  if (c) {
    try {
      const [sub, plans, invoices, wallet, owner] = await Promise.all([
        db.subscription.findFirst({ where: { workspaceId: c.workspaceId }, orderBy: { createdAt: "desc" }, include: { plan: true } }),
        db.plan.findMany({ orderBy: { price: "asc" } }),
        db.invoice.findMany({ where: { workspaceId: c.workspaceId }, orderBy: { paidAt: "desc" }, take: 24 }),
        db.creditWallet.findUnique({ where: { workspaceId: c.workspaceId } }),
        db.membership.findFirst({ where: { workspaceId: c.workspaceId, role: "OWNER" }, orderBy: { createdAt: "asc" }, include: { user: { select: { email: true } } } }),
      ]);
      data = {
        sub: sub
          ? { planName: sub.plan.name, price: sub.plan.price, status: sub.status, periodEnd: sub.currentPeriodEnd, cancelAtPeriodEnd: sub.cancelAtPeriodEnd, stripeCustomerId: sub.stripeCustomerId, planId: sub.planId, features: sub.plan.features }
          : null,
        plans: plans.map((p) => ({ id: p.id, name: p.name, price: p.price, features: p.features })),
        invoices: invoices.map((i) => ({ id: i.id, amount: i.amount, status: i.status, paidAt: i.paidAt, pdfUrl: i.pdfUrl })),
        wallet: wallet ? { planCredits: wallet.planCredits, purchasedCredits: wallet.purchasedCredits } : null,
        owner: owner?.user.email ?? null,
      };
    } catch {
      data = null;
    }
  }
  const sub = data?.sub;
  const credits = data?.wallet ? data.wallet.planCredits + data.wallet.purchasedCredits : null;

  return (
    <>
      <SettingsHeader title="Billing & Subscription" subtitle="Manage workspace plan, billing profile, payment details, and invoices." />
      <StatGrid
        stats={[
          { label: "Current Plan", icon: Diamond, value: sub?.planName ?? null },
          { label: "Renewal", icon: CalendarClock, value: sub ? fmtDate(sub.periodEnd) : null, hint: sub?.cancelAtPeriodEnd ? "Cancels at period end" : undefined },
          { label: "Usage", icon: Gauge, value: credits != null ? `${fmtInt(credits)} credits` : null, hint: credits != null ? "Available credit balance" : undefined },
          { label: "Billing Status", icon: CreditCard, value: sub ? sub.status.replace(/_/g, " ") : null },
        ]}
      />
      <div className="mb-5 grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_805px]">
        <section className="rounded-xl border border-line bg-white p-5">
          <h2 className="text-[17px] font-semibold text-deep-navy">Plan &amp; Subscription</h2>
          {sub ? (
            <div className="mt-4">
              <div className="flex flex-wrap items-baseline justify-between gap-3">
                <div className="text-[24px] font-bold text-deep-navy">{sub.planName}</div>
                <div className="text-[15px] text-ink-soft">{fmtMoney(sub.price)} / month</div>
              </div>
              <div className="mt-2 flex gap-2"><Pill tone={sub.status === "active" ? "green" : "amber"}>{sub.status.replace(/_/g, " ")}</Pill>{sub.cancelAtPeriodEnd && <Pill tone="red">Cancels {fmtDate(sub.periodEnd)}</Pill>}</div>
              {sub.features.length > 0 && <ul className="mt-4 grid grid-cols-1 gap-1.5 text-[13px] text-ink-soft md:grid-cols-2">{sub.features.map((f) => <li key={f}>• {f}</li>)}</ul>}
            </div>
          ) : (
            <EmptyState icon={Diamond} title="Plan information is not available yet" body="Current plan, renewal, entitlement, and usage information will appear when billing data is connected." />
          )}
          <Link href="/app/settings/billing/plans" className="mt-5 mr-2.5 inline-flex h-10 items-center rounded-md border border-line px-5 text-[13.5px] font-semibold text-deep-navy hover:bg-bg-soft">Compare Plans</Link>
          {c?.isAdmin && data && data.plans.length > 0 && (
            <UpgradeDialog plans={data.plans} currentPlanId={sub?.planId} trigger={<button type="button" className="mt-5 inline-flex h-10 items-center rounded-md bg-[#0B5CFF] px-5 text-[13.5px] font-semibold text-white">{sub ? "Change Plan" : "Choose a Plan"}</button>} />
          )}
        </section>
        <section className="rounded-xl border border-line bg-white p-5">
          <h2 className="text-[18px] font-semibold text-deep-navy">Billing Profile</h2>
          <KeyList
            rows={[
              ["Billing contact", data?.owner ?? "Not configured"],
              ["Payment method", sub?.stripeCustomerId ? "Managed in Stripe" : "Not available"],
              ["Credits", credits != null ? `${fmtInt(credits)} available` : "Not available"],
              ["Payment status", sub ? sub.status.replace(/_/g, " ") : "Not available"],
            ]}
          />
          <Link href="/app/usage-credits" className="mt-3 inline-flex h-10 items-center rounded-md border border-line px-12 text-[14px] font-semibold text-deep-navy hover:bg-bg-soft">Buy Credits</Link>
        </section>
      </div>
      <section className="rounded-xl border border-line bg-white p-5">
        <h2 className="mb-3 text-[17px] font-semibold text-deep-navy">Invoices</h2>
        <DataTable
          columns={["Invoice", "Date", "Amount", "Status", "Document"]}
          rows={(data?.invoices ?? []).map((i) => [
            i.id.slice(-8).toUpperCase(),
            fmtDate(i.paidAt),
            fmtMoney(i.amount) ?? "—",
            <Pill key="s" tone={i.status === "paid" ? "green" : i.status === "open" ? "amber" : "gray"}>{i.status}</Pill>,
            i.pdfUrl ? <a key="d" href={i.pdfUrl} target="_blank" rel="noopener noreferrer" className="text-[#0B5CFF] hover:underline">Download</a> : "—",
          ])}
          empty={<EmptyState icon={Receipt} compact title="No invoices available" body="Invoices and payment records will appear after billable activity exists." />}
        />
      </section>
    </>
  );
}
