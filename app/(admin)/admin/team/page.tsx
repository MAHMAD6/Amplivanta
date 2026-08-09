"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { DataTable, type Column } from "@/components/admin/DataTable";
import { Badge } from "@/components/ui/badge";
import type { TeamMember } from "@/types";

export default function TeamAdminPage() {
  const [items, setItems] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    const res = await fetch("/api/team");
    setItems(await res.json());
    setLoading(false);
  };
  useEffect(() => {
    load();
  }, []);

  const onDelete = async (row: TeamMember) => {
    const res = await fetch(`/api/team/${row.id}`, { method: "DELETE" });
    if (res.ok) {
      toast.success("Member deleted");
      setItems((prev) => prev.filter((m) => m.id !== row.id));
    } else toast.error("Delete failed");
  };

  const columns: Column<TeamMember>[] = [
    { key: "name", header: "Name", render: (r) => <span className="font-medium">{r.name}</span> },
    { key: "role", header: "Role" },
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
      searchKey="name"
      searchPlaceholder="Search team..."
      newHref="/admin/team/new"
      editHref={(r) => `/admin/team/${r.id}`}
      onDelete={onDelete}
      emptyLabel="No team members yet."
    />
  );
}
