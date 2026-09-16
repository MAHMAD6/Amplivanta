import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sendEmail, renderEmail } from "@/lib/email";
import { clientIp, rateLimit, tooMany } from "@/lib/rate-limit";
import { emitWebhookEvent } from "@/lib/webhook-delivery";
import { isEmail, parseFields, validateSubmission } from "@/lib/marketing/logic";
import { esc } from "@/lib/marketing/blocks";
import { triggerWorkflows } from "@/lib/server/marketing-runtime";

export const dynamic = "force-dynamic";

type Body = { action?: string; data?: Record<string, unknown>; visitId?: string; source?: string; consent?: boolean; website?: string };

/**
 * Public lead capture endpoint for hosted forms and landing pages.
 * `action`: "view" and "start" count funnel steps; "submit" validates against
 * the form definition, upserts the contact, records the submission and starts
 * the assigned and form-triggered workflows. Only active forms accept input.
 */
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = (await req.json().catch(() => null)) as Body | null;
  if (!body) return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  const ip = clientIp(req);
  const rl = await rateLimit(`form:${body.action === "submit" ? "submit" : "event"}:${ip}`, body.action === "submit" ? 8 : 60, 60);
  if (!rl.ok) return tooMany(rl);

  const form = await db.form.findUnique({ where: { id } });
  if (!form || form.status !== "active") return NextResponse.json({ error: "This form is not accepting submissions." }, { status: 404 });
  const visitId = typeof body.visitId === "string" ? body.visitId.slice(0, 40) : null;

  if (body.action === "view") {
    await db.form.update({ where: { id }, data: { views: { increment: 1 } } });
    return NextResponse.json({ ok: true });
  }
  if (body.action === "start") {
    await db.form.update({ where: { id }, data: { starts: { increment: 1 } } });
    if (visitId) await db.landingPageVisit.updateMany({ where: { id: visitId, workspaceId: form.workspaceId }, data: { formStarted: true } });
    return NextResponse.json({ ok: true });
  }
  if (body.action !== "submit") return NextResponse.json({ error: "Invalid request." }, { status: 400 });

  // Honeypot: bots fill every field. Pretend success without recording anything.
  if (body.website) return NextResponse.json({ ok: true, message: form.successMessage });
  if (form.requireConsent && body.consent !== true) return NextResponse.json({ error: "Please accept the consent statement to continue." }, { status: 400 });

  const fields = parseFields(form.fields);
  const checked = validateSubmission(fields, body.data ?? {});
  if (!checked.ok) return NextResponse.json({ error: checked.error }, { status: 400 });
  const v = checked.values;

  const emailField = fields.find((f) => f.type === "email");
  const email = emailField ? v[emailField.name]?.toLowerCase() : undefined;
  const pick = (...keys: string[]) => keys.map((k) => v[k]).find(Boolean) ?? null;

  let contactId: string | null = null;
  let created = false;
  if (email && isEmail(email)) {
    const existing = await db.contact.findFirst({ where: { workspaceId: form.workspaceId, email: { equals: email, mode: "insensitive" } }, select: { id: true } });
    if (existing) contactId = existing.id;
    else {
      const firstName = pick("first_name", "firstname");
      const lastName = pick("last_name", "lastname");
      const c = await db.contact.create({
        data: { workspaceId: form.workspaceId, email, firstName, lastName, name: pick("name", "full_name") ?? ([firstName, lastName].filter(Boolean).join(" ") || null), phone: pick("phone", "phone_number"), companyName: pick("company", "company_name"), jobTitle: pick("job_title", "title", "role"), status: "new" },
      });
      contactId = c.id;
      created = true;
    }
  }

  await db.formSubmission.create({ data: { formId: form.id, contactId, data: v, source: (body.source ?? "").slice(0, 60) || (visitId ? "landing_page" : "hosted_form"), consent: body.consent === true } });
  if (visitId) await db.landingPageVisit.updateMany({ where: { id: visitId, workspaceId: form.workspaceId }, data: { converted: true, formStarted: true } });

  if (created && contactId) {
    emitWebhookEvent(form.workspaceId, "contact.created", { id: contactId, email });
    await triggerWorkflows(form.workspaceId, "contact.created", { contactId });
  }
  await triggerWorkflows(form.workspaceId, "form.submitted", { contactId, payload: { formId: form.id }, workflowId: form.workflowId });

  if (email && form.confirmationSubject) {
    await sendEmail({ to: email, subject: form.confirmationSubject, html: renderEmail(esc(form.confirmationSubject), esc(form.successMessage)), category: "transactional" }).catch(() => null);
  }
  return NextResponse.json({ ok: true, message: form.successMessage, redirectUrl: form.redirectUrl && /^https?:\/\//.test(form.redirectUrl) ? form.redirectUrl : null });
}
