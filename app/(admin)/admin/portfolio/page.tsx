"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { DataTable, type Column, type FilterTab } from "@/components/admin/DataTable";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { formatDateShort } from "@/lib/utils";
import { toast } from "@/lib/toast";
import type { Portfolio } from "@/types";

export default function PortfolioAdminPage() {
  const [items, setItems] = useState<Portfolio[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    const res = await fetch("/api/portfolio");
    if (res.ok) setItems(await res.json());
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const patch = async (id: string, data: Partial<Portfolio>) => {
    const res = await fetch(`/api/portfolio/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      setItems((prev) => prev.map((p) => (p.id === id ? { ...p, ...data } : p)));
      toast.success("Case Study Updated", {
        description: "Showcase parameters updated successfully.",
      });
    } else toast.error("Update Failed");
  };

  const onDelete = async (row: Portfolio) => {
    const res = await fetch(`/api/portfolio/${row.id}`, { method: "DELETE" });
    if (res.ok) {
      toast.success("Case Study Deleted", {
        description: `"${row.title}" was removed.`,
      });
      setItems((prev) => prev.filter((p) => p.id !== row.id));
    } else toast.error("Delete Failed");
  };

  const onBulkDelete = async (rows: Portfolio[]) => {
    try {
      await Promise.all(rows.map((r) => fetch(`/api/portfolio/${r.id}`, { method: "DELETE" })));
      toast.success(`${rows.length} Case Studies Deleted`, {
        description: "Selected portfolio items removed.",
      });
      setItems((prev) => prev.filter((p) => !rows.some((r) => r.id === p.id)));
    } catch {
      toast.error("Bulk Delete Failed");
    }
  };

  const columns: Column<Portfolio>[] = [
    {
      key: "coverImage",
      header: "Preview",
      sortable: false,
      render: (r) => (
        <div className="relative h-10 w-16 overflow-hidden rounded-lg bg-[#14121f] border border-[#e9e7f0]">
          {r.coverImage ? (
            <Image src={r.coverImage} alt={r.title} fill className="object-cover" />
          ) : (
            <span className="flex h-full w-full items-center justify-center font-mono text-[10px] text-[#767287]">
              No Img
            </span>
          )}
        </div>
      ),
    },
    {
      key: "title",
      header: "Project Title",
      render: (r) => (
        <div>
          <span className="font-bold text-[#14121f]">{r.title}</span>
          <p className="text-[11px] text-[#767287]">Client: {r.client}</p>
        </div>
      ),
    },
    {
      key: "tags",
      header: "Tags & Tech",
      render: (r) => (
        <div className="flex flex-wrap gap-1 max-w-xs">
          {r.tags?.slice(0, 3).map((tag, i) => (
            <span key={i} className="rounded bg-[#f8f7fb] px-1.5 py-0.5 text-[10px] font-semibold text-[#4a4756]">
              {tag}
            </span>
          ))}
          {r.tags?.length > 3 && (
            <span className="text-[10px] text-[#767287]">+{r.tags.length - 3}</span>
          )}
        </div>
      ),
    },
    {
      key: "isFeatured",
      header: "Featured",
      render: (r) => (
        <label className="flex items-center gap-2 cursor-pointer">
          <Switch checked={r.isFeatured} onCheckedChange={(v) => patch(r.id, { isFeatured: v })} />
          <span className="text-xs">{r.isFeatured ? "Featured" : "No"}</span>
        </label>
      ),
    },
    {
      key: "isPublished",
      header: "Publish State",
      render: (r) => (
        <label className="flex items-center gap-2 cursor-pointer">
          <Switch checked={r.isPublished} onCheckedChange={(v) => patch(r.id, { isPublished: v })} />
          <Badge variant={r.isPublished ? "success" : "muted"}>{r.isPublished ? "Published" : "Draft"}</Badge>
        </label>
      ),
    },
    { key: "publishedAt", header: "Date", render: (r) => formatDateShort(r.publishedAt) },
  ];

  const filterTabs: FilterTab[] = [
    { key: "featured", label: "Featured Projects", filterFn: (p) => p.isFeatured },
    { key: "published", label: "Published", filterFn: (p) => p.isPublished },
    { key: "draft", label: "Drafts", filterFn: (p) => !p.isPublished },
  ];

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-sm text-[#767287]">Loading portfolio case studies...</p>
      </div>
    );
  }

  return (
    <DataTable
      title="Portfolio & Case Studies"
      columns={columns}
      data={items}
      searchKey="title"
      searchPlaceholder="Search by project or client..."
      filterTabs={filterTabs}
      newHref="/admin/portfolio/new"
      editHref={(r) => `/admin/portfolio/${r.id}`}
      onDelete={onDelete}
      onBulkDelete={onBulkDelete}
      emptyLabel="No portfolio case studies created yet."
    />
  );
}
