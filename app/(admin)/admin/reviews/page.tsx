"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Star, Trash2 } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import type { Review } from "@/types";

export default function ReviewsAdminPage() {
  const [items, setItems] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [toDelete, setToDelete] = useState<Review | null>(null);

  const load = async () => {
    const res = await fetch("/api/reviews");
    if (res.ok) setItems(await res.json());
    setLoading(false);
  };
  useEffect(() => {
    load();
  }, []);

  const patch = async (id: string, data: Partial<Review>) => {
    const res = await fetch(`/api/reviews/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      setItems((prev) => prev.map((r) => (r.id === id ? { ...r, ...data } : r)));
    } else toast.error("Update failed");
  };

  const remove = async (row: Review) => {
    const res = await fetch(`/api/reviews/${row.id}`, { method: "DELETE" });
    if (res.ok) {
      toast.success("Review deleted");
      setItems((prev) => prev.filter((r) => r.id !== row.id));
    } else toast.error("Delete failed");
  };

  if (loading) return <p className="text-sm text-[#9A9A9A]">Loading...</p>;

  return (
    <div className="space-y-4">
      {items.length === 0 && (
        <p className="rounded-2xl border border-[#E3E3E3] bg-white p-12 text-center text-sm text-[#9A9A9A]">
          No reviews yet.
        </p>
      )}
      {items.map((r) => (
        <div key={r.id} className="rounded-2xl border border-[#E3E3E3] bg-white p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <p className="font-semibold text-[#0A0A0A]">{r.name}</p>
                <span className="text-sm text-[#9A9A9A]">
                  {r.role}, {r.company}
                </span>
              </div>
              <div className="mt-1 flex gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className={i < r.rating ? "h-4 w-4 fill-[#B5FF2D] text-[#B5FF2D]" : "h-4 w-4 text-[#E3E3E3]"} />
                ))}
              </div>
              <p className="mt-3 text-sm italic text-[#5A5A5A]">&ldquo;{r.content}&rdquo;</p>
            </div>
            <button onClick={() => setToDelete(r)} className="shrink-0 text-red-500 hover:text-red-600" aria-label="Delete review">
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
          <div className="mt-4 flex items-center gap-8 border-t border-[#E3E3E3] pt-4">
            <label className="flex items-center gap-2 text-sm">
              <Switch checked={r.isApproved} onCheckedChange={(v) => patch(r.id, { isApproved: v })} />
              Approved
            </label>
            <label className="flex items-center gap-2 text-sm">
              <Switch checked={r.isFeatured} onCheckedChange={(v) => patch(r.id, { isFeatured: v })} />
              Featured
            </label>
          </div>
        </div>
      ))}

      <ConfirmDialog
        isOpen={!!toDelete}
        onClose={() => setToDelete(null)}
        onConfirm={() => toDelete && remove(toDelete)}
        title="Delete this review?"
      />
    </div>
  );
}
