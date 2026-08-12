import { RefreshCw, CheckCircle2, XCircle, Clock, ImageIcon } from "lucide-react";
import { AppHeader } from "@/components/app/AppHeader";
import { PlatformBadge } from "@/components/app/PlatformBadge";
import { MY_TASKS, type TaskStatus } from "@/lib/app-data";

const STATUS: Record<TaskStatus, { bg: string; label: string; icon: typeof CheckCircle2; color: string }> = {
  completed: { bg: "bg-[#e8f7ee] border-[#c6ebd4]", label: "Completed", icon: CheckCircle2, color: "text-[#1FAE6A]" },
  pending: { bg: "bg-[#fdf3e4] border-[#f6e2c4]", label: "Pending", icon: Clock, color: "text-[#F5A623]" },
  declined: { bg: "bg-[#fdeaea] border-[#f6cccc]", label: "Declined", icon: XCircle, color: "text-[#ef4444]" },
};

export default function MyTasksPage() {
  return (
    <div className="flex flex-col pb-6">
      <AppHeader title="My Tasks" right={<RefreshCw className="h-5 w-5 text-[#14121f]" />} />

      <div className="space-y-4 px-5 pt-2">
        {MY_TASKS.map((t) => {
          const s = STATUS[t.status];
          const Icon = s.icon;
          return (
            <div key={t.id} className={`rounded-2xl border p-4 ${s.bg}`}>
              <div className="flex items-start gap-3">
                <PlatformBadge platform={t.platform} />
                <div className="flex-1">
                  <h3 className="font-display text-base font-extrabold leading-snug text-[#14121f]">{t.title}</h3>
                  <div className="mt-1.5 space-y-0.5 text-sm">
                    <div className="flex justify-between">
                      <span className="text-[#4a4756]">Reward</span>
                      <span className="font-bold text-[#6D3BF5]">${t.reward.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#4a4756]">Time/Date</span>
                      <span className="font-semibold text-[#14121f]">{t.date}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className={`flex items-center gap-1.5 font-semibold ${s.color}`}>
                        {s.label} <Icon className="h-4 w-4" />
                      </span>
                      <ImageIcon className="h-5 w-5 text-[#767287]" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
