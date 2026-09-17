import "server-only";
import { db } from "@/lib/db";
import { BLOG_POSTS } from "@/lib/blog-posts";
import { HELP_ARTICLES, RESOURCE_TEMPLATES, RESOURCE_VIDEOS, RESOURCE_WEBINARS } from "@/lib/site-resource-items";
import { AUTOMATION_TEMPLATES } from "@/lib/marketing/workflow";
import { LANDING_TEMPLATES } from "@/lib/marketing/blocks";

/**
 * In-app Resources read the same published sources as the public Resources
 * section (lib/blog-posts, lib/site-resource-items) plus templates that really
 * exist in the product. Nothing here is sample content: an empty source shows
 * an empty state.
 */

export type ResourceEntry = { type: "Article" | "Help" | "Video" | "Webinar" | "Template"; title: string; summary: string; href: string; topic?: string; date?: string; external?: boolean };

const blogDate = (d: string) => new Date(d).getTime() || 0;

export function publishedResources(): ResourceEntry[] {
  return [
    ...[...BLOG_POSTS].sort((a, b) => blogDate(b.date) - blogDate(a.date)).map((p) => ({ type: "Article" as const, title: p.title, summary: p.excerpt, href: `/resources/blog/${p.slug}`, topic: p.topic, date: p.date })),
    ...HELP_ARTICLES.map((a) => ({ type: "Help" as const, title: a.title, summary: a.summary, href: `/resources/help-center/${a.slug}`, date: a.updatedLabel })),
    ...RESOURCE_VIDEOS.map((v) => ({ type: "Video" as const, title: v.title, summary: v.summary, href: `/resources/videos/${v.slug}`, topic: v.topic, date: v.publishedLabel })),
    ...RESOURCE_WEBINARS.map((w) => ({ type: "Webinar" as const, title: w.title, summary: w.summary, href: `/resources/webinars/${w.slug}`, date: w.scheduleLabel })),
    ...RESOURCE_TEMPLATES.map((t) => ({ type: "Template" as const, title: t.title, summary: t.summary, href: `/resources/templates/${t.slug}`, topic: t.format })),
  ];
}

export function matches(q: string, ...fields: (string | undefined)[]) {
  const terms = q.toLowerCase().split(/\s+/).filter(Boolean);
  const hay = fields.filter(Boolean).join(" ").toLowerCase();
  return terms.every((t) => hay.includes(t));
}

export type ProductTemplate = { source: string; name: string; description: string; category: string; href: string };

/** Templates available in the product: built-in automation and landing page templates, plus this workspace's saved templates. */
export async function productTemplates(workspaceId: string | null): Promise<{ items: ProductTemplate[]; workspaceReachable: boolean }> {
  const items: ProductTemplate[] = [
    ...AUTOMATION_TEMPLATES.map((t) => ({ source: "Automation", name: t.name, description: t.description, category: t.category.replace(/_/g, " "), href: `/app/marketing/templates?preview=${t.key}` })),
    ...LANDING_TEMPLATES.map((t) => ({ source: "Landing page", name: t.name, description: t.description, category: t.category.replace(/_/g, " "), href: `/app/marketing/landing-page-templates?t=${t.key}` })),
  ];
  if (!workspaceId) return { items, workspaceReachable: false };
  try {
    const [creative, email] = await Promise.all([
      db.template.findMany({ where: { workspaceId }, orderBy: { createdAt: "desc" }, take: 100, select: { id: true, name: true, category: true, type: true } }),
      db.emailTemplate.findMany({ where: { workspaceId }, orderBy: { updatedAt: "desc" }, take: 100, select: { id: true, name: true, subject: true } }),
    ]);
    items.push(
      ...creative.map((t) => ({ source: "Creative Studio", name: t.name, description: `Saved ${t.type} template`, category: t.category, href: `/app/creative-studio/templates?q=${encodeURIComponent(t.name)}` })),
      ...email.map((t) => ({ source: "Email", name: t.name, description: t.subject ? `Subject: ${t.subject}` : "Saved email template", category: "email", href: "/app/marketing/email-composer" })),
    );
    return { items, workspaceReachable: true };
  } catch {
    return { items, workspaceReachable: false };
  }
}

export type SetupGuide = { key: string; title: string; body: string; href: string; cta: string; done: boolean | null; module: string };

/** Setup guides whose completion is read from the workspace, so progress is real. */
export async function setupGuides(workspaceId: string | null): Promise<SetupGuide[]> {
  const base: Omit<SetupGuide, "done">[] = [
    { key: "integrations", module: "Integrations", title: "Connect a data source", body: "Connect Google, HubSpot or another supported service so dashboards and recommendations use your data.", href: "/app/integrations", cta: "Open Integrations" },
    { key: "contacts", module: "CRM", title: "Import your contacts", body: "Bring contacts in from a CSV with column mapping and validation, or add them one by one.", href: "/app/integrations/import-export", cta: "Import contacts" },
    { key: "pipeline", module: "CRM", title: "Track your first deal", body: "Create a deal, place it in a pipeline stage, and link the contact and company.", href: "/app/crm/deals", cta: "Open Deals" },
    { key: "form", module: "Marketing Automation", title: "Capture leads with a form", body: "Build a form, embed it or host it, and send submissions straight into the CRM.", href: "/app/marketing/forms", cta: "Open Forms" },
    { key: "page", module: "Marketing Automation", title: "Publish a landing page", body: "Start from a template, finish the publish checklist, and put the page live.", href: "/app/marketing/landing-page-templates", cta: "Browse page templates" },
    { key: "workflow", module: "Marketing Automation", title: "Automate a follow-up", body: "Use a workflow template, test it safely, then publish it to run on real triggers.", href: "/app/marketing/templates", cta: "Browse automation templates" },
    { key: "brand", module: "Creative Studio", title: "Set up your brand kit", body: "Add colors, fonts and logos so creative work stays on brand.", href: "/app/creative-studio/brand-kit", cta: "Open Brand Kit" },
    { key: "team", module: "Workspace", title: "Invite your team", body: "Add members and give each the role they need.", href: "/app/settings/users", cta: "Open Team" },
  ];
  if (!workspaceId) return base.map((g) => ({ ...g, done: null }));
  try {
    const w = workspaceId;
    const [integrations, contacts, deals, forms, pages, workflows, brand, members] = await Promise.all([
      db.integration.count({ where: { workspaceId: w, status: "connected" } }),
      db.contact.count({ where: { workspaceId: w } }),
      db.deal.count({ where: { workspaceId: w } }),
      db.form.count({ where: { workspaceId: w } }),
      db.landingPage.count({ where: { workspaceId: w, isPublished: true } }),
      db.workflow.count({ where: { workspaceId: w, status: "active" } }),
      db.brandKit.count({ where: { workspaceId: w } }),
      db.membership.count({ where: { workspaceId: w } }),
    ]);
    const done: Record<string, boolean> = { integrations: integrations > 0, contacts: contacts > 0, pipeline: deals > 0, form: forms > 0, page: pages > 0, workflow: workflows > 0, brand: brand > 0, team: members > 1 };
    return base.map((g) => ({ ...g, done: done[g.key] }));
  } catch {
    return base.map((g) => ({ ...g, done: null }));
  }
}
