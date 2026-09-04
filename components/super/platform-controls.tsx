"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, RefreshCw } from "lucide-react";
import { setFeatureFlag, setModuleStatus, syncPlatformRegistry } from "@/app/(super)/super/platform-actions";
import { cn } from "@/lib/utils";
import { SuperCard, SuperEmptyState } from "./primitives";
import { Database } from "lucide-react";

type Module = { key: string; name: string; description: string | null; status: string; isCore: boolean; scope: string };
type Flag = { key: string; name: string; description: string | null; enabled: boolean };

function Msg({ m }: { m: { ok: boolean; text: string } | null }) {
  if (!m) return null;
  return (
    <p
      role="status"
      className={cn(
        "mb-4 rounded-xl px-4 py-3 text-[12.5px] font-semibold",
        m.ok ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700",
      )}
    >
      {m.text}
    </p>
  );
}

function Toggle({ on, onChange, disabled, label }: { on: boolean; onChange: (v: boolean) => void; disabled?: boolean; label: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!on)}
      className={cn(
        "relative h-6 w-11 shrink-0 rounded-full transition disabled:cursor-not-allowed disabled:opacity-40",
        on ? "bg-emerald-500" : "bg-line",
      )}
    >
      <span className={cn("absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all", on ? "left-[22px]" : "left-0.5")} />
    </button>
  );
}

function RegistryButton({ onDone }: { onDone: (m: { ok: boolean; text: string }) => void }) {
  const [pending, start] = useTransition();
  const router = useRouter();
  return (
    <button
      type="button"
      disabled={pending}
      onClick={() =>
        start(async () => {
          const res = await syncPlatformRegistry();
          onDone(res.ok ? { ok: true, text: res.message } : { ok: false, text: res.error });
          if (res.ok) router.refresh();
        })
      }
      className="inline-flex h-11 items-center gap-2 rounded-xl border border-line bg-white px-4 text-[13.5px] font-bold text-admin-navy hover:bg-bg-soft disabled:opacity-60"
    >
      {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
      Register declared modules
    </button>
  );
}

export function ModuleControlsPanel({ modules, connected }: { modules: Module[]; connected: boolean }) {
  const [m, setM] = useState<{ ok: boolean; text: string } | null>(null);
  const [reason, setReason] = useState("");
  const [pending, start] = useTransition();
  const router = useRouter();

  if (!connected) {
    return (
      <SuperCard>
        <SuperEmptyState
          icon={Database}
          title="Data source unavailable"
          description="The platform database could not be reached, so module state cannot be shown or changed."
        />
      </SuperCard>
    );
  }

  return (
    <>
      <div className="mb-6 flex flex-wrap items-center justify-end gap-2.5">
        <RegistryButton onDone={setM} />
      </div>
      <Msg m={m} />

      <SuperCard className="mb-4 p-5">
        <label className="block">
          <span className="mb-1.5 block text-[12.5px] font-bold text-admin-navy">
            Reason for the next change <span className="text-orange-cta">(required)</span>
          </span>
          <input
            value={reason}
            onChange={(e) => setReason(e.currentTarget.value)}
            placeholder="Why is this module being switched?"
            className="h-12 w-full rounded-xl border border-line bg-white px-3.5 text-[13.5px] focus:border-royal-blue focus:outline-none"
          />
        </label>
      </SuperCard>

      {modules.length === 0 ? (
        <SuperCard>
          <SuperEmptyState
            icon={Database}
            title="No modules registered"
            description="Use Register declared modules to add every module declared in code. Newly registered modules start disabled."
          />
        </SuperCard>
      ) : (
        <SuperCard>
          <div className="divide-y divide-line">
            {modules.map((mod) => (
              <div key={mod.key} className="flex flex-wrap items-center justify-between gap-4 px-6 py-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[14px] font-bold text-admin-navy">{mod.name}</span>
                    {mod.isCore && (
                      <span className="rounded-md bg-bg-soft px-2 py-0.5 text-[10px] font-bold uppercase text-ink-muted">Core</span>
                    )}
                  </div>
                  {mod.description && <p className="mt-0.5 text-[12.5px] text-ink-soft">{mod.description}</p>}
                  <div className="mt-1 text-[11.5px] text-ink-muted">
                    {mod.status === "ENABLED" ? "Enabled" : "Disabled"} · scope {mod.scope.toLowerCase()}
                  </div>
                </div>
                <Toggle
                  label={`Toggle ${mod.name}`}
                  on={mod.status === "ENABLED"}
                  disabled={pending || (mod.isCore && mod.status === "ENABLED")}
                  onChange={(v) =>
                    start(async () => {
                      const res = await setModuleStatus(mod.key, v, reason);
                      setM(res.ok ? { ok: true, text: res.message } : { ok: false, text: res.error });
                      if (res.ok) {
                        setReason("");
                        router.refresh();
                      }
                    })
                  }
                />
              </div>
            ))}
          </div>
        </SuperCard>
      )}
    </>
  );
}

export function FeatureFlagsPanel({ flags, connected }: { flags: Flag[]; connected: boolean }) {
  const [m, setM] = useState<{ ok: boolean; text: string } | null>(null);
  const [pending, start] = useTransition();
  const router = useRouter();

  if (!connected) {
    return (
      <SuperCard>
        <SuperEmptyState
          icon={Database}
          title="Data source unavailable"
          description="The platform database could not be reached, so feature flags cannot be shown or changed."
        />
      </SuperCard>
    );
  }

  return (
    <>
      <div className="mb-6 flex flex-wrap items-center justify-end gap-2.5">
        <RegistryButton onDone={setM} />
      </div>
      <Msg m={m} />

      {flags.length === 0 ? (
        <SuperCard>
          <SuperEmptyState
            icon={Database}
            title="No feature flags registered"
            description="Use Register declared modules to add every flag declared in code. Newly registered flags start disabled."
          />
        </SuperCard>
      ) : (
        <SuperCard>
          <div className="divide-y divide-line">
            {flags.map((f) => (
              <div key={f.key} className="flex flex-wrap items-center justify-between gap-4 px-6 py-4">
                <div className="min-w-0">
                  <div className="text-[14px] font-bold text-admin-navy">{f.name}</div>
                  {f.description && <p className="mt-0.5 text-[12.5px] text-ink-soft">{f.description}</p>}
                  <code className="mt-1 block text-[11.5px] text-ink-muted">{f.key}</code>
                </div>
                <Toggle
                  label={`Toggle ${f.name}`}
                  on={f.enabled}
                  disabled={pending}
                  onChange={(v) =>
                    start(async () => {
                      const res = await setFeatureFlag(f.key, v);
                      setM(res.ok ? { ok: true, text: res.message } : { ok: false, text: res.error });
                      if (res.ok) router.refresh();
                    })
                  }
                />
              </div>
            ))}
          </div>
        </SuperCard>
      )}
    </>
  );
}
