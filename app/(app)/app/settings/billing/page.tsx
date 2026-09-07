import type { Metadata } from "next";
import Link from "next/link";
import { Download } from "lucide-react";
import { StatusPill } from "@/components/amplivanta/status-pill";
import { UpgradeDialog } from "@/components/amplivanta/settings/upgrade-dialog";
import { LiveBadge } from "@/components/amplivanta/live-badge";
import { BILLING, INVOICES, INVOICE_TONE } from "@/lib/settings-data";
import { loadBilling } from "@/lib/server/loaders";

export const metadata: Metadata = { title: "Billing & Subscription" };
export const dynamic = "force-dynamic";

function fmtDate(d: Date) {
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default async function BillingPage() {
  const billing = await loadBilling();
  const planName = billing.planName ?? BILLING.plan;
  const renewal = billing.renewal ? fmtDate(billing.renewal) : BILLING.nextRenewal;
  const liveInvoices = billing.invoices.length > 0;

  return (
    <div className="space-y-5">
      {billing.live && <LiveBadge label={`Live · plan "${planName}" from database`} />}
      <div className="rounded-2xl border border-violet/25 bg-gradient-to-br from-violet/[0.04] to-orange-brand/[0.04] p-5 shadow-card">
        <div className="mb-3 flex items-start justify-between">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-violet">Current Plan</div>
            <div className="mt-1 flex items-baseline gap-2">
              <div className="text-2xl font-extrabold text-ink">{planName}</div>
              <StatusPill tone="green">{BILLING.billingCycle}</StatusPill>
            </div>
            <div className="mt-1 text-[12px] text-ink-muted">Renews {renewal}</div>
          </div>
          <div className="flex gap-2">
            <Link href="/pricing" className="rounded-xl border border-line bg-white px-4 py-2 text-[13px] font-semibold text-ink">Compare plans</Link>
            {billing.plans.length > 0 ? (
              <UpgradeDialog
                plans={billing.plans}
                currentPlanId={billing.currentPlanId ?? undefined}
                trigger={<button className="rounded-xl bg-grad-cta px-4 py-2 text-[13px] font-bold text-white shadow-violet">Upgrade</button>}
              />
            ) : (
              <Link href="/pricing" className="rounded-xl bg-grad-cta px-4 py-2 text-[13px] font-bold text-white shadow-violet">Upgrade</Link>
            )}
          </div>
        </div>
        <div className="grid gap-4 border-t border-line pt-4 sm:grid-cols-3">
          <div><div className="text-[10.5px] text-ink-muted">Seats</div><div className="text-[15px] font-bold text-ink">{BILLING.seatsUsed} / {BILLING.seatsIncluded}</div></div>
          <div><div className="text-[10.5px] text-ink-muted">Payment method</div><div className="text-[13px] font-bold text-ink">{BILLING.paymentMethod}</div></div>
          <div><div className="text-[10.5px] text-ink-muted">Billing contact</div><div className="text-[13px] font-bold text-ink">{BILLING.billingContact}</div></div>
        </div>
      </div>

      <div className="rounded-2xl border border-line bg-white p-5 shadow-card">
        <div className="mb-4 text-[14px] font-bold text-ink">Usage This Month</div>
        <div className="space-y-3">
          {BILLING.usage.map((u) => {
            const pct = Math.round((u.used / u.limit) * 100);
            return (
              <div key={u.label}>
                <div className="mb-1 flex justify-between text-[12px]">
                  <span className="text-ink-soft">{u.label}</span>
                  <span className="font-bold text-ink">{u.used.toLocaleString()}{u.unit ? " " + u.unit : ""} / {u.limit.toLocaleString()}{u.unit ? " " + u.unit : ""}</span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-bg-soft">
                  <div className={`h-full rounded-full ${pct > 85 ? "bg-amber-500" : "bg-grad-brand"}`} style={{ width: `${pct}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="rounded-2xl border border-line bg-white p-5 shadow-card">
        <div className="mb-3 flex items-center justify-between">
          <div className="text-[14px] font-bold text-ink">Payment Method</div>
          <button className="text-[12px] font-semibold text-violet">+ Add card</button>
        </div>
        <div className="flex items-center gap-3 rounded-xl border border-line p-3">
          <div className="flex h-10 w-14 items-center justify-center rounded-lg bg-blue-500 text-[11px] font-bold text-white">VISA</div>
          <div className="min-w-0 flex-1">
            <div className="text-[13px] font-semibold text-ink">Visa ending 6411</div>
            <div className="text-[11px] text-ink-muted">Expires 08/2028 · Default</div>
          </div>
          <button className="rounded-lg border border-line px-3 py-1.5 text-[12px] font-semibold text-ink">Edit</button>
        </div>
      </div>

      <div className="rounded-2xl border border-line bg-white shadow-card">
        <div className="border-b border-line p-4"><div className="text-[14px] font-bold text-ink">Invoices</div></div>
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-line bg-bg-soft/40 text-[11px] font-bold uppercase tracking-wider text-ink-muted">
              <th className="px-4 py-3">Invoice</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3 text-right">Amount</th>
              <th className="px-4 py-3">Status</th>
              <th className="w-10 px-2 py-3" />
            </tr>
          </thead>
          <tbody>
            {liveInvoices
              ? billing.invoices.map((i) => {
                  const label = i.status.charAt(0).toUpperCase() + i.status.slice(1);
                  return (
                    <tr key={i.id} className="border-b border-line last:border-0">
                      <td className="px-4 py-3 font-mono text-[12.5px] font-semibold text-ink">{i.id.slice(0, 10)}</td>
                      <td className="px-4 py-3 text-[12px] text-ink-soft">{fmtDate(i.createdAt)}</td>
                      <td className="px-4 py-3 text-right text-[13px] font-bold text-ink">${i.amount.toLocaleString()}</td>
                      <td className="px-4 py-3"><StatusPill tone={INVOICE_TONE[label as keyof typeof INVOICE_TONE] ?? "gray"}>{label}</StatusPill></td>
                      <td className="px-2 py-3 text-right"><button className="rounded-lg p-1 text-ink-muted hover:bg-bg-soft"><Download className="h-3.5 w-3.5" /></button></td>
                    </tr>
                  );
                })
              : INVOICES.map((i) => (
                  <tr key={i.id} className="border-b border-line last:border-0">
                    <td className="px-4 py-3 font-mono text-[12.5px] font-semibold text-ink">{i.id}</td>
                    <td className="px-4 py-3 text-[12px] text-ink-soft">{i.date}</td>
                    <td className="px-4 py-3 text-right text-[13px] font-bold text-ink">${i.amount.toLocaleString()}</td>
                    <td className="px-4 py-3"><StatusPill tone={INVOICE_TONE[i.status as keyof typeof INVOICE_TONE]}>{i.status}</StatusPill></td>
                    <td className="px-2 py-3 text-right"><button className="rounded-lg p-1 text-ink-muted hover:bg-bg-soft"><Download className="h-3.5 w-3.5" /></button></td>
                  </tr>
                ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
