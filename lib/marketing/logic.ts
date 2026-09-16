/** Pure Marketing Automation rules: form validation, segments, lead scoring, experiments, readiness. */

/* ---------------------------------- Forms --------------------------------- */

export const FIELD_TYPES: [string, string][] = [["text", "Text"], ["email", "Email"], ["dropdown", "Dropdown"], ["checkbox", "Checkbox"], ["hidden", "Hidden Field"]];
export type FormField = { id: string; type: string; label: string; name: string; required: boolean; options: string; value: string };

export function parseFields(input: unknown): FormField[] {
  if (!Array.isArray(input)) return [];
  const seen = new Set<string>();
  return input.slice(0, 30).flatMap((f, i) => {
    if (!f || typeof f !== "object") return [];
    const o = f as Record<string, unknown>;
    const type = String(o.type);
    if (!FIELD_TYPES.some(([t]) => t === type)) return [];
    let name = String(o.name || o.label || `field_${i}`).toLowerCase().replace(/[^a-z0-9_]+/g, "_").replace(/^_+|_+$/g, "").slice(0, 40) || `field_${i}`;
    while (seen.has(name)) name = `${name}_${i}`;
    seen.add(name);
    return [{ id: String(o.id || `f${i}`).slice(0, 40), type, label: String(o.label ?? "").slice(0, 120), name, required: Boolean(o.required), options: String(o.options ?? "").slice(0, 2000), value: String(o.value ?? "").slice(0, 200) }];
  });
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
export const isEmail = (v: string) => EMAIL_RE.test(v) && v.length <= 254;

/** Validates a public submission against the form definition. Unknown keys are dropped. */
export function validateSubmission(fields: FormField[], data: Record<string, unknown>): { ok: true; values: Record<string, string> } | { ok: false; error: string } {
  const values: Record<string, string> = {};
  for (const f of fields) {
    const raw = data[f.name];
    let v = typeof raw === "string" ? raw.trim().slice(0, 2000) : raw === true ? "yes" : "";
    if (f.type === "hidden") v = f.value;
    if (f.type === "checkbox") v = v && v !== "false" ? "yes" : "";
    if (f.required && !v) return { ok: false, error: `${f.label || f.name} is required.` };
    if (v && f.type === "email" && !isEmail(v)) return { ok: false, error: "Enter a valid email address." };
    if (v && f.type === "dropdown") {
      const opts = f.options.split("\n").map((o) => o.trim()).filter(Boolean);
      if (opts.length && !opts.includes(v)) return { ok: false, error: `Choose a valid option for ${f.label || f.name}.` };
    }
    if (v) values[f.name] = v;
  }
  return { ok: true, values };
}

/* -------------------------------- Segments -------------------------------- */

export const SEGMENT_FIELDS: [string, string][] = [["status", "Status"], ["email", "Email"], ["jobTitle", "Job title"], ["companyName", "Company"], ["leadScore", "Lead score"], ["tags", "Tag"], ["createdWithinDays", "Created within (days)"]];
export const SEGMENT_OPERATORS: [string, string][] = [["equals", "equals"], ["contains", "contains"], ["gte", "is at least"], ["lte", "is at most"]];
export type SegmentRule = { field: string; operator: string; value: string };

export function parseRules(input: unknown): SegmentRule[] {
  if (!Array.isArray(input)) return [];
  return input.slice(0, 10).flatMap((r) => {
    if (!r || typeof r !== "object") return [];
    const o = r as Record<string, unknown>;
    const field = String(o.field);
    const operator = String(o.operator);
    const value = String(o.value ?? "").trim().slice(0, 120);
    if (!SEGMENT_FIELDS.some(([f]) => f === field) || !SEGMENT_OPERATORS.some(([op]) => op === operator) || !value) return [];
    return [{ field, operator, value }];
  });
}

/** Prisma `where` for a dynamic segment's contacts (AND of rules). `now` is injectable for tests. */
export function rulesToWhere(workspaceId: string, rules: SegmentRule[], now = new Date()): Record<string, unknown> {
  const and = rules.flatMap((r): Record<string, unknown>[] => {
    const n = Number(r.value);
    switch (r.field) {
      case "leadScore":
        if (!Number.isFinite(n)) return [];
        return [{ leadScore: r.operator === "lte" ? { lte: n } : r.operator === "equals" ? n : { gte: n } }];
      case "createdWithinDays":
        return Number.isFinite(n) && n > 0 ? [{ createdAt: { gte: new Date(now.getTime() - n * 86400000) } }] : [];
      case "tags":
        return [{ tags: { has: r.value.toLowerCase() } }];
      default:
        return [{ [r.field]: r.operator === "contains" ? { contains: r.value, mode: "insensitive" } : { equals: r.value, mode: "insensitive" } }];
    }
  });
  return { workspaceId, ...(and.length ? { AND: and } : {}) };
}

/* ------------------------------ Lead scoring ------------------------------ */

export const SCORING_SIGNALS: [key: string, label: string, needsValue: boolean][] = [
  ["has_email", "Has an email address", false],
  ["has_phone", "Has a phone number", false],
  ["has_company", "Has a company", false],
  ["job_title_contains", "Job title contains", true],
  ["status_is", "Status is", true],
  ["has_tag", "Has tag", true],
  ["form_submissions", "Submitted a form (per submission, max 5)", false],
  ["open_deals", "Has an open deal", false],
  ["email_opened", "Opened a marketing email", false],
  ["email_clicked", "Clicked a marketing email", false],
];

export type ScoreFacts = { email?: string | null; phone?: string | null; companyName?: string | null; companyId?: string | null; jobTitle?: string | null; status?: string | null; tags?: string[]; submissions: number; openDeals: number; opened: boolean; clicked: boolean };
export type Rule = { signal: string; value: string | null; points: number; active: boolean };

export function scoreContact(f: ScoreFacts, rules: Rule[]): number {
  let score = 0;
  for (const r of rules) {
    if (!r.active) continue;
    const v = (r.value ?? "").toLowerCase();
    const hit = (() => {
      switch (r.signal) {
        case "has_email": return Boolean(f.email);
        case "has_phone": return Boolean(f.phone);
        case "has_company": return Boolean(f.companyName || f.companyId);
        case "job_title_contains": return Boolean(v && f.jobTitle?.toLowerCase().includes(v));
        case "status_is": return Boolean(v && f.status?.toLowerCase() === v);
        case "has_tag": return Boolean(v && f.tags?.some((t) => t.toLowerCase() === v));
        case "form_submissions": return Math.min(f.submissions, 5);
        case "open_deals": return f.openDeals > 0;
        case "email_opened": return f.opened;
        case "email_clicked": return f.clicked;
        default: return false;
      }
    })();
    score += typeof hit === "number" ? hit * r.points : hit ? r.points : 0;
  }
  return Math.max(-1000, Math.min(1000, score));
}

/** Highest band whose minimum the score reaches. */
export function bandFor<T extends { minScore: number }>(score: number, bands: T[]): T | null {
  return [...bands].sort((a, b) => b.minScore - a.minScore).find((b) => score >= b.minScore) ?? null;
}

/* ------------------------------- Experiments ------------------------------ */

export type Variant = { key: string; landingPageId: string; weight: number };

export function parseVariants(input: unknown): Variant[] {
  if (!Array.isArray(input)) return [];
  return input.slice(0, 4).flatMap((v, i) => {
    if (!v || typeof v !== "object") return [];
    const o = v as Record<string, unknown>;
    const weight = Math.round(Number(o.weight));
    if (typeof o.landingPageId !== "string" || !o.landingPageId || !Number.isFinite(weight) || weight < 0) return [];
    return [{ key: String.fromCharCode(65 + i), landingPageId: o.landingPageId, weight }];
  });
}

/** Weighted pick; `r` in [0, 1). Falls back to the first variant when weights are all zero. */
export function pickVariant(variants: Variant[], r: number): Variant | null {
  const total = variants.reduce((n, v) => n + v.weight, 0);
  if (!variants.length) return null;
  if (total <= 0) return variants[0];
  let x = r * total;
  for (const v of variants) {
    if (x < v.weight) return v;
    x -= v.weight;
  }
  return variants[variants.length - 1];
}

/** Two-proportion z-test between control and a variant. Confidence is two-sided, 0-100. */
export function significance(a: { visits: number; conversions: number }, b: { visits: number; conversions: number }) {
  if (a.visits === 0 || b.visits === 0) return { lift: null as number | null, confidence: null as number | null };
  const pa = a.conversions / a.visits;
  const pb = b.conversions / b.visits;
  const p = (a.conversions + b.conversions) / (a.visits + b.visits);
  const se = Math.sqrt(p * (1 - p) * (1 / a.visits + 1 / b.visits));
  const lift = pa > 0 ? ((pb - pa) / pa) * 100 : null;
  if (se === 0) return { lift, confidence: null };
  const z = Math.abs(pb - pa) / se;
  return { lift, confidence: Math.round((1 - 2 * (1 - normalCdf(z))) * 1000) / 10 };
}

function normalCdf(z: number) {
  // Abramowitz-Stegun approximation, accurate to ~1e-7.
  const t = 1 / (1 + 0.2316419 * z);
  const d = 0.3989423 * Math.exp((-z * z) / 2);
  return 1 - d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
}

/* ------------------------- Landing page readiness ------------------------- */

export type ReadinessInput = { title: string; slug: string; blocks: number; metaTitle?: string | null; metaDescription?: string | null; formId?: string | null; hasFormBlock: boolean; contentReviewed: boolean; seoReviewed: boolean };

export function readiness(p: ReadinessInput) {
  const items = [
    { key: "content", label: "Content Review", detail: "Review and validate headline, copy, and CTAs.", done: p.blocks > 0 && p.contentReviewed, blocking: p.blocks === 0 },
    { key: "seo", label: "SEO Review", detail: "Verify meta title and description.", done: Boolean(p.metaTitle && p.metaDescription) && p.seoReviewed, blocking: false },
    { key: "form", label: "Form Connection", detail: "Connect a lead capture form to the page's form section.", done: !p.hasFormBlock || Boolean(p.formId), blocking: p.hasFormBlock && !p.formId },
    { key: "url", label: "Page URL", detail: "Set a URL slug for the page.", done: /^[a-z0-9](?:[a-z0-9-]{0,78}[a-z0-9])?$/.test(p.slug), blocking: !/^[a-z0-9](?:[a-z0-9-]{0,78}[a-z0-9])?$/.test(p.slug) },
  ];
  return { items, done: items.filter((i) => i.done).length, canPublish: !items.some((i) => i.blocking) };
}

export const slugify = (v: string) => v.toLowerCase().normalize("NFKD").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 80);
