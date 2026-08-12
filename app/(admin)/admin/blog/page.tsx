"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Clock, BookOpen } from "lucide-react";
import { DataTable, type Column, type FilterTab } from "@/components/admin/DataTable";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { formatDateShort } from "@/lib/utils";
import { toast } from "@/lib/toast";
import type { BlogPost } from "@/types";

export default function BlogAdminPage() {
  const [items, setItems] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    const res = await fetch("/api/blog");
    if (res.ok) setItems(await res.json());
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const patch = async (id: string, data: Partial<BlogPost>) => {
    const res = await fetch(`/api/blog/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      setItems((prev) => prev.map((b) => (b.id === id ? { ...b, ...data } : b)));
      toast.success("Blog Post Updated", {
        description: "Post status / publication settings saved.",
      });
    } else {
      toast.error("Failed to Update Blog Post");
    }
  };

  const onDelete = async (row: BlogPost) => {
    const res = await fetch(`/api/blog/${row.id}`, { method: "DELETE" });
    if (res.ok) {
      toast.success("Article Deleted", {
        description: `"${row.title}" was removed.`,
      });
      setItems((prev) => prev.filter((p) => p.id !== row.id));
    } else {
      toast.error("Delete Failed", {
        description: "Could not remove article from database.",
      });
    }
  };

  const onBulkDelete = async (rows: BlogPost[]) => {
    try {
      await Promise.all(rows.map((r) => fetch(`/api/blog/${r.id}`, { method: "DELETE" })));
      toast.success(`${rows.length} Articles Deleted`, {
        description: "Selected articles were permanently removed.",
      });
      setItems((prev) => prev.filter((p) => !rows.some((r) => r.id === p.id)));
    } catch {
      toast.error("Bulk Delete Failed", {
        description: "Could not complete bulk deletion process.",
      });
    }
  };

  const columns: Column<BlogPost>[] = [
    {
      key: "coverImage",
      header: "Cover",
      sortable: false,
      render: (r) => (
        <div className="relative h-10 w-14 overflow-hidden rounded-lg bg-[#14121f] border border-[#e9e7f0]">
          {r.coverImage ? (
            <Image src={r.coverImage} alt={r.title} fill className="object-cover" />
          ) : (
            <span className="flex h-full w-full items-center justify-center">
              <BookOpen className="h-4 w-4 text-[#767287]" />
            </span>
          )}
        </div>
      ),
    },
    {
      key: "title",
      header: "Article Title",
      render: (r) => (
        <div className="max-w-md">
          <span className="font-bold text-[#14121f] line-clamp-1">{r.title}</span>
          <p className="line-clamp-1 text-[11px] text-[#767287]">{r.excerpt}</p>
        </div>
      ),
    },
    { key: "author", header: "Author" },
    {
      key: "readTime",
      header: "Est. Read",
      sortable: false,
      render: (r) => {
        const words = (r.content || "").replace(/<[^>]+>/g, "").split(/\s+/).length;
        const mins = Math.max(1, Math.ceil(words / 200));
        return (
          <span className="inline-flex items-center gap-1 font-mono text-[11px] text-[#4a4756]">
            <Clock className="h-3 w-3 text-[#767287]" /> {mins} min
          </span>
        );
      },
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
      header: "Status",
      render: (r) => (
        <label className="flex items-center gap-2 cursor-pointer">
          <Switch checked={r.isPublished} onCheckedChange={(v) => patch(r.id, { isPublished: v })} />
          <Badge variant={r.isPublished ? "success" : "muted"}>{r.isPublished ? "Published" : "Draft"}</Badge>
        </label>
      ),
    },
    { key: "createdAt", header: "Created", render: (r) => formatDateShort(r.createdAt) },
  ];

  const filterTabs: FilterTab[] = [
    { key: "published", label: "Published Articles", filterFn: (p) => p.isPublished },
    { key: "draft", label: "Drafts", filterFn: (p) => !p.isPublished },
    { key: "featured", label: "Featured", filterFn: (p) => p.isFeatured },
  ];

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-sm text-[#767287]">Loading blog posts...</p>
      </div>
    );
  }

  return (
    <DataTable
      title="Blog & Articles"
      columns={columns}
      data={items}
      searchKey="title"
      searchPlaceholder="Search articles..."
      filterTabs={filterTabs}
      newHref="/admin/blog/new"
      editHref={(r) => `/admin/blog/${r.id}`}
      onDelete={onDelete}
      onBulkDelete={onBulkDelete}
      emptyLabel="No blog articles written yet."
    />
  );
}
