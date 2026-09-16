import type { Metadata } from "next";
import Link from "next/link";
import { FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import { db } from "@/lib/db";
import { DataTable, EmptyState, Pill, fmtDate } from "@/components/amplivanta/screen-kit";
import { DocumentRowActions, FormDialog } from "@/components/amplivanta/creative-ui";
import { createDocument, draftDocumentWithAi } from "@/app/(app)/app/creative-studio/actions";
import { DOCUMENT_LENGTHS, DOCUMENT_TONES, DOCUMENT_TOOLS, DOCUMENT_TYPES } from "@/lib/creative/options";
import { creativeContext } from "@/lib/server/creative-screens";
import { isAiConfigured } from "@/lib/ai";

export const metadata: Metadata = { title: "Documents — Creative Studio" };
export const dynamic = "force-dynamic";

const BASE = "/app/creative-studio/documents";
const VIEWS = [["mine", "My Documents"], ["templates", "Templates"], ["ai", "AI Generated"], ["shared", "Shared with Me"], ["trash", "Trash"]] as const;

export default async function DocumentsPage({ searchParams }: { searchParams: Promise<{ view?: string }> }) {
  const { view: raw } = await searchParams;
  const view = VIEWS.some(([k]) => k === raw) ? raw! : "mine";
  const c = await creativeContext();
  let reachable = Boolean(c);
  let docs: { id: string; title: string; type: string; aiGenerated: boolean; status: string; updatedAt: Date }[] = [];
  let kits: { id: string; name: string }[] = [];
  if (c) {
    try {
      [docs, kits] = await Promise.all([
        view === "templates" || view === "shared"
          ? Promise.resolve([])
          : db.document.findMany({
              where: { workspaceId: c.workspaceId, status: view === "trash" ? "archived" : "draft", ...(view === "ai" ? { aiGenerated: true } : {}) },
              orderBy: { updatedAt: "desc" },
              take: 100,
              select: { id: true, title: true, type: true, aiGenerated: true, status: true, updatedAt: true },
            }),
        db.brandKit.findMany({ where: { workspaceId: c.workspaceId }, orderBy: { name: "asc" }, select: { id: true, name: true } }),
      ]);
    } catch {
      reachable = false;
    }
  }
  const ai = isAiConfigured();
  const create = (label = "Create Document", cls?: string) => (
    <FormDialog
      title="New Document"
      label={label}
      className={cls}
      action={createDocument}
      disabled={!c?.canEdit}
      goTo={`${BASE}/`}
      submitLabel="Create document"
      fields={[
        { name: "title", label: "Title", kind: "text", placeholder: "Untitled document" },
        { name: "type", label: "Document type", kind: "select", options: DOCUMENT_TYPES, defaultValue: "other" },
      ]}
    />
  );
  const empty: Record<string, [string, string]> = {
    mine: ["No documents yet", "Create a blank document, use a template, or start with the AI Document Writer."],
    templates: ["Document templates", "Document templates live in the Creative Studio template library."],
    ai: ["No AI generated documents yet", "Drafts created with the AI Document Writer appear here."],
    shared: ["Nothing shared with you", "Documents belong to the workspace; sharing individual documents is not available yet."],
    trash: ["Trash is empty", "Documents moved to trash appear here until deleted permanently."],
  };

  return (
    <div className="mx-auto max-w-[1600px]">
      <h1 className="font-display text-[30px] font-bold text-deep-navy">Documents</h1>
      <p className="mt-1 text-[14.5px] text-ink-soft">Create, organize, share, and export documents with AI-assisted writing tools.</p>

      <div className="my-6 flex flex-wrap items-center gap-2.5 rounded-xl border border-line bg-white px-6 py-3.5">
        {VIEWS.map(([k, l]) => (
          <Link key={k} href={k === "templates" ? "/app/creative-studio/templates?category=documents" : k === "mine" ? BASE : `${BASE}?view=${k}`} className={cn("rounded-full border px-3.5 py-1.5 text-[12.5px]", view === k ? "border-[#0B5CFF] bg-royal-tint font-semibold text-[#0B5CFF]" : "border-line bg-bg-soft/60 text-ink-soft hover:text-deep-navy")}>{l}</Link>
        ))}
        <div className="ml-auto">{create("New Document", "inline-flex h-11 items-center rounded-md bg-[#0B5CFF] px-9 text-[13.5px] font-semibold text-white hover:bg-[#0A4FE0] disabled:opacity-50")}</div>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.5fr)_1fr]">
        <section className="min-h-[502px] rounded-xl border border-line bg-white p-5">
          {docs.length ? (
            <DataTable
              minWidth={640}
              columns={["Document", "Type", "Source", "Updated", "Actions"]}
              rows={docs.map((d) => [
                <Link key="t" href={`${BASE}/${d.id}`} className="hover:text-[#0B5CFF]">{d.title}</Link>,
                DOCUMENT_TYPES.find(([v]) => v === d.type)?.[1] ?? d.type,
                d.aiGenerated ? <Pill key="s" tone="violet">AI draft</Pill> : <Pill key="s">Manual</Pill>,
                fmtDate(d.updatedAt),
                <DocumentRowActions key="a" id={d.id} status={d.status} canEdit={Boolean(c?.canEdit)} />,
              ])}
            />
          ) : (
            <EmptyState icon={FileText} title={reachable ? empty[view][0] : "Documents unavailable"} body={reachable ? empty[view][1] : "Documents could not be loaded right now."} action={reachable && view === "mine" ? create() : undefined} />
          )}
        </section>
        <section className="rounded-xl border border-line bg-white p-5">
          <h2 className="mb-4 text-[16px] font-semibold text-deep-navy">AI Document Writer</h2>
          {ai ? (
            <FormDialog
              title="AI Document Writer"
              label="Start Writing"
              action={draftDocumentWithAi}
              disabled={!c?.canEdit}
              goTo={`${BASE}/`}
              submitLabel="Generate draft"
              note="The draft opens in the editor for review. Nothing is published or sent."
              fields={[
                { name: "type", label: "Document Type", kind: "select", required: true, options: DOCUMENT_TYPES },
                { name: "tone", label: "Tone", kind: "select", options: DOCUMENT_TONES, placeholder: "Optional" },
                { name: "length", label: "Length", kind: "select", options: DOCUMENT_LENGTHS, placeholder: "Optional" },
                { name: "brandKitId", label: "Brand Kit", kind: "select", options: kits.map((k) => [k.id, k.name]), placeholder: "Optional" },
                { name: "brief", label: "What should it cover?", kind: "textarea", required: true, rows: 5, placeholder: "Audience, key points, call to action" },
              ]}
              className="inline-flex h-11 items-center rounded-md bg-[#0B5CFF] px-14 text-[13.5px] font-semibold text-white hover:bg-[#0A4FE0] disabled:opacity-50"
            />
          ) : (
            <p className="text-[13px] text-ink-soft">The AI Document Writer is not available yet. You can still create and edit documents manually.</p>
          )}
          <dl className="mt-5 space-y-3 text-[13px]">
            <div><dt className="font-semibold text-deep-navy">Document Type</dt><dd className="text-ink-soft">{DOCUMENT_TYPES.map(([, l]) => l).join(", ")}</dd></div>
            <div><dt className="font-semibold text-deep-navy">Tone</dt><dd className="text-ink-soft">Optional — {DOCUMENT_TONES.map(([, l]) => l).join(", ")}</dd></div>
            <div><dt className="font-semibold text-deep-navy">Brand Kit</dt><dd className="text-ink-soft">{kits.length ? "Optional — guidelines are included in the brief" : "Optional — create a brand kit to include its guidelines"}</dd></div>
          </dl>
        </section>
      </div>

      <section className="rounded-xl border border-line bg-white p-5">
        <h2 className="mb-1 text-[16px] font-semibold text-deep-navy">Document Tools</h2>
        <p className="mb-4 text-[12.5px] text-ink-soft">Open a document to use these tools. Results are suggestions you choose to apply.</p>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6">
          {[...DOCUMENT_TOOLS.map(([, l]) => l), "Export"].map((l) => (
            <div key={l} className="flex h-16 items-center justify-center rounded-md border border-line text-[13.5px] font-semibold text-deep-navy">{l}</div>
          ))}
        </div>
      </section>
    </div>
  );
}
