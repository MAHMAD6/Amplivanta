import type { Metadata } from "next";
import { AtSign, CirclePlus, Hash, Info, Lightbulb, Search, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { DataTable, EmptyState, fmtDate, kitField, kitPrimary } from "@/components/amplivanta/screen-kit";
import { ResourceDialog, type Field } from "@/components/amplivanta/crud/resource-dialog";
import { DeleteAction } from "@/components/amplivanta/crud/delete-action";
import { db } from "@/lib/db";
import { socialContext } from "@/lib/server/social-screens";
import { SOCIAL_PLATFORMS, platformLabel } from "@/lib/social/platforms";

export const metadata: Metadata = { title: "Hashtags & Mentions" };
export const dynamic = "force-dynamic";

const PLATFORM_OPTIONS = SOCIAL_PLATFORMS.map((p) => ({ value: p.id, label: p.label }));
const HASHTAG_FIELDS: Field[] = [
  { name: "name", label: "Label", required: true, placeholder: "Product launch" },
  { name: "tags", label: "Hashtags (comma-separated)", required: true, placeholder: "#launch, #saas" },
  { name: "platform", label: "Platform", type: "select", options: PLATFORM_OPTIONS, colSpan: 1 },
  { name: "category", label: "Category", colSpan: 1, placeholder: "Campaign" },
  { name: "notes", label: "Notes", type: "textarea" },
];
const MENTION_FIELDS: Field[] = [
  { name: "label", label: "Label", required: true, placeholder: "Partner brand" },
  { name: "handle", label: "Handle", required: true, placeholder: "@amplivanta" },
  { name: "platform", label: "Platform", type: "select", options: PLATFORM_OPTIONS },
  { name: "notes", label: "Notes", type: "textarea" },
];

type SP = { q?: string; type?: string; platform?: string; category?: string; sort?: string };

export default async function HashtagsPage({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams;
  const c = await socialContext();
  let reachable = Boolean(c);
  let groups: { id: string; name: string; tags: string[]; platform: string | null; category: string | null; createdAt: Date }[] = [];
  let mentions: { id: string; label: string; handle: string; platform: string | null; createdAt: Date }[] = [];
  let categories: string[] = [];
  const order = sp.sort === "newest" ? { createdAt: "desc" as const } : undefined;
  if (c) {
    try {
      const q = sp.q ? { contains: sp.q, mode: "insensitive" as const } : undefined;
      [groups, mentions, categories] = await Promise.all([
        sp.type === "mentions" ? Promise.resolve([]) : db.hashtagSet.findMany({ where: { workspaceId: c.workspaceId, ...(q ? { name: q } : {}), ...(sp.platform ? { platform: sp.platform } : {}), ...(sp.category ? { category: sp.category } : {}) }, orderBy: order ?? { name: "asc" }, take: 200 }),
        sp.type === "hashtags" ? Promise.resolve([]) : db.mentionReference.findMany({ where: { workspaceId: c.workspaceId, ...(q ? { label: q } : {}), ...(sp.platform ? { platform: sp.platform } : {}) }, orderBy: order ?? { label: "asc" }, take: 200 }),
        db.hashtagSet.findMany({ where: { workspaceId: c.workspaceId, category: { not: null } }, distinct: ["category"], select: { category: true } }).then((r) => r.map((x) => x.category as string)),
      ]);
    } catch {
      reachable = false;
    }
  }

  const createHashtag = (label: string, className = kitPrimary) => (
    <ResourceDialog title="Create Hashtag Group" fields={HASHTAG_FIELDS} endpoint="/api/hashtag-sets" arrayFields={["tags"]} submitLabel="Create group" successMessage="Hashtag group created" trigger={<button type="button" className={className}>{label} <CirclePlus className="h-4 w-4" /></button>} />
  );
  const createMention = (label: string, className = kitPrimary) => (
    <ResourceDialog title="Add Mention Reference" fields={MENTION_FIELDS} endpoint="/api/mention-references" submitLabel="Add reference" successMessage="Mention reference added" trigger={<button type="button" className={className}>{label} <CirclePlus className="h-4 w-4" /></button>} />
  );
  const del = (endpoint: string, label: string, name: string) => (
    <DeleteAction endpoint={endpoint} label={label} name={name} trigger={<button type="button" aria-label={`Delete ${name}`} className="rounded p-1.5 text-ink-muted hover:bg-red-50 hover:text-red-600"><Trash2 className="h-4 w-4" /></button>} />
  );

  return (
    <div className="mx-auto max-w-[1600px]">
      <h1 className="font-display text-[30px] font-bold text-deep-navy">Hashtags &amp; Mentions Library</h1>
      <p className="mb-5 mt-1 text-[14.5px] text-ink-soft">Save reusable hashtag groups and mention references for faster composing.</p>

      <form method="get" className="mb-5 flex flex-wrap items-end gap-4 rounded-xl border border-line bg-white px-5 py-4">
        <label className="relative w-full max-w-[380px] flex-1">
          <span className="sr-only">Search</span>
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" />
          <input name="q" defaultValue={sp.q ?? ""} placeholder="Search groups and mentions..." className={cn(kitField, "h-11 pl-9")} />
        </label>
        {([
          ["type", "Type", [["hashtags", "Hashtag groups"], ["mentions", "Mention references"]]],
          ["platform", "Platform", SOCIAL_PLATFORMS.map((p) => [p.id, p.label])],
          ["category", "Category", categories.map((x) => [x, x])],
        ] as [keyof SP, string, string[][]][]).map(([name, label, opts]) => (
          <label key={name} className="w-[180px]">
            <span className="mb-1 block text-[12px] text-ink-soft">{label}</span>
            <select name={name} defaultValue={sp[name] ?? ""} className={kitField}>
              <option value="">All</option>
              {opts.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          </label>
        ))}
        <button type="submit" className="h-10 rounded-md border border-line px-4 text-[13px] font-semibold text-deep-navy hover:bg-bg-soft">Apply</button>
        <div className="ml-auto">{createHashtag("Create Hashtag Group")}</div>
      </form>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_500px]">
        <div className="min-w-0 space-y-5">
          <section className="rounded-xl border border-line bg-white p-5">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-[16px] font-semibold text-deep-navy">Hashtag Groups</h2>
              <form method="get"><select name="sort" defaultValue={sp.sort ?? ""} aria-label="Sort" className="h-9 rounded-md border border-line px-2 text-[12.5px]"><option value="">Sort by: Name (A-Z)</option><option value="newest">Sort by: Newest</option></select> <button className="text-[12.5px] text-[#0B5CFF]">Sort</button></form>
            </div>
            <DataTable
              columns={["Label", "Hashtags", "Platform", "Category", "Created", ""]}
              rows={groups.map((g) => [g.name, <span key="t" className="text-[12.5px]">{g.tags.map((t) => (t.startsWith("#") ? t : `#${t}`)).join(" ")}</span>, g.platform ? platformLabel(g.platform) : "Any", g.category ?? "—", fmtDate(g.createdAt), del(`/api/hashtag-sets/${g.id}`, "Hashtag group", g.name)])}
              empty={<EmptyState icon={Hash} title={reachable ? "No hashtag groups yet" : "Library unavailable"} body="Create hashtag groups to keep your most-used sets organized and ready to add to any post." action={reachable ? createHashtag("Create Hashtag Group") : undefined} />}
            />
          </section>
          <section className="rounded-xl border border-line bg-white p-5">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-[16px] font-semibold text-deep-navy">Mention References</h2>
              {createMention("Add Mention Reference", "inline-flex h-9 items-center gap-2 rounded-md bg-[#0B5CFF] px-3 text-[13px] font-semibold text-white")}
            </div>
            <DataTable
              columns={["Label", "Handle", "Platform", "Created", ""]}
              rows={mentions.map((m) => [m.label, m.handle, m.platform ? platformLabel(m.platform) : "Any", fmtDate(m.createdAt), del(`/api/mention-references/${m.id}`, "Mention reference", m.label)])}
              empty={<EmptyState icon={AtSign} title={reachable ? "No mention references yet" : "Library unavailable"} body="Save mention references to quickly add relevant handles when composing posts." action={reachable ? createMention("Add Mention Reference") : undefined} />}
            />
          </section>
        </div>

        <aside className="h-fit space-y-5 rounded-xl border border-line bg-white p-5">
          {([
            [Info, "About This Library", "Store and organize reusable hashtag groups and mention references to streamline your social publishing workflow. Use them when composing posts or scheduling content.", []],
            [Hash, "Hashtag Groups", "Group hashtags by campaign, platform, or theme.", [["Label", "Give your group a clear name."], ["Platform", "Optional platform targeting."], ["Notes", "Add context for your team."], ["Reuse", "Insert groups into any post from the composer."]]],
            [AtSign, "Mention References", "Save handles you frequently mention.", [["Label", "Name your mention reference."], ["Platform", "Optional platform targeting."], ["Notes", "Add context for your team."], ["Reuse", "Insert mentions into any post from the composer."]]],
            [Lightbulb, "Tip", "Use clear labels and notes to help your team find and reuse the right groups and mentions faster.", []],
          ] as const).map(([Icon, title, body, bullets]) => (
            <div key={title} className="flex gap-4 border-b border-line pb-5 last:border-0 last:pb-0">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-royal-tint text-[#3B3FD8]"><Icon className="h-5 w-5" /></span>
              <div>
                <h3 className="text-[15px] font-semibold text-deep-navy">{title}</h3>
                <p className="mt-1 text-[13px] text-ink-soft">{body}</p>
                {bullets.length > 0 && (
                  <ul className="mt-2 list-disc space-y-1 pl-5 text-[12.5px] text-ink-soft">
                    {bullets.map(([k, v]) => <li key={k}><span className="font-semibold text-deep-navy">{k}</span> – {v}</li>)}
                  </ul>
                )}
              </div>
            </div>
          ))}
        </aside>
      </div>
    </div>
  );
}
