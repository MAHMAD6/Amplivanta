"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { DataTable, type Column } from "@/components/admin/DataTable";
import { Badge } from "@/components/ui/badge";
import type { Service } from "@/types";

export default function ServicesAdminPage() {
  const [items, setItems] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    const res = await fetch("/api/services");
    setItems(await res.json());
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const onDelete = async (row: Service) => {
    const res = await fetch(`/api/services/${row.id}`, { method: "DELETE" });
    if (res.ok) {
      toast.success("Service deleted");
      setItems((prev) => prev.filter((s) => s.id !== row.id));
    } else {
      toast.error("Delete failed");
    }
  };

  const columns: Column<Service>[] = [
    { key: "icon", header: "Icon", render: (r) => <span className="text-xl">{r.icon}</span> },
    { key: "title", header: "Title", render: (r) => <span className="font-medium">{r.title}</span> },
    { key: "slug", header: "Slug", render: (r) => <span className="text-[#9A9A9A]">{r.slug}</span> },
    { key: "order", header: "Order" },
    {
      key: "isActive",
      header: "Active",
      render: (r) => <Badge variant={r.isActive ? "success" : "muted"}>{r.isActive ? "Active" : "Inactive"}</Badge>,
    },
  ];

  if (loading) return <p className="text-sm text-[#9A9A9A]">Loading...</p>;

  return (
    <DataTable
      columns={columns}
      data={items}
      searchKey="title"
      searchPlaceholder="Search services..."
      newHref="/admin/services/new"
      editHref={(r) => `/admin/services/${r.id}`}
      onDelete={onDelete}
      emptyLabel="No services yet."
    />
  );
}
