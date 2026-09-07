import type { Metadata } from "next";
import { Download, Upload, Trash2, Database, AlertTriangle, RotateCw } from "lucide-react";
import { StatusPill, Avatar } from "@/components/amplivanta/status-pill";
import { DATA_JOBS, DATA_JOB_TONE } from "@/lib/settings-data";

export const metadata: Metadata = { title: "Data Management" };

export default function DataManagementPage() {
  return (
    <div className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-3">
        <ActionCard icon={Download} label="Export Data" desc="Full workspace export as CSV or JSON" cta="Request Export" />
        <ActionCard icon={Upload} label="Import Data" desc="Contacts, deals, activities from CSV" cta="Upload File" />
        <ActionCard icon={Database} label="Backup" desc="Manual snapshot + auto-daily backups" cta="Trigger Backup" />
      </div>

      <div className="rounded-2xl border border-line bg-white p-5 shadow-card">
        <div className="mb-3 text-[14px] font-bold text-ink">Retention Policies</div>
        <div className="space-y-2 text-[12.5px]">
          {[
            { l: "Deleted contacts", v: "Recoverable for 30 days" },
            { l: "Activity events", v: "Retained 24 months" },
            { l: "Audit log", v: "Retained 1 year (Growth), 7 years (Enterprise)" },
            { l: "Media assets", v: "Retained until manually deleted" },
            { l: "Draft posts / emails", v: "Auto-purged after 180 days idle" },
          ].map((r) => (
            <div key={r.l} className="flex items-center justify-between border-b border-line pb-2 last:border-0">
              <span className="text-ink-soft">{r.l}</span>
              <span className="font-bold text-ink">{r.v}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-line bg-white shadow-card">
        <div className="border-b border-line p-4"><div className="text-[14px] font-bold text-ink">Import & Export Jobs</div></div>
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-line bg-bg-soft/40 text-[11px] font-bold uppercase tracking-wider text-ink-muted">
              <th className="px-4 py-3">Job</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Size</th>
              <th className="px-4 py-3">Created By</th>
              <th className="px-4 py-3">Created</th>
              <th className="w-10 px-2 py-3" />
            </tr>
          </thead>
          <tbody>
            {DATA_JOBS.map((j) => (
              <tr key={j.id} className="border-b border-line last:border-0">
                <td className="px-4 py-3 text-[13px] font-semibold text-ink">{j.name}</td>
                <td className="px-4 py-3"><StatusPill tone={j.type === "Export" ? "blue" : "violet"}>{j.type}</StatusPill></td>
                <td className="px-4 py-3"><StatusPill tone={DATA_JOB_TONE[j.status as keyof typeof DATA_JOB_TONE]}>{j.status}</StatusPill></td>
                <td className="px-4 py-3 text-[11.5px] text-ink-muted">{j.size}</td>
                <td className="px-4 py-3"><div className="flex items-center gap-2"><Avatar name={j.createdBy} size={20} /><span className="text-[11.5px]">{j.createdBy.split(" ")[0]}</span></div></td>
                <td className="px-4 py-3 text-[11.5px] text-ink-muted">{j.createdAt}</td>
                <td className="px-2 py-3 text-right">
                  <div className="flex justify-end gap-1">
                    {j.status === "Completed" && <button className="rounded-lg p-1 text-ink-muted hover:bg-bg-soft"><Download className="h-3.5 w-3.5" /></button>}
                    {j.status === "Failed" && <button className="rounded-lg p-1 text-amber-600 hover:bg-bg-soft"><RotateCw className="h-3.5 w-3.5" /></button>}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="rounded-2xl border border-red-200 bg-red-50/40 p-5">
        <div className="mb-2 flex items-center gap-2 text-[13px] font-bold text-red-700"><AlertTriangle className="h-4 w-4" /> Data Deletion</div>
        <div className="mt-3 space-y-2">
          <div className="flex items-center justify-between rounded-xl border border-red-200 bg-white p-3">
            <div><div className="text-[13px] font-semibold text-ink">Delete workspace</div><div className="text-[11px] text-ink-muted">Removes all data after 30-day grace period. Cannot be undone.</div></div>
            <button className="inline-flex items-center gap-1 rounded-lg bg-red-500 px-3 py-1.5 text-[12px] font-bold text-white"><Trash2 className="h-3 w-3" />Delete workspace</button>
          </div>
          <div className="flex items-center justify-between rounded-xl border border-red-200 bg-white p-3">
            <div><div className="text-[13px] font-semibold text-ink">Purge deleted items</div><div className="text-[11px] text-ink-muted">Immediately delete anything in trash. Bypasses 30-day recovery.</div></div>
            <button className="rounded-lg border border-red-300 bg-white px-3 py-1.5 text-[12px] font-bold text-red-600">Purge now</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ActionCard({ icon: Icon, label, desc, cta }: { icon: any; label: string; desc: string; cta: string }) {
  return (
    <div className="rounded-2xl border border-line bg-white p-5 shadow-card">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet/10 text-violet"><Icon className="h-5 w-5" /></div>
      <div className="mt-3 text-[13.5px] font-bold text-ink">{label}</div>
      <div className="mt-1 text-[11.5px] text-ink-soft">{desc}</div>
      <button className="mt-3 w-full rounded-xl bg-grad-cta py-2 text-[12px] font-bold text-white shadow-violet">{cta}</button>
    </div>
  );
}
