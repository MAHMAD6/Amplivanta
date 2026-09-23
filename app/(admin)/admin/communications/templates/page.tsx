import type { Metadata } from "next";
import { SuperInfoNote } from "@/components/admin/primitives";
import { TemplatesPanel } from "@/components/admin/communications-panels";
import { TEMPLATE_CATEGORIES } from "@/lib/server/communications";
import { loadCommunicationTemplates } from "../loaders";

export const metadata: Metadata = { title: "Communication Templates" };
export const dynamic = "force-dynamic";

export default async function CommunicationTemplatesPage() {
  const { rows, connected } = await loadCommunicationTemplates();
  return (
    <div className="space-y-6">
      <TemplatesPanel templates={rows} categories={TEMPLATE_CATEGORIES} connected={connected} />
      <SuperInfoNote title="About Communication Templates">
        Only active templates can be picked when composing a message. A template that is already referenced by a communication is archived rather than deleted, so delivery history keeps its context.
      </SuperInfoNote>
    </div>
  );
}
