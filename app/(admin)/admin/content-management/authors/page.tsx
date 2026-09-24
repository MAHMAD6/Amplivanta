import type { Metadata } from "next";
import { SuperInfoNote } from "@/components/admin/primitives";
import { AuthorsPanel } from "@/components/admin/content-ops-panels";
import { loadAuthors } from "../../content/loaders";

export const metadata: Metadata = { title: "Authors" };
export const dynamic = "force-dynamic";

export default async function Page() {
  const { rows, connected } = await loadAuthors();
  return (
    <div className="space-y-6">
      <AuthorsPanel rows={rows} connected={connected} />
      <SuperInfoNote title="About Authors">Authors are credited on content items rather than kept as separate profiles, so this list always matches what is published. Renaming an author updates every item they are credited on.</SuperInfoNote>
    </div>
  );
}
