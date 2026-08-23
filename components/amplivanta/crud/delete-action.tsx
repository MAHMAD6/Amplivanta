"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { api } from "@/lib/client/api";

interface DeleteActionProps {
  endpoint: string;
  label: string;
  /** What is being deleted, shown in the confirm copy (e.g. "Sophia Martinez"). */
  name: string;
  trigger: React.ReactNode;
  successMessage?: string;
}

/** Confirm dialog that DELETEs a resource then refreshes the server component. */
export function DeleteAction({ endpoint, label, name, trigger, successMessage }: DeleteActionProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function onConfirm() {
    setLoading(true);
    try {
      await api.del(endpoint);
      toast.success(successMessage ?? `${label} deleted`);
      setOpen(false);
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Delete failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Delete {label}?</DialogTitle>
          <DialogDescription>
            This permanently removes <span className="font-semibold text-ink">{name}</span>. This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="inline-flex h-10 items-center rounded-xl border border-line bg-white px-4 text-[13px] font-semibold text-ink-soft hover:border-ink/30"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="inline-flex h-10 items-center gap-1.5 rounded-xl bg-red-600 px-4 text-[13px] font-bold text-white hover:bg-red-700 disabled:opacity-60"
          >
            {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            Delete
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
