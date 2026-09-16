import type { Metadata } from "next";
import Link from "next/link";
import { Diamond } from "lucide-react";
import { cn } from "@/lib/utils";
import { db } from "@/lib/db";
import { DataTable, EmptyState, fmtDate } from "@/components/amplivanta/screen-kit";
import { FormDialog, ProjectActions } from "@/components/amplivanta/creative-ui";
import { createGraphic } from "@/app/(app)/app/creative-studio/actions";
import { GRAPHIC_DESTINATIONS, GRAPHIC_FORMATS } from "@/lib/creative/options";
import { creativeContext } from "@/lib/server/creative-screens";

export const metadata: Metadata = { title: "Graphics — Creative Studio" };
export const dynamic = "force-dynamic";

const BASE = "/app/creative-studio/graphics";
const VIEWS = [["create", "Create New"], ["templates", "Templates"], ["mine", "My Graphics"], ["brand", "Brand Kit"]] as const;

type GraphicConfig = { format?: string; width?: number; height?: number; brandKitId?: string | null; destination?: string | null };

export default async function GraphicsPage({ searchParams }: { searchParams: Promise<{ view?: string }> }) {
  const { view: raw } = await searchParams;
  const view = VIEWS.some(([k]) => k === raw) ? raw! : "create";
  const c = await creativeContext();
  let graphics: { id: string; name: string; status: string; starred: boolean; config: GraphicConfig; updatedAt: Date }[] = [];
  let kits: { id: string; name: string }[] = [];
  let templates: { id: string; name: string; category: string }[] = [];
  let reachable = Boolean(c);
  if (c) {
    try {
      const [g, k, t] = await Promise.all([
        db.project.findMany({ where: { workspaceId: c.workspaceId, type: "graphic" }, orderBy: { updatedAt: "desc" }, take: 100 }),
        db.brandKit.findMany({ where: { workspaceId: c.workspaceId }, orderBy: { name: "asc" }, select: { id: true, name: true } }),
        db.template.findMany({ where: { workspaceId: c.workspaceId, type: "graphic" }, orderBy: { createdAt: "desc" }, take: 50, select: { id: true, name: true, category: true } }),
      ]);
      graphics = g.map((x) => ({ id: x.id, name: x.name, status: x.status, starred: x.starred, updatedAt: x.updatedAt, config: (x.config ?? {}) as GraphicConfig }));
      kits = k;
      templates = t;
    } catch {
      reachable = false;
    }
  }
  const create = (label = "Create Graphic", cls?: string) => (
    <FormDialog
      title="Create Graphic"
      label={label}
      className={cls}
      action={createGraphic}
      disabled={!c?.canEdit}
      submitLabel="Create graphic"
      note="Creates a graphic project with this canvas setup. Use the AI Image Generator to produce artwork for it."
      fields={[
        { name: "name", label: "Name", kind: "text", placeholder: "Spring launch banner" },
        { name: "format", label: "Format", kind: "select", required: true, options: GRAPHIC_FORMATS.map((f) => [f.value, f.width ? `${f.label} · ${f.width}×${f.height}` : f.label]) },
        { name: "width", label: "Custom width (px)", kind: "number", placeholder: "Only for custom size" },
        { name: "height", label: "Custom height (px)", kind: "number", placeholder: "Only for custom size" },
        { name: "brandKitId", label: "Brand Kit", kind: "select", options: kits.map((k) => [k.id, k.name]), placeholder: "Optional" },
        { name: "destination", label: "Destination", kind: "select", options: GRAPHIC_DESTINATIONS, placeholder: "Optional" },
      ]}
    />
  );
  const tool = "flex h-14 items-center justify-center rounded-md border border-line text-[13.5px] font-semibold text-deep-navy hover:bg-bg-soft";

  return (
    <div className="mx-auto max-w-[1600px]">
      <h1 className="font-display text-[30px] font-bold text-deep-navy">Graphics</h1>
      <p className="mt-1 text-[14.5px] text-ink-soft">Create social, ad, banner, presentation, and campaign graphics.</p>

      <div className="my-6 flex flex-wrap items-center gap-2.5 rounded-xl border border-line bg-white px-6 py-3.5">
        {VIEWS.map(([k, l]) =>
          k === "brand" ? (
            <Link key={k} href="/app/creative-studio/brand-kit" className="rounded-full border border-line bg-bg-soft/60 px-3.5 py-1.5 text-[12.5px] text-ink-soft hover:text-deep-navy">{l}</Link>
          ) : (
            <Link key={k} href={k === "create" ? BASE : `${BASE}?view=${k}`} className={cn("rounded-full border px-3.5 py-1.5 text-[12.5px]", view === k ? "border-[#0B5CFF] bg-royal-tint font-semibold text-[#0B5CFF]" : "border-line bg-bg-soft/60 text-ink-soft hover:text-deep-navy")}>{l}</Link>
          ),
        )}
        <div className="ml-auto">{create("Create Graphic", "inline-flex h-11 items-center rounded-md bg-[#0B5CFF] px-8 text-[13.5px] font-semibold text-white hover:bg-[#0A4FE0] disabled:opacity-50")}</div>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.6fr)_1fr]">
        <section className="min-h-[490px] rounded-xl border border-line bg-white p-5">
          {view === "templates" ? (
            templates.length ? (
              <DataTable columns={["Template", "Category"]} rows={templates.map((t) => [t.name, t.category.replace(/_/g, " ")])} />
            ) : (
              <EmptyState icon={Diamond} title="No graphic templates yet" body="Graphic templates appear here when they are added to the Creative Studio library." action={<Link href="/app/creative-studio/templates" className="text-[13px] font-semibold text-[#0B5CFF]">Open Templates</Link>} />
            )
          ) : graphics.length ? (
            <DataTable
              minWidth={680}
              columns={["Graphic", "Format", "Size", "Updated", "Actions"]}
              rows={graphics.filter((g) => view !== "mine" || g.status !== "archived").map((g) => [
                g.name,
                GRAPHIC_FORMATS.find((f) => f.value === g.config.format)?.label ?? "—",
                g.config.width ? `${g.config.width}×${g.config.height}` : "—",
                fmtDate(g.updatedAt),
                <ProjectActions key="a" id={g.id} starred={g.starred} status={g.status} canEdit={Boolean(c?.canEdit)} />,
              ])}
            />
          ) : (
            <EmptyState icon={Diamond} title={reachable ? "No graphics yet" : "Graphics unavailable"} body="Start from a blank canvas, use a template, or describe what you want to create." action={reachable ? create() : undefined} />
          )}
        </section>
        <section className="rounded-xl border border-line bg-white p-5">
          <h2 className="mb-4 text-[16px] font-semibold text-deep-navy">Canvas Setup</h2>
          <p className="mb-4 text-[13px] text-ink-soft">Choose a format, size, brand kit and destination when you create a graphic. Available formats:</p>
          <ul className="divide-y divide-line text-[13px]">
            {GRAPHIC_FORMATS.filter((f) => f.width).map((f) => (
              <li key={f.value} className="flex justify-between py-2.5"><span className="text-deep-navy">{f.label}</span><span className="text-ink-soft">{f.width}×{f.height}</span></li>
            ))}
          </ul>
        </section>
      </div>

      <section className="rounded-xl border border-line bg-white p-5">
        <h2 className="mb-4 text-[16px] font-semibold text-deep-navy">Design Tools</h2>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6">
          <Link href="/app/creative-studio/templates" className={tool}>Start from Template</Link>
          {create("Custom Size", tool)}
          <Link href="/app/creative-studio/brand-kit" className={tool}>Brand Kit</Link>
          <Link href="/app/creative-studio/images" className={tool}>AI Design Assistant</Link>
          <span className={cn(tool, "cursor-not-allowed text-ink-muted")} title="Available once the canvas editor is enabled">Export · Not available yet</span>
          <span className={cn(tool, "cursor-not-allowed text-ink-muted")} title="Available once the canvas editor is enabled">Version History · Not available yet</span>
        </div>
      </section>
    </div>
  );
}
