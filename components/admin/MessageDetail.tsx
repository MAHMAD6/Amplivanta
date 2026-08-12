"use client";

import { useState } from "react";
import { toast } from "@/lib/toast";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import type { ContactMessage, ContactStatus } from "@/types";

const inputCls =
  "w-full rounded-xl border border-[#e9e7f0] bg-[#f8f7fb] px-4 py-3 text-sm focus:border-[#6D3BF5] focus:outline-none";

const STATUSES: ContactStatus[] = ["NEW", "IN_PROGRESS", "REPLIED", "CLOSED"];

export function MessageDetail({ message }: { message: ContactMessage }) {
  const [status, setStatus] = useState<ContactStatus>(message.status);
  const [notes, setNotes] = useState(message.notes ?? "");
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    const res = await fetch(`/api/contact/${message.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, notes }),
    });
    setSaving(false);
    if (res.ok) {
      toast.success("Inquiry Updated", {
        description: `Status updated to "${status.replace("_", " ")}". Internal notes recorded.`,
      });
    } else {
      toast.error("Failed to Save Changes", {
        description: "An error occurred while updating the message status.",
      });
    }
  };

  return (
    <div className="grid max-w-4xl gap-6 lg:grid-cols-2">
      <div className="rounded-2xl border border-[#e9e7f0] bg-white p-6">
        <h2 className="font-display text-lg font-bold text-[#14121f]">{message.name}</h2>
        <dl className="mt-4 space-y-2 text-sm">
          <div className="flex justify-between"><dt className="text-[#767287]">Email</dt><dd>{message.email}</dd></div>
          <div className="flex justify-between"><dt className="text-[#767287]">Phone</dt><dd>{message.phone ?? "—"}</dd></div>
          <div className="flex justify-between"><dt className="text-[#767287]">Company</dt><dd>{message.company ?? "—"}</dd></div>
          <div className="flex justify-between"><dt className="text-[#767287]">Service</dt><dd>{message.service ?? "—"}</dd></div>
          <div className="flex justify-between"><dt className="text-[#767287]">Budget</dt><dd>{message.budget ?? "—"}</dd></div>
        </dl>
        <div className="mt-4 border-t border-[#e9e7f0] pt-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-[#767287]">Message</p>
          <p className="mt-2 text-sm text-[#4a4756]">{message.message}</p>
        </div>
      </div>

      <div className="rounded-2xl border border-[#e9e7f0] bg-white p-6">
        <label className="mb-1.5 block text-sm font-medium">Status</label>
        <select className={inputCls} value={status} onChange={(e) => setStatus(e.target.value as ContactStatus)}>
          {STATUSES.map((s) => (
            <option key={s} value={s}>{s.replace("_", " ")}</option>
          ))}
        </select>

        <label className="mb-1.5 mt-4 block text-sm font-medium">Internal Notes</label>
        <textarea className={inputCls} rows={5} value={notes} onChange={(e) => setNotes(e.target.value)} />

        <button
          onClick={save}
          disabled={saving}
          className="mt-4 inline-flex items-center gap-2 rounded-full bg-[#6D3BF5] px-6 py-3 font-semibold text-white transition hover:bg-[#5B2FE0] disabled:opacity-60"
        >
          {saving && <LoadingSpinner className="text-black" />}
          Save Changes
        </button>
      </div>
    </div>
  );
}
