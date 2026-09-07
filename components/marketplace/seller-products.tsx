"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Paperclip, Pencil, Send, Upload } from "lucide-react";
import {
  attachProductAsset,
  publishNewVersion,
  updateProduct,
  setOwnProductStatus,
  submitProductForReview,
} from "@/app/(app)/app/marketplace/actions";
import { toastResult } from "@/lib/action-toast";
import { cn } from "@/lib/utils";
import { MpCard } from "./ui";

export type SellerProduct = {
  id: string;
  title: string;
  status: string;
  updated: string;
  version: number | null;
  assets: number;
  priceLabel: string;
  summary: string | null;
  description: string | null;
  tags: string[];
  categoryId: string | null;
  priceValue: number | null;
};

export type SellerCategory = { id: string; name: string };

const STATUS_LABEL: Record<string, string> = {
  DRAFT: "Draft",
  SUBMITTED: "Submitted",
  UNDER_REVIEW: "Under review",
  CHANGES_REQUESTED: "Changes requested",
  APPROVED: "Approved",
  PUBLISHED: "Published",
  UNPUBLISHED: "Unpublished",
  SUSPENDED: "Suspended",
  ARCHIVED: "Archived",
  REJECTED: "Rejected",
};

const btn =
  "inline-flex h-9 items-center gap-1.5 rounded-lg border border-line bg-white px-3 text-[12.5px] font-bold text-deep-navy transition hover:bg-bg-soft disabled:opacity-50";
const btnPrimary =
  "inline-flex h-9 items-center gap-1.5 rounded-lg bg-royal-blue px-3 text-[12.5px] font-bold text-white transition hover:bg-royal-soft disabled:opacity-50";
const editField =
  "h-11 w-full rounded-xl border border-line bg-white px-3.5 text-[13px] focus:border-royal-blue focus:outline-none";

export function SellerProductRows({
  products,
  categories,
}: {
  products: SellerProduct[];
  categories: SellerCategory[];
}) {
  const [pending, start] = useTransition();
  const [attachFor, setAttachFor] = useState<string | null>(null);
  const [editFor, setEditFor] = useState<string | null>(null);
  const router = useRouter();

  const run = (fn: () => Promise<{ ok: true; message: string } | { ok: false; error: string }>, after?: () => void) =>
    start(async () => {
      if (toastResult(await fn())) {
        after?.();
        router.refresh();
      }
    });

  return (
    <>
      <MpCard>
        <div className="divide-y divide-line">
          {products.map((p) => {
            const editable = p.status === "DRAFT" || p.status === "CHANGES_REQUESTED";
            return (
              <div key={p.id} className="px-6 py-4">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="min-w-0">
                    <div className="text-[14px] font-bold text-deep-navy">{p.title}</div>
                    <div className="text-[12px] text-ink-muted">
                      {STATUS_LABEL[p.status] ?? p.status} · {p.priceLabel}
                      {p.version ? ` · v${p.version}` : ""} · {p.assets} file(s) · {p.updated}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {editable && (
                      <button type="button" className={btn} onClick={() => setEditFor(editFor === p.id ? null : p.id)}>
                        <Pencil className="h-3.5 w-3.5" /> Edit
                      </button>
                    )}
                    {editable && (
                      <button type="button" className={btn} onClick={() => setAttachFor(attachFor === p.id ? null : p.id)}>
                        <Paperclip className="h-3.5 w-3.5" /> Attach file
                      </button>
                    )}
                    {editable && (
                      <button
                        type="button"
                        className={btnPrimary}
                        disabled={pending}
                        title={p.assets === 0 ? "Attach a deliverable before submitting." : undefined}
                        onClick={() => run(() => submitProductForReview(p.id))}
                      >
                        {pending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
                        Submit for review
                      </button>
                    )}
                    {p.status === "PUBLISHED" && (
                      <>
                        <button type="button" className={btn} disabled={pending} onClick={() => run(() => setOwnProductStatus(p.id, "UNPUBLISHED"))}>
                          Unpublish
                        </button>
                        <NewVersionButton productId={p.id} pending={pending} run={run} />
                      </>
                    )}
                    {p.status === "UNPUBLISHED" && (
                      <button type="button" className={btn} disabled={pending} onClick={() => run(() => setOwnProductStatus(p.id, "ARCHIVED"))}>
                        Archive
                      </button>
                    )}
                    {["SUBMITTED", "UNDER_REVIEW"].includes(p.status) && (
                      <span className="text-[12.5px] font-semibold text-ink-muted">Awaiting moderation</span>
                    )}
                  </div>
                </div>

                {editFor === p.id && (
                  <form
                    className="mt-4 grid gap-3 rounded-xl border border-line bg-bg-soft px-4 py-4 md:grid-cols-2"
                    onSubmit={(e) => {
                      e.preventDefault();
                      const form = e.currentTarget;
                      run(() => updateProduct(p.id, new FormData(form)), () => setEditFor(null));
                    }}
                  >
                    <label className="block">
                      <span className="mb-1.5 block text-[12px] font-bold text-deep-navy">Title</span>
                      <input name="title" defaultValue={p.title} required className={editField} />
                    </label>
                    <label className="block">
                      <span className="mb-1.5 block text-[12px] font-bold text-deep-navy">Price (USD)</span>
                      <input
                        name="price"
                        type="number"
                        min={0}
                        step="0.01"
                        defaultValue={p.priceValue ?? ""}
                        className={editField}
                      />
                    </label>
                    <label className="block">
                      <span className="mb-1.5 block text-[12px] font-bold text-deep-navy">Category</span>
                      <select name="categoryId" defaultValue={p.categoryId ?? ""} className={editField}>
                        <option value="">Uncategorised</option>
                        {categories.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="block">
                      <span className="mb-1.5 block text-[12px] font-bold text-deep-navy">Tags (comma separated)</span>
                      <input name="tags" defaultValue={p.tags.join(", ")} className={editField} />
                    </label>
                    <label className="block md:col-span-2">
                      <span className="mb-1.5 block text-[12px] font-bold text-deep-navy">Summary</span>
                      <input name="summary" defaultValue={p.summary ?? ""} className={editField} />
                    </label>
                    <label className="block md:col-span-2">
                      <span className="mb-1.5 block text-[12px] font-bold text-deep-navy">Description</span>
                      <textarea
                        name="description"
                        defaultValue={p.description ?? ""}
                        rows={4}
                        className="w-full rounded-xl border border-line bg-white px-3.5 py-2.5 text-[13px] focus:border-royal-blue focus:outline-none"
                      />
                    </label>
                    <div className="flex gap-2 md:col-span-2">
                      <button type="submit" className={btnPrimary} disabled={pending}>
                        {pending && <Loader2 className="h-3.5 w-3.5 animate-spin" />} Save changes
                      </button>
                      <button type="button" className={btn} onClick={() => setEditFor(null)}>
                        Cancel
                      </button>
                    </div>
                  </form>
                )}

                {attachFor === p.id && (
                  <form
                    className="mt-4 flex flex-wrap items-center gap-3 rounded-xl border border-line bg-bg-soft px-4 py-3"
                    onSubmit={(e) => {
                      e.preventDefault();
                      const form = e.currentTarget;
                      run(() => attachProductAsset(p.id, new FormData(form)), () => {
                        form.reset();
                        setAttachFor(null);
                      });
                    }}
                  >
                    <input
                      type="file"
                      name="file"
                      required
                      aria-label={`Deliverable for ${p.title}`}
                      className="text-[12.5px] file:mr-3 file:rounded-lg file:border-0 file:bg-royal-tint file:px-3 file:py-1.5 file:text-[12px] file:font-bold file:text-royal-blue"
                    />
                    <button type="submit" className={btnPrimary} disabled={pending}>
                      {pending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />} Attach
                    </button>
                  </form>
                )}
              </div>
            );
          })}
        </div>
      </MpCard>
    </>
  );
}

function NewVersionButton({
  productId,
  pending,
  run,
}: {
  productId: string;
  pending: boolean;
  run: (fn: () => Promise<{ ok: true; message: string } | { ok: false; error: string }>, after?: () => void) => void;
}) {
  const [open, setOpen] = useState(false);
  if (!open) {
    return (
      <button type="button" className={btn} onClick={() => setOpen(true)}>
        New version
      </button>
    );
  }
  return (
    <form
      className="flex flex-wrap items-center gap-2"
      onSubmit={(e) => {
        e.preventDefault();
        const form = e.currentTarget;
        run(() => publishNewVersion(productId, new FormData(form)), () => {
          form.reset();
          setOpen(false);
        });
      }}
    >
      <input name="price" type="number" min={0} step="0.01" placeholder="New price" aria-label="New price" className="h-9 w-28 rounded-lg border border-line px-2.5 text-[12.5px]" />
      <input name="changelog" placeholder="What changed" aria-label="Changelog" className="h-9 w-44 rounded-lg border border-line px-2.5 text-[12.5px]" />
      <button type="submit" className={btnPrimary} disabled={pending}>Create</button>
      <button type="button" className={btn} onClick={() => setOpen(false)}>Cancel</button>
    </form>
  );
}
