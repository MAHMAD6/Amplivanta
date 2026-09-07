"use client";

import { useState, useTransition } from "react";
import { Loader2 } from "lucide-react";
import { createJobOpening } from "@/app/(admin)/admin/actions";
import { cn } from "@/lib/utils";
import { SuperCard } from "./primitives";
import { toastResult } from "@/lib/action-toast";

const field =
  "h-12 w-full rounded-xl border border-line bg-white px-3.5 text-[13.5px] text-ink focus:border-royal-blue focus:outline-none focus:ring-2 focus:ring-royal-blue/15";

function Field({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[12.5px] font-bold text-admin-navy">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-[11.5px] text-ink-muted">{hint}</span>}
    </label>
  );
}

export function JobOpeningForm() {
  const [pending, start] = useTransition();

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const form = e.currentTarget;
        const fd = new FormData(form);
        start(async () => {
          if (toastResult(await createJobOpening(fd))) form.reset();
        });
      }}
    >
      <SuperCard className="p-6">
        <div className="grid gap-5 md:grid-cols-2">
          <div className="md:col-span-2">
            <Field label="Job title">
              <input name="title" required placeholder="e.g. Senior Product Designer" className={field} />
            </Field>
          </div>
          <Field label="Department">
            <input name="department" placeholder="e.g. Design" className={field} />
          </Field>
          <Field label="Location">
            <input name="location" placeholder="e.g. Remote — EU" className={field} />
          </Field>
          <Field label="Employment type">
            <select name="employment" defaultValue="Full-time" className={field}>
              {["Full-time", "Part-time", "Contract", "Internship"].map((o) => (
                <option key={o} value={o}>
                  {o}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Status">
            <select name="status" defaultValue="DRAFT" className={field}>
              <option value="DRAFT">Draft</option>
              <option value="OPEN">Open — publish to careers site</option>
              <option value="CLOSED">Closed</option>
            </select>
          </Field>
          <div className="md:col-span-2">
            <Field label="URL slug" hint="Leave blank to generate from the title.">
              <input name="slug" placeholder="senior-product-designer" className={field} />
            </Field>
          </div>
          <div className="md:col-span-2">
            <Field label="Description">
              <textarea
                name="description"
                rows={7}
                placeholder="Role summary, responsibilities and requirements..."
                className="w-full rounded-xl border border-line bg-white px-3.5 py-3 text-[13.5px] text-ink focus:border-royal-blue focus:outline-none focus:ring-2 focus:ring-royal-blue/15"
              />
            </Field>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-2.5">
          <button type="reset" className="h-12 rounded-xl border border-line bg-white px-5 text-[13.5px] font-bold text-admin-navy hover:bg-bg-soft">
            Clear
          </button>
          <button
            type="submit"
            disabled={pending}
            className="inline-flex h-12 items-center gap-2 rounded-xl bg-royal-blue px-5 text-[13.5px] font-bold text-white transition hover:bg-royal-soft disabled:opacity-60"
          >
            {pending && <Loader2 className="h-4 w-4 animate-spin" />} Create job opening
          </button>
        </div>
      </SuperCard>
    </form>
  );
}
