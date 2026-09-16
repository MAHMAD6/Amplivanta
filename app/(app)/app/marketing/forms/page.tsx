import type { Metadata } from "next";
import Link from "next/link";
import { FileText } from "lucide-react";
import { db } from "@/lib/db";
import { EmptyState, Panel, Pill, ScreenHeader, TabBar, fmtDateTime } from "@/components/amplivanta/screen-kit";
import { headerOutline, headerPrimary } from "@/components/amplivanta/growth-kit";
import { ActButton } from "@/components/amplivanta/growth-ui";
import { FormDialog } from "@/components/amplivanta/creative-ui";
import { CopyField, FormBuilder } from "@/components/amplivanta/marketing-builders";
import { createForm, deleteForm, duplicateForm, saveForm, setFormStatus } from "@/app/(app)/app/marketing/actions";
import { marketingContext, pct } from "@/lib/server/marketing-screens";
import { appUrl } from "@/lib/marketing/tokens";
import { parseFields } from "@/lib/marketing/logic";
import { FORM_STATUSES, label } from "@/lib/marketing/options";

export const metadata: Metadata = { title: "Lead Capture Forms" };
export const dynamic = "force-dynamic";

const TABS = [["design", "Design"], ["settings", "Settings"], ["integrations", "Integrations"], ["compliance", "Compliance"], ["share", "Share & Embed"], ["analytics", "Analytics"]] as const;

export default async function LeadCaptureFormsPage({ searchParams }: { searchParams: Promise<{ id?: string; tab?: string; range?: string }> }) {
  const sp = await searchParams;
  const c = await marketingContext();
  const canEdit = Boolean(c?.canEdit);
  let forms: { id: string; name: string; status: string }[] = [];
  let workflows: [string, string][] = [];
  let form: Awaited<ReturnType<typeof db.form.findFirst>> = null;
  let subs = { total: 0, recent: [] as { id: string; createdAt: Date; source: string | null; data: unknown }[] };
  if (c) {
    try {
      const w = c.workspaceId;
      [forms, workflows] = await Promise.all([
        db.form.findMany({ where: { workspaceId: w }, orderBy: { updatedAt: "desc" }, take: 200, select: { id: true, name: true, status: true } }),
        db.workflow.findMany({ where: { workspaceId: w }, select: { id: true, name: true, status: true } }).then((r) => r.map((f): [string, string] => [f.id, `${f.name}${f.status === "active" ? "" : ` (${f.status})`}`])),
      ]);
      const id = sp.id ?? forms[0]?.id;
      if (id) {
        form = await db.form.findFirst({ where: { id, workspaceId: w } });
        if (form) {
          const range = sp.range === "30" ? { createdAt: { gte: new Date(Date.now() - 30 * 86400000) } } : {};
          const [total, recent] = await Promise.all([
            db.formSubmission.count({ where: { formId: form.id, ...range } }),
            db.formSubmission.findMany({ where: { formId: form.id }, orderBy: { createdAt: "desc" }, take: 10, select: { id: true, createdAt: true, source: true, data: true } }),
          ]);
          subs = { total, recent };
        }
      }
    } catch {
      form = null;
    }
  }
  const tab = (TABS.find(([k]) => k === sp.tab)?.[0] ?? "design") as (typeof TABS)[number][0];
  const create = (cls: string, text = "+ Create Form") => <FormDialog title="Create Form" label={text} className={cls} action={createForm} disabled={!canEdit} goTo="/app/marketing/forms?id=" submitLabel="Create form" note="New forms start with name and email fields, as a draft." fields={[{ name: "name", label: "Form name", kind: "text", required: true }]} />;
  const hosted = form ? `${appUrl()}/f/${form.id}` : "";

  return (
    <div className="mx-auto max-w-[1600px]">
      <ScreenHeader
        crumbs={[["Home", "/app"], ["Marketing Automation", "/app/marketing"], ["Lead Capture Forms"]]}
        title="Lead Capture Forms"
        actions={<>{form && <Link href={`?id=${form.id}&tab=share`} className={headerOutline}>Share & Embed</Link>}{create(headerPrimary)}<Link href="/app/marketing/form-analytics" className={headerOutline}>Form Analytics</Link></>}
      />
      {forms.length > 0 && (
        <form method="get" className="mb-4 flex flex-wrap items-center gap-2 rounded-xl border border-line bg-white p-2">
          <label htmlFor="fm" className="px-2 text-[12.5px] font-semibold text-deep-navy">Form</label>
          <select id="fm" name="id" defaultValue={form?.id} className="h-9 min-w-[240px] rounded-md border border-line bg-white px-2.5 text-[12.5px]">
            {forms.map((f) => <option key={f.id} value={f.id}>{f.name} · {label(FORM_STATUSES, f.status)}</option>)}
          </select>
          <button className="h-9 rounded-md border border-line px-4 text-[12.5px] font-semibold">Open</button>
          {form && (
            <span className="ml-auto flex flex-wrap items-center gap-2">
              <Pill tone={form.status === "active" ? "green" : form.status === "archived" ? "gray" : "amber"}>{label(FORM_STATUSES, form.status)}</Pill>
              {canEdit && form.status !== "active" && <ActButton action={setFormStatus.bind(null, form.id, "active")}>Activate</ActButton>}
              {canEdit && form.status === "active" && <ActButton action={setFormStatus.bind(null, form.id, "draft")}>Unpublish</ActButton>}
              {canEdit && form.status !== "archived" && <ActButton action={setFormStatus.bind(null, form.id, "archived")}>Archive</ActButton>}
              {canEdit && <ActButton action={duplicateForm.bind(null, form.id)} goTo="/app/marketing/forms?id=">Duplicate</ActButton>}
              {canEdit && <ActButton action={deleteForm.bind(null, form.id)} confirm="Delete this form and its submissions?">Delete</ActButton>}
            </span>
          )}
        </form>
      )}
      {!form ? (
        <Panel><EmptyState icon={FileText} title="Start building your form" body="Create a lead capture form, add fields, connect a workflow and embed it anywhere." action={create(headerPrimary, "Create Form")} /></Panel>
      ) : (
        <>
          <div className="mb-4"><TabBar active={TABS.find(([k]) => k === tab)![1]} tabs={TABS.map(([k, l]) => [l, `?id=${form!.id}&tab=${k}`])} /></div>
          {tab === "share" ? (
            <Panel title="Share & Embed" className="max-w-[760px]">
              {form.status !== "active" && <p className="mb-3 rounded-md bg-amber-50 px-3 py-2 text-[13px] text-amber-900">Activate the form before sharing; drafts don&apos;t accept submissions.</p>}
              <div className="space-y-3">
                <CopyField label="Hosted form link" value={hosted} />
                <CopyField label="Embed code" value={`<iframe src="${hosted}" width="100%" height="560" style="border:0" title="${form.name.replace(/"/g, "")}"></iframe>`} />
                <p className="text-[12px] text-ink-muted">To use this form on a landing page, connect it in the Landing Page Builder&apos;s Page Settings.</p>
              </div>
            </Panel>
          ) : tab === "analytics" ? (
            <Panel title="Recent Submissions" action={<a href={`/api/marketing/export?kind=submissions&form=${form.id}&days=90`} className="text-[12.5px] font-semibold text-[#0B5CFF]">Export CSV (90 days)</a>}>
              {subs.recent.length ? (
                <ul className="divide-y divide-line">{subs.recent.map((s) => <li key={s.id} className="py-2.5 text-[12.5px]"><div className="flex justify-between"><span className="text-ink-soft">{fmtDateTime(s.createdAt)} · {s.source ?? "—"}</span></div><div className="mt-1 break-all text-deep-navy">{Object.entries((s.data ?? {}) as Record<string, string>).map(([k, v]) => `${k}: ${v}`).join(" · ")}</div></li>)}</ul>
              ) : (
                <EmptyState icon={FileText} title="No submissions yet" body="Submissions appear here once the active form receives entries." />
              )}
            </Panel>
          ) : (
            <FormBuilder
              key={`${form.id}-${form.updatedAt.getTime()}-${tab}`}
              tab={tab}
              form={{ id: form.id, fields: parseFields(form.fields), settings: { name: form.name, submitButtonText: form.submitButtonText, successMessage: form.successMessage, redirectUrl: form.redirectUrl ?? "", workflowId: form.workflowId ?? "", requireConsent: form.requireConsent, consentText: form.consentText ?? "", privacyUrl: form.privacyUrl ?? "", termsUrl: form.termsUrl ?? "", confirmationSubject: form.confirmationSubject ?? "" } }}
              workflows={workflows}
              canEdit={canEdit}
              save={saveForm}
            />
          )}
          <Panel
            title="Form Analytics Summary"
            className="mt-4"
            action={
              <form method="get" className="flex gap-1.5">
                <input type="hidden" name="id" value={form.id} />
                <input type="hidden" name="tab" value={tab} />
                <select name="range" defaultValue={sp.range ?? ""} aria-label="Submission range" className="h-9 rounded-md border border-line bg-white px-2 text-[12.5px]"><option value="">All Time</option><option value="30">Last 30 days</option></select>
                <button className="h-9 rounded-md border border-line px-3 text-[12px] font-semibold">Go</button>
              </form>
            }
          >
            <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
              {[["Form Views", form.views ? form.views.toLocaleString() : null, "Hosted form loads"], ["Starts", form.starts ? form.starts.toLocaleString() : null, "First field focused"], ["Submissions", subs.total ? subs.total.toLocaleString() : null, sp.range === "30" ? "Last 30 days" : "All time"], ["Completion Rate", pct(subs.total, form.starts), "Submissions per start"], ["Conversion Rate", pct(subs.total, form.views), "Submissions per view"]].map(([l, v, h]) => (
                <div key={l} className="rounded-lg border border-line p-4 text-center"><div className="text-[13px] font-semibold text-deep-navy">{l}</div><div className="mt-1 text-[20px] font-bold text-deep-navy">{v ?? "—"}</div><div className="text-[11.5px] text-ink-muted">{h}</div></div>
              ))}
            </div>
            <p className="mt-2 text-[11.5px] text-ink-muted">Views count hosted form loads; forms on landing pages count toward page visits instead.</p>
          </Panel>
        </>
      )}
    </div>
  );
}
