import type { Metadata } from "next";
import { SuperInfoNote } from "@/components/admin/primitives";
import { TaxonomyPanel } from "@/components/admin/content-ops-panels";
import { loadTaxonomy } from "../../content/loaders";

export const metadata: Metadata = { title: "Tags" };
export const dynamic = "force-dynamic";

export default async function Page() {
  const { rows, connected, items } = await loadTaxonomy("tags");
  return (
    <div className="space-y-6">
      <TaxonomyPanel kind="tags" rows={rows} connected={connected} items={items} />
      <SuperInfoNote title="About Tags">Tags come from the content that carries them. Renaming a tag updates every item, and removing one clears it everywhere without touching the content itself.</SuperInfoNote>
    </div>
  );
}
