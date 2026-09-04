"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Database, Loader2, Plus } from "lucide-react";
import {
  decidePayout,
  decideSellerApplication,
  moderateProduct,
  refundOrder,
  setSellerStatus,
  upsertCategory,
} from "@/app/(super)/super/marketplace-actions";
import { cn } from "@/lib/utils";
import { SuperCard, SuperEmptyState } from "./primitives";

type Msg = { ok: boolean; text: string } | null;

function Banner({ m }: { m: Msg }) {
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

const btn =
  "inline-flex h-9 items-center gap-1.5 rounded-lg border border-line bg-white px-3 text-[12.5px] font-bold text-admin-navy transition hover:bg-bg-soft disabled:opacity-50";
const btnPrimary =
  "inline-flex h-9 items-center gap-1.5 rounded-lg bg-royal-blue px-3 text-[12.5px] font-bold text-white transition hover:bg-royal-soft disabled:opacity-50";

/** Shared reason box — every marketplace decision requires one. */
function ReasonBox({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <SuperCard className="mb-4 p-5">
      <label className="block">
        <span className="mb-1.5 block text-[12.5px] font-bold text-admin-navy">
          Reason for the next decision <span className="text-orange-cta">(required)</span>
        </span>
        <input
          value={value}
          onChange={(e) => onChange(e.currentTarget.value)}
          placeholder="Recorded in the audit log with your decision"
          className="h-12 w-full rounded-xl border border-line bg-white px-3.5 text-[13.5px] focus:border-royal-blue focus:outline-none"
        />
      </label>
    </SuperCard>
  );
}

function Unavailable({ what }: { what: string }) {
  return (
    <SuperCard>
      <SuperEmptyState
        icon={Database}
        title="Data source unavailable"
        description={`The platform database could not be reached, so ${what} cannot be shown or changed.`}
      />
    </SuperCard>
  );
}

/* --------------------------------------------------------- seller applications */

export function SellerApplicationsPanel({
  rows,
  connected,
}: {
  rows: { id: string; storeName: string; contactEmail: string; website: string | null; status: string; createdAt: string }[];
  connected: boolean;
}) {
  const [m, setM] = useState<Msg>(null);
  const [reason, setReason] = useState("");
  const [pending, start] = useTransition();
  const router = useRouter();
  if (!connected) return <Unavailable what="seller applications" />;

  const act = (id: string, decision: "APPROVED" | "REJECTED") =>
    start(async () => {
      const res = await decideSellerApplication(id, decision, reason);
      setM(res.ok ? { ok: true, text: res.message } : { ok: false, text: res.error });
      if (res.ok) {
        setReason("");
        router.refresh();
      }
    });

  return (
    <>
      <Banner m={m} />
      <ReasonBox value={reason} onChange={setReason} />
      {rows.length === 0 ? (
        <SuperCard>
          <SuperEmptyState icon={Database} title="No seller applications" description="Applications appear here once users apply to sell." />
        </SuperCard>
      ) : (
        <SuperCard>
          <div className="divide-y divide-line">
            {rows.map((r) => {
              const decided = r.status === "APPROVED" || r.status === "REJECTED";
              return (
                <div key={r.id} className="flex flex-wrap items-center justify-between gap-4 px-6 py-4">
                  <div>
                    <div className="text-[14px] font-bold text-admin-navy">{r.storeName}</div>
                    <div className="text-[12px] text-ink-muted">
                      {r.contactEmail}
                      {r.website ? ` · ${r.website}` : ""} · {r.status.toLowerCase().replace(/_/g, " ")} · {r.createdAt}
                    </div>
                  </div>
                  {decided ? (
                    <span className="text-[12.5px] font-semibold text-ink-muted">Decided</span>
                  ) : (
                    <div className="flex gap-2">
                      <button type="button" className={btn} disabled={pending} onClick={() => act(r.id, "REJECTED")}>Reject</button>
                      <button type="button" className={btnPrimary} disabled={pending} onClick={() => act(r.id, "APPROVED")}>
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

/* ------------------------------------------------------------ seller management */

export function SellersPanel({
  rows,
  connected,
}: {
  rows: { id: string; storeName: string; email: string | null; status: string; products: number }[];
  connected: boolean;
}) {
  const [m, setM] = useState<Msg>(null);
  const [reason, setReason] = useState("");
  const [pending, start] = useTransition();
  const router = useRouter();
  if (!connected) return <Unavailable what="sellers" />;

  const act = (id: string, status: "APPROVED" | "SUSPENDED" | "CLOSED") =>
    start(async () => {
      const res = await setSellerStatus(id, status, reason);
      setM(res.ok ? { ok: true, text: res.message } : { ok: false, text: res.error });
      if (res.ok) {
        setReason("");
        router.refresh();
      }
    });

  return (
    <>
      <Banner m={m} />
      <ReasonBox value={reason} onChange={setReason} />
      {rows.length === 0 ? (
        <SuperCard>
          <SuperEmptyState icon={Database} title="No sellers yet" description="Approved sellers appear here." />
        </SuperCard>
      ) : (
        <SuperCard>
          <div className="divide-y divide-line">
            {rows.map((r) => (
              <div key={r.id} className="flex flex-wrap items-center justify-between gap-4 px-6 py-4">
                <div>
                  <div className="text-[14px] font-bold text-admin-navy">{r.storeName}</div>
                  <div className="text-[12px] text-ink-muted">
                    {r.email ?? "no contact"} · {r.status.toLowerCase()} · {r.products} product(s)
                  </div>
                </div>
                <div className="flex gap-2">
                  {r.status === "SUSPENDED" ? (
                    <button type="button" className={btnPrimary} disabled={pending} onClick={() => act(r.id, "APPROVED")}>Reinstate</button>
                  ) : (
                    <button type="button" className={btn} disabled={pending} onClick={() => act(r.id, "SUSPENDED")}>Suspend</button>
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

/* ----------------------------------------------------------------- moderation */

const NEXT_STATES: Record<string, string[]> = {
  SUBMITTED: ["UNDER_REVIEW", "CHANGES_REQUESTED", "REJECTED"],
  UNDER_REVIEW: ["APPROVED", "CHANGES_REQUESTED", "REJECTED"],
  CHANGES_REQUESTED: ["SUBMITTED"],
  APPROVED: ["PUBLISHED", "REJECTED"],
  PUBLISHED: ["UNPUBLISHED", "SUSPENDED", "ARCHIVED"],
  UNPUBLISHED: ["PUBLISHED", "ARCHIVED"],
  SUSPENDED: ["PUBLISHED", "ARCHIVED"],
};

export function ModerationPanel({
  rows,
  connected,
  emptyLabel,
}: {
  rows: { id: string; title: string; seller: string | null; status: string; type: string }[];
  connected: boolean;
  emptyLabel: string;
}) {
  const [m, setM] = useState<Msg>(null);
  const [reason, setReason] = useState("");
  const [pending, start] = useTransition();
  const router = useRouter();
  if (!connected) return <Unavailable what="products" />;

  return (
    <>
      <Banner m={m} />
      <ReasonBox value={reason} onChange={setReason} />
      {rows.length === 0 ? (
        <SuperCard>
          <SuperEmptyState icon={Database} title={emptyLabel} description="Products appear here as sellers submit and publish them." />
        </SuperCard>
      ) : (
        <SuperCard>
          <div className="divide-y divide-line">
            {rows.map((r) => (
              <div key={r.id} className="flex flex-wrap items-center justify-between gap-4 px-6 py-4">
                <div>
                  <div className="text-[14px] font-bold text-admin-navy">{r.title}</div>
                  <div className="text-[12px] text-ink-muted">
                    {r.seller ?? "unknown seller"} · {r.type.toLowerCase()} · {r.status.toLowerCase().replace(/_/g, " ")}
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {(NEXT_STATES[r.status] ?? []).map((next) => (
                    <button
                      key={next}
                      type="button"
                      className={next === "PUBLISHED" || next === "APPROVED" ? btnPrimary : btn}
                      disabled={pending}
                      onClick={() =>
                        start(async () => {
                          const res = await moderateProduct(r.id, next as never, reason);
                          setM(res.ok ? { ok: true, text: res.message } : { ok: false, text: res.error });
                          if (res.ok) {
                            setReason("");
                            router.refresh();
                          }
                        })
                      }
                    >
                      {next.toLowerCase().replace(/_/g, " ")}
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

/* -------------------------------------------------------------------- orders */

export function OrdersPanel({
  rows,
  connected,
}: {
  rows: { id: string; buyer: string | null; total: string; status: string; placed: string | null }[];
  connected: boolean;
}) {
  const [m, setM] = useState<Msg>(null);
  const [reason, setReason] = useState("");
  const [pending, start] = useTransition();
  const router = useRouter();
  if (!connected) return <Unavailable what="orders" />;

  return (
    <>
      <Banner m={m} />
      <ReasonBox value={reason} onChange={setReason} />
      {rows.length === 0 ? (
        <SuperCard>
          <SuperEmptyState icon={Database} title="No orders yet" description="Marketplace orders appear here once buyers purchase." />
        </SuperCard>
      ) : (
        <SuperCard>
          <div className="divide-y divide-line">
            {rows.map((r) => {
              const refundable = ["PAID", "ACCESS_READY", "PARTIALLY_REFUNDED"].includes(r.status);
              return (
                <div key={r.id} className="flex flex-wrap items-center justify-between gap-4 px-6 py-4">
                  <div>
                    <div className="text-[14px] font-bold text-admin-navy">{r.id.slice(0, 10)}</div>
                    <div className="text-[12px] text-ink-muted">
                      {r.buyer ?? "unknown buyer"} · {r.total} · {r.status.toLowerCase().replace(/_/g, " ")}
                      {r.placed ? ` · ${r.placed}` : ""}
                    </div>
                  </div>
                  <button
                    type="button"
                    className={btn}
                    disabled={pending || !refundable}
                    title={refundable ? undefined : "Only a paid order can be refunded."}
                    onClick={() =>
                      start(async () => {
                        const res = await refundOrder(r.id, reason, true);
                        setM(res.ok ? { ok: true, text: res.message } : { ok: false, text: res.error });
                        if (res.ok) {
                          setReason("");
                          router.refresh();
                        }
                      })
                    }
                  >
                    Refund
                  </button>
                </div>
              );
            })}
          </div>
        </SuperCard>
      )}
    </>
  );
}

/* ------------------------------------------------------------------- payouts */

const PAYOUT_NEXT: Record<string, string[]> = {
  REQUESTED: ["PENDING", "HELD", "CANCELLED"],
  PENDING: ["PROCESSING", "HELD", "CANCELLED"],
  PROCESSING: ["PAID", "FAILED", "HELD"],
  HELD: ["PENDING", "CANCELLED"],
  FAILED: ["PENDING", "CANCELLED"],
};

export function PayoutsPanel({
  rows,
  connected,
}: {
  rows: { id: string; seller: string | null; amount: string; status: string; requested: string | null }[];
  connected: boolean;
}) {
  const [m, setM] = useState<Msg>(null);
  const [reason, setReason] = useState("");
  const [pending, start] = useTransition();
  const router = useRouter();
  if (!connected) return <Unavailable what="payouts" />;

  return (
    <>
      <Banner m={m} />
      <ReasonBox value={reason} onChange={setReason} />
      {rows.length === 0 ? (
        <SuperCard>
          <SuperEmptyState icon={Database} title="No payout requests" description="Seller payout requests appear here." />
        </SuperCard>
      ) : (
        <SuperCard>
          <div className="divide-y divide-line">
            {rows.map((r) => (
              <div key={r.id} className="flex flex-wrap items-center justify-between gap-4 px-6 py-4">
                <div>
                  <div className="text-[14px] font-bold text-admin-navy">{r.seller ?? "unknown seller"}</div>
                  <div className="text-[12px] text-ink-muted">
                    {r.amount} · {r.status.toLowerCase()}
                    {r.requested ? ` · ${r.requested}` : ""}
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {(PAYOUT_NEXT[r.status] ?? []).map((next) => (
                    <button
                      key={next}
                      type="button"
                      className={next === "PAID" ? btnPrimary : btn}
                      disabled={pending}
                      onClick={() =>
                        start(async () => {
                          const res = await decidePayout(r.id, next as never, reason);
                          setM(res.ok ? { ok: true, text: res.message } : { ok: false, text: res.error });
                          if (res.ok) {
                            setReason("");
                            router.refresh();
                          }
                        })
                      }
                    >
                      {next.toLowerCase()}
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

/* ---------------------------------------------------------------- categories */

export function CategoriesPanel({
  categories,
  connected,
}: {
  categories: { id: string; name: string; slug: string; description: string | null; order: number; isActive: boolean; products: number }[];
  connected: boolean;
}) {
  const [m, setM] = useState<Msg>(null);
  const [open, setOpen] = useState(false);
  const [pending, start] = useTransition();
  const router = useRouter();
  if (!connected) return <Unavailable what="categories" />;

  return (
    <>
      <Banner m={m} />
      <div className="mb-4 flex justify-end">
        <button type="button" className={btnPrimary} onClick={() => setOpen((v) => !v)}>
          <Plus className="h-3.5 w-3.5" /> New category
        </button>
      </div>

      {open && (
        <SuperCard className="mb-4 p-5">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const form = e.currentTarget;
              const fd = new FormData(form);
              start(async () => {
                const res = await upsertCategory(fd);
                setM(res.ok ? { ok: true, text: res.message } : { ok: false, text: res.error });
                if (res.ok) {
                  form.reset();
                  setOpen(false);
                  router.refresh();
                }
              });
            }}
            className="grid gap-4 md:grid-cols-2"
          >
            <label className="block">
              <span className="mb-1.5 block text-[12.5px] font-bold text-admin-navy">Name</span>
              <input name="name" required className="h-12 w-full rounded-xl border border-line px-3.5 text-[13.5px] focus:border-royal-blue focus:outline-none" />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-[12.5px] font-bold text-admin-navy">Slug</span>
              <input name="slug" placeholder="auto from name" className="h-12 w-full rounded-xl border border-line px-3.5 text-[13.5px] focus:border-royal-blue focus:outline-none" />
            </label>
            <div className="md:col-span-2">
              <label className="block">
                <span className="mb-1.5 block text-[12.5px] font-bold text-admin-navy">Description</span>
                <input name="description" className="h-12 w-full rounded-xl border border-line px-3.5 text-[13.5px] focus:border-royal-blue focus:outline-none" />
              </label>
            </div>
            <label className="flex items-center gap-2 text-[13px] text-ink-soft">
              <input type="checkbox" name="isActive" defaultChecked className="h-4 w-4 accent-royal-blue" /> Active
            </label>
            <div className="flex justify-end">
              <button type="submit" className={btnPrimary} disabled={pending}>
                {pending && <Loader2 className="h-3.5 w-3.5 animate-spin" />} Save category
              </button>
            </div>
          </form>
        </SuperCard>
      )}

      {categories.length === 0 ? (
        <SuperCard>
          <SuperEmptyState icon={Database} title="No categories yet" description="Create categories so sellers can classify their products." />
        </SuperCard>
      ) : (
        <SuperCard>
          <div className="divide-y divide-line">
            {categories.map((c) => (
              <div key={c.id} className="flex flex-wrap items-center justify-between gap-4 px-6 py-4">
                <div>
                  <div className="text-[14px] font-bold text-admin-navy">{c.name}</div>
                  <div className="text-[12px] text-ink-muted">
                    /{c.slug} · {c.products} product(s) · {c.isActive ? "active" : "inactive"}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </SuperCard>
      )}
    </>
  );
}
