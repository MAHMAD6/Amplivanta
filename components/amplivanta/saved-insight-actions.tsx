"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "@/lib/toast";

/** Moves a saved insight between saved, ready-for-action and archived. */
export function SavedInsightActions({ id, status }: { id: string; status: string }) {
  const router = useRouter();
  const [pending, start] = useTransition();

  const set = (next: string, message: string) =>
    start(async () => {
      try {
        const res = await fetch(`/api/recommendations/${id}`, {
          method: "PATCH",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ status: next }),
        });
        if (!res.ok) throw new Error("Could not update this insight.");
        toast.success(message);
        router.refresh();
      } catch (e) {
        toast.error((e as Error).message);
      }
    });

  const btn = "rounded-md border border-line px-2 py-1 text-[11.5px] font-semibold text-deep-navy hover:bg-bg-soft disabled:opacity-50";
  return (
    <div className="flex flex-wrap gap-1.5">
      {status !== "ready" && status !== "archived" && (
        <button type="button" disabled={pending} className={btn} onClick={() => set("ready", "Marked ready for action")}>Ready</button>
      )}
      {status !== "archived" ? (
        <button type="button" disabled={pending} className={btn} onClick={() => set("archived", "Insight archived")}>Archive</button>
      ) : (
        <button type="button" disabled={pending} className={btn} onClick={() => set("saved", "Insight restored")}>Restore</button>
      )}
    </div>
  );
}
