"use client";

import { useEffect, useState } from "react";
import { Eye, Mail, MessageSquare } from "lucide-react";
import { DataTable, type Column, type FilterTab } from "@/components/admin/DataTable";
import { Badge } from "@/components/ui/badge";
import { MessageDrawer } from "@/components/admin/MessageDrawer";
import { formatDateShort } from "@/lib/utils";
import { toast } from "@/lib/toast";
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
  const [activeMessage, setActiveMessage] = useState<ContactMessage | null>(null);

  const load = async () => {
    const res = await fetch("/api/contact");
    if (res.ok) setItems(await res.json());
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const onDelete = async (row: ContactMessage) => {
    const res = await fetch(`/api/contact/${row.id}`, { method: "DELETE" });
    if (res.ok) {
      toast.success("Message Deleted", {
        description: `Inquiry from ${row.name} was removed.`,
      });
      setItems((prev) => prev.filter((m) => m.id !== row.id));
    } else {
      toast.error("Delete Failed", {
        description: "Could not delete inquiry.",
      });
    }
  };

  const onBulkDelete = async (rows: ContactMessage[]) => {
    try {
      await Promise.all(rows.map((r) => fetch(`/api/contact/${r.id}`, { method: "DELETE" })));
      toast.success(`${rows.length} Messages Deleted`, {
        description: "Selected inquiries were permanently removed.",
      });
      setItems((prev) => prev.filter((m) => !rows.some((r) => r.id === m.id)));
    } catch {
      toast.error("Bulk Delete Failed");
    }
  };

  const handleUpdateMessage = (updated: ContactMessage) => {
    setItems((prev) => prev.map((m) => (m.id === updated.id ? updated : m)));
  };

  const columns: Column<ContactMessage>[] = [
    {
      key: "name",
      header: "Client Name",
      render: (r) => (
        <button
          onClick={() => setActiveMessage(r)}
          className="flex items-center gap-2 font-bold text-[#14121f] hover:text-lime-ink text-left"
        >
          {r.status === "NEW" && (
            <span className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
          )}
          {r.name}
        </button>
      ),
    },
    { key: "email", header: "Email Address" },
    { key: "service", header: "Requested Service", render: (r) => r.service ?? "General" },
    { key: "budget", header: "Budget", render: (r) => r.budget ?? "Unspecified" },
    {
      key: "status",
      header: "Status",
      render: (r) => (
        <Badge variant={STATUS_VARIANT[r.status]}>{r.status.replace("_", " ")}</Badge>
      ),
    },
    { key: "createdAt", header: "Received Date", render: (r) => formatDateShort(r.createdAt) },
    {
      key: "view",
      header: "View",
      sortable: false,
      render: (r) => (
        <button
          onClick={() => setActiveMessage(r)}
          className="flex h-7 w-7 items-center justify-center rounded-lg border border-[#e9e7f0] text-[#4a4756] hover:border-[#14121f] hover:bg-[#14121f] hover:text-white transition"
          title="Quick View Message"
        >
          <Eye className="h-3.5 w-3.5" />
        </button>
      ),
    },
  ];

  const filterTabs: FilterTab[] = [
    { key: "new", label: "New Unread", filterFn: (m) => m.status === "NEW" },
    { key: "in_progress", label: "In Progress", filterFn: (m) => m.status === "IN_PROGRESS" },
    { key: "replied", label: "Replied", filterFn: (m) => m.status === "REPLIED" },
    { key: "closed", label: "Closed", filterFn: (m) => m.status === "CLOSED" },
  ];

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="flex items-center gap-2 text-sm text-[#767287]">
          <MessageSquare className="h-4 w-4 animate-bounce text-[#6D3BF5]" />
          Loading client messages...
        </div>
      </div>
    );
  }

  return (
    <>
      <DataTable
        title="Client Inquiries & Messages"
        columns={columns}
        data={items}
        searchKey="name"
        searchPlaceholder="Search by client name, email, service..."
        filterTabs={filterTabs}
        onDelete={onDelete}
        onBulkDelete={onBulkDelete}
        emptyLabel="No contact messages recorded yet."
      />

      {/* Instant Side Drawer for reading message */}
      <MessageDrawer
        message={activeMessage}
        onClose={() => setActiveMessage(null)}
        onUpdate={handleUpdateMessage}
      />
    </>
  );
}
