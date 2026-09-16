"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Pin, PinOff, X } from "lucide-react";
import { toastResult } from "@/lib/action-toast";
import { deleteNote, saveNote, setAutomationStatus, setCampaignStatus, setTaskStatus, toggleNotePin } from "@/app/(app)/app/workspace/actions";
import { Fields } from "@/components/amplivanta/creative-ui";

type Result = { ok: true; message: string } | { ok: false; error: string };

const ACTIONS: Record<string, (id: string, v: string) => Promise<Result>> = {
  campaign: setCampaignStatus,
  task: setTaskStatus,
  automation: setAutomationStatus,
};

/** Inline status control for a workspace record. */
export function StatusSelect({ kind, id, value, options, canEdit }: { kind: "campaign" | "task" | "automation"; id: string; value: string; options: [string, string][]; canEdit: boolean }) {
  const [pending, start] = useTransition();
  const router = useRouter();
  if (!canEdit) return <span className="text-[12.5px]">{options.find(([v]) => v === value)?.[1] ?? value}</span>;
  return (
    <span className="inline-flex items-center gap-1.5">
      <select
        aria-label="Status"
        defaultValue={value}
        disabled={pending}
        onChange={(e) => {
          const next = e.target.value;
          start(async () => {
            if (!toastResult(await ACTIONS[kind](id, next))) e.target.value = value;
            router.refresh();
          });
        }}
        className="h-8 rounded-md border border-line bg-white px-2 text-[12.5px] text-deep-navy"
      >
        {options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
      </select>
      {pending && <Loader2 className="h-3.5 w-3.5 animate-spin text-ink-muted" />}
    </span>
  );
}

export function NoteCard({
  note,
  categories,
  canEdit,
}: {
  note: { id: string; title: string | null; content: string; category: string; pinned: boolean; updated: string };
  categories: [string, string][];
  canEdit: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const [pending, start] = useTransition();
  const router = useRouter();
  const run = (fn: () => Promise<Result>, after?: () => void) => start(async () => { if (toastResult(await fn())) { after?.(); router.refresh(); } });

  return (
    <li className="rounded-lg border border-line p-4">
      {editing ? (
        <form
          className="space-y-3"
          onSubmit={(e) => {
            e.preventDefault();
            const fd = new FormData(e.currentTarget);
            run(() => saveNote(fd), () => setEditing(false));
          }}
        >
          <input type="hidden" name="id" value={note.id} />
          <Fields
            fields={[
              { name: "title", label: "Title", kind: "text", defaultValue: note.title ?? "" },
              { name: "category", label: "Category", kind: "select", options: categories, defaultValue: note.category },
              { name: "content", label: "Note", kind: "textarea", rows: 6, required: true, defaultValue: note.content },
            ]}
          />
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setEditing(false)} className="h-9 rounded-md border border-line px-3 text-[13px]">Cancel</button>
            <button type="submit" disabled={pending} className="inline-flex h-9 items-center gap-2 rounded-md bg-[#0B5CFF] px-4 text-[13px] font-semibold text-white">{pending && <Loader2 className="h-3.5 w-3.5 animate-spin" />} Save</button>
          </div>
        </form>
      ) : (
        <>
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="truncate text-[14.5px] font-semibold text-deep-navy">{note.title || note.content.split("\n")[0].slice(0, 80)}</div>
              <div className="text-[12px] text-ink-muted">{categories.find(([v]) => v === note.category)?.[1] ?? note.category} · {note.updated}</div>
            </div>
            {canEdit && (
              <div className="flex shrink-0 gap-1">
                <button type="button" aria-label={note.pinned ? "Unpin" : "Pin"} disabled={pending} onClick={() => run(() => toggleNotePin(note.id, !note.pinned))} className="rounded p-1.5 text-ink-muted hover:bg-bg-soft">{note.pinned ? <PinOff className="h-4 w-4" /> : <Pin className="h-4 w-4" />}</button>
                <button type="button" onClick={() => setEditing(true)} className="rounded px-2 py-1 text-[12px] font-semibold text-[#0B5CFF] hover:bg-bg-soft">Edit</button>
                <button type="button" aria-label="Delete note" disabled={pending} onClick={() => { if (window.confirm("Delete this note?")) run(() => deleteNote(note.id)); }} className="rounded p-1.5 text-ink-muted hover:bg-red-50 hover:text-red-600"><X className="h-4 w-4" /></button>
              </div>
            )}
          </div>
          <p className="mt-2 line-clamp-6 whitespace-pre-wrap text-[13px] text-ink-soft">{note.content}</p>
        </>
      )}
    </li>
  );
}
