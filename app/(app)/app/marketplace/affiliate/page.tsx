import type { Metadata } from "next";
import Link from "next/link";
import { Link2 } from "lucide-react";
import { MpCard, MpDenied, MpEmpty, MpHeader, MpNote } from "@/components/marketplace/ui";
import { MARKETPLACE_FLAGS } from "@/lib/marketplace/config";
import { getMarketplaceViewer, guardMarketplace } from "@/lib/server/marketplace-access";
import { prisma } from "@/lib/prisma";
import { SITE_URL } from "@/lib/constants";

export const metadata: Metadata = { title: "Affiliate Links" };

/**
 * Affiliate promotion for Marketplace products. Links carry the affiliate's
 * own code; attribution and commission are decided server-side at fulfilment,
 * against the rate configured for that affiliate.
 */
export default async function AffiliateLinksPage() {
  const viewer = await getMarketplaceViewer();
  const gate = guardMarketplace(viewer, { flag: MARKETPLACE_FLAGS.affiliatePromotion });
  if (!gate.ok) return <MpDenied denial={gate} />;

  let affiliate: { id: string; code: string; status: string; commissionRate: number } | null = null;
  let products: { slug: string; title: string }[] = [];
  let commissions: { id: string; amount: number; currency: string; status: string; createdAt: Date }[] = [];
  let reachable = true;
  try {
    affiliate = await prisma.affiliate.findFirst({
      where: viewer.userId ? { OR: [{ userId: viewer.userId }, { email: viewer.email ?? "__none__" }] } : { id: "__none__" },
      select: { id: true, code: true, status: true, commissionRate: true },
    });
    if (affiliate) {
      [products, commissions] = await Promise.all([
        prisma.marketplaceProduct.findMany({
          where: { status: "PUBLISHED" },
          orderBy: { publishedAt: "desc" },
          take: 50,
          select: { slug: true, title: true },
        }),
        prisma.commission.findMany({
          where: { affiliateId: affiliate.id },
          orderBy: { createdAt: "desc" },
          take: 25,
          select: { id: true, amount: true, currency: true, status: true, createdAt: true },
        }),
      ]);
    }
  } catch {
    reachable = false;
  }

  const header = (
    <MpHeader
      title="Affiliate Links"
      description="Share Marketplace products with your referral code."
      breadcrumb={[{ label: "Marketplace", href: "/app/marketplace" }, { label: "Affiliate Links" }]}
    />
  );

  if (!reachable) {
    return (
      <>
        {header}
        <MpCard>
          <MpEmpty icon={Link2} title="Affiliate links unavailable" description="The platform database could not be reached." />
        </MpCard>
      </>
    );
  }

  if (!affiliate || affiliate.status !== "APPROVED") {
    return (
      <>
        {header}
        <MpCard>
          <MpEmpty
            icon={Link2}
            title={affiliate ? "Your affiliate application is not approved yet" : "You are not an affiliate yet"}
            description={
              affiliate
                ? "Referral links appear here once your affiliate account is approved."
                : "The Affiliate Program is separate from selling on the Marketplace. Apply first, and your links appear here once approved."
            }
          />
        </MpCard>
        <MpNote title="Programs are separate">
          Partner Program, Affiliate Program and Marketplace selling are distinct. Being approved for one does
          not enroll you in another.
        </MpNote>
      </>
    );
  }

  return (
    <>
      {header}
      <MpCard className="mb-6 p-6">
        <div className="text-[13px] text-ink-soft">Your referral code</div>
        <div className="mt-1 text-[22px] font-extrabold text-deep-navy">{affiliate.code}</div>
        <p className="mt-2 text-[12.5px] text-ink-muted">
          Commission rate: {affiliate.commissionRate}% — set by the Affiliate Program, not by this page.
        </p>
      </MpCard>

      {products.length > 0 && (
        <MpCard className="mb-6">
          <div className="border-b border-line px-6 py-4 text-[15px] font-bold text-deep-navy">Published products</div>
          <div className="divide-y divide-line">
            {products.map((p) => {
              const url = `${SITE_URL}/marketplace/products/${p.slug}?ref=${encodeURIComponent(affiliate!.code)}`;
              return (
                <div key={p.slug} className="px-6 py-4">
                  <div className="text-[14px] font-semibold text-deep-navy">{p.title}</div>
                  <div className="mt-1 flex flex-wrap items-center gap-3">
                    <code className="break-all rounded-lg bg-bg-soft px-2 py-1 text-[12px] text-ink-soft">{url}</code>
                    <Link href={url} className="text-[12.5px] font-bold text-royal-blue hover:underline">Open</Link>
                  </div>
                </div>
              );
            })}
          </div>
        </MpCard>
      )}

      <MpCard>
        <div className="border-b border-line px-6 py-4 text-[15px] font-bold text-deep-navy">Your commissions</div>
        {commissions.length === 0 ? (
          <MpEmpty icon={Link2} title="No commissions yet" description="Commissions appear here after a referred purchase is paid." />
        ) : (
          <div className="divide-y divide-line">
            {commissions.map((c) => (
              <div key={c.id} className="flex items-center justify-between px-6 py-4">
                <div className="text-[13px] text-ink-soft">
                  {new Intl.DateTimeFormat("en-US", { dateStyle: "medium" }).format(c.createdAt)} · {c.status}
                </div>
                <span className="text-[14px] font-bold text-deep-navy">
                  {new Intl.NumberFormat("en-US", { style: "currency", currency: c.currency }).format(c.amount)}
                </span>
              </div>
            ))}
          </div>
        )}
      </MpCard>

      <MpNote title="How attribution works">
        A referral link sets a code in the visitor&apos;s browser for 30 days. The commission is recorded only
        when a referred order is actually paid, at the rate configured for your affiliate account.
      </MpNote>
    </>
  );
}
