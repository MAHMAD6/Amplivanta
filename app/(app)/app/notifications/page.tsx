import { MoreVertical, CheckCircle2, Truck, ShoppingBag, Megaphone } from "lucide-react";
import { AppHeader } from "@/components/app/AppHeader";
import { NOTIFICATIONS, type AppNotification } from "@/lib/app-data";

const ICONS: Record<AppNotification["kind"], { icon: typeof CheckCircle2; tile: string }> = {
  task: { icon: CheckCircle2, tile: "ic-green" },
  withdraw: { icon: Truck, tile: "ic-blue" },
  order: { icon: ShoppingBag, tile: "ic-violet" },
  system: { icon: Megaphone, tile: "ic-amber" },
};

export default function NotificationsPage() {
  const groups = ["Recent", "Yesterday"] as const;
  return (
    <div className="flex flex-col pb-6">
      <AppHeader title="Notifications" right={<MoreVertical className="h-5 w-5 text-[#14121f]" />} />

      <div className="px-5 pt-2">
        {groups.map((g) => {
          const items = NOTIFICATIONS.filter((n) => n.group === g);
          if (!items.length) return null;
          return (
            <div key={g} className="mb-5">
              <h2 className="mb-2 font-display text-base font-extrabold text-[#14121f]">{g}</h2>
              <div className="divide-y divide-[#f2f0f7]">
                {items.map((n) => {
                  const { icon: Icon, tile } = ICONS[n.kind];
                  return (
                    <div key={n.id} className="flex items-center gap-3 py-3">
                      <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${tile}`}>
                        <Icon className="h-4 w-4 text-white" />
                      </span>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-[#14121f]">{n.title}</p>
                        <p className="text-xs text-[#767287]">{n.detail} · {n.time}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
