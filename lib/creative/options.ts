/** Creative Studio option lists, shared by forms and server-side validation. */

export const PROJECT_TYPES: [string, string][] = [["general", "General"], ["graphic", "Graphic"], ["video", "Video"], ["document", "Document"], ["campaign", "Campaign"]];
export const PROJECT_STATUSES: [string, string][] = [["active", "Active"], ["in_review", "In review"], ["completed", "Completed"], ["archived", "Archived"]];

export const GRAPHIC_FORMATS: { value: string; label: string; width: number; height: number }[] = [
  { value: "instagram_post", label: "Instagram post", width: 1080, height: 1080 },
  { value: "instagram_story", label: "Instagram story", width: 1080, height: 1920 },
  { value: "linkedin_post", label: "LinkedIn post", width: 1200, height: 627 },
  { value: "facebook_ad", label: "Facebook ad", width: 1200, height: 628 },
  { value: "display_banner", label: "Display banner", width: 728, height: 90 },
  { value: "presentation", label: "Presentation slide", width: 1920, height: 1080 },
  { value: "custom", label: "Custom size", width: 0, height: 0 },
];
export const GRAPHIC_DESTINATIONS: [string, string][] = [["social", "Social post"], ["ad", "Advertising"], ["email", "Email"], ["web", "Website"], ["print", "Print"]];

export const TEMPLATE_CATEGORIES: [string, string][] = [
  ["social_media", "Social Media"], ["presentations", "Presentations"], ["documents", "Documents"], ["marketing", "Marketing"],
  ["videos", "Videos"], ["ads", "Ads"], ["print", "Print"], ["other", "Other"],
];
export const TEMPLATE_TYPES: [string, string][] = [["document", "Document"], ["graphic", "Graphic"], ["image", "Image"], ["video", "Video"], ["email", "Email"], ["social", "Social"]];
export const TEMPLATE_CHANNELS: [string, string][] = [["instagram", "Instagram"], ["linkedin", "LinkedIn"], ["facebook", "Facebook"], ["email", "Email"], ["web", "Web"], ["print", "Print"]];

export const DOCUMENT_TYPES: [string, string][] = [["blog_post", "Blog post"], ["email", "Email"], ["landing_page", "Landing page copy"], ["social", "Social copy"], ["report", "Report"], ["proposal", "Proposal"], ["other", "Other"]];
export const DOCUMENT_TONES: [string, string][] = [["professional", "Professional"], ["friendly", "Friendly"], ["persuasive", "Persuasive"], ["informative", "Informative"], ["bold", "Bold"]];
export const DOCUMENT_LENGTHS: [string, string][] = [["short", "Short (~300 words)"], ["medium", "Medium (~700 words)"], ["long", "Long (~1,200 words)"]];
export const DOCUMENT_TOOLS: [string, string, string][] = [
  ["summarize", "Summarize", "Summarize the text in a few concise paragraphs."],
  ["translate", "Translate", "Translate the text into the requested language."],
  ["improve", "Improve Writing", "Improve clarity, flow and structure without changing meaning."],
  ["tone", "Change Tone", "Rewrite the text in the requested tone."],
  ["grammar", "Grammar", "Fix spelling, grammar and punctuation only."],
];

export const pick = (v: unknown, list: [string, string][] | { value: string }[], fallback: string) => {
  const s = typeof v === "string" ? v : "";
  const ok = list.some((x) => (Array.isArray(x) ? x[0] : x.value) === s);
  return ok ? s : fallback;
};
export const HEX = /^#[0-9a-f]{6}$/i;
