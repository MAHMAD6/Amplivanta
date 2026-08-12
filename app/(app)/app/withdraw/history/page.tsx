import { Settings, CheckCircle2, XCircle, Clock } from "lucide-react";
import { AppHeader } from "@/components/app/AppHeader";
import { WITHDRAWALS, type TaskStatus } from "@/lib/app-data";

const STATUS: Record<TaskStatus, { label: string; icon: typeof CheckCircle2; color: string }> = {
  completed: { label: "Completed", icon: CheckCircle2, color: "text-[#1FAE6A]" },
  pending: { label: "Pending", icon: Clock, color: "text-[#F5A623]" },
  declined: { label: "Declined", icon: XCircle, color: "text-[#ef4444]" },
};

export default function WithdrawHistoryPage() {
  return (
    <div className="flex flex-col pb-6">
      <AppHeader title="Withdraw History" back="/app/withdraw" right={<Settings className="h-5 w-5 text-[#14121f]" />} />

      <div className="space-y-4 px-5 pt-2">
        {WITHDRAWALS.map((w) => {
          const s = STATUS[w.status];
          const Icon = s.icon;
          return (
            <div key={w.id} className="rounded-2xl border border-[#e9e7f0] bg-white p-4 shadow-[0_10px_28px_-18px_rgba(30,20,60,0.3)]">
              <div className="flex items-center justify-between">
                <span className="font-display text-lg font-extrabold text-[#1FAE6A]">${w.amount.toFixed(2)}</span>
                <span className={`flex items-center gap-1.5 font-bold ${s.color}`}>
                  <Icon className="h-5 w-5" /> {s.label}
                </span>
              </div>
              <div className="mt-3 space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="font-bold text-[#14121f]">Time/Date</span>
                  <span className="text-[#4a4756]">{w.date} · {w.time}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-bold text-[#14121f]">{w.method}</span>
                  <span className="text-[#4a4756]">{w.ref}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
