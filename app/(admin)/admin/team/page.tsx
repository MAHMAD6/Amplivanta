"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Linkedin, Twitter, User } from "lucide-react";
import { DataTable, type Column, type FilterTab } from "@/components/admin/DataTable";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/lib/toast";
import type { TeamMember } from "@/types";

export default function TeamAdminPage() {
  const [items, setItems] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    const res = await fetch("/api/team");
    if (res.ok) setItems(await res.json());
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const patch = async (id: string, data: Partial<TeamMember>) => {
    const res = await fetch(`/api/team/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      setItems((prev) => prev.map((m) => (m.id === id ? { ...m, ...data } : m)));
      toast.success("Team Profile Updated", {
        description: "Status and display order saved.",
      });
    } else toast.error("Update Failed");
  };

  const onDelete = async (row: TeamMember) => {
    const res = await fetch(`/api/team/${row.id}`, { method: "DELETE" });
    if (res.ok) {
      toast.success("Team Member Removed", {
        description: `${row.name} profile deleted.`,
      });
      setItems((prev) => prev.filter((m) => m.id !== row.id));
    } else toast.error("Delete Failed");
  };

  const onBulkDelete = async (rows: TeamMember[]) => {
    try {
      await Promise.all(rows.map((r) => fetch(`/api/team/${r.id}`, { method: "DELETE" })));
      toast.success(`${rows.length} Team Members Removed`, {
        description: "Selected team profiles deleted.",
      });
      setItems((prev) => prev.filter((m) => !rows.some((r) => r.id === m.id)));
    } catch {
      toast.error("Bulk Delete Failed");
    }
  };

  const columns: Column<TeamMember>[] = [
    {
      key: "image",
      header: "Avatar",
      sortable: false,
      render: (r) => (
        <div className="relative h-10 w-10 overflow-hidden rounded-full bg-[#14121f] border border-[#e9e7f0]">
          {r.image ? (
            <Image src={r.image} alt={r.name} fill className="object-cover" />
          ) : (
            <span className="flex h-full w-full items-center justify-center text-xs font-bold text-[#6D3BF5]">
              {r.name.charAt(0)}
            </span>
          )}
        </div>
      ),
    },
    {
      key: "name",
      header: "Name",
      render: (r) => (
        <div>
          <span className="font-bold text-[#14121f]">{r.name}</span>
          {r.bio && <p className="line-clamp-1 text-[11px] text-[#767287]">{r.bio}</p>}
        </div>
      ),
    },
    { key: "role", header: "Designation / Role" },
    {
      key: "socials",
      header: "Social Profiles",
      sortable: false,
      render: (r) => (
        <div className="flex items-center gap-1.5 text-[#767287]">
          {r.linkedin ? (
            <a href={r.linkedin} target="_blank" rel="noreferrer" className="hover:text-blue-600">
              <Linkedin className="h-3.5 w-3.5" />
            </a>
          ) : null}
          {r.twitter ? (
            <a href={r.twitter} target="_blank" rel="noreferrer" className="hover:text-sky-500">
              <Twitter className="h-3.5 w-3.5" />
            </a>
          ) : null}
          {!r.linkedin && !r.twitter && <span className="text-[11px] text-[#767287]">—</span>}
        </div>
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
    { key: "active", label: "Active Members", filterFn: (m) => m.isActive },
    { key: "hidden", label: "Hidden / Inactive", filterFn: (m) => !m.isActive },
  ];

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-sm text-[#767287]">Loading team members...</p>
      </div>
    );
  }

  return (
    <DataTable
      title="Team Members & Staff"
      columns={columns}
      data={items}
      searchKey="name"
      searchPlaceholder="Search team members..."
      filterTabs={filterTabs}
      newHref="/admin/team/new"
      editHref={(r) => `/admin/team/${r.id}`}
      onDelete={onDelete}
      onBulkDelete={onBulkDelete}
      emptyLabel="No team members added yet."
    />
  );
}
