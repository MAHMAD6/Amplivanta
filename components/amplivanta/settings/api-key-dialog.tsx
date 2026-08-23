"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Plus, Copy, Check } from "lucide-react";
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

/** Creates an API key and shows the raw secret exactly once (it is never retrievable again). */
export function ApiKeyDialog() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [created, setCreated] = useState<{ key: string } | null>(null);
  const [copied, setCopied] = useState(false);

  function reset() {
    setName("");
    setCreated(null);
    setCopied(false);
  }

  async function onCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Key name is required");
      return;
    }
    setLoading(true);
    try {
      const res = await api.post<{ key: string }>("/api/api-keys", { name });
      setCreated(res);
      toast.success("API key created");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not create key");
    } finally {
      setLoading(false);
    }
  }

  async function copy() {
    if (!created) return;
    try {
      await navigator.clipboard.writeText(created.key);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Copy failed — select and copy manually");
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        if (!o) reset();
      }}
    >
      <DialogTrigger asChild>
        <button className="inline-flex h-10 items-center gap-1.5 rounded-xl bg-grad-cta px-4 text-[13px] font-bold text-white shadow-violet">
          <Plus className="h-3.5 w-3.5" /> New Key
        </button>
      </DialogTrigger>
      <DialogContent>
        {!created ? (
          <>
            <DialogHeader>
              <DialogTitle>New API Key</DialogTitle>
              <DialogDescription>Generate a workspace-scoped key. The secret is shown only once.</DialogDescription>
            </DialogHeader>
            <form onSubmit={onCreate} className="mt-2 space-y-3">
              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-semibold uppercase tracking-wider text-ink-muted">Key name<span className="text-red-500"> *</span></label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Production server"
                  className="h-10 rounded-xl border border-line bg-white px-3 text-[13px] focus:border-violet focus:outline-none"
                />
              </div>
              <DialogFooter>
                <button type="button" onClick={() => setOpen(false)} className="inline-flex h-10 items-center rounded-xl border border-line bg-white px-4 text-[13px] font-semibold text-ink-soft hover:border-ink/30">Cancel</button>
                <button type="submit" disabled={loading} className="inline-flex h-10 items-center gap-1.5 rounded-xl bg-grad-cta px-4 text-[13px] font-bold text-white shadow-violet disabled:opacity-60">
                  {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" />} Create key
                </button>
              </DialogFooter>
            </form>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Copy your API key</DialogTitle>
              <DialogDescription>This is the only time the full key is shown. Store it somewhere safe.</DialogDescription>
            </DialogHeader>
            <div className="mt-3 flex items-center gap-2 rounded-xl border border-line bg-bg-soft/60 p-3">
              <code className="min-w-0 flex-1 truncate font-mono text-[12px] text-ink">{created.key}</code>
              <button onClick={copy} className="inline-flex h-8 items-center gap-1 rounded-lg border border-line bg-white px-2 text-[12px] font-semibold text-ink hover:border-violet/40">
                {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                {copied ? "Copied" : "Copy"}
              </button>
            </div>
            <DialogFooter>
              <button onClick={() => setOpen(false)} className="inline-flex h-10 items-center rounded-xl bg-grad-cta px-4 text-[13px] font-bold text-white shadow-violet">Done</button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
