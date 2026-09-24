import type { Metadata } from "next";
import { SuperInfoNote } from "@/components/admin/primitives";
import { ContentAnalyticsPanel } from "@/components/admin/content-ops-panels";
import { loadContentAnalytics } from "../../content/loaders";

export const metadata: Metadata = { title: "Content Analytics" };
export const dynamic = "force-dynamic";

export default async function Page() {
  const data = await loadContentAnalytics();
  return (
    <div className="space-y-6">
      <ContentAnalyticsPanel data={data} />
      <SuperInfoNote title="About Content Analytics">These figures come from the content records themselves: how much exists, what is published, when it went live and where it is concentrated. Views, reads and engagement are not shown because no content analytics source is connected.</SuperInfoNote>
    </div>
  );
}
