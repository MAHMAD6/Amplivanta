/** Content blocks for the Email Composer and Landing Page Builder. Stored as JSON; rendered server-side with escaping. */

export type Block = { id: string; type: string; props: Record<string, string> };

export const EMAIL_BLOCKS: [type: string, label: string, props: [key: string, label: string, multiline?: boolean][]][] = [
  ["hero", "Hero", [["heading", "Heading"], ["text", "Text", true], ["imageUrl", "Image URL"]]],
  ["text", "Text", [["text", "Text", true]]],
  ["image", "Image", [["url", "Image URL"], ["alt", "Alt text"]]],
  ["button", "Button", [["label", "Label"], ["url", "Link URL"]]],
  ["divider", "Divider", []],
  ["social", "Social", [["links", "Profile URLs (one per line)", true]]],
  ["footer", "Footer", [["text", "Footer text", true]]],
  ["html", "HTML", [["html", "Custom HTML", true]]],
];

export const PAGE_SECTIONS: [type: string, label: string, props: [key: string, label: string, multiline?: boolean][]][] = [
  ["hero", "Hero", [["heading", "Heading"], ["subheading", "Subheading", true], ["ctaLabel", "Button label"], ["ctaUrl", "Button link"], ["imageUrl", "Image URL"]]],
  ["features", "Features", [["heading", "Heading"], ["items", "Features (one per line)", true]]],
  ["benefits", "Benefits", [["heading", "Heading"], ["items", "Benefits (one per line)", true]]],
  ["testimonials", "Testimonials", [["quote", "Quote", true], ["author", "Author"]]],
  ["pricing", "Pricing", [["heading", "Heading"], ["items", "Plans: name | price | description (one per line)", true]]],
  ["faq", "FAQ", [["heading", "Heading"], ["items", "Question | answer (one per line)", true]]],
  ["cta", "CTA", [["heading", "Heading"], ["ctaLabel", "Button label"], ["ctaUrl", "Button link"]]],
  ["footer", "Footer", [["text", "Footer text"]]],
];

export const PAGE_ELEMENTS: [type: string, label: string, props: [key: string, label: string, multiline?: boolean][]][] = [
  ["text", "Text", [["text", "Text", true]]],
  ["image", "Image", [["url", "Image URL"], ["alt", "Alt text"]]],
  ["button", "Button", [["label", "Label"], ["url", "Link URL"]]],
  ["form", "Lead Form", [["heading", "Heading"]]],
  ["divider", "Divider", []],
];

const KNOWN = (list: typeof EMAIL_BLOCKS) => new Map(list.map(([t, , props]) => [t, props.map(([k]) => k)]));

/** Keeps only known block types and their declared string props. */
export function parseBlocks(input: unknown, kind: "email" | "page"): Block[] {
  const known = kind === "email" ? KNOWN(EMAIL_BLOCKS) : new Map([...KNOWN(PAGE_SECTIONS), ...KNOWN(PAGE_ELEMENTS)]);
  if (!Array.isArray(input)) return [];
  return input.slice(0, 60).flatMap((b, i) => {
    if (!b || typeof b !== "object") return [];
    const o = b as Record<string, unknown>;
    const keys = known.get(String(o.type));
    if (!keys) return [];
    const p = o.props && typeof o.props === "object" ? (o.props as Record<string, unknown>) : {};
    return [{ id: typeof o.id === "string" && o.id ? o.id.slice(0, 40) : `b${i}`, type: String(o.type), props: Object.fromEntries(keys.map((k) => [k, String(p[k] ?? "").slice(0, k === "html" ? 20000 : 4000)])) }];
  });
}

export const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");

/** http(s) or mailto links only; anything else becomes "#". */
export function safeUrl(v: string | undefined): string {
  const s = (v ?? "").trim();
  if (/^(https?:\/\/|mailto:)/i.test(s)) return s;
  if (s.startsWith("#") || (s.startsWith("/") && !s.startsWith("//"))) return s;
  return "#";
}

export const lines = (v: string | undefined) => (v ?? "").split("\n").map((l) => l.trim()).filter(Boolean);

/** Replaces {{firstName}}-style merge tags. Values are escaped because the result is HTML. */
export function mergeTags(html: string, vars: Record<string, string>, escape = true) {
  return html.replace(/\{\{\s*(\w+)\s*\}\}/g, (_, k: string) => {
    const v = vars[k] ?? "";
    return escape ? esc(v) : v;
  });
}

/** Email-safe HTML (tables + inline styles). `footer` carries the unsubscribe link and is always appended. */
export function renderEmailHtml(blocks: Block[], opts: { preheader?: string; footer?: string } = {}): string {
  const td = (inner: string, style = "padding:12px 24px") => `<tr><td style="${style}">${inner}</td></tr>`;
  const para = (t: string) => esc(t).replace(/\n/g, "<br>");
  const body = blocks
    .map((b) => {
      const p = b.props;
      switch (b.type) {
        case "hero":
          return td(`${p.imageUrl ? `<img src="${esc(safeUrl(p.imageUrl))}" alt="" width="552" style="display:block;width:100%;max-width:552px;border-radius:8px;margin-bottom:16px">` : ""}<h1 style="margin:0 0 8px;font-size:26px;color:#0B1B3F">${esc(p.heading ?? "")}</h1><p style="margin:0;font-size:15px;line-height:1.6;color:#44516C">${para(p.text ?? "")}</p>`, "padding:24px");
        case "text":
          return td(`<p style="margin:0;font-size:15px;line-height:1.6;color:#44516C">${para(p.text ?? "")}</p>`);
        case "image":
          return p.url ? td(`<img src="${esc(safeUrl(p.url))}" alt="${esc(p.alt ?? "")}" width="552" style="display:block;width:100%;max-width:552px">`) : "";
        case "button":
          return td(`<a href="${esc(safeUrl(p.url))}" style="display:inline-block;background:#0B5CFF;color:#fff;text-decoration:none;font-weight:600;padding:12px 22px;border-radius:6px">${esc(p.label || "Learn more")}</a>`);
        case "divider":
          return td('<hr style="border:0;border-top:1px solid #E3E8F2;margin:0">');
        case "social":
          return td(lines(p.links).map((u) => `<a href="${esc(safeUrl(u))}" style="color:#0B5CFF;margin-right:12px">${esc(u.replace(/^https?:\/\/(www\.)?/, "").split("/")[0])}</a>`).join(""));
        case "footer":
          return td(`<p style="margin:0;font-size:12px;color:#8A94A8">${para(p.text ?? "")}</p>`);
        case "html":
          return td(p.html ?? "");
        default:
          return "";
      }
    })
    .join("");
  const pre = opts.preheader ? `<div style="display:none;max-height:0;overflow:hidden">${esc(opts.preheader)}</div>` : "";
  const foot = opts.footer ? td(`<p style="margin:0;font-size:12px;color:#8A94A8">${opts.footer}</p>`, "padding:16px 24px 24px") : "";
  return `<!doctype html><html><body style="margin:0;background:#F4F6FB;font-family:Arial,Helvetica,sans-serif">${pre}<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:24px 12px"><table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#fff;border-radius:10px">${body}${foot}</table></td></tr></table></body></html>`;
}

export type LandingTemplate = { key: string; name: string; description: string; category: string; layout: string; use: string; blocks: Omit<Block, "id">[] };

const sec = (type: string, props: Record<string, string>) => ({ type, props });

export const LANDING_TEMPLATES: LandingTemplate[] = [
  { key: "lead-capture", name: "Lead Capture", description: "Collect leads with a focused form and value proposition.", category: "lead_gen", layout: "Single column with form", use: "Gated content, consultations, newsletter sign-ups", blocks: [sec("hero", { heading: "Get the guide", subheading: "Practical steps you can use this week.", ctaLabel: "Get it free", ctaUrl: "#form" }), sec("benefits", { heading: "What you'll learn", items: "The framework\nCommon mistakes\nA checklist to start" }), sec("form", { heading: "Send me the guide" }), sec("footer", { text: "" })] },
  { key: "webinar-registration", name: "Webinar Registration", description: "Drive registrations with event details and a signup form.", category: "events", layout: "Hero, agenda and form", use: "Webinars, workshops, live demos", blocks: [sec("hero", { heading: "Live webinar", subheading: "Date, time and what we'll cover.", ctaLabel: "Save my seat", ctaUrl: "#form" }), sec("features", { heading: "Agenda", items: "Introduction\nLive walkthrough\nQ&A" }), sec("form", { heading: "Register" }), sec("footer", { text: "" })] },
  { key: "product-announcement", name: "Product Announcement", description: "Announce new product features and benefits.", category: "product", layout: "Hero, features and CTA", use: "Launches, feature releases, updates", blocks: [sec("hero", { heading: "Introducing something new", subheading: "What it is and why it matters.", ctaLabel: "Learn more", ctaUrl: "#features" }), sec("features", { heading: "Highlights", items: "Feature one\nFeature two\nFeature three" }), sec("cta", { heading: "Ready to try it?", ctaLabel: "Get started", ctaUrl: "#" }), sec("footer", { text: "" })] },
  { key: "waitlist", name: "Waitlist", description: "Build anticipation and capture early interest.", category: "lead_gen", layout: "Hero with short form", use: "Pre-launch, beta programs", blocks: [sec("hero", { heading: "Be first in line", subheading: "Join the waitlist for early access.", ctaLabel: "", ctaUrl: "" }), sec("form", { heading: "Join the waitlist" }), sec("faq", { heading: "Questions", items: "When does it launch? | We'll email you as soon as it's ready." }), sec("footer", { text: "" })] },
  { key: "thank-you", name: "Thank You Page", description: "Thank visitors and provide next steps.", category: "thank_you", layout: "Confirmation with next steps", use: "After form submissions and purchases", blocks: [sec("hero", { heading: "Thank you!", subheading: "We've received your details. Here's what happens next.", ctaLabel: "Back to site", ctaUrl: "/" }), sec("benefits", { heading: "Next steps", items: "Check your inbox\nAdd us to your contacts" }), sec("footer", { text: "" })] },
  { key: "event-signup", name: "Event Signup", description: "Promote your event and collect attendee details.", category: "events", layout: "Hero, details, testimonials and form", use: "In-person events, meetups, conferences", blocks: [sec("hero", { heading: "Join us in person", subheading: "Location, date and who should attend.", ctaLabel: "Reserve a spot", ctaUrl: "#form" }), sec("testimonials", { quote: "", author: "" }), sec("form", { heading: "Reserve your spot" }), sec("footer", { text: "" })] },
  { key: "blank", name: "Blank", description: "Start from an empty canvas.", category: "blank", layout: "Empty", use: "Anything", blocks: [] },
];
export const LANDING_TEMPLATE_CATEGORIES: [string, string][] = [["lead_gen", "Lead Gen"], ["events", "Events"], ["product", "Product"], ["thank_you", "Thank You"], ["blank", "Blank"]];
