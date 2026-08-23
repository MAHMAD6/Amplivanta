"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { api } from "@/lib/client/api";
import { cn } from "@/lib/utils";

export type FieldType = "text" | "email" | "number" | "textarea" | "select" | "date";

export interface Field {
  name: string;
  label: string;
  type?: FieldType;
  required?: boolean;
  placeholder?: string;
  options?: { value: string; label: string }[];
  min?: number;
  max?: number;
  /** Grid columns the field spans (1 or 2). Default 2 (full width). */
  colSpan?: 1 | 2;
}

interface ResourceDialogProps {
  title: string;
  description?: string;
  fields: Field[];
  endpoint: string;
  method?: "POST" | "PATCH";
  initial?: Record<string, unknown>;
  submitLabel?: string;
  successMessage?: string;
  trigger: React.ReactNode;
  /** Field names whose comma-separated input should be sent as a string array. */
  arrayFields?: string[];
  /** Called with the created/updated record on success. */
  onSuccess?: (record: unknown) => void;
}

function coerce(field: Field, raw: string): unknown {
  if (raw === "") return undefined;
  if (field.type === "number") return Number(raw);
  if (field.type === "date") return new Date(raw).toISOString();
  return raw;
}

export function ResourceDialog({
  title,
  description,
  fields,
  endpoint,
  method = "POST",
  initial = {},
  submitLabel,
  successMessage,
  trigger,
  arrayFields,
  onSuccess,
}: ResourceDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [values, setValues] = useState<Record<string, string>>(() =>
    Object.fromEntries(fields.map((f) => [f.name, initial[f.name] != null ? String(initial[f.name]) : ""])),
  );

  function set(name: string, v: string) {
    setValues((prev) => ({ ...prev, [name]: v }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    // Build payload, dropping empty optional fields.
    const arraySet = new Set(arrayFields ?? []);
    const payload: Record<string, unknown> = {};
    for (const f of fields) {
      if (arraySet.has(f.name)) {
        const parts = (values[f.name] ?? "").split(",").map((s) => s.trim()).filter(Boolean);
        if (parts.length) payload[f.name] = parts;
        if (f.required && parts.length === 0) {
          toast.error(`${f.label} is required`);
          return;
        }
        continue;
      }
      const v = coerce(f, values[f.name] ?? "");
      if (v !== undefined) payload[f.name] = v;
      if (f.required && v === undefined) {
        toast.error(`${f.label} is required`);
        return;
      }
    }
    const body = payload;
    setLoading(true);
    try {
      const record = method === "PATCH" ? await api.patch(endpoint, body) : await api.post(endpoint, body);
      toast.success(successMessage ?? `${title} saved`);
      setOpen(false);
      onSuccess?.(record);
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        <form onSubmit={onSubmit} className="mt-2 grid grid-cols-2 gap-3">
          {fields.map((f) => (
            <div key={f.name} className={cn("flex flex-col gap-1", (f.colSpan ?? 2) === 2 ? "col-span-2" : "col-span-1")}>
              <label className="text-[11px] font-semibold uppercase tracking-wider text-ink-muted">
                {f.label}
                {f.required && <span className="text-red-500"> *</span>}
              </label>
              {f.type === "textarea" ? (
                <textarea
                  value={values[f.name]}
                  onChange={(e) => set(f.name, e.target.value)}
                  placeholder={f.placeholder}
                  rows={3}
                  className="rounded-xl border border-line bg-white px-3 py-2 text-[13px] focus:border-violet focus:outline-none"
                />
              ) : f.type === "select" ? (
                <select
                  value={values[f.name]}
                  onChange={(e) => set(f.name, e.target.value)}
                  className="h-10 rounded-xl border border-line bg-white px-3 text-[13px] focus:border-violet focus:outline-none"
                >
                  <option value="">Select…</option>
                  {f.options?.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type={f.type === "number" ? "number" : f.type === "date" ? "date" : f.type ?? "text"}
                  value={values[f.name]}
                  onChange={(e) => set(f.name, e.target.value)}
                  placeholder={f.placeholder}
                  min={f.min}
                  max={f.max}
                  className="h-10 rounded-xl border border-line bg-white px-3 text-[13px] focus:border-violet focus:outline-none"
                />
              )}
            </div>
          ))}
          <DialogFooter className="col-span-2">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="inline-flex h-10 items-center rounded-xl border border-line bg-white px-4 text-[13px] font-semibold text-ink-soft hover:border-ink/30"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex h-10 items-center gap-1.5 rounded-xl bg-grad-cta px-4 text-[13px] font-bold text-white shadow-violet disabled:opacity-60"
            >
              {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              {submitLabel ?? "Save"}
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
