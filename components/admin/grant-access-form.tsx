"use client";

import { useState, useTransition } from "react";
import { Building2, CalendarDays, Check, ShieldCheck, User as UserIcon } from "lucide-react";
import { grantAccessCredit } from "@/app/(admin)/admin/actions";
import { cn } from "@/lib/utils";
import { SuperCard } from "./primitives";

const GRANT_TABS = [
  { key: "ACCESS_EXTENSION", label: "Access Extension", hint: "Extend user access by adding extra days." },
  { key: "USAGE_CREDIT", label: "Usage Credit", hint: "Add usage credit to the recipient's balance." },
  { key: "BILLING_CREDIT", label: "Billing Credit", hint: "Apply a billing credit against future invoices." },
  { key: "FEATURE_ACCESS", label: "Feature Access", hint: "Override feature access for the recipient." },
] as const;

const REASONS = [
  "Service disruption remediation",
  "Sales or onboarding concession",
  "Billing correction",
  "Support resolution",
  "Contractual commitment",
  "Other (explain in note)",
];

function StepLabel({ n, children }: { n: number; children: React.ReactNode }) {
  return (
    <div className="mb-2.5 flex items-center gap-2.5">
      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-admin-navy text-[11.5px] font-bold text-white">
        {n}
      </span>
      <span className="text-[14px] font-bold text-admin-navy">{children}</span>
    </div>
  );
}

const field =
  "h-12 w-full rounded-xl border border-line bg-white px-3.5 text-[13.5px] text-ink focus:border-royal-blue focus:outline-none focus:ring-2 focus:ring-royal-blue/15";

type DirectoryEntry = { id: string; label: string; sublabel: string | null };

/** Type-ahead recipient picker backed by the real user / organization directory. */
function DirectoryPicker({ type }: { type: "user" | "organization" }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<DirectoryEntry[]>([]);
  const [chosen, setChosen] = useState<DirectoryEntry | null>(null);
  const [state, setState] = useState<"idle" | "loading" | "error">("idle");
  const [open, setOpen] = useState(false);

  async function search(q: string) {
    setState("loading");
    try {
      const res = await fetch(`/api/admin/directory?type=${type}&q=${encodeURIComponent(q)}`);
      const data = (await res.json()) as { results?: DirectoryEntry[] };
      setResults(data.results ?? []);
      setState(res.ok ? "idle" : "error");
    } catch {
      setResults([]);
      setState("error");
    }
  }

  if (chosen) {
    return (
      <div className="flex items-center justify-between gap-3 rounded-xl border border-royal-blue bg-royal-tint px-4 py-3">
        <input type="hidden" name="recipient" value={chosen.id} />
        <span>
          <span className="block text-[13.5px] font-bold text-admin-navy">{chosen.label}</span>
          {chosen.sublabel && <span className="block text-[12px] text-ink-soft">{chosen.sublabel}</span>}
        </span>
        <button
          type="button"
          onClick={() => { setChosen(null); setQuery(""); setResults([]); setOpen(false); }}
          className="text-[12.5px] font-bold text-royal-blue hover:underline"
        >
          Change
        </button>
      </div>
    );
  }

  return (
    <div className="relative">
      <input
        value={query}
        onChange={(e) => {
          const v = e.currentTarget.value;
          setQuery(v);
          setOpen(true);
          void search(v);
        }}
        onFocus={() => { setOpen(true); if (!results.length) void search(""); }}
        placeholder={type === "user" ? "Search users by name or email" : "Search organizations by name"}
        aria-label={type === "user" ? "Search users" : "Search organizations"}
        autoComplete="off"
        className={field}
      />
      {/* Empty until a real record is picked; the server action rejects a blank recipient. */}
      <input type="hidden" name="recipient" value="" />

      {open && (
        <div className="absolute z-20 mt-1.5 max-h-64 w-full overflow-y-auto rounded-xl border border-line bg-white shadow-card-lg">
          {state === "loading" && <p className="px-4 py-3 text-[12.5px] text-ink-muted">Searching...</p>}
          {state === "error" && (
            <p className="px-4 py-3 text-[12.5px] text-red-700">
              Directory unavailable — the platform database could not be reached.
            </p>
          )}
          {state === "idle" && results.length === 0 && (
            <p className="px-4 py-3 text-[12.5px] text-ink-muted">
              No matching {type === "user" ? "users" : "organizations"}.
            </p>
          )}
          {results.map((r) => (
            <button
              key={r.id}
              type="button"
              onClick={() => { setChosen(r); setOpen(false); }}
              className="block w-full border-b border-line px-4 py-2.5 text-left last:border-0 hover:bg-bg-soft"
            >
              <span className="block text-[13px] font-semibold text-admin-navy">{r.label}</span>
              {r.sublabel && <span className="block text-[11.5px] text-ink-soft">{r.sublabel}</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function GrantAccessForm() {
  const [target, setTarget] = useState<"user" | "organization">("user");
  const [grantType, setGrantType] = useState<string>("ACCESS_EXTENSION");
  const [days, setDays] = useState("");
  const [amount, setAmount] = useState("");
  const [effectiveAt, setEffectiveAt] = useState("");
  const [note, setNote] = useState("");
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(null);
  const [pending, startTransition] = useTransition();

  const tab = GRANT_TABS.find((t) => t.key === grantType)!;
  const isAccess = grantType === "ACCESS_EXTENSION";
  const isCredit = grantType === "USAGE_CREDIT" || grantType === "BILLING_CREDIT";

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    fd.set("target", target);
    fd.set("grantType", grantType);
    startTransition(async () => {
      const res = await grantAccessCredit(fd);
      if (res.ok) {
        setResult({ ok: true, message: "Grant recorded and written to the audit log." });
        setDays("");
        setAmount("");
        setNote("");
      } else {
        setResult({ ok: false, message: res.error });
      }
    });
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
      <SuperCard className="p-6">
        {/* 1. Grant to */}
        <StepLabel n={1}>Grant To</StepLabel>
        <p className="mb-3 text-[13px] text-ink-soft">
          Choose whether to grant credit to an individual user or an organization.
        </p>
        <div className="space-y-2.5">
          {([
            { key: "user", icon: UserIcon, title: "Individual User", desc: "Grant credit or access to a specific user" },
            { key: "organization", icon: Building2, title: "Organization / Workspace", desc: "Grant credit or access to an organization" },
          ] as const).map((o) => (
            <button
              key={o.key}
              type="button"
              onClick={() => setTarget(o.key)}
              aria-pressed={target === o.key}
              className={cn(
                "flex w-full items-center gap-3.5 rounded-xl border px-4 py-3.5 text-left transition",
                target === o.key ? "border-royal-blue bg-royal-tint" : "border-line bg-white hover:bg-bg-soft",
              )}
            >
              <span
                className={cn(
                  "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2",
                  target === o.key ? "border-royal-blue bg-royal-blue" : "border-line",
                )}
              >
                {target === o.key && <Check className="h-3 w-3 text-white" />}
              </span>
              <o.icon className="h-5 w-5 shrink-0 text-ink-muted" />
              <span>
                <span className="block text-[13.5px] font-bold text-admin-navy">{o.title}</span>
                <span className="block text-[12px] text-ink-soft">{o.desc}</span>
              </span>
            </button>
          ))}
        </div>

        {/* 2. Recipient */}
        <div className="mt-7">
          <StepLabel n={2}>{target === "user" ? "Select User" : "Select Organization"}</StepLabel>
          <DirectoryPicker key={target} type={target} />
        </div>

        {/* 3. Grant type */}
        <div className="mt-7">
          <StepLabel n={3}>Grant Type</StepLabel>
          <div className="flex flex-wrap gap-1 border-b border-line">
            {GRANT_TABS.map((t) => (
              <button
                key={t.key}
                type="button"
                onClick={() => setGrantType(t.key)}
                className={cn(
                  "-mb-px border-b-2 px-3.5 py-2.5 text-[13px] font-semibold transition",
                  grantType === t.key
                    ? "border-royal-blue text-royal-blue"
                    : "border-transparent text-ink-soft hover:text-admin-navy",
                )}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div className="mt-4 flex items-start gap-2.5 rounded-xl bg-royal-tint px-4 py-3 text-[12.5px] text-admin-navy">
            <CalendarDays className="mt-0.5 h-4 w-4 shrink-0 text-royal-blue" />
            {tab.hint}
          </div>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {isAccess && (
              <label className="block">
                <span className="mb-1.5 block text-[12.5px] font-bold text-admin-navy">Number of Days</span>
                <input
                  name="days"
                  type="number"
                  min={1}
                  value={days}
                  onChange={(e) => setDays(e.currentTarget.value)}
                  placeholder="Enter number of days"
                  className={field}
                />
              </label>
            )}
            {isCredit && (
              <label className="block">
                <span className="mb-1.5 block text-[12.5px] font-bold text-admin-navy">Amount (USD)</span>
                <input
                  name="amount"
                  type="number"
                  min={0}
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.currentTarget.value)}
                  placeholder="Enter amount"
                  className={field}
                />
              </label>
            )}
            <label className="block">
              <span className="mb-1.5 block text-[12.5px] font-bold text-admin-navy">Effective Date</span>
              <input
                name="effectiveAt"
                type="date"
                value={effectiveAt}
                onChange={(e) => setEffectiveAt(e.currentTarget.value)}
                className={field}
              />
            </label>
          </div>
        </div>

        {/* 4. Reason */}
        <div className="mt-7">
          <StepLabel n={4}>
            Reason <span className="text-[12px] font-semibold text-orange-cta">(Required)</span>
          </StepLabel>
          <select name="reason" required defaultValue="" className={field}>
            <option value="" disabled>
              Select reason
            </option>
            {REASONS.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>

        {/* 5. Note */}
        <div className="mt-7">
          <StepLabel n={5}>
            Admin Note <span className="text-[12px] font-medium text-ink-muted">(Optional)</span>
          </StepLabel>
          <textarea
            name="note"
            rows={4}
            maxLength={250}
            value={note}
            onChange={(e) => setNote(e.currentTarget.value)}
            placeholder="Add internal note..."
            className="w-full rounded-xl border border-line bg-white px-3.5 py-3 text-[13.5px] text-ink focus:border-royal-blue focus:outline-none focus:ring-2 focus:ring-royal-blue/15"
          />
          <div className="mt-1 text-right text-[11.5px] text-ink-muted">{note.length}/250</div>
        </div>
      </SuperCard>

      {/* Summary rail */}
      <div className="space-y-4">
        <SuperCard className="p-6">
          <h2 className="text-[15px] font-bold text-admin-navy">Summary (Preview)</h2>
          <dl className="mt-4">
            {[
              ["Recipient type", target === "user" ? "Individual User" : "Organization / Workspace"],
              ["Grant type", tab.label],
              isAccess ? ["Days to Add", days || "—"] : null,
              isCredit ? ["Amount", amount ? `$${amount}` : "—"] : null,
              ["Effective", effectiveAt || "Immediately"],
            ]
              .filter(Boolean)
              .map((row) => {
                const [k, v] = row as [string, string];
                return (
                  <div key={k} className="flex items-center justify-between border-b border-line py-3 last:border-0">
                    <dt className="text-[13px] text-ink-soft">{k}</dt>
                    <dd className="text-[13px] font-semibold text-admin-navy">{v}</dd>
                  </div>
                );
              })}
          </dl>

          {result && (
            <p
              className={cn(
                "mt-4 rounded-xl px-4 py-3 text-[12.5px] font-semibold",
                result.ok ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700",
              )}
              role="status"
            >
              {result.message}
            </p>
          )}

          <div className="mt-5 flex gap-2.5">
            <button
              type="reset"
              className="h-12 flex-1 rounded-xl border border-line bg-white text-[13.5px] font-bold text-admin-navy hover:bg-bg-soft"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={pending}
              className="h-12 flex-[1.4] rounded-xl bg-royal-blue text-[13.5px] font-bold text-white transition hover:bg-royal-soft disabled:opacity-60"
            >
              {pending ? "Recording..." : "Review & Confirm"}
            </button>
          </div>
        </SuperCard>

        <div className="flex gap-3 rounded-2xl border border-line bg-royal-tint px-5 py-4">
          <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-royal-blue" />
          <p className="text-[12.5px] leading-relaxed text-admin-navy">
            This action is authorized server-side, requires a reason, and is recorded in the platform audit
            log where it can be reviewed or adjusted later.
          </p>
        </div>
      </div>
    </form>
  );
}
