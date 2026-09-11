/**
 * Published Resources items for videos, webinars, templates and Help Center.
 *
 * These are deliberately empty. The reference is explicit that these sections
 * show only real published records — no sample videos, invented speakers,
 * attendance counts, view numbers or placeholder help articles. Until a record
 * is added here (or a CMS replaces this module), each section renders its
 * neutral state and every detail URL returns 404.
 *
 * lib/resources-data.ts holds fixtures for the signed-in app; it must not be
 * used for the public site.
 */

export type VideoItem = {
  slug: string;
  title: string;
  summary: string;
  topic: string;
  /** Embeddable player URL. The page shows no player without one. */
  embedUrl: string;
  durationLabel?: string;
  publishedLabel?: string;
  chapters?: string[];
  transcript?: string;
};

export type WebinarStatus = "upcoming" | "registration-open" | "registration-closed" | "completed" | "replay";

export type WebinarItem = {
  slug: string;
  title: string;
  summary: string;
  status: WebinarStatus;
  scheduleLabel?: string;
  format?: string;
  speakers?: string[];
  agenda?: string[];
  /** External registration form; only shown while registration is open. */
  registrationUrl?: string;
  replayEmbedUrl?: string;
};

export type TemplateItem = {
  slug: string;
  title: string;
  summary: string;
  format?: string;
  /** In-app destination the template opens in, when supported. */
  moduleHref?: string;
  moduleLabel?: string;
  /** Only when a downloadable file is actually published. */
  downloadUrl?: string;
  instructions?: string[];
};

export type HelpArticle = {
  slug: string;
  title: string;
  summary: string;
  updatedLabel?: string;
  prerequisites?: string[];
  steps: string[];
  troubleshooting?: string[];
};

export const RESOURCE_VIDEOS: VideoItem[] = [];
export const RESOURCE_WEBINARS: WebinarItem[] = [];
export const RESOURCE_TEMPLATES: TemplateItem[] = [];
export const HELP_ARTICLES: HelpArticle[] = [];

/** Listing entries for a Resources section, in a shape the index can render. */
export function resourceListing(section: string): { title: string; summary: string; href: string }[] {
  const map: Record<string, { slug: string; title: string; summary: string }[]> = {
    videos: RESOURCE_VIDEOS,
    webinars: RESOURCE_WEBINARS,
    templates: RESOURCE_TEMPLATES,
    "help-center": HELP_ARTICLES,
  };
  return (map[section] ?? []).map((i) => ({
    title: i.title,
    summary: i.summary,
    href: `/resources/${section}/${i.slug}`,
  }));
}
