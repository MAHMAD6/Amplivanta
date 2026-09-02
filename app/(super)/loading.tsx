export default function SuperLoading() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center bg-bg-soft" role="status" aria-live="polite">
      <div className="flex flex-col items-center gap-3">
        <span className="h-9 w-9 animate-spin rounded-full border-[3px] border-line border-t-royal-blue" />
        <span className="text-[12px] font-bold uppercase tracking-[0.14em] text-ink-soft">Loading</span>
      </div>
    </div>
  );
}
