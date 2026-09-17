/**
 * Pure import/export logic for the Import / Export center: CSV parsing,
 * header mapping and row validation. Database writes live in the server
 * actions so this stays testable.
 */

export const IMPORT_LIMITS = { bytes: 5 * 1024 * 1024, rows: 10000, storedErrors: 50 };

export type ImportEntity = "contacts" | "companies" | "deals";

export type FieldDef = { key: string; label: string; required?: boolean; aliases: string[]; kind?: "email" | "number" | "date" | "tags" | "url" | "status" };

export const IMPORT_FIELDS: Record<ImportEntity, FieldDef[]> = {
  contacts: [
    { key: "email", label: "Email", kind: "email", aliases: ["email", "email address", "e-mail", "work email"] },
    { key: "firstName", label: "First name", aliases: ["first name", "firstname", "given name"] },
    { key: "lastName", label: "Last name", aliases: ["last name", "lastname", "surname", "family name"] },
    { key: "name", label: "Full name", aliases: ["name", "full name", "contact name"] },
    { key: "phone", label: "Phone", aliases: ["phone", "phone number", "mobile", "telephone"] },
    { key: "jobTitle", label: "Job title", aliases: ["job title", "title", "position", "role"] },
    { key: "companyName", label: "Company", aliases: ["company", "company name", "organization", "organisation", "account"] },
    { key: "status", label: "Status", kind: "status", aliases: ["status", "lifecycle stage", "lead status"] },
    { key: "tags", label: "Tags", kind: "tags", aliases: ["tags", "labels", "lists"] },
  ],
  companies: [
    { key: "name", label: "Name", required: true, aliases: ["name", "company", "company name", "account name", "organization"] },
    { key: "domain", label: "Domain", aliases: ["domain", "company domain", "email domain"] },
    { key: "website", label: "Website", kind: "url", aliases: ["website", "url", "web site", "homepage"] },
    { key: "industry", label: "Industry", aliases: ["industry", "sector", "vertical"] },
    { key: "size", label: "Size", aliases: ["size", "company size", "employees", "headcount"] },
    { key: "location", label: "Location", aliases: ["location", "city", "country", "address", "hq"] },
  ],
  deals: [
    { key: "name", label: "Deal name", required: true, aliases: ["name", "deal", "deal name", "opportunity", "opportunity name"] },
    { key: "value", label: "Value", kind: "number", aliases: ["value", "amount", "deal value", "revenue"] },
    { key: "currency", label: "Currency", aliases: ["currency", "currency code"] },
    { key: "stage", label: "Stage", aliases: ["stage", "deal stage", "pipeline stage"] },
    { key: "status", label: "Status", aliases: ["status", "deal status", "outcome"] },
    { key: "closeDate", label: "Close date", kind: "date", aliases: ["close date", "expected close", "closing date", "close"] },
    { key: "contactEmail", label: "Contact email", kind: "email", aliases: ["contact email", "email", "contact"] },
    { key: "companyName", label: "Company", aliases: ["company", "company name", "account"] },
  ],
};

export const CONTACT_STATUSES = ["new", "qualified", "engaged", "customer"];
export const DEAL_STATUSES = ["open", "won", "lost"];

/** RFC 4180 parser: quoted fields, embedded commas, quotes and newlines, CRLF, BOM. */
export function parseCsv(text: string): string[][] {
  const src = text.charCodeAt(0) === 0xfeff ? text.slice(1) : text;
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let quoted = false;
  for (let i = 0; i < src.length; i++) {
    const ch = src[i];
    if (quoted) {
      if (ch === '"') {
        if (src[i + 1] === '"') {
          cell += '"';
          i++;
        } else quoted = false;
      } else cell += ch;
    } else if (ch === '"' && cell === "") quoted = true;
    else if (ch === ",") {
      row.push(cell);
      cell = "";
    } else if (ch === "\n" || ch === "\r") {
      if (ch === "\r" && src[i + 1] === "\n") i++;
      row.push(cell);
      rows.push(row);
      row = [];
      cell = "";
    } else cell += ch;
  }
  if (cell !== "" || row.length) {
    row.push(cell);
    rows.push(row);
  }
  return rows.filter((r) => r.some((c) => c.trim() !== ""));
}

const norm = (s: string) => s.toLowerCase().replace(/[_\-.]+/g, " ").replace(/\s+/g, " ").trim();

/** Suggests a field for each header; each field is used at most once. */
export function suggestMapping(entity: ImportEntity, headers: string[]): (string | null)[] {
  const used = new Set<string>();
  return headers.map((h) => {
    const n = norm(h);
    const f = IMPORT_FIELDS[entity].find((d) => !used.has(d.key) && (norm(d.key) === n || norm(d.label) === n || d.aliases.some((a) => norm(a) === n)));
    if (!f) return null;
    used.add(f.key);
    return f.key;
  });
}

export type RowResult = { ok: true; data: Record<string, string | number | string[] | Date | null> } | { ok: false; message: string };

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** Validates and normalises one row against the mapping (column index → field key). */
export function validateRow(entity: ImportEntity, cells: string[], mapping: (string | null)[]): RowResult {
  const data: Record<string, string | number | string[] | Date | null> = {};
  for (const [i, key] of mapping.entries()) {
    if (!key) continue;
    const def = IMPORT_FIELDS[entity].find((f) => f.key === key);
    if (!def) continue;
    const raw = (cells[i] ?? "").trim().slice(0, 500);
    if (!raw) continue;
    switch (def.kind) {
      case "email":
        if (!EMAIL.test(raw)) return { ok: false, message: `${def.label} "${raw.slice(0, 60)}" is not a valid email` };
        data[key] = raw.toLowerCase();
        break;
      case "number": {
        const n = Number(raw.replace(/[$€£,\s]/g, ""));
        if (!Number.isFinite(n) || n < 0) return { ok: false, message: `${def.label} "${raw.slice(0, 30)}" is not a number` };
        data[key] = n;
        break;
      }
      case "date": {
        const d = new Date(raw);
        if (Number.isNaN(d.getTime())) return { ok: false, message: `${def.label} "${raw.slice(0, 30)}" is not a date` };
        data[key] = d;
        break;
      }
      case "tags":
        data[key] = [...new Set(raw.split(/[;,|]/).map((t) => t.trim()).filter(Boolean))].slice(0, 20);
        break;
      case "url":
        data[key] = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
        break;
      case "status": {
        const v = raw.toLowerCase();
        if (!CONTACT_STATUSES.includes(v)) return { ok: false, message: `Status "${raw.slice(0, 30)}" must be one of ${CONTACT_STATUSES.join(", ")}` };
        data[key] = v;
        break;
      }
      default:
        data[key] = raw;
    }
  }
  if (entity === "contacts") {
    if (!data.email && !data.name && !data.firstName && !data.lastName) return { ok: false, message: "A contact needs an email or a name" };
    if (!data.name && (data.firstName || data.lastName)) data.name = [data.firstName, data.lastName].filter(Boolean).join(" ");
  }
  if (entity === "companies") {
    if (!data.name) return { ok: false, message: "Name is required" };
    if (data.domain) data.domain = String(data.domain).toLowerCase().replace(/^https?:\/\//, "").replace(/^www\./, "").replace(/\/.*$/, "");
  }
  if (entity === "deals") {
    if (!data.name) return { ok: false, message: "Deal name is required" };
    if (data.currency && !/^[A-Za-z]{3}$/.test(String(data.currency))) return { ok: false, message: `Currency "${String(data.currency).slice(0, 10)}" must be a three-letter code` };
    if (data.currency) data.currency = String(data.currency).toUpperCase();
    if (data.status) {
      const s = String(data.status).toLowerCase();
      if (!DEAL_STATUSES.includes(s)) return { ok: false, message: `Status "${String(data.status).slice(0, 20)}" must be open, won or lost` };
      data.status = s;
    }
  }
  return { ok: true, data };
}

/** Mapping must be one entry per header, known keys only, no duplicates, and cover required fields. */
export function checkMapping(entity: ImportEntity, headers: string[], mapping: (string | null)[]): string | null {
  if (mapping.length !== headers.length) return "The column mapping does not match the file.";
  const keys = mapping.filter((m): m is string => Boolean(m));
  const known = new Set(IMPORT_FIELDS[entity].map((f) => f.key));
  if (keys.some((k) => !known.has(k))) return "The mapping has an unknown field.";
  if (new Set(keys).size !== keys.length) return "Each field can be mapped from one column only.";
  const missing = IMPORT_FIELDS[entity].filter((f) => f.required && !keys.includes(f.key));
  if (missing.length) return `Map a column to ${missing.map((f) => f.label).join(", ")}.`;
  if (entity === "contacts" && !["email", "name", "firstName", "lastName"].some((k) => keys.includes(k))) return "Map a column to Email or a name field.";
  if (!keys.length) return "Map at least one column.";
  return null;
}

/** RFC 4180 CSV cell. Leading formula characters are neutralised for spreadsheet safety. */
export function csvCell(v: unknown): string {
  let s = v == null ? "" : v instanceof Date ? v.toISOString() : Array.isArray(v) ? v.join("; ") : String(v);
  if (typeof v !== "number" && /^[=+\-@\t\r]/.test(s)) s = `'${s}`;
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export function toCsv(header: string[], rows: unknown[][]): string {
  return [header, ...rows].map((r) => r.map(csvCell).join(",")).join("\r\n") + "\r\n";
}
