import type { Metadata } from "next";
import Link from "next/link";
import { DataTable, Pill, ScreenHeader, kitOutline } from "@/components/amplivanta/screen-kit";
import { WEBHOOK_EVENTS } from "@/lib/webhook-delivery";

export const metadata: Metadata = { title: "API Documentation" };

/**
 * Developer guidance for the endpoints that accept workspace API keys. Every
 * row here is a real route in app/api; keep it in step when routes change.
 */
const ENDPOINTS: [method: string, path: string, scope: "read" | "write", purpose: string][] = [
  ["GET", "/api/contacts", "read", "List contacts. Query: q, page, limit (max 100)."],
  ["POST", "/api/contacts", "write", "Create a contact: email, firstName, lastName, phone, jobTitle, status, companyId, leadScore."],
  ["GET · PATCH · DELETE", "/api/contacts/{id}", "write", "Read, update or delete one contact (PATCH and DELETE need write)."],
  ["GET", "/api/companies", "read", "List companies."],
  ["POST", "/api/companies", "write", "Create a company."],
  ["GET · PATCH · DELETE", "/api/companies/{id}", "write", "Read, update or delete one company."],
  ["GET", "/api/deals", "read", "List deals."],
  ["POST", "/api/deals", "write", "Create a deal."],
  ["GET · PATCH · DELETE", "/api/deals/{id}", "write", "Read, update or delete one deal."],
  ["GET · POST", "/api/tasks", "write", "List or create CRM tasks."],
  ["GET · POST", "/api/campaigns", "write", "List or create campaigns."],
  ["GET · POST", "/api/workflows", "write", "List or create workflows."],
  ["GET · POST", "/api/social-posts", "write", "List or create social post drafts."],
  ["GET", "/api/analytics-events", "read", "Custom event definitions and daily totals."],
  ["POST", "/api/analytics-events", "write", "Record a custom event { name, properties }. Workflows triggered by the event run."],
  ["GET", "/api/notifications", "read", "Notifications visible to the workspace owner the key acts as."],
  ["GET", "/api/data-transfer/export?entity=contacts&format=csv", "write", "Export contacts, companies, deals or campaign_metrics as CSV or JSON."],
  ["POST", "/api/data-transfer/import", "write", "Multipart import: file (CSV), entity, mapping (JSON array), duplicates (skip | update)."],
];

const CURL = `curl https://amplivanta.com/api/contacts?limit=25 \\
  -H "Authorization: Bearer amp_your_key_here"`;

const VERIFY = `import { createHmac, timingSafeEqual } from "node:crypto";

function isValid(rawBody, signatureHeader, signingSecret) {
  const expected = "sha256=" + createHmac("sha256", signingSecret).update(rawBody).digest("hex");
  const a = Buffer.from(expected), b = Buffer.from(signatureHeader ?? "");
  return a.length === b.length && timingSafeEqual(a, b);
}`;

const code = "overflow-x-auto rounded-lg bg-[#071F45] p-4 font-mono text-[12.5px] leading-relaxed text-white";

export default function ApiDocsPage() {
  return (
    <div className="mx-auto max-w-[1400px]">
      <ScreenHeader
        crumbs={[["Integrations", "/app/integrations"], ["Developer & API"], ["Documentation"]]}
        title="API Documentation"
        subtitle="Authenticate with a workspace API key, call the REST endpoints, and verify webhook deliveries."
        actions={<Link href="/app/integrations/api-keys" className={kitOutline}>Manage API Keys</Link>}
      />
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <section className="rounded-xl border border-line bg-white p-5">
          <h2 className="text-[16.5px] font-semibold text-deep-navy">Authentication</h2>
          <ul className="mt-2 list-disc space-y-1.5 pl-5 text-[13px] text-ink-soft">
            <li>Send the key as <code className="rounded bg-bg-soft px-1">Authorization: Bearer amp_…</code>. Keys are shown once when created and stored only as a hash.</li>
            <li>Every key can read. Keys with the <strong>write</strong> scope can also create, update and delete; admin-only actions are never available to keys.</li>
            <li>Requests act inside the key&apos;s workspace only and are attributed to the workspace owner.</li>
            <li>Rate limits apply per route; a <code className="rounded bg-bg-soft px-1">429</code> response includes <code className="rounded bg-bg-soft px-1">Retry-After</code>.</li>
            <li>Errors return JSON <code className="rounded bg-bg-soft px-1">{"{ \"error\": \"…\" }"}</code> with the HTTP status.</li>
          </ul>
          <pre className={`${code} mt-4`}>{CURL}</pre>
        </section>
        <section className="rounded-xl border border-line bg-white p-5">
          <h2 className="text-[16.5px] font-semibold text-deep-navy">Webhooks</h2>
          <p className="mt-2 text-[13px] text-ink-soft">
            Endpoints must be public <strong>https</strong> URLs. Each delivery is a POST with headers <code className="rounded bg-bg-soft px-1">x-amplivanta-event</code> and <code className="rounded bg-bg-soft px-1">x-amplivanta-signature</code> (HMAC-SHA256 of the raw body with the endpoint&apos;s signing secret). Failed deliveries are retried up to three times and logged.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">{WEBHOOK_EVENTS.map((e) => <Pill key={e} tone="blue">{e}</Pill>)}</div>
          <pre className={`${code} mt-4`}>{VERIFY}</pre>
          <Link href="/app/integrations/webhooks" className="mt-3 inline-block text-[13px] font-semibold text-[#0B5CFF]">Manage webhook endpoints</Link>
        </section>
      </div>
      <section className="mt-6 rounded-xl border border-line bg-white p-5">
        <h2 className="mb-3 text-[16.5px] font-semibold text-deep-navy">Endpoints</h2>
        <DataTable
          minWidth={820}
          columns={["Method", "Path", "Key scope", "Purpose"]}
          rows={ENDPOINTS.map(([m, p, s, d]) => [<code key="m" className="text-[12px]">{m}</code>, <code key="p" className="break-all text-[12px]">{p}</code>, <Pill key="s" tone={s === "write" ? "amber" : "green"}>{s}</Pill>, d])}
        />
      </section>
    </div>
  );
}
