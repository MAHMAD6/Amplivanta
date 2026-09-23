import type { Metadata } from "next";
import Link from "next/link";
import { Search, Square } from "lucide-react";
import { cn } from "@/lib/utils";
import { db } from "@/lib/db";
import { DataTable, EmptyState, Pill, fmtDate, kitField } from "@/components/amplivanta/screen-kit";
import { FormDialog, ProjectActions } from "@/components/amplivanta/creative-ui";
import { createProject } from "@/app/(app)/app/creative-studio/actions";
import { PROJECT_STATUSES, PROJECT_TYPES } from "@/lib/creative/options";
import { creativeContext } from "@/lib/server/creative-screens";

export const metadata: Metadata = { title: "My Projects — Creative Studio" };
export const dynamic = "force-dynamic";

const BASE = "/app/creative-studio/projects";
type SP = { view?: string; q?: string; type?: string; status?: string; owner?: string; tag?: string; modified?: string };

export default async function ProjectsPage({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams;
  const view = sp.view === "starred" ? "starred" : sp.view === "shared" ? "shared" : "all";
  const c = await creativeContext();
  let reachable = Boolean(c);
  let rows: { id: string; name: string; type: string; status: string; starred: boolean; tags: string[]; ownerId: string | null; updatedAt: Date }[] = [];
  let owners: { id: string; name: string }[] = [];
  const days = [7, 30, 90].includes(Number(sp.modified)) ? Number(sp.modified) : null;
  if (c && view !== "shared") {
    try {
      const [p, m] = await Promise.all([
        db.project.findMany({
          where: {
            workspaceId: c.workspaceId,
            ...(view === "starred" ? { starred: true } : {}),
            ...(sp.q ? { name: { contains: sp.q, mode: "insensitive" } } : {}),
            ...(sp.type ? { type: sp.type } : {}),
            ...(sp.status ? { status: sp.status } : { status: { not: "archived" } }),
            ...(sp.owner ? { ownerId: sp.owner } : {}),
            ...(sp.tag ? { tags: { has: sp.tag.toLowerCase() } } : {}),
            ...(days ? { updatedAt: { gte: new Date(Date.now() - days * 86400000) } } : {}),
          },
          orderBy: { updatedAt: "desc" },
          take: 200,
          select: { id: true, name: true, type: true, status: true, starred: true, tags: true, ownerId: true, updatedAt: true },
        }),
        db.membership.findMany({ where: { workspaceId: c.workspaceId }, include: { user: { select: { id: true, name: true, email: true } } } }),
      ]);
      rows = p;
      owners = m.map((x) => ({ id: x.user.id, name: x.user.name || x.user.email }));
    } catch {
      reachable = false;
    }
  }
  const create = (label = "Create Project", cls?: string) => (
    <FormDialog
      title="Create Project"
      label={label}
      className={cls}
      action={createProject}
      disabled={!c?.canEdit}
      submitLabel="Create project"
      fields={[
        { name: "name", label: "Project name", kind: "text", required: true },
        { name: "type", label: "Type", kind: "select", options: PROJECT_TYPES, defaultValue: "general" },
        { name: "tags", label: "Tags (comma-separated)", kind: "text", placeholder: "launch, q4" },
        { name: "description", label: "Description", kind: "textarea", rows: 3 },
      ]}
    />
  );
  const ownerName = (id: string | null) => owners.find((o) => o.id === id)?.name ?? "—";
  const filtered = Boolean(sp.q || sp.type || sp.status || sp.owner || sp.tag || sp.modified);

  return (
    <div className="mx-auto max-w-[1600px]">
      <h1 className="font-display text-[30px] font-bold text-deep-navy">My Projects</h1>
      <p className="mt-1 text-[14.5px] text-ink-soft">Organize creative work, folders, collaborators, and project activity.</p>

      <div className="my-6 flex flex-wrap items-center gap-2.5 rounded-xl border border-line bg-white px-6 py-3.5">
        {[["all", "All Projects"], ["starred", "Starred"], ["shared", "Shared with Me"]].map(([k, l]) => (
          <Link key={k} href={k === "all" ? BASE : `${BASE}?view=${k}`} className={cn("rounded-full border px-3.5 py-1.5 text-[12.5px]", view === k ? "border-[#0B5CFF] bg-royal-tint font-semibold text-[#0B5CFF]" : "border-line bg-bg-soft/60 text-ink-soft hover:text-deep-navy")}>{l}</Link>
        ))}
        <form method="get" className="ml-auto flex w-full sm:w-auto items-center gap-3">
          {view !== "all" && <input type="hidden" name="view" value={view} />}
          <label className="relative w-full sm:w-auto">
            <span className="sr-only">Search projects</span>
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" />
            <input name="q" defaultValue={sp.q ?? ""} placeholder="Search projects..." className={cn(kitField, "h-11 w-full sm:w-[300px] pl-9")} />
          </label>
        </form>
        {create("Create Project", "inline-flex h-11 items-center rounded-md bg-[#0B5CFF] px-10 text-[13.5px] font-semibold text-white hover:bg-[#0A4FE0] disabled:opacity-50")}
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_455px]">
        <section className="min-h-[580px] rounded-xl border border-line bg-white p-5">
          {rows.length ? (
            <DataTable
              minWidth={760}
              columns={["Project", "Type", "Status", "Owner", "Updated", "Actions"]}
              rows={rows.map((p) => [
                <span key="n">{p.name}{p.tags.length > 0 && <span className="ml-2 text-[11.5px] font-normal text-ink-muted">{p.tags.map((t) => `#${t}`).join(" ")}</span>}</span>,
                <span key="t" className="capitalize">{p.type}</span>,
                <Pill key="s" tone={p.status === "completed" ? "green" : p.status === "archived" ? "gray" : "blue"}>{p.status.replace(/_/g, " ")}</Pill>,
                ownerName(p.ownerId),
                fmtDate(p.updatedAt),
                <ProjectActions key="a" id={p.id} starred={p.starred} status={p.status} canEdit={Boolean(c?.canEdit)} />,
              ])}
            />
          ) : (
            <EmptyState
              icon={Square}
              title={!reachable ? "Projects unavailable" : view === "shared" ? "Nothing shared with you" : filtered ? "No projects match these filters" : view === "starred" ? "No starred projects" : "No projects yet"}
              body={view === "shared" ? "Projects belong to the workspace; sharing individual projects is not available yet." : "Create a project to organize creative assets, collaborators, and activity."}
              action={reachable && view === "all" && !filtered ? create() : undefined}
            />
          )}
        </section>
        <aside className="rounded-xl border border-line bg-white p-5">
          <h2 className="mb-4 text-[16px] font-semibold text-deep-navy">Project Filters</h2>
          <form method="get" className="space-y-4">
            {view !== "all" && <input type="hidden" name="view" value={view} />}
            {sp.q && <input type="hidden" name="q" value={sp.q} />}
            {([
              ["type", "Type", PROJECT_TYPES, "All"],
              ["status", "Status", PROJECT_STATUSES, "Active and in progress"],
              ["owner", "Owner", owners.map((o) => [o.id, o.name] as [string, string]), "All"],
              ["modified", "Modified", [["7", "Last 7 days"], ["30", "Last 30 days"], ["90", "Last 90 days"]] as [string, string][], "Any time"],
            ] as [keyof SP, string, [string, string][], string][]).map(([name, label, opts, all]) => (
              <label key={name} className="block">
                <span className="mb-1.5 block text-[13.5px] font-semibold text-deep-navy">{label}</span>
                <select name={name} defaultValue={sp[name] ?? ""} className={cn(kitField, "h-11")}>
                  <option value="">{all}</option>
                  {opts.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                </select>
              </label>
            ))}
            <label className="block">
              <span className="mb-1.5 block text-[13.5px] font-semibold text-deep-navy">Tags</span>
              <input name="tag" defaultValue={sp.tag ?? ""} placeholder="Any" className={cn(kitField, "h-11")} />
            </label>
            <div className="flex gap-2">
              <button type="submit" className="h-10 rounded-md bg-[#0B5CFF] px-5 text-[13px] font-semibold text-white">Apply</button>
              {filtered && <Link href={view === "all" ? BASE : `${BASE}?view=${view}`} className="flex h-10 items-center rounded-md border border-line px-4 text-[13px]">Clear</Link>}
            </div>
          </form>
        </aside>
      </div>
      <section className="mt-6 rounded-xl border border-line bg-white p-5">
        <h2 className="mb-2 text-[16px] font-semibold text-deep-navy">Project Actions</h2>
        <p className="text-[13px] text-ink-soft">Star, duplicate, archive or delete a project from its row. Opening a project in an editor and moving it between folders become available as those editors ship.</p>
      </section>
    </div>
  );
}
