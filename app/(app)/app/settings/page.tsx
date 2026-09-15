import type { Metadata } from "next";
import Link from "next/link";
import { db } from "@/lib/db";
import { SettingsHeader } from "@/components/amplivanta/settings-header";
import { GeneralSettingsForm, SubmitFor } from "@/components/amplivanta/settings-ui";
import { fmtDateTime, kitOutline } from "@/components/amplivanta/screen-kit";
import { PREFERENCE_SCOPES } from "@/lib/preferences";
import { loadPreferences } from "@/lib/server/preferences";
import { settingsContext } from "@/lib/server/settings-screens";

export const metadata: Metadata = { title: "General Settings" };
export const dynamic = "force-dynamic";

export default async function GeneralSettingsPage() {
  const c = await settingsContext();
  let workspace: { name: string; slug: string } | null = null;
  let summary = { plan: null as string | null, members: 0, domains: 0, verified: 0, lastAudit: null as Date | null, notificationsSaved: false };
  const prefs = await loadPreferences(c?.workspaceId ?? null, "workspace.general");
  if (c) {
    try {
      const [ws, sub, members, domains, verified, audit, notif] = await Promise.all([
        db.workspace.findUnique({ where: { id: c.workspaceId }, select: { name: true, slug: true } }),
        db.subscription.findFirst({ where: { workspaceId: c.workspaceId }, orderBy: { createdAt: "desc" }, include: { plan: { select: { name: true } } } }),
        db.membership.count({ where: { workspaceId: c.workspaceId } }),
        db.domain.count({ where: { workspaceId: c.workspaceId } }),
        db.domain.count({ where: { workspaceId: c.workspaceId, isVerified: true } }),
        db.auditLog.findFirst({ where: { workspaceId: c.workspaceId }, orderBy: { createdAt: "desc" }, select: { createdAt: true } }),
        db.workspacePreference.findUnique({ where: { workspaceId_scope: { workspaceId: c.workspaceId, scope: "workspace.notifications" } }, select: { id: true } }),
      ]);
      workspace = ws;
      summary = { plan: sub ? `${sub.plan.name} · ${sub.status}` : null, members, domains, verified, lastAudit: audit?.createdAt ?? null, notificationsSaved: Boolean(notif) };
    } catch {
      workspace = null;
    }
  }
  const fields = PREFERENCE_SCOPES["workspace.general"].sections[0].fields.flatMap((f) => (f.kind === "select" ? [{ key: f.key, label: f.label, placeholder: f.placeholder ?? "Not configured", options: f.options }] : []));
  const canEdit = Boolean(c?.isAdmin && workspace);

  return (
    <>
      <SettingsHeader
        title="General Settings"
        subtitle="Configure workspace-wide defaults and administrative preferences."
        actions={
          <>
            <Link href="/app/settings/audit" className={`${kitOutline} h-11 px-10`}>View Audit Log</Link>
            <SubmitFor form="general-settings" label="Save Changes" disabled={!canEdit} />
          </>
        }
      />
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_610px]">
        <section className="rounded-xl border border-line bg-white p-6">
          <h2 className="mb-4 text-[19px] font-semibold text-deep-navy">Workspace Profile</h2>
          {workspace ? (
            <GeneralSettingsForm name={workspace.name} slug={workspace.slug} values={prefs.values as Record<string, string>} options={fields} canEdit={canEdit} />
          ) : (
            <p className="text-[13.5px] text-ink-soft">Workspace settings could not be loaded right now.</p>
          )}
          {!c?.isAdmin && workspace && <p className="mt-3 text-[12.5px] text-ink-muted">Only workspace admins can change these settings.</p>}
          <h2 className="mb-1 mt-8 text-[17px] font-semibold text-deep-navy">Workspace Defaults</h2>
          <p className="text-[13px] text-ink-soft">Defaults affect new activity unless explicitly propagated to existing records.{prefs.updatedAt ? ` Last saved ${fmtDateTime(prefs.updatedAt)}.` : ""}</p>
          <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-[1fr_1.5fr_0.8fr]">
            <div className="flex flex-col rounded-xl border border-line bg-bg-soft/40 p-5">
              <h3 className="text-[16px] font-semibold text-deep-navy">Users &amp; Permissions</h3>
              <p className="mt-1 flex-1 text-[13px] text-ink-soft">Manage workspace access and role assignments.</p>
              <Link href="/app/settings/users" className={`${kitOutline} mt-6`}>Open Roles</Link>
            </div>
            <div className="flex flex-col rounded-xl border border-line bg-bg-soft/40 p-5">
              <h3 className="text-[16px] font-semibold text-deep-navy">Security</h3>
              <p className="mt-1 flex-1 text-[13px] text-ink-soft">Security status appears when authentication and session data are available.</p>
              <Link href="/app/settings/security" className={`${kitOutline} mt-6 w-fit px-10`}>Open Security</Link>
            </div>
            <div className="rounded-xl border border-line bg-bg-soft/40 p-5">
              <h3 className="text-[16px] font-semibold text-deep-navy">System Status</h3>
              <div className="mt-5 text-[20px] font-bold text-deep-navy">{workspace ? "Operational" : "—"}</div>
              <p className="mt-2 text-[12.5px] text-ink-muted">{workspace ? "Workspace data reachable" : "Not available yet"}</p>
            </div>
          </div>
        </section>
        <aside className="rounded-xl border border-line bg-white p-6">
          <h2 className="text-[19px] font-semibold text-deep-navy">Settings Summary</h2>
          <ul className="divide-y divide-line">
            {([
              ["Current Plan", summary.plan ?? "Plan data unavailable", "/app/settings/billing"],
              ["Members", summary.members ? `${summary.members} member${summary.members === 1 ? "" : "s"}` : "No member data available", "/app/settings/users"],
              ["Notifications", summary.notificationsSaved ? "Workspace preferences saved" : "Preferences not configured", "/app/settings/notifications"],
              ["Domains", summary.domains ? `${summary.domains} added · ${summary.verified} verified` : "No domain data available", "/app/settings/api-domains"],
              ["Audit", summary.lastAudit ? `Last event ${fmtDateTime(summary.lastAudit)}` : "Activity appears after administrative changes", "/app/settings/audit"],
            ] as const).map(([t, b, href]) => (
              <li key={t} className="py-6">
                <Link href={href} className="text-[15px] font-semibold text-deep-navy hover:text-[#0B5CFF]">{t}</Link>
                <div className="mt-1 text-[13px] text-ink-soft">{b}</div>
              </li>
            ))}
          </ul>
        </aside>
      </div>
    </>
  );
}
