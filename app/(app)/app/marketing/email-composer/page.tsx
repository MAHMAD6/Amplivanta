import type { Metadata } from "next";
import { Mail } from "lucide-react";
import { db } from "@/lib/db";
import { EmptyState, Panel, Pill, ScreenHeader } from "@/components/amplivanta/screen-kit";
import { headerOutline, headerPrimary } from "@/components/amplivanta/growth-kit";
import { FormDialog } from "@/components/amplivanta/creative-ui";
import { EmailComposer } from "@/components/amplivanta/marketing-builders";
import { createEmailCampaign, saveEmail, scheduleEmail, sendEmailNow, sendTestEmail } from "@/app/(app)/app/marketing/actions";
import { marketingContext } from "@/lib/server/marketing-screens";
import { parseBlocks } from "@/lib/marketing/blocks";
import { EMAIL_STATUSES, label } from "@/lib/marketing/options";

export const metadata: Metadata = { title: "Email Composer" };
export const dynamic = "force-dynamic";

export default async function EmailComposerPage({ searchParams }: { searchParams: Promise<{ id?: string }> }) {
  const sp = await searchParams;
  const c = await marketingContext();
  const canEdit = Boolean(c?.canEdit);
  let emails: { id: string; name: string; status: string }[] = [];
  let segments: [string, string][] = [];
  let email: Awaited<ReturnType<typeof db.emailCampaign.findFirst>> = null;
  if (c) {
    try {
      const w = c.workspaceId;
      [emails, segments] = await Promise.all([
        db.emailCampaign.findMany({ where: { workspaceId: w }, orderBy: { updatedAt: "desc" }, take: 100, select: { id: true, name: true, status: true } }),
        db.segment.findMany({ where: { workspaceId: w, status: "active" }, select: { id: true, name: true, memberCount: true } }).then((r) => r.map((s): [string, string] => [s.id, `${s.name} (${s.memberCount})`])),
      ]);
      const id = sp.id ?? emails.find((e) => ["draft", "paused"].includes(e.status))?.id;
      if (id) email = await db.emailCampaign.findFirst({ where: { id, workspaceId: w } });
    } catch {
      email = null;
    }
  }
  const create = (cls: string, text: string) => <FormDialog title="Create Email Campaign" label={text} className={cls} action={createEmailCampaign} disabled={!canEdit} goTo="/app/marketing/email-composer?id=" submitLabel="Open composer" fields={[{ name: "name", label: "Campaign name", kind: "text", required: true }, { name: "subject", label: "Subject line", kind: "text" }, { name: "segmentId", label: "Audience", kind: "select", options: segments, placeholder: "Choose later" }]} />;

  return (
    <div className="mx-auto max-w-[1600px]">
      <ScreenHeader
        crumbs={[["Home", "/app"], ["Marketing Automation", "/app/marketing"], ["Email Composer"]]}
        title="Email Composer"
        actions={create(headerOutline, "+ New Email")}
      />
      {emails.length > 0 && (
        <form method="get" className="mb-4 flex flex-wrap items-center gap-2 rounded-xl border border-line bg-white p-2">
          <label htmlFor="em" className="px-2 text-[12.5px] font-semibold text-deep-navy">Email</label>
          <select id="em" name="id" defaultValue={email?.id} className="h-9 min-w-[260px] rounded-md border border-line bg-white px-2.5 text-[12.5px]">
            {emails.map((e) => <option key={e.id} value={e.id}>{e.name} · {label(EMAIL_STATUSES, e.status)}</option>)}
          </select>
          <button className="h-9 rounded-md border border-line px-4 text-[12.5px] font-semibold">Open</button>
          {email && <span className="ml-auto"><Pill tone={email.status === "sent" ? "green" : email.status === "draft" ? "gray" : "blue"}>{label(EMAIL_STATUSES, email.status)}</Pill></span>}
        </form>
      )}
      {email ? (
        <EmailComposer
          key={`${email.id}-${email.updatedAt.getTime()}`}
          email={{ id: email.id, blocks: parseBlocks(email.blocks, "email"), locked: ["sending", "sent"].includes(email.status), settings: { senderName: email.fromName ?? "", senderEmail: email.fromEmail ?? "", replyTo: email.replyTo ?? "", subject: email.subject, preheader: email.previewText ?? "", segmentId: email.segmentId ?? "" } }}
          segments={segments}
          canEdit={canEdit}
          save={saveEmail}
          sendTest={sendTestEmail}
          sendNow={sendEmailNow}
          schedule={scheduleEmail}
        />
      ) : (
        <Panel>
          <EmptyState icon={Mail} title="Start building your email" body="Create an email campaign, then drag content blocks to design it, choose an audience and schedule it." action={create(headerPrimary, "Create Email Campaign")} />
        </Panel>
      )}
    </div>
  );
}
