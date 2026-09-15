import type { Metadata } from "next";
import Link from "next/link";
import { FileDown, HardDrive, RefreshCw, Upload, X } from "lucide-react";
import { db } from "@/lib/db";
import { SettingsHeader } from "@/components/amplivanta/settings-header";
import { PreferencesForm } from "@/components/amplivanta/preferences-form";
import { EmptyState, StatGrid, fmtInt } from "@/components/amplivanta/screen-kit";
import { PREFERENCE_SCOPES } from "@/lib/preferences";
import { loadPreferences } from "@/lib/server/preferences";
import { settingsContext } from "@/lib/server/settings-screens";
import { formatBytes } from "@/lib/server/media-library";

export const metadata: Metadata = { title: "Data Management" };
export const dynamic = "force-dynamic";

export default async function DataManagementPage() {
  const c = await settingsContext();
  const prefs = await loadPreferences(c?.workspaceId ?? null, "workspace.data");
  let storage: { files: number; bytes: number } | null = null;
  if (c) {
    try {
      const agg = await db.asset.aggregate({ where: { workspaceId: c.workspaceId }, _count: true, _sum: { fileSize: true } });
      storage = { files: agg._count, bytes: agg._sum.fileSize ?? 0 };
    } catch {
      storage = null;
    }
  }
  return (
    <>
      <SettingsHeader title="Data Management" subtitle="Manage imports, exports, retention, deletion, and workspace data lifecycle." />
      <StatGrid
        stats={[
          { label: "Import Jobs", icon: Upload, value: null },
          { label: "Export Jobs", icon: FileDown, value: null },
          { label: "Deletion Requests", icon: X, value: null },
          { label: "Storage Inventory", icon: HardDrive, value: storage?.files ? `${fmtInt(storage.files)} files` : null, hint: storage?.files ? formatBytes(storage.bytes) : undefined },
        ]}
      />
      <div className="mb-5 grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_1.2fr]">
        <section className="rounded-xl border border-line bg-white p-5">
          <h2 className="text-[17px] font-semibold text-deep-navy">Import &amp; Export Jobs</h2>
          <EmptyState
            icon={RefreshCw}
            title="No data jobs yet"
            body="Import, export, and processing history will appear when workspace data jobs exist."
            action={<Link href="/app/integrations/import-export" className="text-[13px] font-semibold text-[#0B5CFF]">Open Import / Export</Link>}
          />
        </section>
        <section>
          <PreferencesForm def={PREFERENCE_SCOPES["workspace.data"]} values={prefs.values} path="/app/settings/data" canEdit={Boolean(c?.isAdmin && prefs.reachable)} layout="flat" />
          <p className="mt-3 text-[12.5px] text-ink-soft">
            Retention and deletion workflows respect platform constraints, access controls, and applicable legal requirements. Saved policies are recorded for your workspace; automated enforcement is not enabled yet.
          </p>
        </section>
      </div>
      <section className="flex flex-wrap items-end justify-between gap-6 rounded-xl border border-line bg-bg-soft/40 p-6">
        <div className="max-w-[900px]">
          <h2 className="text-[17px] font-semibold text-deep-navy">Recovery &amp; Requests</h2>
          <p className="mt-2 text-[13px] text-ink-soft">Recovery, restore visibility, and data-request preparation appear only when those operations or requests exist. Failed jobs surface recoverable diagnostics.</p>
        </div>
        <Link href="/contact" className="inline-flex h-11 items-center rounded-md border border-line bg-white px-12 text-[14px] font-semibold text-deep-navy hover:bg-bg-soft">Prepare Data Request</Link>
      </section>
    </>
  );
}
