import { HelpCircle, ExternalLink, ImagePlus, Upload } from "lucide-react";
import { AppHeader } from "@/components/app/AppHeader";
import { PlatformBadge } from "@/components/app/PlatformBadge";
import { AVAILABLE_TASKS, PLATFORM_META } from "@/lib/app-data";

export default async function TaskDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const task = AVAILABLE_TASKS.find((t) => t.id === id) ?? AVAILABLE_TASKS[0];
  const meta = PLATFORM_META[task.platform];

  return (
    <div className="flex flex-col gap-5 px-5 pb-8">
      <AppHeader
        title={`${meta.label} Task`}
        back="/app/tasks"
        right={<HelpCircle className="h-5 w-5 text-[#14121f]" />}
      />

      {/* summary card */}
      <div className="flex items-center gap-4 rounded-2xl border border-[#e9e7f0] bg-white p-4 shadow-sm">
        <PlatformBadge platform={task.platform} size="lg" />
        <div className="flex-1">
          <h2 className="font-display text-base font-extrabold leading-snug text-[#14121f]">
            {task.action} on {meta.label}
          </h2>
          <div className="mt-1 flex justify-between text-sm">
            <span className="text-[#767287]">Earn</span>
            <span className="font-bold text-[#6D3BF5]">${task.earn.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-[#767287]">Time Estimate</span>
            <span className="font-bold text-[#E8398F]">{task.timeEstimate}</span>
          </div>
        </div>
      </div>

      {/* instructions */}
      <div className="rounded-2xl border border-[#e9e7f0] bg-[#f8f7fb] p-4 text-sm leading-relaxed text-[#767287]">
        Tap the button below to open the post/page.<br />
        Perform the action ({task.action.toLowerCase()}).<br />
        Take a screenshot as proof.
      </div>

      {/* open link */}
      <button className="bg-grad-brand-2 flex items-center justify-center gap-2 rounded-xl py-3.5 font-bold text-white shadow-[0_8px_20px_-6px_rgba(109,59,245,0.5)]">
        <ExternalLink className="h-4 w-4" /> Open Task Link
      </button>

      {/* upload proof */}
      <div className="flex items-center justify-between rounded-2xl border border-[#e9e7f0] bg-white p-4 shadow-sm">
        <div>
          <p className="font-display text-lg font-extrabold text-[#14121f]">Upload Proof</p>
          <p className="text-sm text-[#767287]">Tap to upload</p>
        </div>
        <span className="relative flex h-16 w-16 items-center justify-center rounded-xl border-2 border-[#14121f]">
          <ImagePlus className="h-7 w-7 text-[#14121f]" />
          <span className="bg-grad-brand-2 absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full text-white">
            <Upload className="h-3 w-3" />
          </span>
        </span>
      </div>

      <input
        placeholder="Add text"
        className="rounded-full border border-[#e9e7f0] bg-[#f8f7fb] px-4 py-3 text-center text-sm text-[#14121f] outline-none placeholder:text-[#a8a4b8]"
      />

      <button className="bg-grad-cta rounded-xl py-3.5 font-bold text-white shadow-[0_8px_20px_-6px_rgba(109,59,245,0.5)]">
        Submit for Review
      </button>
    </div>
  );
}
