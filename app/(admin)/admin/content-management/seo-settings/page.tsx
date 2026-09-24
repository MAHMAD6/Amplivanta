import type { Metadata } from "next";
import { SuperInfoNote } from "@/components/admin/primitives";
import { SeoPanel } from "@/components/admin/content-ops-panels";
import { loadSeoGaps } from "../../content/loaders";

export const metadata: Metadata = { title: "SEO & Metadata" };
export const dynamic = "force-dynamic";

export default async function Page() {
  const { rows, connected } = await loadSeoGaps();
  return (
    <div className="space-y-6">
      <SeoPanel rows={rows} connected={connected} />
      <SuperInfoNote title="About SEO & Metadata">Search title and meta description are stored per content item. Editing them here versions published content the same way the editor does; no search rankings or traffic estimates are shown because none are measured.</SuperInfoNote>
    </div>
  );
}
