"use client";

import { useMemo, useState, type ReactNode } from "react";
import Link from "next/link";
import { Pencil, Trash2, Plus, Search } from "lucide-react";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { ConfirmDialog } from "./ConfirmDialog";

export interface Column<T> {
  key: string;
  header: string;
  render?: (row: T) => ReactNode;
}

interface DataTableProps<T extends { id: string }> {
  columns: Column<T>[];
  data: T[];
  searchKey?: keyof T;
  searchPlaceholder?: string;
  newHref?: string;
  editHref?: (row: T) => string;
  onDelete?: (row: T) => void;
  emptyLabel?: string;
}

export function DataTable<T extends { id: string }>({
  columns,
  data,
  searchKey,
  searchPlaceholder = "Search...",
  newHref,
  editHref,
  onDelete,
  emptyLabel = "No items yet.",
}: DataTableProps<T>) {
  const [query, setQuery] = useState("");
  const [toDelete, setToDelete] = useState<T | null>(null);

  const filtered = useMemo(() => {
    if (!searchKey || !query) return data;
    return data.filter((row) =>
      String(row[searchKey] ?? "").toLowerCase().includes(query.toLowerCase())
    );
  }, [data, query, searchKey]);

  return (
    <div className="rounded-2xl border border-[#E3E3E3] bg-white">
      <div className="flex items-center justify-between gap-4 border-b border-[#E3E3E3] p-4">
        {searchKey ? (
          <div className="relative w-full max-w-xs">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9A9A9A]" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={searchPlaceholder}
              className="w-full rounded-xl border border-[#E3E3E3] bg-[#F4F4F4] py-2 pl-9 pr-4 text-sm focus:border-[#B5FF2D] focus:outline-none"
            />
          </div>
        ) : (
          <span />
        )}
        {newHref && (
          <Link
            href={newHref}
            className="inline-flex shrink-0 items-center gap-1 rounded-full bg-[#B5FF2D] px-4 py-2 text-sm font-semibold text-black transition hover:bg-[#a0e828]"
          >
            <Plus className="h-4 w-4" /> New
          </Link>
        )}
      </div>

      {filtered.length === 0 ? (
        <p className="p-12 text-center text-sm text-[#9A9A9A]">{emptyLabel}</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((c) => (
                <TableHead key={c.key}>{c.header}</TableHead>
              ))}
              {(editHref || onDelete) && <TableHead>Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((row) => (
              <TableRow key={row.id}>
                {columns.map((c) => (
                  <TableCell key={c.key}>
                    {c.render ? c.render(row) : String((row as Record<string, unknown>)[c.key] ?? "")}
                  </TableCell>
                ))}
                {(editHref || onDelete) && (
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {editHref && (
                        <Link href={editHref(row)} className="text-[#5A5A5A] hover:text-[#0A0A0A]" aria-label="Edit">
                          <Pencil className="h-4 w-4" />
                        </Link>
                      )}
                      {onDelete && (
                        <button onClick={() => setToDelete(row)} className="text-red-500 hover:text-red-600" aria-label="Delete">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <ConfirmDialog
        isOpen={!!toDelete}
        onClose={() => setToDelete(null)}
        onConfirm={() => toDelete && onDelete?.(toDelete)}
        title="Delete this item?"
        description="This will permanently remove it. This action cannot be undone."
      />
    </div>
  );
}
