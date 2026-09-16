import type { Metadata } from "next";
import Link from "next/link";
import { NotebookPen, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { db } from "@/lib/db";
import { EmptyState, ScreenHeader, fmtDate, kitField } from "@/components/amplivanta/screen-kit";
import { FormDialog } from "@/components/amplivanta/creative-ui";
import { NoteCard } from "@/components/amplivanta/workspace-ui";
import { saveNote } from "@/app/(app)/app/workspace/actions";
import { NOTE_CATEGORIES } from "@/lib/workspace/options";
import { workspaceContext } from "@/lib/server/workspace-screens";

export const metadata: Metadata = { title: "Notes" };
export const dynamic = "force-dynamic";

const BASE = "/app/workspace/notes";
type SP = { q?: string; category?: string; book?: string };

export default async function NotesPage({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams;
  const c = await workspaceContext();
  let reachable = Boolean(c);
  let notes: { id: string; title: string | null; content: string; category: string; pinned: boolean; updatedAt: Date }[] = [];
  if (c) {
    try {
      notes = await db.note.findMany({
        where: {
          workspaceId: c.workspaceId,
          contactId: null,
          ...(sp.category ? { category: sp.category } : {}),
          ...(sp.book === "pinned" ? { pinned: true } : sp.book === "uncategorized" ? { category: "uncategorized" } : {}),
          ...(sp.q ? { OR: [{ title: { contains: sp.q, mode: "insensitive" } }, { content: { contains: sp.q, mode: "insensitive" } }] } : {}),
        },
        orderBy: [{ pinned: "desc" }, { updatedAt: "desc" }],
        take: 200,
        select: { id: true, title: true, content: true, category: true, pinned: true, updatedAt: true },
      });
    } catch {
      reachable = false;
    }
  }
  const qs = (patch: Partial<SP>) => {
    const u = new URLSearchParams();
    for (const [k, v] of Object.entries({ ...sp, ...patch })) if (v) u.set(k, v);
    const s = u.toString();
    return s ? `${BASE}?${s}` : BASE;
  };
  const create = (cls: string) => (
    <FormDialog
      title="New Note"
      label="+ New Note"
      className={cls}
      action={saveNote}
      disabled={!c?.canEdit}
      submitLabel="Create note"
      fields={[
        { name: "title", label: "Title", kind: "text" },
        { name: "category", label: "Category", kind: "select", options: NOTE_CATEGORIES, defaultValue: sp.category ?? "uncategorized" },
        { name: "content", label: "Note", kind: "textarea", rows: 8, required: true },
      ]}
    />
  );
  const filtered = Boolean(sp.q || sp.category || sp.book);

  return (
    <div className="mx-auto max-w-[1600px]">
      <ScreenHeader crumbs={[["AI Workspace", "/app/workspace"], ["Notes"]]} title="Notes" subtitle="Capture research, meetings, ideas, strategy, and AI-assisted summaries in context." actions={create("inline-flex h-11 items-center rounded-md bg-[#0B5CFF] px-8 text-[15px] font-semibold text-white hover:bg-[#0A4FE0] disabled:opacity-50")} />
      <form method="get" className="mb-4">
        {sp.category && <input type="hidden" name="category" value={sp.category} />}
        <label className="relative block w-full max-w-[520px]">
          <span className="sr-only">Search notes</span>
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" />
          <input name="q" defaultValue={sp.q ?? ""} placeholder="Search notes..." className={cn(kitField, "h-11 pl-9")} />
        </label>
      </form>
      <nav className="mb-5 flex flex-wrap gap-3" aria-label="Note categories">
        {[["", "All Notes"] as [string, string], ...NOTE_CATEGORIES.filter(([v]) => v !== "uncategorized")].map(([v, l]) => (
          <Link key={l} href={qs({ category: v || undefined, book: undefined })} className={cn("rounded-md px-8 py-2 text-[13.5px] font-semibold", (sp.category ?? "") === v && !sp.book ? "bg-royal-tint text-[#0B5CFF]" : "text-deep-navy hover:bg-bg-soft")}>{l}</Link>
        ))}
      </nav>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[285px_minmax(0,1fr)]">
        <aside className="h-fit rounded-xl border border-line bg-white p-5">
          <h2 className="mb-3 text-[16px] font-semibold text-deep-navy">Notebooks</h2>
          {[["", "All Notes"], ["pinned", "Pinned"], ["uncategorized", "Uncategorized"]].map(([v, l]) => (
            <Link key={l} href={qs({ book: v || undefined, category: undefined })} className={cn("block rounded px-2 py-2.5 text-[13.5px]", (sp.book ?? "") === v && !sp.category ? "font-semibold text-[#0B5CFF]" : "text-deep-navy hover:bg-bg-soft")}>{l}</Link>
          ))}
        </aside>
        <section className="min-h-[680px] rounded-xl border border-line bg-white p-5">
          {notes.length ? (
            <ul className="grid grid-cols-1 gap-4 xl:grid-cols-2">
              {notes.map((n) => (
                <NoteCard key={n.id} note={{ id: n.id, title: n.title, content: n.content, category: n.category, pinned: n.pinned, updated: fmtDate(n.updatedAt) }} categories={NOTE_CATEGORIES} canEdit={Boolean(c?.canEdit)} />
              ))}
            </ul>
          ) : (
            <div className="flex h-full flex-col justify-center">
              <EmptyState icon={NotebookPen} title={!reachable ? "Notes unavailable" : filtered ? "No notes match" : "No notes yet"} body="Create a note when you have research, meeting notes, or ideas to capture." action={reachable && !filtered ? create("inline-flex h-11 items-center rounded-md bg-[#0B5CFF] px-8 text-[15px] font-semibold text-white") : undefined} />
              <p className="mt-10 text-center text-[12.5px] text-ink-muted">AI summaries and action items remain unavailable until source notes exist.</p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
