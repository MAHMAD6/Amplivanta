"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Database, Loader2, Plus } from "lucide-react";
import {
  decideAffiliateApplication,
  decideAffiliatePayout,
  decidePartnerApplication,
  setAffiliateStatus,
  setPartnerProfileStatus,
  upsertPartnerProgram,
} from "@/app/(admin)/admin/partner-actions";
import { toastResult } from "@/lib/action-toast";
import { cn } from "@/lib/utils";
import { SuperCard, SuperEmptyState } from "./primitives";

const btn =
  "inline-flex h-9 items-center gap-1.5 rounded-lg border border-line bg-white px-3 text-[12.5px] font-bold text-admin-navy transition hover:bg-bg-soft disabled:opacity-50";
const btnPrimary =
  "inline-flex h-9 items-center gap-1.5 rounded-lg bg-royal-blue px-3 text-[12.5px] font-bold text-white transition hover:bg-royal-soft disabled:opacity-50";
const field =
  "h-12 w-full rounded-xl border border-line bg-white px-3.5 text-[13.5px] focus:border-royal-blue focus:outline-none";

function Unavailable({ what }: { what: string }) {
  return (
    <SuperCard>
      <SuperEmptyState icon={Database} title="Data source unavailable" description={`The platform database could not be reached, so ${what} cannot be shown or changed.`} />
    </SuperCard>
  );
}

function useAct() {
  const [pending, start] = useTransition();
  const router = useRouter();
  const run = (fn: () => Promise<{ ok: true; message: string } | { ok: false; error: string }>, after?: () => void) =>
    start(async () => {
      const res = await fn();
      if (toastResult(res)) {
        after?.();
        router.refresh();
      }
    });
  return { pending, run };
}

function ReasonBox({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <SuperCard className="mb-4 p-5">
      <label className="block">
        <span className="mb-1.5 block text-[12.5px] font-bold text-admin-navy">
          Reason for the next decision <span className="text-orange-cta">(required)</span>
        </span>
        <input value={value} onChange={(e) => onChange(e.currentTarget.value)} className={field} />
      </label>
    </SuperCard>
  );
}

/* ------------------------------------------------------------- affiliates */

export function AffiliateApplicationsPanel({
  rows,
  connected,
}: {
  rows: { id: string; name: string; email: string; website: string | null; status: string; created: string }[];
  connected: boolean;
}) {
  const { pending, run } = useAct();
  const [reason, setReason] = useState("");
  if (!connected) return <Unavailable what="affiliate applications" />;

  return (
    <>
      <ReasonBox value={reason} onChange={setReason} />
      {rows.length === 0 ? (
        <SuperCard><SuperEmptyState icon={Database} title="No affiliate applications" description="Applications appear here once people apply to the affiliate program." /></SuperCard>
      ) : (
        <SuperCard>
          <div className="divide-y divide-line">
            {rows.map((r) => {
              const decided = r.status === "APPROVED" || r.status === "REJECTED";
              return (
                <div key={r.id} className="flex flex-wrap items-center justify-between gap-4 px-6 py-4">
                  <div>
                    <div className="text-[14px] font-bold text-admin-navy">{r.name}</div>
                    <div className="text-[12px] text-ink-muted">
                      {r.email}{r.website ? ` · ${r.website}` : ""} · {r.status.toLowerCase()} · {r.created}
                    </div>
                  </div>
                  {decided ? (
                    <span className="text-[12.5px] font-semibold text-ink-muted">Decided</span>
                  ) : (
                    <div className="flex gap-2">
                      <button type="button" className={btn} disabled={pending} onClick={() => run(() => decideAffiliateApplication(r.id, "REJECTED", reason), () => setReason(""))}>Reject</button>
                      <button type="button" className={btnPrimary} disabled={pending} onClick={() => run(() => decideAffiliateApplication(r.id, "APPROVED", reason), () => setReason(""))}>
                        {pending && <Loader2 className="h-3.5 w-3.5 animate-spin" />} Approve
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </SuperCard>
      )}
    </>
  );
}

export function AffiliatesPanel({
  rows,
  connected,
}: {
  rows: { id: string; name: string; email: string; code: string; status: string; rate: string }[];
  connected: boolean;
}) {
  const { pending, run } = useAct();
  const [reason, setReason] = useState("");
  if (!connected) return <Unavailable what="affiliates" />;

  return (
    <>
      <ReasonBox value={reason} onChange={setReason} />
      {rows.length === 0 ? (
        <SuperCard><SuperEmptyState icon={Database} title="No affiliates" description="Approved affiliates appear here." /></SuperCard>
      ) : (
        <SuperCard>
          <div className="divide-y divide-line">
            {rows.map((r) => (
              <div key={r.id} className="flex flex-wrap items-center justify-between gap-4 px-6 py-4">
                <div>
                  <div className="text-[14px] font-bold text-admin-navy">{r.name}</div>
                  <div className="text-[12px] text-ink-muted">{r.email} · code {r.code} · {r.rate} · {r.status.toLowerCase()}</div>
                </div>
                <div className="flex gap-2">
                  {r.status === "SUSPENDED" ? (
                    <button type="button" className={btnPrimary} disabled={pending} onClick={() => run(() => setAffiliateStatus(r.id, "APPROVED", reason), () => setReason(""))}>Reinstate</button>
                  ) : (
                    <button type="button" className={btn} disabled={pending} onClick={() => run(() => setAffiliateStatus(r.id, "SUSPENDED", reason), () => setReason(""))}>Suspend</button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </SuperCard>
      )}
    </>
  );
}

const PAYOUT_NEXT: Record<string, string[]> = {
  REQUESTED: ["PENDING", "HELD", "CANCELLED"],
  PENDING: ["PROCESSING", "HELD", "CANCELLED"],
  PROCESSING: ["PAID", "FAILED", "HELD"],
  HELD: ["PENDING", "CANCELLED"],
  FAILED: ["PENDING", "CANCELLED"],
};

export function AffiliatePayoutsPanel({
  rows,
  connected,
}: {
  rows: { id: string; affiliate: string | null; amount: string; status: string; requested: string | null }[];
  connected: boolean;
}) {
  const { pending, run } = useAct();
  const [reason, setReason] = useState("");
  if (!connected) return <Unavailable what="affiliate payouts" />;

  return (
    <>
      <ReasonBox value={reason} onChange={setReason} />
      {rows.length === 0 ? (
        <SuperCard><SuperEmptyState icon={Database} title="No payout requests" description="Affiliate payout requests appear here." /></SuperCard>
      ) : (
        <SuperCard>
          <div className="divide-y divide-line">
            {rows.map((r) => (
              <div key={r.id} className="flex flex-wrap items-center justify-between gap-4 px-6 py-4">
                <div>
                  <div className="text-[14px] font-bold text-admin-navy">{r.affiliate ?? "unknown affiliate"}</div>
                  <div className="text-[12px] text-ink-muted">{r.amount} · {r.status.toLowerCase()}{r.requested ? ` · ${r.requested}` : ""}</div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {(PAYOUT_NEXT[r.status] ?? []).map((s) => (
                    <button key={s} type="button" className={s === "PAID" ? btnPrimary : btn} disabled={pending} onClick={() => run(() => decideAffiliatePayout(r.id, s, reason), () => setReason(""))}>
                      {s.toLowerCase()}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </SuperCard>
      )}
    </>
  );
}

/* -------------------------------------------------------- partner program */

export function PartnerProgramsPanel({
  rows,
  connected,
}: {
  rows: { id: string; name: string; slug: string; status: string; partners: number }[];
  connected: boolean;
}) {
  const { pending, run } = useAct();
  const [open, setOpen] = useState(false);
  if (!connected) return <Unavailable what="partner programs" />;

  return (
    <>
      <div className="mb-4 flex justify-end">
        <button type="button" className={btnPrimary} onClick={() => setOpen((v) => !v)}><Plus className="h-3.5 w-3.5" /> New program</button>
      </div>
      {open && (
        <SuperCard className="mb-4 p-5">
          <form
            className="grid gap-4 md:grid-cols-2"
            onSubmit={(e) => {
              e.preventDefault();
              const form = e.currentTarget;
              run(() => upsertPartnerProgram(new FormData(form)), () => { form.reset(); setOpen(false); });
            }}
          >
            <label className="block">
              <span className="mb-1.5 block text-[12.5px] font-bold text-admin-navy">Name</span>
              <input name="name" required className={field} />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-[12.5px] font-bold text-admin-navy">Slug</span>
              <input name="slug" placeholder="auto from name" className={field} />
            </label>
            <div className="md:col-span-2">
              <label className="block">
                <span className="mb-1.5 block text-[12.5px] font-bold text-admin-navy">Description</span>
                <input name="description" className={field} />
              </label>
            </div>
            <label className="block">
              <span className="mb-1.5 block text-[12.5px] font-bold text-admin-navy">Status</span>
              <select name="status" defaultValue="draft" className={field}>
                {["draft", "open", "closed"].map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </label>
            <div className="flex items-end justify-end">
              <button type="submit" className={btnPrimary} disabled={pending}>
                {pending && <Loader2 className="h-3.5 w-3.5 animate-spin" />} Save program
              </button>
            </div>
          </form>
        </SuperCard>
      )}
      {rows.length === 0 ? (
        <SuperCard><SuperEmptyState icon={Database} title="No partner programs" description="Create a program so partners can apply to it." /></SuperCard>
      ) : (
        <SuperCard>
          <div className="divide-y divide-line">
            {rows.map((r) => (
              <div key={r.id} className="px-6 py-4">
                <div className="text-[14px] font-bold text-admin-navy">{r.name}</div>
                <div className="text-[12px] text-ink-muted">/{r.slug} · {r.status} · {r.partners} partner(s)</div>
              </div>
            ))}
          </div>
        </SuperCard>
      )}
    </>
  );
}

export function PartnerApplicationsPanel({
  rows,
  connected,
}: {
  rows: { id: string; companyName: string; contactEmail: string; status: string; created: string }[];
  connected: boolean;
}) {
  const { pending, run } = useAct();
  const [reason, setReason] = useState("");
  if (!connected) return <Unavailable what="partner applications" />;

  return (
    <>
      <ReasonBox value={reason} onChange={setReason} />
      {rows.length === 0 ? (
        <SuperCard><SuperEmptyState icon={Database} title="No partner applications" description="Applications appear here once companies apply." /></SuperCard>
      ) : (
        <SuperCard>
          <div className="divide-y divide-line">
            {rows.map((r) => {
              const decided = r.status === "APPROVED" || r.status === "REJECTED";
              return (
                <div key={r.id} className="flex flex-wrap items-center justify-between gap-4 px-6 py-4">
                  <div>
                    <div className="text-[14px] font-bold text-admin-navy">{r.companyName}</div>
                    <div className="text-[12px] text-ink-muted">{r.contactEmail} · {r.status.toLowerCase()} · {r.created}</div>
                  </div>
                  {decided ? (
                    <span className="text-[12.5px] font-semibold text-ink-muted">Decided</span>
                  ) : (
                    <div className="flex gap-2">
                      <button type="button" className={btn} disabled={pending} onClick={() => run(() => decidePartnerApplication(r.id, "REJECTED", reason), () => setReason(""))}>Reject</button>
                      <button type="button" className={btnPrimary} disabled={pending} onClick={() => run(() => decidePartnerApplication(r.id, "APPROVED", reason), () => setReason(""))}>Approve</button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </SuperCard>
      )}
    </>
  );
}

export function PartnerProfilesPanel({
  rows,
  connected,
}: {
  rows: { id: string; companyName: string; contactEmail: string; program: string | null; status: string }[];
  connected: boolean;
}) {
  const { pending, run } = useAct();
  const [reason, setReason] = useState("");
  if (!connected) return <Unavailable what="partners" />;

  return (
    <>
      <ReasonBox value={reason} onChange={setReason} />
      {rows.length === 0 ? (
        <SuperCard><SuperEmptyState icon={Database} title="No partners" description="Approved partners appear here." /></SuperCard>
      ) : (
        <SuperCard>
          <div className="divide-y divide-line">
            {rows.map((r) => (
              <div key={r.id} className="flex flex-wrap items-center justify-between gap-4 px-6 py-4">
                <div>
                  <div className="text-[14px] font-bold text-admin-navy">{r.companyName}</div>
                  <div className="text-[12px] text-ink-muted">{r.contactEmail}{r.program ? ` · ${r.program}` : ""} · {r.status.toLowerCase()}</div>
                </div>
                {r.status === "SUSPENDED" ? (
                  <button type="button" className={btnPrimary} disabled={pending} onClick={() => run(() => setPartnerProfileStatus(r.id, "APPROVED", reason), () => setReason(""))}>Reinstate</button>
                ) : (
                  <button type="button" className={btn} disabled={pending} onClick={() => run(() => setPartnerProfileStatus(r.id, "SUSPENDED", reason), () => setReason(""))}>Suspend</button>
                )}
              </div>
            ))}
          </div>
        </SuperCard>
      )}
    </>
  );
}
