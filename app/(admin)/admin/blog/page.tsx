"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { DataTable, type Column } from "@/components/admin/DataTable";
import { Badge } from "@/components/ui/badge";
import { formatDateShort } from "@/lib/utils";
import type { BlogPost } from "@/types";

export default function BlogAdminPage() {
  const [items, setItems] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    const res = await fetch("/api/blog");
    setItems(await res.json());
    setLoading(false);
  };
  useEffect(() => {
    load();
  }, []);

  const onDelete = async (row: BlogPost) => {
    const res = await fetch(`/api/blog/${row.id}`, { method: "DELETE" });
    if (res.ok) {
      toast.success("Post deleted");
      setItems((prev) => prev.filter((p) => p.id !== row.id));
    } else toast.error("Delete failed");
  };

  const columns: Column<BlogPost>[] = [
    { key: "title", header: "Title", render: (r) => <span className="font-medium">{r.title}</span> },
    { key: "author", header: "Author" },
    {
      key: "isPublished",
      header: "Status",
      render: (r) => <Badge variant={r.isPublished ? "success" : "muted"}>{r.isPublished ? "Published" : "Draft"}</Badge>,
    },
    {
      key: "isFeatured",
      header: "Featured",
      render: (r) => (r.isFeatured ? <Badge>Featured</Badge> : <span className="text-[#9A9A9A]">—</span>),
    },
    { key: "createdAt", header: "Date", render: (r) => formatDateShort(r.createdAt) },
  ];

  if (loading) return <p className="text-sm text-[#9A9A9A]">Loading...</p>;

  return (
    <DataTable
      columns={columns}
      data={items}
      searchKey="title"
      searchPlaceholder="Search posts..."
      newHref="/admin/blog/new"
      editHref={(r) => `/admin/blog/${r.id}`}
      onDelete={onDelete}
      emptyLabel="No posts yet."
    />
  );
}
