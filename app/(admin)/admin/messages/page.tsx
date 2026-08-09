"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { DataTable, type Column } from "@/components/admin/DataTable";
import { Badge } from "@/components/ui/badge";
import { formatDateShort } from "@/lib/utils";
import type { ContactMessage, ContactStatus } from "@/types";

const STATUS_VARIANT: Record<ContactStatus, "info" | "warning" | "success" | "muted"> = {
  NEW: "info",
  IN_PROGRESS: "warning",
  REPLIED: "success",
  CLOSED: "muted",
};

export default function MessagesAdminPage() {
  const [items, setItems] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/contact")
      .then((r) => (r.ok ? r.json() : []))
      .then(setItems)
      .finally(() => setLoading(false));
  }, []);

  const columns: Column<ContactMessage>[] = [
    {
      key: "name",
      header: "Name",
      render: (r) => (
        <Link href={`/admin/messages/${r.id}`} className="font-medium text-[#0A0A0A] hover:text-[#8fd620]">
          {r.name}
        </Link>
      ),
    },
    { key: "email", header: "Email" },
    { key: "service", header: "Service", render: (r) => r.service ?? "—" },
    { key: "budget", header: "Budget", render: (r) => r.budget ?? "—" },
    {
      key: "status",
      header: "Status",
      render: (r) => <Badge variant={STATUS_VARIANT[r.status]}>{r.status.replace("_", " ")}</Badge>,
    },
    { key: "createdAt", header: "Date", render: (r) => formatDateShort(r.createdAt) },
  ];

  if (loading) return <p className="text-sm text-[#9A9A9A]">Loading...</p>;

  return (
    <DataTable
      columns={columns}
      data={items}
      searchKey="name"
      searchPlaceholder="Search messages..."
      editHref={(r) => `/admin/messages/${r.id}`}
      emptyLabel="No messages yet."
    />
  );
}
