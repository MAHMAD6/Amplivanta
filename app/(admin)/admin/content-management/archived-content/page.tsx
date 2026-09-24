import type { Metadata } from "next";
import { SuperInfoNote } from "@/components/admin/primitives";
import { ArchivedPanel } from "@/components/admin/content-ops-panels";
import { loadContentItems } from "../../content/loaders";

export const metadata: Metadata = { title: "Archived Content" };
export const dynamic = "force-dynamic";

export default async function Page() {
  const { rows, connected } = await loadContentItems(undefined, 300);
  const archived = rows.filter((r) => r.status === "ARCHIVED");
  return (
    <div className="space-y-6">
      <ArchivedPanel rows={archived} connected={connected} />
      <SuperInfoNote title="About Archived Content">Archiving keeps the record and its version history while removing it from public listings. Restoring returns the item to draft so it is reviewed before going live again.</SuperInfoNote>
    </div>
  );
}
