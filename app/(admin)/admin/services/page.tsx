"use client";

import { useEffect, useState } from "react";
import { DataTable, type Column, type FilterTab } from "@/components/admin/DataTable";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/lib/toast";
import type { Service } from "@/types";

export default function ServicesAdminPage() {
  const [items, setItems] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    const res = await fetch("/api/services");
    if (res.ok) setItems(await res.json());
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const patch = async (id: string, data: Partial<Service>) => {
    const res = await fetch(`/api/services/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      setItems((prev) => prev.map((s) => (s.id === id ? { ...s, ...data } : s)));
      toast.success("Service Package Updated", {
        description: "Status and display configuration saved.",
      });
    } else toast.error("Update Failed");
  };

  const onDelete = async (row: Service) => {
    const res = await fetch(`/api/services/${row.id}`, { method: "DELETE" });
    if (res.ok) {
      toast.success("Service Deleted", {
        description: `"${row.title}" offering was removed.`,
      });
      setItems((prev) => prev.filter((s) => s.id !== row.id));
    } else toast.error("Delete Failed");
  };

  const onBulkDelete = async (rows: Service[]) => {
    try {
      await Promise.all(rows.map((r) => fetch(`/api/services/${r.id}`, { method: "DELETE" })));
      toast.success(`${rows.length} Services Deleted`, {
        description: "Selected service offerings removed.",
      });
      setItems((prev) => prev.filter((s) => !rows.some((r) => r.id === s.id)));
    } catch {
      toast.error("Bulk Delete Failed");
    }
  };

  const columns: Column<Service>[] = [
    {
      key: "icon",
      header: "Icon",
      sortable: false,
      render: (r) => (
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#14121f] text-lg font-bold text-[#6D3BF5] shadow-xs">
          {r.icon}
        </span>
      ),
    },
    {
      key: "title",
      header: "Service Title",
      render: (r) => (
        <div>
          <span className="font-bold text-[#14121f]">{r.title}</span>
          <p className="line-clamp-1 text-[11px] text-[#767287]">{r.description}</p>
        </div>
      ),
    },
    { key: "slug", header: "URL Slug", render: (r) => <code className="font-mono text-xs text-[#4a4756]">/{r.slug}</code> },
    {
      key: "features",
      header: "Features Count",
      render: (r) => (
        <span className="rounded-full bg-[#f8f7fb] px-2.5 py-1 font-mono text-xs font-semibold text-[#14121f]">
          {r.features?.length || 0} features
        </span>
      ),
    },
    { key: "order", header: "Display Order" },
    {
      key: "isActive",
      header: "Status",
      render: (r) => (
        <div className="flex items-center gap-2">
          <Switch checked={r.isActive} onCheckedChange={(v) => patch(r.id, { isActive: v })} />
          <Badge variant={r.isActive ? "success" : "muted"}>{r.isActive ? "Active" : "Hidden"}</Badge>
        </div>
      ),
    },
  ];

  const filterTabs: FilterTab[] = [
    { key: "active", label: "Active Services", filterFn: (s) => s.isActive },
    { key: "inactive", label: "Hidden / Inactive", filterFn: (s) => !s.isActive },
  ];

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-sm text-[#767287]">Loading digital services...</p>
      </div>
    );
  }

  return (
    <DataTable
      title="Services Management"
      columns={columns}
      data={items}
      searchKey="title"
      searchPlaceholder="Search services..."
      filterTabs={filterTabs}
      newHref="/admin/services/new"
      editHref={(r) => `/admin/services/${r.id}`}
      onDelete={onDelete}
      onBulkDelete={onBulkDelete}
      emptyLabel="No services created yet."
    />
  );
}
