"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { DataTable, type Column } from "@/components/admin/DataTable";
import { Badge } from "@/components/ui/badge";
import { formatDateShort } from "@/lib/utils";
import type { Portfolio } from "@/types";

export default function PortfolioAdminPage() {
  const [items, setItems] = useState<Portfolio[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    const res = await fetch("/api/portfolio");
    setItems(await res.json());
    setLoading(false);
  };
  useEffect(() => {
    load();
  }, []);

  const onDelete = async (row: Portfolio) => {
    const res = await fetch(`/api/portfolio/${row.id}`, { method: "DELETE" });
    if (res.ok) {
      toast.success("Case study deleted");
      setItems((prev) => prev.filter((p) => p.id !== row.id));
    } else toast.error("Delete failed");
  };

  const columns: Column<Portfolio>[] = [
    { key: "title", header: "Title", render: (r) => <span className="font-medium">{r.title}</span> },
    { key: "client", header: "Client" },
    { key: "tags", header: "Tags", render: (r) => r.tags.join(", ") },
    {
      key: "isFeatured",
      header: "Featured",
      render: (r) => (r.isFeatured ? <Badge>Featured</Badge> : <span className="text-[#9A9A9A]">—</span>),
    },
    {
      key: "isPublished",
      header: "Status",
      render: (r) => <Badge variant={r.isPublished ? "success" : "muted"}>{r.isPublished ? "Published" : "Draft"}</Badge>,
    },
    { key: "publishedAt", header: "Date", render: (r) => formatDateShort(r.publishedAt) },
  ];

  if (loading) return <p className="text-sm text-[#9A9A9A]">Loading...</p>;

  return (
    <DataTable
      columns={columns}
      data={items}
      searchKey="title"
      searchPlaceholder="Search case studies..."
      newHref="/admin/portfolio/new"
      editHref={(r) => `/admin/portfolio/${r.id}`}
      onDelete={onDelete}
      emptyLabel="No case studies yet."
    />
  );
}
