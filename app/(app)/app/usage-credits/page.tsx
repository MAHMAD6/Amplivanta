import type { Metadata } from "next";
import { Coins, Receipt } from "lucide-react";
import { MpButton, MpCard, MpEmpty, MpHeader, MpNote, MpStat } from "@/components/marketplace/ui";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = { title: "Usage & Credits" };

const money = (cents: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(cents / 100);

export default async function UsageCreditsPage() {
  const session = await auth();
  const user = session?.user as { id?: string } | undefined;

  let data: { grants: { id: string; type: string; value: string; reason: string; when: string }[]; aiCalls: number } | null = null;
  try {
    const [grants, aiCalls] = await Promise.all([
      user?.id
        ? prisma.creditAdjustment.findMany({
            where: { userId: user.id },
            orderBy: { createdAt: "desc" },
            take: 50,
          })
        : Promise.resolve([]),
      prisma.aiUsage.count(),
    ]);
    data = {
      aiCalls,
      grants: grants.map((g) => ({
        id: g.id,
        type: g.grantType.replace(/_/g, " ").toLowerCase(),
        value: g.amount != null ? money(Math.round(g.amount * 100)) : g.days != null ? `${g.days} days` : "—",
        reason: g.reason,
        when: new Intl.DateTimeFormat("en-US", { dateStyle: "medium" }).format(g.createdAt),
      })),
    };
  } catch {
    data = null;
  }

  return (
    <>
      <MpHeader
        title="Usage & Credits"
        description="Your plan usage, AI credits and any credits granted to your account."
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <MpStat label="AI credit balance" value={null} hint="No balance source connected" />
        <MpStat label="Recorded AI usage events" value={data ? data.aiCalls.toLocaleString("en-US") : null} />
        <MpStat label="Credits granted to you" value={data ? String(data.grants.length) : null} />
      </div>

      <MpCard className="mt-6">
        <div className="border-b border-line px-6 py-4 text-[15px] font-bold text-deep-navy">Credit history</div>
        {data && data.grants.length > 0 ? (
          <div className="divide-y divide-line">
            {data.grants.map((g) => (
              <div key={g.id} className="flex flex-wrap items-center justify-between gap-4 px-6 py-4">
                <div>
                  <div className="text-[14px] font-semibold capitalize text-deep-navy">{g.type}</div>
                  <div className="text-[12px] text-ink-muted">
                    {g.reason} · {g.when}
                  </div>
                </div>
                <span className="text-[14px] font-bold text-deep-navy">{g.value}</span>
              </div>
            ))}
          </div>
        ) : (
          <MpEmpty
            icon={Coins}
            title={data === null ? "Usage unavailable" : "No credits granted yet"}
            description={
              data === null
                ? "The platform database could not be reached, so your usage and credits cannot be shown right now."
                : "Access extensions and usage or billing credits granted to your account appear here."
            }
            action={<MpButton href="/app/settings/billing" icon={Receipt}>Billing & plans</MpButton>}
          />
        )}
      </MpCard>

      <MpNote title="About your balance">
        An AI credit balance appears here once a metered credit source is connected. Until then the
        balance stays unavailable rather than showing an estimated figure.
      </MpNote>
    </>
  );
}
