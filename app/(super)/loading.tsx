import { ShieldAlert } from "lucide-react";

export default function SuperLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-bg-soft">
      <div className="flex flex-col items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-500/10 text-red-600 animate-pulse"><ShieldAlert className="h-5 w-5" /></div>
        <div className="text-[12px] font-bold uppercase tracking-wider text-red-600">Loading Super Admin</div>
      </div>
    </div>
  );
}
