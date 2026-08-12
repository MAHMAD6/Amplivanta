"use client";

import { useMemo, useState, type ReactNode } from "react";
import Link from "next/link";
import {
  Pencil,
  Trash2,
  Plus,
  Search,
  ChevronDown,
  ChevronUp,
  ChevronsUpDown,
  Download,
  CheckSquare,
  Square,
  FileX,
  ChevronLeft,
  ChevronRight,
  Filter,
} from "lucide-react";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { ConfirmDialog } from "./ConfirmDialog";

export interface Column<T> {
  key: string;
  header: string;
  render?: (row: T) => ReactNode;
  sortable?: boolean;
}

export interface FilterTab {
  key: string;
  label: string;
  filterFn?: (item: any) => boolean;
}

interface DataTableProps<T extends { id: string }> {
  columns: Column<T>[];
  data: T[];
  searchKey?: keyof T;
  searchPlaceholder?: string;
  newHref?: string;
  editHref?: (row: T) => string;
  onDelete?: (row: T) => void;
  onBulkDelete?: (rows: T[]) => void;
  filterTabs?: FilterTab[];
  emptyLabel?: string;
  title?: string;
}

export function DataTable<T extends { id: string }>({
  columns,
  data,
  searchKey,
  searchPlaceholder = "Search records...",
  newHref,
  editHref,
  onDelete,
  onBulkDelete,
  filterTabs,
  emptyLabel = "No items found.",
  title,
}: DataTableProps<T>) {
  const [query, setQuery] = useState("");
  const [activeTab, setActiveTab] = useState<string>("all");
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [toDelete, setToDelete] = useState<T | null>(null);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // 1. Filtering by search query & filter tabs
  const filtered = useMemo(() => {
    let result = [...data];

    // Filter tab
    if (filterTabs && activeTab !== "all") {
      const tab = filterTabs.find((t) => t.key === activeTab);
      if (tab?.filterFn) {
        result = result.filter(tab.filterFn);
      }
    }

    // Search query
    if (searchKey && query.trim()) {
      const q = query.toLowerCase();
      result = result.filter((row) =>
        String(row[searchKey] ?? "").toLowerCase().includes(q)
      );
    }

    // Sort
    if (sortKey) {
      result.sort((a, b) => {
        const valA = (a as any)[sortKey] ?? "";
        const valB = (b as any)[sortKey] ?? "";
        if (valA < valB) return sortOrder === "asc" ? -1 : 1;
        if (valA > valB) return sortOrder === "asc" ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [data, activeTab, filterTabs, searchKey, query, sortKey, sortOrder]);

  // 2. Pagination calculation
  const totalPages = Math.ceil(filtered.length / pageSize) || 1;
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, currentPage, pageSize]);

  // Sort handler
  const handleSort = (key: string) => {
    if (sortKey === key) {
      if (sortOrder === "asc") setSortOrder("desc");
      else setSortKey(null);
    } else {
      setSortKey(key);
      setSortOrder("asc");
    }
  };

  // Selection handlers
  const toggleSelectAll = () => {
    if (selectedIds.size === paginatedData.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(paginatedData.map((d) => d.id)));
    }
  };

  const toggleSelectRow = (id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedIds(newSet);
  };

  // CSV Export handler
  const exportCSV = () => {
    if (filtered.length === 0) return;
    const headers = columns.map((c) => c.header).join(",");
    const rows = filtered.map((row) =>
      columns
        .map((c) => {
          const val = String((row as any)[c.key] ?? "").replace(/"/g, '""');
          return `"${val}"`;
        })
        .join(",")
    );
    const csvContent = [headers, ...rows].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `export_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Bulk Delete
  const handleConfirmBulkDelete = () => {
    const selectedRows = data.filter((d) => selectedIds.has(d.id));
    onBulkDelete?.(selectedRows);
    setSelectedIds(new Set());
    setIsBulkDeleting(false);
  };

  return (
    <div className="space-y-4">
      {/* Top Header Card */}
      <div className="rounded-2xl border border-[#e9e7f0] bg-white p-4 shadow-sm">
        {/* Title + Global Actions */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {title && (
              <h2 className="font-display text-lg font-bold text-[#14121f]">{title}</h2>
            )}
            <span className="rounded-full bg-[#f8f7fb] px-2.5 py-1 font-mono text-xs font-semibold text-[#4a4756]">
              {filtered.length} {filtered.length === 1 ? "item" : "items"}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* CSV Export */}
            <button
              onClick={exportCSV}
              disabled={filtered.length === 0}
              className="inline-flex items-center gap-1.5 rounded-xl border border-[#e9e7f0] bg-white px-3 py-2 text-xs font-semibold text-[#14121f] hover:bg-[#f8f7fb] disabled:opacity-40 transition shadow-xs"
              title="Export CSV"
            >
              <Download className="h-3.5 w-3.5" /> Export
            </button>

            {/* Create New Button */}
            {newHref && (
              <Link
                href={newHref}
                className="inline-flex items-center gap-1.5 rounded-xl bg-[#6D3BF5] px-4 py-2 text-xs font-bold text-white hover:bg-[#5B2FE0] transition shadow-xs"
              >
                <Plus className="h-4 w-4" /> Add New
              </Link>
            )}
          </div>
        </div>

        {/* Filter Tabs & Search Bar */}
        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-t border-[#e9e7f0] pt-4">
          {/* Tabs */}
          {filterTabs && filterTabs.length > 0 ? (
            <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
              <button
                onClick={() => {
                  setActiveTab("all");
                  setCurrentPage(1);
                }}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                  activeTab === "all"
                    ? "bg-[#14121f] text-[#6D3BF5]"
                    : "text-[#4a4756] hover:bg-[#f8f7fb] hover:text-[#14121f]"
                }`}
              >
                All
              </button>
              {filterTabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => {
                    setActiveTab(tab.key);
                    setCurrentPage(1);
                  }}
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                    activeTab === tab.key
                      ? "bg-[#14121f] text-[#6D3BF5]"
                      : "text-[#4a4756] hover:bg-[#f8f7fb] hover:text-[#14121f]"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          ) : (
            <div />
          )}

          {/* Search Box */}
          {searchKey && (
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#767287]" />
              <input
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder={searchPlaceholder}
                className="w-full rounded-xl border border-[#e9e7f0] bg-[#f8f7fb] py-1.5 pl-8 pr-3 text-xs focus:border-[#6D3BF5] focus:bg-white focus:outline-none transition"
              />
            </div>
          )}
        </div>
      </div>

      {/* Floating Bulk Actions Bar */}
      {selectedIds.size > 0 && (
        <div className="flex items-center justify-between rounded-xl bg-[#14121f] p-3 text-white shadow-xl animate-in fade-in">
          <div className="flex items-center gap-2 text-xs font-medium">
            <CheckSquare className="h-4 w-4 text-[#6D3BF5]" />
            <span>{selectedIds.size} items selected</span>
          </div>
          <div className="flex items-center gap-2">
            {onBulkDelete && (
              <button
                onClick={() => setIsBulkDeleting(true)}
                className="inline-flex items-center gap-1 rounded-lg bg-red-500/20 px-3 py-1.5 text-xs font-semibold text-red-400 hover:bg-red-500/30 transition"
              >
                <Trash2 className="h-3.5 w-3.5" /> Delete Selected
              </button>
            )}
            <button
              onClick={() => setSelectedIds(new Set())}
              className="text-xs text-white/50 hover:text-white"
            >
              Deselect All
            </button>
          </div>
        </div>
      )}

      {/* Table Container */}
      <div className="overflow-hidden rounded-2xl border border-[#e9e7f0] bg-white shadow-sm">
        {paginatedData.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#f8f7fb] text-[#767287] mb-3">
              <FileX className="h-6 w-6" />
            </div>
            <p className="font-display text-base font-bold text-[#14121f]">No data found</p>
            <p className="mt-1 text-xs text-[#767287]">{emptyLabel}</p>
            {newHref && (
              <Link
                href={newHref}
                className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-[#6D3BF5] px-4 py-2 text-xs font-bold text-white transition hover:bg-[#5B2FE0]"
              >
                <Plus className="h-4 w-4" /> Create First Item
              </Link>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-[#f8f7fb]">
                  {/* Select All Checkbox */}
                  {onBulkDelete && (
                    <TableHead className="w-10">
                      <button onClick={toggleSelectAll} className="text-[#767287] hover:text-[#14121f]">
                        {selectedIds.size === paginatedData.length ? (
                          <CheckSquare className="h-4 w-4 text-[#14121f]" />
                        ) : (
                          <Square className="h-4 w-4" />
                        )}
                      </button>
                    </TableHead>
                  )}

                  {/* Columns */}
                  {columns.map((c) => (
                    <TableHead key={c.key} className="text-xs font-bold text-[#14121f]">
                      {c.sortable !== false ? (
                        <button
                          onClick={() => handleSort(c.key)}
                          className="flex items-center gap-1 hover:text-lime-ink font-bold"
                        >
                          {c.header}
                          {sortKey === c.key ? (
                            sortOrder === "asc" ? (
                              <ChevronUp className="h-3.5 w-3.5 text-lime-ink" />
                            ) : (
                              <ChevronDown className="h-3.5 w-3.5 text-lime-ink" />
                            )
                          ) : (
                            <ChevronsUpDown className="h-3.5 w-3.5 text-[#767287]" />
                          )}
                        </button>
                      ) : (
                        c.header
                      )}
                    </TableHead>
                  ))}

                  {/* Actions Column */}
                  {(editHref || onDelete) && (
                    <TableHead className="text-right text-xs font-bold text-[#14121f]">Actions</TableHead>
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedData.map((row) => {
                  const isSelected = selectedIds.has(row.id);
                  return (
                    <TableRow
                      key={row.id}
                      className={`transition-colors hover:bg-[#f8f7fb] ${
                        isSelected ? "bg-amber-50/50" : ""
                      }`}
                    >
                      {/* Checkbox */}
                      {onBulkDelete && (
                        <TableCell className="w-10">
                          <button
                            onClick={() => toggleSelectRow(row.id)}
                            className="text-[#767287] hover:text-[#14121f]"
                          >
                            {isSelected ? (
                              <CheckSquare className="h-4 w-4 text-amber-600" />
                            ) : (
                              <Square className="h-4 w-4" />
                            )}
                          </button>
                        </TableCell>
                      )}

                      {/* Cells */}
                      {columns.map((c) => (
                        <TableCell key={c.key} className="text-xs text-[#14121f]">
                          {c.render ? c.render(row) : String((row as any)[c.key] ?? "—")}
                        </TableCell>
                      ))}

                      {/* Action buttons */}
                      {(editHref || onDelete) && (
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {editHref && (
                              <Link
                                href={editHref(row)}
                                className="flex h-7 w-7 items-center justify-center rounded-lg border border-[#e9e7f0] text-[#4a4756] hover:border-[#14121f] hover:bg-[#14121f] hover:text-white transition"
                                title="Edit"
                              >
                                <Pencil className="h-3.5 w-3.5" />
                              </Link>
                            )}
                            {onDelete && (
                              <button
                                onClick={() => setToDelete(row)}
                                className="flex h-7 w-7 items-center justify-center rounded-lg border border-red-200 text-red-500 hover:bg-red-500 hover:text-white transition"
                                title="Delete"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            )}
                          </div>
                        </TableCell>
                      )}
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}

        {/* Footer Pagination Controls */}
        {filtered.length > 0 && (
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-t border-[#e9e7f0] bg-[#f8f7fb] p-4 text-xs">
            <div className="flex items-center gap-2 text-[#4a4756]">
              <span>Rows per page:</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="rounded-lg border border-[#e9e7f0] bg-white px-2 py-1 text-xs focus:outline-none"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </select>
              <span>
                Showing {(currentPage - 1) * pageSize + 1}–
                {Math.min(currentPage * pageSize, filtered.length)} of {filtered.length}
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#e9e7f0] bg-white text-[#14121f] hover:bg-[#f8f7fb] disabled:opacity-40 transition"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="px-2 font-mono font-semibold text-[#14121f]">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#e9e7f0] bg-white text-[#14121f] hover:bg-[#f8f7fb] disabled:opacity-40 transition"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Delete Single Confirm */}
      <ConfirmDialog
        isOpen={!!toDelete}
        onClose={() => setToDelete(null)}
        onConfirm={() => {
          if (toDelete && onDelete) {
            onDelete(toDelete);
            setToDelete(null);
          }
        }}
        title="Delete this record?"
        description="This action will permanently delete the item from the database. It cannot be undone."
      />

      {/* Delete Bulk Confirm */}
      <ConfirmDialog
        isOpen={isBulkDeleting}
        onClose={() => setIsBulkDeleting(false)}
        onConfirm={handleConfirmBulkDelete}
        title={`Delete ${selectedIds.size} selected items?`}
        description="This will permanently delete all selected records from the database."
      />
    </div>
  );
}
