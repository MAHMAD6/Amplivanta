/**
 * Content operations types and validation. Pure, so the publishing lifecycle
 * and per-type field rules are testable and identical on every screen.
 *
 * One lifecycle serves every content type: DRAFT → IN_REVIEW → SCHEDULED →
 * PUBLISHED → ARCHIVED.
 */

export const CONTENT_TYPES = [
  { value: "blog_post", label: "Blog Post", plural: "Blog Posts", href: "/admin/content-management/blog-posts", editor: "content" },
  { value: "article", label: "Resource / Article", plural: "Resources & Articles", href: "/admin/content-management/resource-library", editor: "content" },
  { value: "case_study", label: "Case Study", plural: "Case Studies", href: "/admin/content-management/case-studies", editor: "content" },
  { value: "video", label: "Video", plural: "Videos", href: "/admin/content-management/videos", editor: "content" },
  { value: "webinar", label: "Webinar / Event", plural: "Webinars & Events", href: "/admin/content-management/webinars-and-events", editor: "event" },
  { value: "lead_magnet", label: "Lead Magnet", plural: "Lead Magnets & Downloads", href: "/admin/content-management/lead-magnets", editor: "lead_magnet" },
  { value: "template", label: "Template", plural: "Templates", href: "/admin/content-management/templates", editor: "template" },
] as const;

export type ContentType = (typeof CONTENT_TYPES)[number]["value"];
export type EditorKind = (typeof CONTENT_TYPES)[number]["editor"];

export const contentTypeMeta = (t: string) => CONTENT_TYPES.find((c) => c.value === t) ?? null;

export const CONTENT_STATUSES = ["DRAFT", "IN_REVIEW", "SCHEDULED", "PUBLISHED", "ARCHIVED"] as const;
export type ContentStatus = (typeof CONTENT_STATUSES)[number];

export const VISIBILITIES: [value: string, label: string][] = [
  ["public", "Public"],
  ["members", "Signed-in members"],
  ["private", "Private (admins only)"],
];

export const EVENT_TYPES: [string, string][] = [
  ["webinar", "Webinar"],
  ["workshop", "Workshop"],
  ["conference", "Conference"],
  ["meetup", "Meetup"],
  ["office_hours", "Office hours"],
];

export const EVENT_FORMATS: [string, string][] = [
  ["online", "Online (webinar)"],
  ["in_person", "In person"],
  ["hybrid", "Hybrid"],
];

export const RECURRENCES: [string, string][] = [
  ["none", "Does not repeat"],
  ["weekly", "Weekly"],
  ["monthly", "Monthly"],
];

export const ACCESS_MODES: [string, string, string][] = [
  ["FORM_REQUIRED", "Form required", "Users must complete the selected form to download."],
  ["DIRECT_DOWNLOAD", "Direct download", "Allow download without a form."],
];

export const TEMPLATE_TYPES: [string, string][] = [
  ["social_post", "Social post"],
  ["email", "Email"],
  ["presentation", "Presentation"],
  ["document", "Document"],
  ["ad_creative", "Ad creative"],
  ["landing_page", "Landing page"],
];

/** Which transitions the lifecycle allows. */
export const ALLOWED_TRANSITIONS: Record<ContentStatus, ContentStatus[]> = {
  DRAFT: ["IN_REVIEW", "SCHEDULED", "PUBLISHED", "ARCHIVED"],
  IN_REVIEW: ["DRAFT", "SCHEDULED", "PUBLISHED", "ARCHIVED"],
  SCHEDULED: ["DRAFT", "PUBLISHED", "ARCHIVED"],
  PUBLISHED: ["DRAFT", "ARCHIVED"],
  ARCHIVED: ["DRAFT"],
};

export function canTransition(from: string, to: string): boolean {
  const list = ALLOWED_TRANSITIONS[from as ContentStatus];
  return Boolean(list && list.includes(to as ContentStatus));
}

export function slugify(input: string): string {
  return input
    .toLowerCase()
    // Characters that do not decompose need an explicit Latin spelling.
    .replace(/ß/g, "ss")
    .replace(/æ/g, "ae")
    .replace(/ø/g, "o")
    .replace(/đ/g, "d")
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export type ContentInput = {
  contentType: string;
  title: string;
  slug: string;
  excerpt?: string | null;
  body?: string | null;
  status: string;
  visibility: string;
  authorName?: string | null;
  categories: string[];
  tags: string[];
  seoTitle?: string | null;
  seoDescription?: string | null;
  scheduledAt?: Date | null;
  data: Record<string, unknown>;
};

/**
 * Validates a content item for the status it is moving to. Publishing has
 * stricter requirements than saving a draft, so unfinished work is never
 * published by accident.
 */
export function validateContent(input: ContentInput): string | null {
  if (!contentTypeMeta(input.contentType)) return "Choose a content type.";
  if (!input.title.trim()) return "Enter a title.";
  if (!input.slug || !/^[a-z0-9-]+$/.test(input.slug)) return "The slug can only contain lowercase letters, numbers and hyphens.";
  if (!CONTENT_STATUSES.includes(input.status as ContentStatus)) return "Choose a valid status.";
  if (!VISIBILITIES.some(([v]) => v === input.visibility)) return "Choose a visibility.";
  if (input.status === "SCHEDULED") {
    if (!input.scheduledAt) return "Choose when this should publish.";
    if (input.scheduledAt.getTime() < Date.now() - 60000) return "Schedule a time in the future.";
  }

  const publishing = input.status === "PUBLISHED" || input.status === "SCHEDULED";
  const d = input.data ?? {};

  if (input.contentType === "webinar") {
    if (!d.eventType) return "Choose an event type.";
    if (!EVENT_FORMATS.some(([v]) => v === d.format)) return "Choose an event format.";
    if (publishing && !d.startAt) return "Enter the event date and start time before publishing.";
    if (d.startAt && d.endAt && new Date(String(d.endAt)) <= new Date(String(d.startAt))) return "The end time must be after the start time.";
    if (d.registrationEnabled && !d.registrationUrl) return "Add the registration link, or turn registration off.";
    if (d.registrationUrl && !/^https?:\/\/\S+$/i.test(String(d.registrationUrl))) return "The registration link must start with http:// or https://.";
  }

  if (input.contentType === "lead_magnet") {
    if (!ACCESS_MODES.some(([v]) => v === d.accessMode)) return "Choose how the download is accessed.";
    if (d.accessMode === "FORM_REQUIRED" && publishing && !d.formId) return "Select the lead capture form, or switch to direct download.";
    if (publishing && !d.fileMediaId) return "Upload the downloadable file before publishing.";
  }

  if (input.contentType === "template") {
    if (!TEMPLATE_TYPES.some(([v]) => v === d.templateType)) return "Choose a template type.";
    if (publishing && !d.creativeStudioRef) return "Link the Creative Studio template before publishing.";
  }

  if (input.contentType === "video" && publishing && !d.videoUrl) return "Add the video URL before publishing.";

  if (publishing && !input.excerpt?.trim() && input.contentType !== "template") return "Add a short excerpt before publishing.";
  return null;
}

/** Fields that belong to each editor, used to keep `data` clean. */
export const DATA_FIELDS: Record<string, string[]> = {
  webinar: ["eventType", "format", "startAt", "endAt", "timezone", "recurrence", "registrationEnabled", "registrationUrl", "speakers", "location"],
  lead_magnet: ["accessMode", "fileMediaId", "formId", "landingPageId", "ctaText"],
  template: ["templateType", "dimensions", "creativeStudioRef", "featured", "allowTeamUse", "supportedFormats", "instructions", "thumbnailMediaId"],
  video: ["videoUrl", "durationLabel"],
};

export const STATUS_LABEL: Record<string, string> = {
  DRAFT: "Draft",
  IN_REVIEW: "In review",
  SCHEDULED: "Scheduled",
  PUBLISHED: "Published",
  ARCHIVED: "Archived",
};
