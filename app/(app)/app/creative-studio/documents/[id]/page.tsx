import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { ScreenHeader } from "@/components/amplivanta/screen-kit";
import { DocumentEditor } from "@/components/amplivanta/creative-ui";
import { DOCUMENT_TONES, DOCUMENT_TOOLS } from "@/lib/creative/options";
import { creativeContext } from "@/lib/server/creative-screens";
import { isAiConfigured } from "@/lib/ai";

export const metadata: Metadata = { title: "Document — Creative Studio" };
export const dynamic = "force-dynamic";

export default async function DocumentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const c = await creativeContext();
  if (!c) notFound();
  const doc = await db.document.findFirst({ where: { id, workspaceId: c.workspaceId } }).catch(() => null);
  if (!doc) notFound();
  return (
    <div className="mx-auto max-w-[1600px]">
      <ScreenHeader
        crumbs={[["Creative Studio", "/app/creative-studio"], ["Documents", "/app/creative-studio/documents"], [doc.title]]}
        title={doc.title}
        subtitle={doc.aiGenerated ? "AI draft — review and edit before using it anywhere." : "Edit, improve and export your document."}
      />
      <DocumentEditor id={doc.id} title={doc.title} content={doc.content} tools={isAiConfigured() ? DOCUMENT_TOOLS : []} tones={DOCUMENT_TONES} canEdit={c.canEdit && doc.status !== "archived"} />
    </div>
  );
}
