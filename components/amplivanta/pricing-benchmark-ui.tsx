"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toastResult } from "@/lib/action-toast";
import { deleteBenchmark, saveBenchmarkNotes } from "@/app/(app)/app/pricing-benchmark/actions";

export function BenchmarkNotesForm({ set, assumptions, disabled }: { set: string; assumptions: string; disabled?: boolean }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  return (
    <form
      className="mt-2"
      onSubmit={(e) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        start(async () => { if (toastResult(await saveBenchmarkNotes(fd))) router.refresh(); });
      }}
    >
      <label className="mb-2 block text-[15px] font-semibold text-deep-navy" htmlFor="bm-notes">Assumptions &amp; Notes</label>
      <input type="hidden" name="benchmarkSet" value={set} />
      <textarea id="bm-notes" name="assumptions" rows={7} maxLength={5000} defaultValue={assumptions} key={set} disabled={disabled} placeholder="No internal pricing notes yet." className="w-full rounded-md border border-line bg-white px-3 py-2.5 text-[13px] text-deep-navy placeholder:text-ink-muted focus:border-[#0B5CFF] focus:outline-none disabled:bg-bg-soft" />
      <button type="submit" disabled={pending || disabled} className="mt-4 inline-flex h-10 w-full items-center justify-center gap-2 rounded-md border border-line bg-white text-[13.5px] font-semibold text-deep-navy hover:bg-bg-soft disabled:bg-bg-soft disabled:text-ink-muted">
        {pending && <Loader2 className="h-4 w-4 animate-spin" />} Save Notes
      </button>
    </form>
  );
}

export function DeleteBenchmarkButton({ id, label }: { id: string; label: string }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => {
        if (!window.confirm(`Remove the benchmark "${label}"? The change is kept in the audit log.`)) return;
        start(async () => { if (toastResult(await deleteBenchmark(id))) router.refresh(); });
      }}
      className="text-[12px] font-semibold text-ink-soft hover:text-red-600 disabled:opacity-50"
    >
      Remove
    </button>
  );
}
