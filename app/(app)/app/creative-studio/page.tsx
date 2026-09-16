import type { Metadata } from "next";
import Link from "next/link";
import { Diamond, FileText, Image as ImageIcon, LayoutTemplate, Palette, Play, Square } from "lucide-react";
import { db } from "@/lib/db";
import { EmptyState, fmtDate, kitOutline } from "@/components/amplivanta/screen-kit";
import { FormDialog } from "@/components/amplivanta/creative-ui";
import { createProject } from "@/app/(app)/app/creative-studio/actions";
import { PROJECT_TYPES } from "@/lib/creative/options";
import { creativeContext } from "@/lib/server/creative-screens";
import { formatBytes } from "@/lib/server/media-library";
import { isStorageConfigured, objectUrl } from "@/lib/storage";

export const metadata: Metadata = { title: "Creative Studio" };
export const dynamic = "force-dynamic";

const CREATE: [typeof ImageIcon, string, string, string][] = [
  [ImageIcon, "Images", "Generate or manage images.", "/app/creative-studio/images"],
  [Diamond, "Graphics", "Create campaign and social graphics.", "/app/creative-studio/graphics"],
  [Play, "Video", "Create and manage video projects.", "/app/creative-studio/video"],
  [FileText, "Documents", "Draft and manage documents.", "/app/creative-studio/documents"],
];

export default async function CreativeStudioPage() {
  const c = await creativeContext();
  let projects: { id: string; name: string; type: string; updatedAt: Date }[] = [];
  let assets: { id: string; name: string; mimeType: string | null; fileSize: number; url: string | null; createdAt: Date }[] = [];
  if (c) {
    try {
      const [p, a] = await Promise.all([
        db.project.findMany({ where: { workspaceId: c.workspaceId, status: { not: "archived" } }, orderBy: { updatedAt: "desc" }, take: 6, select: { id: true, name: true, type: true, updatedAt: true } }),
        db.asset.findMany({ where: { workspaceId: c.workspaceId }, orderBy: { createdAt: "desc" }, take: 8 }),
      ]);
      projects = p;
      const storage = isStorageConfigured();
      assets = await Promise.all(a.map(async (x) => ({ id: x.id, name: x.name, mimeType: x.mimeType, fileSize: x.fileSize, createdAt: x.createdAt, url: storage && x.mimeType?.startsWith("image/") ? await objectUrl(x.fileUrl).catch(() => null) : null })));
    } catch {
      projects = [];
    }
  }
  const createProjectButton = (
    <FormDialog
      title="Create Project"
      label="Create Project"
      action={createProject}
      disabled={!c?.canEdit}
      submitLabel="Create project"
      fields={[
        { name: "name", label: "Project name", kind: "text", required: true },
        { name: "type", label: "Type", kind: "select", options: PROJECT_TYPES, defaultValue: "general" },
        { name: "description", label: "Description", kind: "textarea", rows: 3 },
      ]}
    />
  );

  return (
    <div className="mx-auto max-w-[1600px]">
      <h1 className="font-display text-[30px] font-bold text-deep-navy">Creative Studio</h1>
      <p className="mt-1 text-[14.5px] text-ink-soft">Create and manage images, graphics, video, documents, brand assets, and reusable creative work.</p>

      <h2 className="mt-6 text-[15px] font-semibold text-deep-navy">Create</h2>
      <p className="mb-1 text-[12.5px] text-ink-soft">Choose a creative workspace.</p>
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {CREATE.map(([Icon, title, body, href]) => (
          <div key={title} className="flex gap-4 rounded-xl border border-line bg-white p-5">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-royal-tint text-[#3B3FD8]"><Icon className="h-5 w-5" /></span>
            <div>
              <div className="text-[15px] font-semibold text-deep-navy">{title}</div>
              <div className="text-[12.5px] text-ink-soft">{body}</div>
              <Link href={href} className={`${kitOutline} mt-3 h-9 px-12`}>Open</Link>
            </div>
          </div>
        ))}
      </div>

      <div className="mb-6 grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.3fr)_1fr]">
        <section className="rounded-xl border border-line bg-white p-5">
          {projects.length ? (
            <>
              <div className="mb-3 flex items-center justify-between"><h2 className="text-[16px] font-semibold text-deep-navy">Recent Projects</h2>{createProjectButton}</div>
              <ul className="divide-y divide-line">
                {projects.map((p) => (
                  <li key={p.id} className="flex items-center justify-between py-3">
                    <div><div className="text-[14px] font-semibold text-deep-navy">{p.name}</div><div className="text-[12px] capitalize text-ink-muted">{p.type} · updated {fmtDate(p.updatedAt)}</div></div>
                    <Link href="/app/creative-studio/projects" className="text-[12.5px] font-semibold text-[#0B5CFF]">View</Link>
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <EmptyState icon={Square} title="No recent projects yet" body="Create a project or open a creative workspace to get started." action={createProjectButton} />
          )}
        </section>
        <section className="rounded-xl border border-line bg-white p-5">
          <h2 className="mb-4 text-[16px] font-semibold text-deep-navy">Quick Start</h2>
          <ul className="space-y-3">
            {([[Palette, "Brand Kit", "Set brand assets and reusable design tokens.", "/app/creative-studio/brand-kit"], [LayoutTemplate, "Templates", "Browse reusable starting points.", "/app/creative-studio/templates"], [Square, "My Projects", "Organize creative work and folders.", "/app/creative-studio/projects"]] as const).map(([Icon, t, b, href]) => (
              <li key={t}>
                <Link href={href} className="flex items-start gap-3 rounded-lg border border-line px-4 py-4 hover:bg-bg-soft/60">
                  <Icon className="mt-0.5 h-4 w-4 text-[#3B3FD8]" />
                  <span><span className="block text-[14px] font-semibold text-deep-navy">{t}</span><span className="block text-[12.5px] text-ink-soft">{b}</span></span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <section className="rounded-xl border border-line bg-white p-5">
        <h2 className="mb-3 text-[16px] font-semibold text-deep-navy">Recent Assets</h2>
        {assets.length ? (
          <ul className="grid grid-cols-2 gap-4 md:grid-cols-4 2xl:grid-cols-8">
            {assets.map((a) => (
              <li key={a.id} className="overflow-hidden rounded-lg border border-line">
                <div className="flex aspect-square items-center justify-center bg-bg-soft">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  {a.url ? <img src={a.url} alt={a.name} loading="lazy" className="h-full w-full object-cover" /> : <FileText className="h-6 w-6 text-ink-muted" />}
                </div>
                <div className="px-2.5 py-2"><div className="truncate text-[12px] font-semibold text-deep-navy">{a.name}</div><div className="text-[11px] text-ink-muted">{formatBytes(a.fileSize)}</div></div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="rounded-lg border border-line"><EmptyState icon={Diamond} title="No creative assets yet" body="Generated, uploaded, and saved assets will appear here." /></div>
        )}
      </section>
    </div>
  );
}
