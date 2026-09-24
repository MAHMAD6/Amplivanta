import type { Metadata } from "next";
import { SuperInfoNote } from "@/components/admin/primitives";
import { TaxonomyPanel } from "@/components/admin/content-ops-panels";
import { loadTaxonomy } from "../../content/loaders";

export const metadata: Metadata = { title: "Categories" };
export const dynamic = "force-dynamic";

export default async function Page() {
  const { rows, connected, items } = await loadTaxonomy("categories");
  return (
    <div className="space-y-6">
      <TaxonomyPanel kind="categories" rows={rows} connected={connected} items={items} />
      <SuperInfoNote title="About Categories">Categories live on the content items that use them, so this screen shows what is actually in use. Renaming a category updates every item at once, and merging is a rename onto an existing name.</SuperInfoNote>
    </div>
  );
}
