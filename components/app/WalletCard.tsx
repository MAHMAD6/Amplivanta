import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function WalletCard({
  balance,
  pending,
  secondaryLabel = "Withdrawn",
  secondaryValue,
  href = "/app/withdraw",
}: {
  balance: number;
  pending: number;
  secondaryLabel?: string;
  secondaryValue: string;
  href?: string;
}) {
  const [dollars, cents] = balance.toFixed(2).split(".");
  return (
    <div className="bg-grad-cta relative overflow-hidden rounded-3xl px-5 py-5 text-white shadow-[0_18px_40px_-16px_rgba(109,59,245,0.55)]">
      <div className="pointer-events-none absolute -right-8 -top-10 h-32 w-32 rounded-full bg-white/15 blur-2xl" />
      <div className="flex items-start justify-between">
        <span className="text-sm font-bold">Available Balance</span>
        <span className="font-display text-3xl font-extrabold tracking-tight">
          ${dollars}
          <span className="text-lg">.{cents}</span>
        </span>
      </div>
      <div className="mt-4 space-y-1.5 text-[13px]">
        <div className="flex justify-between">
          <span className="text-white/85">Pending</span>
          <span className="font-bold text-[#FFE45C]">${pending.toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-white/85">{secondaryLabel}</span>
          <span className="font-semibold text-white/95">{secondaryValue}</span>
        </div>
      </div>
      <Link href={href} className="mt-3 flex items-center justify-between text-sm font-semibold">
        Withdraw now
        <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  );
}
