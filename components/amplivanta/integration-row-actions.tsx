"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "@/lib/toast";
import { IntegrationSyncButton } from "@/components/amplivanta/integration-sync-button";

/** Connection controls shown only where the provider and state support them. */
export function IntegrationRowActions({
  id,
  provider,
  name,
  status,
  resources,
  selected,
  canSync,
}: {
  id: string;
  provider: string;
  name: string;
  status: string;
  resources: { id: string; label: string }[];
  selected: string | null;
  canSync: boolean;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const reconnect = `/api/integrations/oauth/${provider}/start?returnTo=${encodeURIComponent("/app/integrations/connected")}`;

  return (
    <div className="flex flex-wrap items-center justify-end gap-1.5">
      {resources.length > 1 && (
        <select
          aria-label={`${name} resource`}
          disabled={pending}
          defaultValue={selected ?? ""}
          onChange={(e) => {
            const resourceId = e.target.value;
            if (!resourceId) return;
            start(async () => {
              const res = await fetch(`/api/integrations/${id}/resource`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ resourceId }) });
              if (res.ok) {
                toast.success("Resource selected");
                router.refresh();
              } else toast.error("Could not select that resource.");
            });
          }}
          className="h-8 max-w-[180px] rounded-lg border border-line bg-white px-2 text-[12px] text-deep-navy"
        >
          <option value="">Choose…</option>
          {resources.map((r) => <option key={r.id} value={r.id}>{r.label}</option>)}
        </select>
      )}
      {canSync && status === "connected" && selected && <IntegrationSyncButton id={id} name={name} />}
      {(status === "reauth_required" || status === "error") && (
        <a href={reconnect} className="rounded-lg bg-[#0B5CFF] px-2.5 py-1 text-[11.5px] font-semibold text-white hover:bg-[#0A4FE0]">Reconnect</a>
      )}
      <button
        type="button"
        disabled={pending}
        onClick={() => {
          if (!window.confirm(`Disconnect ${name}? Stored access will be revoked and syncing stops.`)) return;
          start(async () => {
            const res = await fetch(`/api/integrations/${id}`, { method: "DELETE" });
            if (res.ok) {
              toast.success(`${name} disconnected`);
              router.refresh();
            } else toast.error("Could not disconnect.");
          });
        }}
        className="rounded-lg border border-line px-2.5 py-1 text-[11.5px] font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50"
      >
        {pending ? <Loader2 className="h-3 w-3 animate-spin" /> : "Disconnect"}
      </button>
    </div>
  );
}
