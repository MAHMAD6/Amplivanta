import Link from "next/link";
import { Bell, CheckSquare, DollarSign, ShoppingBag, ArrowRight } from "lucide-react";
import { WalletCard } from "@/components/app/WalletCard";
import { PlatformBadge } from "@/components/app/PlatformBadge";
import { WALLET, USER, type Platform } from "@/lib/app-data";

const QUICK = [
  { icon: CheckSquare, label: "Tasks", href: "/app/tasks", tile: "ic-green" },
  { icon: DollarSign, label: "Earnings", href: "/app/earnings", tile: "ic-violet" },
  { icon: ShoppingBag, label: "Request Service", href: "/app/request", tile: "ic-amber" },
];

const TASK_TYPES: { platform: Platform; label: string }[] = [
  { platform: "youtube", label: "YouTube Tasks" },
  { platform: "facebook", label: "Facebook Tasks" },
  { platform: "tiktok", label: "TikTok Tasks" },
  { platform: "instagram", label: "Instagram Tasks" },
];

export default function AppHome() {
  return (
    <div className="flex flex-col gap-5 px-5 pb-8 pt-5">
      {/* header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="bg-grad-brand-2 flex h-10 w-10 items-center justify-center rounded-full font-display text-sm font-bold text-white">
            {USER.name.charAt(0)}
          </span>
          <div>
            <p className="font-display text-base font-extrabold text-[#14121f]">Welcome</p>
            <p className="text-xs text-[#767287]">{USER.name}</p>
          </div>
        </div>
        <Link href="/app/notifications" className="relative flex h-10 w-10 items-center justify-center rounded-full text-[#14121f] hover:bg-[#f8f7fb]">
          <Bell className="h-5 w-5" />
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-[#E8398F]" />
        </Link>
      </div>

      <WalletCard balance={WALLET.balance} pending={WALLET.pending} secondaryValue={`$${WALLET.withdrawn.toFixed(2)}`} />

      {/* quick actions */}
      <div className="grid grid-cols-3 gap-3">
        {QUICK.map(({ icon: Icon, label, href, tile }) => (
          <Link key={label} href={href} className="flex flex-col items-center gap-2">
            <span className={`flex h-16 w-full items-center justify-center rounded-2xl ${tile} shadow-sm`}>
              <Icon className="h-6 w-6 text-white" />
            </span>
            <span className="text-center text-xs font-bold text-[#14121f]">{label}</span>
          </Link>
        ))}
      </div>

      {/* available tasks header */}
      <div className="mt-1 flex items-center justify-between">
        <h2 className="font-display text-lg font-extrabold text-[#14121f]">Available Tasks</h2>
        <Link href="/app/tasks" className="flex items-center gap-1 text-sm font-bold text-[#6D3BF5]">
          View All <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      {/* task types */}
      <div className="grid grid-cols-2 gap-4">
        {TASK_TYPES.map(({ platform, label }) => (
          <Link
            key={label}
            href="/app/tasks"
            className="flex flex-col items-center gap-3 rounded-2xl border border-[#e9e7f0] bg-white p-5 transition hover:-translate-y-0.5 hover:shadow-[0_16px_34px_-18px_rgba(30,20,60,0.25)]"
          >
            <PlatformBadge platform={platform} size="lg" />
            <span className="text-sm font-bold text-[#14121f]">{label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
