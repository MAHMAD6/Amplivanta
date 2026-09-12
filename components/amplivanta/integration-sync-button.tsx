"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, RefreshCw } from "lucide-react";
import { toast } from "@/lib/toast";

type SyncOutcome = { ok: boolean; provider: string; rows?: number; error?: string };

/**
 * Runs a provider's connectors and reports each outcome, including the reason
 * one could not run (missing developer token, no property id, expired
 * connection). Failures stay visible rather than looking like "no data".
 */
export function IntegrationSyncButton({ id, name }: { id: string; name: string }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [last, setLast] = useState<string | null>(null);

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        disabled={pending}
        className="inline-flex items-center gap-1.5 rounded-lg border border-line px-2 py-1 text-[10.5px] font-semibold text-ink-soft transition hover:bg-bg-soft disabled:opacity-50"
        onClick={() =>
          start(async () => {
            try {
              const res = await fetch(`/api/integrations/${id}/sync`, { method: "POST" });
              const data = (await res.json()) as { rows?: number; results?: SyncOutcome[]; error?: string };
              if (!res.ok) throw new Error(data.error ?? "Sync failed.");
              const failed = (data.results ?? []).filter((r) => !r.ok);
              if (failed.length > 0) {
                toast.warning(`${name}: ${data.rows ?? 0} rows synced`, { description: failed.map((f) => `${f.provider}: ${f.error}`).join(" · ") });
              } else {
                toast.success(`${name}: ${data.rows ?? 0} rows synced`);
              }
              setLast(failed.length > 0 ? failed[0].error ?? null : null);
              router.refresh();
            } catch (e) {
              toast.error(`${name} sync failed`, { description: (e as Error).message });
            }
          })
        }
      >
        {pending ? <Loader2 className="h-3 w-3 animate-spin" /> : <RefreshCw className="h-3 w-3" />} Sync
      </button>
      {last && <span className="max-w-[220px] text-right text-[10px] text-ink-muted">{last}</span>}
    </div>
  );
}
