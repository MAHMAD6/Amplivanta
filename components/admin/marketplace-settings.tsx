"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { saveMarketplaceSetting } from "@/app/(admin)/admin/marketplace-actions";
import { cn } from "@/lib/utils";
import { SuperCard } from "./primitives";

const field =
  "h-12 w-full rounded-xl border border-line bg-white px-3.5 text-[13.5px] focus:border-royal-blue focus:outline-none";

type Settings = Record<string, unknown>;

function providerOf(v: unknown) {
  return (v as { provider?: string } | undefined)?.provider ?? "";
}

export function MarketplaceSettingsPanel({ settings, connected }: { settings: Settings; connected: boolean }) {
  const [m, setM] = useState<{ ok: boolean; text: string } | null>(null);
  const [pending, start] = useTransition();
  const router = useRouter();

  const save = (key: string, value: unknown, reason: string) =>
    start(async () => {
      const res = await saveMarketplaceSetting(key, value, reason);
      setM(res.ok ? { ok: true, text: res.message } : { ok: false, text: res.error });
      if (res.ok) router.refresh();
    });

  if (!connected) {
    return (
      <SuperCard className="px-6 py-8 text-[13.5px] text-ink-soft">
        The platform database could not be reached, so marketplace settings cannot be shown or changed.
      </SuperCard>
    );
  }

  const scanMode = (settings["security.malware_scanning"] as { mode?: string } | undefined)?.mode ?? "required";

  return (
    <>
      {m && (
        <p
          role="status"
          className={cn(
            "mb-4 rounded-xl px-4 py-3 text-[12.5px] font-semibold",
            m.ok ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700",
          )}
        >
          {m.text}
        </p>
      )}

      <SuperCard className="mb-6 p-6">
        <h2 className="text-[16px] font-bold text-admin-navy">Providers</h2>
        <p className="mt-1 text-[13px] text-ink-soft">
          Nothing is hard-coded. Until a provider id is set here, paid checkout, payouts and downloads
          stay blocked and say why.
        </p>
        <form
          className="mt-5 grid gap-4 md:grid-cols-2"
          onSubmit={(e) => {
            e.preventDefault();
            const fd = new FormData(e.currentTarget);
            const reason = String(fd.get("reason") ?? "");
            for (const key of ["payment.provider", "payout.provider", "storage.provider"]) {
              const id = String(fd.get(key) ?? "").trim();
              if (id !== providerOf(settings[key])) {
                save(key, id ? { provider: id, config: {} } : {}, reason);
              }
            }
          }}
        >
          {(
            [
              ["payment.provider", "Payment provider"],
              ["payout.provider", "Payout provider"],
              ["storage.provider", "File storage provider"],
            ] as const
          ).map(([key, label]) => (
            <label key={key} className="block">
              <span className="mb-1.5 block text-[12.5px] font-bold text-admin-navy">{label}</span>
              <input name={key} defaultValue={providerOf(settings[key])} placeholder="not configured" className={field} />
            </label>
          ))}
          <label className="block">
            <span className="mb-1.5 block text-[12.5px] font-bold text-admin-navy">
              Reason <span className="text-orange-cta">(required)</span>
            </span>
            <input name="reason" required className={field} />
          </label>
          <div className="flex justify-end md:col-span-2">
            <button
              type="submit"
              disabled={pending}
              className="inline-flex h-11 items-center gap-2 rounded-xl bg-royal-blue px-4 text-[13.5px] font-bold text-white transition hover:bg-royal-soft disabled:opacity-50"
            >
              {pending && <Loader2 className="h-4 w-4 animate-spin" />} Save providers
            </button>
          </div>
        </form>
      </SuperCard>

      <SuperCard className="p-6">
        <h2 className="text-[16px] font-bold text-admin-navy">File safety</h2>
        <p className="mt-1 text-[13px] text-ink-soft">
          Deliverables must pass a malware scan before download. Running without a scanner is an
          explicit, recorded decision, never a silent default.
        </p>
        <form
          className="mt-5 grid gap-4 md:grid-cols-2"
          onSubmit={(e) => {
            e.preventDefault();
            const fd = new FormData(e.currentTarget);
            save("security.malware_scanning", { mode: String(fd.get("mode")) }, String(fd.get("reason") ?? ""));
          }}
        >
          <label className="block">
            <span className="mb-1.5 block text-[12.5px] font-bold text-admin-navy">Scanning</span>
            <select name="mode" defaultValue={scanMode} className={field}>
              <option value="required">Required — downloads blocked until a file scans clean</option>
              <option value="disabled">Disabled — accept unscanned files</option>
            </select>
          </label>
          <label className="block">
            <span className="mb-1.5 block text-[12.5px] font-bold text-admin-navy">
              Reason <span className="text-orange-cta">(required)</span>
            </span>
            <input name="reason" required className={field} />
          </label>
          <div className="flex justify-end md:col-span-2">
            <button
              type="submit"
              disabled={pending}
              className="inline-flex h-11 items-center gap-2 rounded-xl bg-royal-blue px-4 text-[13.5px] font-bold text-white transition hover:bg-royal-soft disabled:opacity-50"
            >
              {pending && <Loader2 className="h-4 w-4 animate-spin" />} Save file safety
            </button>
          </div>
        </form>
      </SuperCard>
    </>
  );
}
