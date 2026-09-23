import type { Metadata } from "next";
import { SuperInfoNote } from "@/components/admin/primitives";
import { DeliveryHistoryPanel } from "@/components/admin/communications-panels";
import { loadCommunications, loadRecipients } from "../loaders";

export const metadata: Metadata = { title: "Delivery History" };
export const dynamic = "force-dynamic";

export default async function DeliveryHistoryPage({ searchParams }: { searchParams: Promise<{ id?: string }> }) {
  const { id } = await searchParams;
  const { rows, connected } = await loadCommunications(100);
  const selectedId = id && rows.some((r) => r.id === id) ? id : null;
  const recipients = selectedId ? await loadRecipients(selectedId) : [];

  return (
    <div className="space-y-6">
      <DeliveryHistoryPanel rows={rows} connected={connected} recipients={recipients} selectedId={selectedId} />
      <SuperInfoNote title="About Delivery History">
        Statuses come from the send itself: sent means the provider accepted the message, suppressed means the address is on a suppression list, and not sent means no provider was configured. Open and click rates are not shown because no provider events are wired up yet.
      </SuperInfoNote>
    </div>
  );
}
