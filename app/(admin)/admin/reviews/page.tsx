"use client";

import { useEffect, useState, useMemo } from "react";
import { Star, Trash2, CheckCircle2, Award, ThumbsUp, Filter } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { StatsCard } from "@/components/admin/StatsCard";
import { toast } from "@/lib/toast";
import type { Review } from "@/types";

export default function ReviewsAdminPage() {
  const [items, setItems] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [toDelete, setToDelete] = useState<Review | null>(null);
  const [filterTab, setFilterTab] = useState<string>("all");

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
      toast.success("Review Status Updated", {
        description: "Visibility settings saved.",
      });
      setItems((prev) => prev.map((r) => (r.id === id ? { ...r, ...data } : r)));
    } else toast.error("Update Failed");
  };

  const remove = async (row: Review) => {
    const res = await fetch(`/api/reviews/${row.id}`, { method: "DELETE" });
    if (res.ok) {
      toast.success("Review Deleted", {
        description: `Review from ${row.name} was removed.`,
      });
      setItems((prev) => prev.filter((r) => r.id !== row.id));
    } else toast.error("Delete Failed");
  };

  const approveAllPending = async () => {
    const pending = items.filter((r) => !r.isApproved);
    if (pending.length === 0) return;

    try {
      await Promise.all(
        pending.map((r) =>
          fetch(`/api/reviews/${r.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ isApproved: true }),
          })
        )
      );
      toast.success(`Approved ${pending.length} Pending Reviews!`, {
        description: "Testimonials are now published live.",
      });
      setItems((prev) => prev.map((r) => ({ ...r, isApproved: true })));
    } catch {
      toast.error("Failed to Approve Reviews");
    }
  };

  // Metrics
  const stats = useMemo(() => {
    const total = items.length;
    const pending = items.filter((r) => !r.isApproved).length;
    const approved = items.filter((r) => r.isApproved).length;
    const avgRating =
      total > 0
        ? (items.reduce((acc, r) => acc + r.rating, 0) / total).toFixed(1)
        : "5.0";
    return { total, pending, approved, avgRating };
  }, [items]);

  // Filtered dataset
  const filtered = useMemo(() => {
    if (filterTab === "pending") return items.filter((r) => !r.isApproved);
    if (filterTab === "approved") return items.filter((r) => r.isApproved);
    if (filterTab === "5star") return items.filter((r) => r.rating === 5);
    if (filterTab === "4star") return items.filter((r) => r.rating < 5);
    return items;
  }, [items, filterTab]);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-sm text-[#767287]">Loading client reviews...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Metric Cards Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard title="Total Reviews" value={stats.total} icon={Star} variant="default" />
        <StatsCard title="Average Rating" value={`${stats.avgRating} / 5`} icon={Award} variant="success" />
        <StatsCard title="Approved Reviews" value={stats.approved} icon={ThumbsUp} variant="accent" />
        <StatsCard title="Pending Approval" value={stats.pending} icon={CheckCircle2} variant="warning" />
      </div>

      {/* Action Header & Tabs */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-[#e9e7f0] bg-white p-4 shadow-sm">
        {/* Filter Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {[
            { key: "all", label: "All Reviews" },
            { key: "pending", label: `Pending (${stats.pending})` },
            { key: "approved", label: `Approved (${stats.approved})` },
            { key: "5star", label: "5 Stars" },
            { key: "4star", label: "4 Stars & below" },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilterTab(tab.key)}
              className={`rounded-xl px-3.5 py-2 text-xs font-semibold transition ${
                filterTab === tab.key
                  ? "bg-[#14121f] text-[#6D3BF5]"
                  : "text-[#4a4756] hover:bg-[#f8f7fb] hover:text-[#14121f]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Bulk Approve */}
        {stats.pending > 0 && (
          <button
            onClick={approveAllPending}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#6D3BF5] px-4 py-2 text-xs font-bold text-white hover:bg-[#5B2FE0] transition shadow-xs"
          >
            <CheckCircle2 className="h-4 w-4" /> Approve All ({stats.pending})
          </button>
        )}
      </div>

      {/* Reviews List */}
      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-[#e9e7f0] bg-white p-12 text-center text-sm text-[#767287]">
          No reviews match the selected filter.
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {filtered.map((r) => (
            <div
              key={r.id}
              className="flex flex-col justify-between rounded-2xl border border-[#e9e7f0] bg-white p-6 shadow-xs transition hover:shadow-md hover:border-[#14121f]/20"
            >
              <div>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#14121f] text-sm font-extrabold text-[#6D3BF5]">
                      {r.name.charAt(0)}
                    </span>
                    <div>
                      <p className="font-display font-bold text-[#14121f]">{r.name}</p>
                      <p className="text-xs text-[#767287]">
                        {r.role}, <span className="font-semibold text-[#4a4756]">{r.company}</span>
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => setToDelete(r)}
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-red-500 hover:bg-red-50 transition"
                    aria-label="Delete review"
                    title="Delete Review"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                {/* Rating Stars */}
                <div className="mt-3 flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={
                        i < r.rating
                          ? "h-4 w-4 fill-[#6D3BF5] text-[#6D3BF5]"
                          : "h-4 w-4 text-[#e9e7f0]"
                      }
                    />
                  ))}
                  <span className="ml-2 font-mono text-xs font-bold text-[#14121f]">
                    {r.rating}.0
                  </span>
                </div>

                {/* Review Text */}
                <p className="mt-3 text-xs leading-relaxed text-[#4a4756] italic bg-[#f8f7fb] p-3 rounded-xl border border-[#e9e7f0]">
                  &ldquo;{r.content}&rdquo;
                </p>
              </div>

              {/* Switches Control Footer */}
              <div className="mt-4 flex items-center justify-between border-t border-[#e9e7f0] pt-4 text-xs font-semibold">
                <label className="flex items-center gap-2 cursor-pointer">
                  <Switch
                    checked={r.isApproved}
                    onCheckedChange={(v) => patch(r.id, { isApproved: v })}
                  />
                  <span className={r.isApproved ? "text-emerald-700" : "text-[#767287]"}>
                    {r.isApproved ? "Approved" : "Pending Approval"}
                  </span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <Switch
                    checked={r.isFeatured}
                    onCheckedChange={(v) => patch(r.id, { isFeatured: v })}
                  />
                  <span className={r.isFeatured ? "text-purple-700" : "text-[#767287]"}>
                    {r.isFeatured ? "Featured" : "Standard"}
                  </span>
                </label>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Modal */}
      <ConfirmDialog
        isOpen={!!toDelete}
        onClose={() => setToDelete(null)}
        onConfirm={() => toDelete && remove(toDelete)}
        title="Delete this client review?"
        description="This testimonial will be removed permanently from your website."
      />
    </div>
  );
}
