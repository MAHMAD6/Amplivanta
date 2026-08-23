"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { api } from "@/lib/client/api";

/** Checkbox that toggles a task between done / open, persisting via PATCH. */
export function TaskToggle({ id, done, live }: { id: string; done: boolean; live?: boolean }) {
  const router = useRouter();
  const [checked, setChecked] = useState(done);
  const [pending, startTransition] = useTransition();

  async function onChange(next: boolean) {
    if (!live) {
      // Sample data — reflect visually but nothing to persist.
      setChecked(next);
      return;
    }
    setChecked(next);
    try {
      await api.patch(`/api/tasks/${id}`, { status: next ? "done" : "open" });
      toast.success(next ? "Task completed" : "Task reopened");
      startTransition(() => router.refresh());
    } catch (err) {
      setChecked(!next);
      toast.error(err instanceof Error ? err.message : "Update failed");
    }
  }

  return (
    <input
      type="checkbox"
      checked={checked}
      disabled={pending}
      onChange={(e) => onChange(e.target.checked)}
      className="mt-0.5 h-4 w-4 rounded border-line accent-violet"
    />
  );
}
