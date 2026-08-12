import { Settings, CheckCircle2, Zap, Loader, FileText, LifeBuoy, Star } from "lucide-react";
import { AppHeader } from "@/components/app/AppHeader";
import { PlatformBadge } from "@/components/app/PlatformBadge";
import { ORDERS, PLATFORM_META } from "@/lib/app-data";

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const order = ORDERS.find((o) => o.id === id) ?? ORDERS[0];
  const meta = PLATFORM_META[order.platform];

  const timeline = [
    { icon: CheckCircle2, tile: "ic-green", label: "Order Placed", meta: `${order.date} · 10:15 AM` },
    { icon: Zap, tile: "ic-amber", label: "Processing Started", meta: `${order.date} · 10:30 AM` },
    { icon: Loader, tile: "ic-violet", label: "In Progress", meta: `${order.progress}% complete` },
  ];

  return (
    <div className="flex flex-col gap-5 px-5 pb-8">
      <AppHeader title="Order Detail" back="/app/orders" right={<Settings className="h-5 w-5 text-[#14121f]" />} />

      {/* summary */}
      <div className="rounded-2xl border border-[#e9e7f0] bg-white p-4 shadow-sm">
        <div className="flex items-start gap-3">
          <PlatformBadge platform={order.platform} size="lg" />
          <div className="flex-1 text-right">
            <p className="font-display text-base font-extrabold text-[#14121f]">{meta.label}</p>
            <p className="text-sm text-[#767287]">{order.service}</p>
          </div>
        </div>
        <div className="mt-3 space-y-1 text-sm">
          <div className="flex justify-between"><span className="text-[#767287]">Status</span><span className="font-bold capitalize text-[#F5A623]">{order.status}</span></div>
          <div className="flex justify-between"><span className="text-[#767287]">Qty: {order.qty}</span><span className="font-bold text-[#14121f]">Amount: ${order.amount}</span></div>
          <div className="flex justify-between"><span className="text-[#767287]">Order ID</span><span className="font-mono text-[#14121f]">#{order.id}</span></div>
          <div className="flex justify-between"><span className="text-[#767287]">Date</span><span className="text-[#14121f]">{order.date}</span></div>
        </div>
        <div className="mt-3 flex items-center gap-3">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#1FAE6A] text-white"><CheckCircle2 className="h-5 w-5" /></span>
          <div className="flex-1">
            <div className="mb-1 text-xs font-bold text-[#14121f]">{order.progress}% <span className="font-normal text-[#767287]">Completed</span></div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#efe9fb]"><div className="bg-grad-brand-2 h-full rounded-full" style={{ width: `${order.progress}%` }} /></div>
          </div>
        </div>
      </div>

      {/* timeline */}
      <div className="space-y-3 rounded-2xl border border-[#e9e7f0] bg-white p-4 shadow-sm">
        {timeline.map((t) => (
          <div key={t.label} className="flex items-center gap-3">
            <span className={`flex h-8 w-8 items-center justify-center rounded-full ${t.tile}`}><t.icon className="h-4 w-4 text-white" /></span>
            <span className="flex-1 text-sm font-bold text-[#14121f]">{t.label}</span>
            <span className="text-xs text-[#767287]">{t.meta}</span>
          </div>
        ))}
      </div>

      {/* link */}
      <div>
        <p className="mb-2 text-sm font-bold text-[#14121f]">Link</p>
        <input readOnly value={`www.${order.platform}.com`} className="w-full rounded-xl border border-[#e9e7f0] bg-white px-4 py-3 text-sm text-[#14121f]" />
      </div>

      <button className="bg-grad-brand-2 mx-auto w-44 rounded-xl py-3 text-sm font-bold text-white shadow-[0_8px_20px_-6px_rgba(109,59,245,0.5)]">Open Link</button>

      {/* actions */}
      <div className="divide-y divide-[#e9e7f0] rounded-2xl border border-[#e9e7f0] bg-white">
        {[
          { icon: FileText, label: "View Invoice" },
          { icon: LifeBuoy, label: "Contact Support" },
          { icon: Star, label: "Rate Us" },
        ].map(({ icon: Icon, label }) => (
          <button key={label} className="flex w-full items-center gap-3 px-4 py-3.5 text-left">
            <Icon className="h-5 w-5 text-[#6D3BF5]" />
            <span className="flex-1 text-sm font-semibold text-[#14121f]">{label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
