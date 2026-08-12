"use client";

import { useState, useEffect } from "react";
import { X, Mail, Phone, Building, Layers, DollarSign, Calendar, Save, CheckCircle } from "lucide-react";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { formatDateShort } from "@/lib/utils";
import { toast } from "@/lib/toast";
import type { ContactMessage, ContactStatus } from "@/types";

const STATUSES: { value: ContactStatus; label: string; color: string }[] = [
  { value: "NEW", label: "New Message", color: "bg-blue-100 text-blue-800" },
  { value: "IN_PROGRESS", label: "In Progress", color: "bg-amber-100 text-amber-800" },
  { value: "REPLIED", label: "Replied", color: "bg-emerald-100 text-emerald-800" },
  { value: "CLOSED", label: "Closed", color: "bg-gray-100 text-gray-700" },
];

export function MessageDrawer({
  message,
  onClose,
  onUpdate,
}: {
  message: ContactMessage | null;
  onClose: () => void;
  onUpdate: (updated: ContactMessage) => void;
}) {
  const [status, setStatus] = useState<ContactStatus>("NEW");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (message) {
      setStatus(message.status);
      setNotes(message.notes ?? "");
    }
  }, [message]);

  if (!message) return null;

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/contact/${message.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, notes }),
      });
      if (res.ok) {
        toast.success("Inquiry Status Updated", {
          description: `Message marked as "${status.replace("_", " ")}".`,
        });
        onUpdate({ ...message, status, notes });
        onClose();
      } else {
        toast.error("Failed to Update Message", {
          description: "Database update failed. Please try again.",
        });
      }
    } catch {
      toast.error("Network Error", {
        description: "Could not save message details.",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-xs transition-opacity">
      <div
        className="w-full max-w-xl bg-white text-[#14121f] shadow-2xl h-full flex flex-col animate-in slide-in-from-right duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#e9e7f0] bg-[#14121f] px-6 py-4 text-white">
          <div className="flex items-center gap-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#6D3BF5] text-white">
              <Mail className="h-4 w-4" />
            </span>
            <div>
              <h3 className="font-display text-base font-bold">{message.name}</h3>
              <p className="text-xs text-white/60">{formatDateShort(message.createdAt)}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-white/60 hover:bg-white/10 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Status Pills */}
          <div>
            <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-[#767287]">
              Message Status
            </label>
            <div className="flex flex-wrap gap-2">
              {STATUSES.map((s) => (
                <button
                  key={s.value}
                  type="button"
                  onClick={() => setStatus(s.value)}
                  className={`rounded-xl px-3 py-1.5 text-xs font-bold transition flex items-center gap-1.5 ${
                    status === s.value
                      ? "bg-[#14121f] text-[#6D3BF5] shadow-sm"
                      : "bg-[#f8f7fb] text-[#4a4756] hover:bg-[#e9e7f0]"
                  }`}
                >
                  {status === s.value && <CheckCircle className="h-3.5 w-3.5 text-[#6D3BF5]" />}
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Quick Info Grid */}
          <div className="grid grid-cols-2 gap-3 rounded-2xl border border-[#e9e7f0] bg-[#f8f7fb] p-4 text-xs">
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-[#767287]" />
              <span className="truncate font-medium">{message.email}</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-[#767287]" />
              <span>{message.phone || "Not provided"}</span>
            </div>
            <div className="flex items-center gap-2">
              <Building className="h-4 w-4 text-[#767287]" />
              <span>{message.company || "No company"}</span>
            </div>
            <div className="flex items-center gap-2">
              <Layers className="h-4 w-4 text-[#767287]" />
              <span>{message.service || "General Inquiry"}</span>
            </div>
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-[#767287]" />
              <span>{message.budget || "Unspecified"}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-[#767287]" />
              <span>{formatDateShort(message.createdAt)}</span>
            </div>
          </div>

          {/* Message Text */}
          <div>
            <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-[#767287]">
              Message Content
            </label>
            <div className="rounded-2xl border border-[#e9e7f0] bg-white p-4 text-sm text-[#14121f] leading-relaxed whitespace-pre-wrap">
              {message.message}
            </div>
          </div>

          {/* Internal Notes */}
          <div>
            <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-[#767287]">
              Internal Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add internal follow-up notes, team comments, or action items..."
              rows={4}
              className="w-full rounded-2xl border border-[#e9e7f0] bg-[#f8f7fb] p-3 text-xs text-[#14121f] focus:border-[#6D3BF5] focus:bg-white focus:outline-none transition"
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between border-t border-[#e9e7f0] bg-[#f8f7fb] px-6 py-4">
          <a
            href={`mailto:${message.email}?subject=Re: ${encodeURIComponent(message.service || "Inquiry")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-xl border border-[#e9e7f0] bg-white px-4 py-2.5 text-xs font-bold text-[#14121f] hover:bg-[#e9e7f0] transition"
          >
            <Mail className="h-3.5 w-3.5" /> Email Client
          </a>

          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-xl bg-[#6D3BF5] px-5 py-2.5 text-xs font-bold text-white hover:bg-[#5B2FE0] disabled:opacity-60 transition shadow-sm"
          >
            {saving ? <LoadingSpinner className="text-black" /> : <Save className="h-4 w-4" />}
            Save & Update
          </button>
        </div>
      </div>
    </div>
  );
}
