import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CheckCircle2, FileText, Mail, LifeBuoy } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { MpButton, MpCard, MpEmpty, MpHeader } from "@/components/marketplace/ui";
import { getMarketplaceViewer } from "@/lib/server/marketplace-access";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = { title: "Purchase Confirmation" };

const money = (c: number, cur: string) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: cur }).format(c / 100);

const NEXT_STEPS: [LucideIcon, string, string][] = [
  [FileText, "Access", "Purchased files appear in My Purchases when the related entitlement is active."],
  [Mail, "Email", "A confirmation email is sent when the email notification workflow is configured and succeeds."],
  [LifeBuoy, "Support", "Use the Help Center or the order support flow if you need assistance."],
];

export default async function PurchaseConfirmationPage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const viewer = await getMarketplaceViewer();
  const { orderId } = await params;

  // Buyer order-ownership check is mandatory before showing any order.
  let order:
    | { id: string; status: string; placedAt: Date | null; totalCents: number; currency: string; paymentProvider: string | null }
    | null = null;
  let reachable = true;
  try {
    order = viewer.userId
      ? await prisma.marketplaceOrder.findFirst({
          where: { id: orderId, buyerUserId: viewer.userId },
          select: { id: true, status: true, placedAt: true, totalCents: true, currency: true, paymentProvider: true },
        })
      : null;
  } catch {
    reachable = false;
  }
  if (reachable && !order) notFound();

  const details: [string, string][] = order
    ? [
        ["Order ID", order.id],
        ["Date", order.placedAt ? new Intl.DateTimeFormat("en-US", { dateStyle: "medium" }).format(order.placedAt) : "Not recorded"],
        ["Payment Method", order.paymentProvider ?? (order.totalCents === 0 ? "No payment required" : "Not recorded")],
        ["Total", money(order.totalCents, order.currency)],
      ]
    : [];

  return (
    <>
      <MpHeader
        title="Purchase Confirmation"
        description="Order status and access are shown from the completed Marketplace transaction."
        breadcrumb={[
          { label: "Marketplace", href: "/app/marketplace" },
          { label: "My Purchases", href: "/app/marketplace/purchases" },
          { label: "Confirmation" },
        ]}
      />

      {!order ? (
        <MpCard>
          <MpEmpty
            icon={CheckCircle2}
            title="Confirmation unavailable"
            description="The platform database could not be reached, so this confirmation cannot be shown right now."
          />
        </MpCard>
      ) : (
        <MpCard className="px-6 py-10 sm:px-10">
          <div className="text-center">
            <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50">
              <CheckCircle2 className="h-6 w-6 text-emerald-600" />
            </span>
            <h2 className="mt-4 text-[22px] font-extrabold text-deep-navy">Thank you for your purchase</h2>
            <p className="mt-1 text-[13.5px] text-ink-soft">
              Your order has been received. Status: {order.status.toLowerCase().replace(/_/g, " ")}.
            </p>
          </div>

          <div className="mx-auto mt-8 max-w-[680px] rounded-2xl border border-line p-5">
            <div className="text-[13.5px] font-bold text-deep-navy">Order Details</div>
            <dl className="mt-4 grid grid-cols-1 gap-x-8 gap-y-3 sm:grid-cols-2">
              {details.map(([k, v]) => (
                <div key={k} className="flex items-center justify-between gap-4 text-[12.5px]">
                  <dt className="text-ink-muted">{k}</dt>
                  <dd className="m-0 truncate font-semibold text-deep-navy">{v}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="mx-auto mt-6 max-w-[680px]">
            <div className="text-[13.5px] font-bold text-deep-navy">What happens next</div>
            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
              {NEXT_STEPS.map(([Icon, title, body]) => (
                <div key={title} className="rounded-2xl border border-line p-4">
                  <Icon className="h-4 w-4 text-royal-blue" />
                  <div className="mt-2 text-[13px] font-bold text-deep-navy">{title}</div>
                  <p className="mt-1 text-[11.5px] leading-relaxed text-ink-soft">{body}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <MpButton href={`/app/marketplace/purchases/${order.id}`} variant="primary">Go to My Purchases</MpButton>
            <MpButton href="/app/marketplace/products">Continue Shopping</MpButton>
          </div>
        </MpCard>
      )}
    </>
  );
}
