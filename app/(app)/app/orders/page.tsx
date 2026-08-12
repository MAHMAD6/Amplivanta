import Link from "next/link";
import { Settings, CheckCircle2 } from "lucide-react";
import { AppHeader } from "@/components/app/AppHeader";
import { PlatformBadge } from "@/components/app/PlatformBadge";
import { ORDERS, type OrderStatus } from "@/lib/app-data";

const STATUS_DOT: Record<OrderStatus, string> = {
  active: "text-[#F5A623]",
  completed: "text-[#1FAE6A]",
  cancelled: "text-[#767287]",
  failed: "text-[#ef4444]",
};

export default function OrdersPage() {
  return (
    <div className="flex flex-col pb-6">
      <AppHeader title="My Orders" right={<Settings className="h-5 w-5 text-[#14121f]" />} />

      <div className="space-y-4 px-5 pt-2">
        {ORDERS.map((o) => (
          <Link
            key={o.id}
            href={`/app/orders/${o.id}`}
            className="block rounded-2xl border border-[#e9e7f0] bg-white p-4 shadow-[0_10px_28px_-18px_rgba(30,20,60,0.3)]"
          >
            <div className="flex items-start gap-3">
              <PlatformBadge platform={o.platform} />
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <h3 className="font-display text-sm font-extrabold text-[#14121f]">{o.service}</h3>
                  <span className={`text-sm font-bold capitalize ${STATUS_DOT[o.status]}`}>{o.status}</span>
                </div>
                <div className="mt-1.5 space-y-0.5 text-sm">
                  <div className="flex justify-between"><span className="text-[#767287]">Qty: {o.qty}</span><span className="font-bold text-[#14121f]">Amount: ${o.amount}</span></div>
                  <div className="flex justify-between"><span className="text-[#767287]">Order ID</span><span className="font-mono text-[#14121f]">#{o.id}</span></div>
                  <div className="flex justify-between"><span className="text-[#767287]">Date</span><span className="text-[#14121f]">{o.date}</span></div>
                </div>
              </div>
            </div>
            <div className="mt-3 flex items-center gap-3">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#1FAE6A] text-white">
                <CheckCircle2 className="h-5 w-5" />
              </span>
              <div className="flex-1">
                <div className="mb-1 text-xs font-bold text-[#14121f]">{o.progress}% <span className="font-normal text-[#767287]">Completed</span></div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#efe9fb]">
                  <div className="bg-grad-brand-2 h-full rounded-full" style={{ width: `${o.progress}%` }} />
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
