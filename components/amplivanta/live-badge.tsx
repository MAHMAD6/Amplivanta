/** Small pill indicating a page is rendering data from the database. */
export function LiveBadge({ label = "Live · from database" }: { label?: string }) {
  return (
    <div className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-[11px] font-bold text-emerald-600">
      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> {label}
    </div>
  );
}
