import { Wallet, CheckCircle2, Loader, ShoppingBag } from "lucide-react";
import { AppHeader } from "@/components/app/AppHeader";
import { WalletCard } from "@/components/app/WalletCard";
import { PlatformBadge } from "@/components/app/PlatformBadge";
import { WALLET, RECENT_ACTIVITY } from "@/lib/app-data";

const STATS = [
  { icon: CheckCircle2, label: "Completed Tasks", value: WALLET.completedTasks, tile: "ic-green" },
  { icon: Loader, label: "Pending Tasks", value: WALLET.pendingTasks, tile: "ic-amber" },
  { icon: ShoppingBag, label: "Lifetime Earnings", value: `$${WALLET.lifetime.toFixed(2)}`, tile: "ic-violet" },
];

export default function EarningsPage() {
  return (
    <div className="flex flex-col gap-5 px-5 pb-8">
      <AppHeader title="My Earnings" right={<Wallet className="h-5 w-5 text-[#14121f]" />} />

      <WalletCard balance={WALLET.balance} pending={WALLET.pending} secondaryValue={`$${WALLET.withdrawn.toFixed(2)}`} />

      <div className="space-y-2.5">
        {STATS.map(({ icon: Icon, label, value, tile }) => (
          <div key={label} className="flex items-center gap-3 rounded-full bg-[#f8f7fb] px-3 py-2.5">
            <span className={`flex h-9 w-9 items-center justify-center rounded-full ${tile}`}>
              <Icon className="h-4 w-4 text-white" />
            </span>
            <span className="flex-1 text-sm font-semibold text-[#14121f]">{label}</span>
            <span className="font-bold text-[#14121f]">{value}</span>
          </div>
        ))}
      </div>

      <div>
        <h2 className="mb-3 font-display text-base font-extrabold text-[#14121f]">Recent Activity</h2>
        <div className="space-y-2.5">
          {RECENT_ACTIVITY.map((a) => (
            <div key={a.id} className="flex items-center gap-3 rounded-full bg-[#f8f7fb] px-3 py-2.5">
              <PlatformBadge platform={a.platform} size="sm" />
              <span className="flex-1 text-sm font-semibold text-[#14121f]">{a.label}</span>
              <span className="font-bold text-[#6D3BF5]">${a.amount.toFixed(2)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
