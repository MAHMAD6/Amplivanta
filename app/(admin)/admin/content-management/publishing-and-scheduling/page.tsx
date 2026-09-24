import type { Metadata } from "next";
import { SuperInfoNote } from "@/components/admin/primitives";
import { PublishingQueuePanel } from "@/components/admin/content-ops-panels";
import { loadPublishingQueue } from "../../content/loaders";

export const metadata: Metadata = { title: "Publishing & Scheduling" };
export const dynamic = "force-dynamic";

export default async function Page() {
  const { scheduled, published, drafts, connected } = await loadPublishingQueue();
  return (
    <div className="space-y-6">
      <PublishingQueuePanel scheduled={scheduled} published={published} drafts={drafts} connected={connected} />
      <SuperInfoNote title="About Publishing & Scheduling">One publishing service serves every content type. Scheduled items go live automatically at their time; publishing early or moving an item back to draft is available here and is audited.</SuperInfoNote>
    </div>
  );
}
