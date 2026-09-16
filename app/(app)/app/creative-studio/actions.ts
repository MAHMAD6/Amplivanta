"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { getSessionContext } from "@/lib/tenant";
import { runAiTask } from "@/lib/ai";
import {
  DOCUMENT_LENGTHS,
  DOCUMENT_TONES,
  DOCUMENT_TOOLS,
  DOCUMENT_TYPES,
  GRAPHIC_DESTINATIONS,
  GRAPHIC_FORMATS,
  HEX,
  PROJECT_STATUSES,
  PROJECT_TYPES,
  TEMPLATE_CATEGORIES,
  TEMPLATE_CHANNELS,
  TEMPLATE_TYPES,
  pick,
} from "@/lib/creative/options";

/**
 * Creative Studio writes: projects, graphics setups, brand kits, templates and
 * documents. Workspace-scoped; viewers cannot write. AI writing returns a
 * suggestion or a draft document — it never overwrites a document by itself.
 */

type Result = { ok: true; message: string; id?: string; text?: string } | { ok: false; error: string };

const BASE = "/app/creative-studio";
const str = (fd: FormData, k: string, max = 200) => String(fd.get(k) ?? "").trim().slice(0, max);

async function editor() {
  try {
    const ctx = await getSessionContext();
    return ctx.workspaceRole === "VIEWER" ? null : ctx;
  } catch {
    return null;
  }
}

const denied = { ok: false as const, error: "You don't have permission to change Creative Studio content." };

/* --------------------------------------------------------------- projects */

export async function createProject(fd: FormData): Promise<Result> {
  const c = await editor();
  if (!c) return denied;
  const name = str(fd, "name", 160);
  if (name.length < 2) return { ok: false, error: "Enter a project name." };
  const tags = str(fd, "tags", 300).split(",").map((t) => t.trim().toLowerCase()).filter(Boolean).slice(0, 10);
  const p = await db.project.create({
    data: { workspaceId: c.workspaceId, name, description: str(fd, "description", 2000) || null, type: pick(fd.get("type"), PROJECT_TYPES, "general"), tags, ownerId: c.userId },
  });
  revalidatePath(`${BASE}/projects`);
  revalidatePath(BASE);
  return { ok: true, message: "Project created.", id: p.id };
}

export async function updateProject(id: string, patch: { starred?: boolean; status?: string }): Promise<Result> {
  const c = await editor();
  if (!c) return denied;
  const data: { starred?: boolean; status?: string } = {};
  if (typeof patch.starred === "boolean") data.starred = patch.starred;
  if (patch.status) data.status = pick(patch.status, PROJECT_STATUSES, "active");
  const r = await db.project.updateMany({ where: { id, workspaceId: c.workspaceId }, data });
  if (!r.count) return { ok: false, error: "That project is not in this workspace." };
  revalidatePath(`${BASE}/projects`);
  revalidatePath(`${BASE}/graphics`);
  return { ok: true, message: data.status === "archived" ? "Project archived." : "Project updated." };
}

export async function duplicateProject(id: string): Promise<Result> {
  const c = await editor();
  if (!c) return denied;
  const src = await db.project.findFirst({ where: { id, workspaceId: c.workspaceId } });
  if (!src) return { ok: false, error: "That project is not in this workspace." };
  const copy = await db.project.create({
    data: { workspaceId: c.workspaceId, name: `${src.name} (copy)`.slice(0, 160), description: src.description, type: src.type, tags: src.tags, config: src.config ?? undefined, ownerId: c.userId },
  });
  revalidatePath(`${BASE}/projects`);
  return { ok: true, message: "Project duplicated.", id: copy.id };
}

export async function deleteProject(id: string): Promise<Result> {
  const c = await editor();
  if (!c) return denied;
  const r = await db.project.deleteMany({ where: { id, workspaceId: c.workspaceId } });
  if (!r.count) return { ok: false, error: "That project is not in this workspace." };
  revalidatePath(`${BASE}/projects`);
  revalidatePath(`${BASE}/graphics`);
  return { ok: true, message: "Project deleted." };
}

/* --------------------------------------------------------------- graphics */

export async function createGraphic(fd: FormData): Promise<Result> {
  const c = await editor();
  if (!c) return denied;
  const name = str(fd, "name", 160) || "Untitled graphic";
  const format = GRAPHIC_FORMATS.find((f) => f.value === fd.get("format"));
  if (!format) return { ok: false, error: "Choose a format." };
  let width = format.width;
  let height = format.height;
  if (format.value === "custom") {
    width = Number(fd.get("width"));
    height = Number(fd.get("height"));
    if (!Number.isInteger(width) || !Number.isInteger(height) || width < 50 || height < 50 || width > 8000 || height > 8000) {
      return { ok: false, error: "Custom sizes must be whole pixels between 50 and 8000." };
    }
  }
  const brandKitId = str(fd, "brandKitId", 40);
  if (brandKitId && !(await db.brandKit.findFirst({ where: { id: brandKitId, workspaceId: c.workspaceId }, select: { id: true } }))) {
    return { ok: false, error: "That brand kit is not in this workspace." };
  }
  const p = await db.project.create({
    data: {
      workspaceId: c.workspaceId,
      name,
      type: "graphic",
      ownerId: c.userId,
      config: { format: format.value, width, height, brandKitId: brandKitId || null, destination: pick(fd.get("destination"), GRAPHIC_DESTINATIONS, "") || null },
    },
  });
  revalidatePath(`${BASE}/graphics`);
  revalidatePath(`${BASE}/projects`);
  return { ok: true, message: "Graphic project created.", id: p.id };
}

/* ------------------------------------------------------------- brand kits */

export async function saveBrandKit(fd: FormData): Promise<Result> {
  const c = await editor();
  if (!c) return denied;
  const id = str(fd, "id", 40);
  const name = str(fd, "name", 120);
  if (name.length < 2) return { ok: false, error: "Enter a brand kit name." };
  const color = (k: string) => {
    const v = str(fd, k, 7);
    return v && HEX.test(v) ? v.toUpperCase() : null;
  };
  const logoIds = fd.getAll("logos").map(String).slice(0, 10);
  const logos = logoIds.length
    ? (await db.asset.findMany({ where: { id: { in: logoIds }, workspaceId: c.workspaceId, mimeType: { startsWith: "image/" } }, select: { id: true } })).map((a) => a.id)
    : [];
  const data = {
    name,
    primaryColor: color("primaryColor"),
    secondaryColor: color("secondaryColor"),
    accentColor: color("accentColor"),
    fonts: { heading: str(fd, "headingFont", 60) || null, body: str(fd, "bodyFont", 60) || null },
    guidelines: str(fd, "guidelines", 5000) || null,
    logos,
  };
  if (id) {
    const r = await db.brandKit.updateMany({ where: { id, workspaceId: c.workspaceId }, data });
    if (!r.count) return { ok: false, error: "That brand kit is not in this workspace." };
  } else {
    const count = await db.brandKit.count({ where: { workspaceId: c.workspaceId } });
    await db.brandKit.create({ data: { ...data, workspaceId: c.workspaceId, isDefault: count === 0 } });
  }
  revalidatePath(`${BASE}/brand-kit`);
  return { ok: true, message: id ? "Brand kit saved." : "Brand kit created." };
}

export async function setDefaultBrandKit(id: string): Promise<Result> {
  const c = await editor();
  if (!c) return denied;
  const kit = await db.brandKit.findFirst({ where: { id, workspaceId: c.workspaceId }, select: { id: true } });
  if (!kit) return { ok: false, error: "That brand kit is not in this workspace." };
  await db.$transaction([
    db.brandKit.updateMany({ where: { workspaceId: c.workspaceId }, data: { isDefault: false } }),
    db.brandKit.update({ where: { id }, data: { isDefault: true } }),
  ]);
  revalidatePath(`${BASE}/brand-kit`);
  return { ok: true, message: "Default brand kit set." };
}

export async function deleteBrandKit(id: string): Promise<Result> {
  const c = await editor();
  if (!c) return denied;
  const r = await db.brandKit.deleteMany({ where: { id, workspaceId: c.workspaceId } });
  if (!r.count) return { ok: false, error: "That brand kit is not in this workspace." };
  revalidatePath(`${BASE}/brand-kit`);
  return { ok: true, message: "Brand kit deleted." };
}

/* -------------------------------------------------------------- templates */

export async function createTemplate(fd: FormData): Promise<Result> {
  const c = await editor();
  if (!c) return denied;
  const name = str(fd, "name", 120);
  if (name.length < 2) return { ok: false, error: "Enter a template name." };
  const t = await db.template.create({
    data: {
      workspaceId: c.workspaceId,
      name,
      category: pick(fd.get("category"), TEMPLATE_CATEGORIES, "other"),
      type: pick(fd.get("type"), TEMPLATE_TYPES, "document"),
      channel: pick(fd.get("channel"), TEMPLATE_CHANNELS, "") || null,
      content: { text: str(fd, "content", 20000) },
    },
  });
  revalidatePath(`${BASE}/templates`);
  return { ok: true, message: "Template created.", id: t.id };
}

export async function deleteTemplate(id: string): Promise<Result> {
  const c = await editor();
  if (!c) return denied;
  const r = await db.template.deleteMany({ where: { id, workspaceId: c.workspaceId } });
  if (!r.count) return { ok: false, error: "That template is not in this workspace." };
  revalidatePath(`${BASE}/templates`);
  return { ok: true, message: "Template deleted." };
}

/** Starts a document from a document template. */
export async function useTemplate(id: string): Promise<Result> {
  const c = await editor();
  if (!c) return denied;
  const t = await db.template.findFirst({ where: { id, workspaceId: c.workspaceId } });
  if (!t) return { ok: false, error: "That template is not in this workspace." };
  const text = typeof (t.content as { text?: unknown })?.text === "string" ? ((t.content as { text: string }).text) : "";
  const d = await db.document.create({ data: { workspaceId: c.workspaceId, title: t.name, content: text, createdByUserId: c.userId } });
  revalidatePath(`${BASE}/documents`);
  return { ok: true, message: "Document created from template.", id: d.id };
}

/* -------------------------------------------------------------- documents */

export async function createDocument(fd: FormData): Promise<Result> {
  const c = await editor();
  if (!c) return denied;
  const d = await db.document.create({
    data: { workspaceId: c.workspaceId, title: str(fd, "title", 200) || "Untitled document", type: pick(fd.get("type"), DOCUMENT_TYPES, "other"), content: "", createdByUserId: c.userId },
  });
  revalidatePath(`${BASE}/documents`);
  return { ok: true, message: "Document created.", id: d.id };
}

export async function saveDocument(id: string, title: string, content: string): Promise<Result> {
  const c = await editor();
  if (!c) return denied;
  if (content.length > 200_000) return { ok: false, error: "That document is too long." };
  const r = await db.document.updateMany({ where: { id, workspaceId: c.workspaceId }, data: { title: title.trim().slice(0, 200) || "Untitled document", content } });
  if (!r.count) return { ok: false, error: "That document is not in this workspace." };
  revalidatePath(`${BASE}/documents`);
  return { ok: true, message: "Document saved." };
}

export async function setDocumentStatus(id: string, status: "draft" | "archived"): Promise<Result> {
  const c = await editor();
  if (!c) return denied;
  const r = await db.document.updateMany({ where: { id, workspaceId: c.workspaceId }, data: { status: status === "archived" ? "archived" : "draft" } });
  if (!r.count) return { ok: false, error: "That document is not in this workspace." };
  revalidatePath(`${BASE}/documents`);
  return { ok: true, message: status === "archived" ? "Moved to trash." : "Document restored." };
}

export async function deleteDocument(id: string): Promise<Result> {
  const c = await editor();
  if (!c) return denied;
  const r = await db.document.deleteMany({ where: { id, workspaceId: c.workspaceId, status: "archived" } });
  if (!r.count) return { ok: false, error: "Only documents in trash can be deleted permanently." };
  revalidatePath(`${BASE}/documents`);
  return { ok: true, message: "Document deleted permanently." };
}

/** AI Document Writer: creates a draft document the user then edits. */
export async function draftDocumentWithAi(fd: FormData): Promise<Result> {
  const c = await editor();
  if (!c) return denied;
  const brief = str(fd, "brief", 3000);
  if (brief.length < 10) return { ok: false, error: "Describe what the document should cover (at least 10 characters)." };
  const type = pick(fd.get("type"), DOCUMENT_TYPES, "other");
  const tone = pick(fd.get("tone"), DOCUMENT_TONES, "");
  const length = pick(fd.get("length"), DOCUMENT_LENGTHS, "medium");
  const kitId = str(fd, "brandKitId", 40);
  const kit = kitId ? await db.brandKit.findFirst({ where: { id: kitId, workspaceId: c.workspaceId }, select: { name: true, guidelines: true } }) : null;
  const prompt = [
    `Document type: ${DOCUMENT_TYPES.find(([v]) => v === type)?.[1]}`,
    tone && `Tone: ${tone}`,
    `Length: ${DOCUMENT_LENGTHS.find(([v]) => v === length)?.[1]}`,
    kit?.guidelines ? `Brand guidelines (${kit.name}):\n${kit.guidelines.slice(0, 2000)}` : null,
    `Brief:\n${brief}`,
  ].filter(Boolean).join("\n\n");
  const res = await runAiTask({ workspaceId: c.workspaceId, userId: c.userId }, "document_draft", { prompt, moderationText: brief });
  if (!res.ok) return { ok: false, error: res.error };
  const title = (res.value.match(/^#\s+(.+)$/m)?.[1] ?? brief.split(/[.\n]/)[0]).slice(0, 200);
  const d = await db.document.create({ data: { workspaceId: c.workspaceId, title, type, content: res.value, aiGenerated: true, createdByUserId: c.userId } });
  revalidatePath(`${BASE}/documents`);
  return { ok: true, message: "Draft created. Review and edit before using it.", id: d.id };
}

/** Document tools: returns a suggestion; the editor applies it only on request. */
export async function transformText(tool: string, text: string, option = ""): Promise<Result> {
  const c = await editor();
  if (!c) return denied;
  const def = DOCUMENT_TOOLS.find(([v]) => v === tool);
  if (!def) return { ok: false, error: "Unknown tool." };
  const input = text.trim();
  if (input.length < 20) return { ok: false, error: "Select or write at least 20 characters first." };
  if (input.length > 12000) return { ok: false, error: "Use this tool on up to 12,000 characters at a time." };
  const extra = tool === "translate" ? `Target language: ${option.slice(0, 40) || "Spanish"}` : tool === "tone" ? `Target tone: ${pick(option, DOCUMENT_TONES, "professional")}` : "";
  const res = await runAiTask({ workspaceId: c.workspaceId, userId: c.userId }, "document_transform", { prompt: `${def[2]}\n${extra}\n\nText:\n${input}`, moderationText: input });
  if (!res.ok) return { ok: false, error: res.error };
  return { ok: true, message: "Suggestion ready.", text: res.value };
}
