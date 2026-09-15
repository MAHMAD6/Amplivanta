import type { Metadata } from "next";
import { AlertCircle, Diamond, KeyRound, MonitorSmartphone } from "lucide-react";
import { db } from "@/lib/db";
import { SettingsHeader } from "@/components/amplivanta/settings-header";
import { DataTable, EmptyState, StatGrid, fmtDateTime, fmtInt } from "@/components/amplivanta/screen-kit";
import { settingsContext } from "@/lib/server/settings-screens";

export const metadata: Metadata = { title: "Security & 2FA" };
export const dynamic = "force-dynamic";

/**
 * Multi-factor enrollment and login alerts are not implemented in the auth
 * stack yet, so this screen states that plainly instead of offering controls
 * that would not be enforced. Sessions are shown only from recorded rows.
 */
export default async function SecurityPage() {
  const c = await settingsContext();
  let sessions: { id: string; user: string; device: string; ip: string; lastActive: Date }[] = [];
  let reachable = Boolean(c);
  if (c) {
    try {
      const members = await db.membership.findMany({ where: { workspaceId: c.workspaceId }, select: { userId: true } });
      const rows = await db.userSession.findMany({
        where: { userId: { in: members.map((m) => m.userId) }, revokedAt: null },
        orderBy: { lastActiveAt: "desc" },
        take: 50,
        include: { user: { select: { name: true, email: true } } },
      });
      sessions = rows.map((s) => ({ id: s.id, user: s.user.name || s.user.email, device: [s.browser, s.os, s.device].filter(Boolean).join(" · ") || "Unknown device", ip: s.ipAddress ?? "—", lastActive: s.lastActiveAt }));
    } catch {
      reachable = false;
    }
  }

  return (
    <>
      <SettingsHeader
        title="Security & 2FA"
        subtitle="Configure MFA, session controls, authentication policies, and login alerts."
        actions={<button type="button" disabled className="h-11 rounded-md border border-line bg-bg-soft px-8 text-[14px] font-semibold text-ink-muted">Save Security Policy</button>}
      />
      <StatGrid
        stats={[
          { label: "MFA Enrollment", icon: KeyRound, value: null },
          { label: "Active Sessions", icon: MonitorSmartphone, value: sessions.length ? fmtInt(sessions.length) : null },
          { label: "Login Alerts", icon: AlertCircle, value: null },
          { label: "Security Policy", icon: Diamond, value: null },
        ]}
      />
      <div className="mb-5 grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_1.3fr]">
        <section className="flex flex-col rounded-xl border border-line bg-white p-6">
          <h2 className="text-[18px] font-semibold text-deep-navy">Multi-Factor Authentication</h2>
          <dl className="mt-4 grid grid-cols-[180px_1fr] items-center gap-y-4 text-[13.5px]">
            <dt className="font-semibold text-deep-navy">Enrollment status</dt>
            <dd className="text-ink-soft">Not available yet</dd>
            <dt className="font-semibold text-deep-navy">Workspace requirement</dt>
            <dd><div className="flex h-10 max-w-[290px] items-center rounded-md border border-line bg-bg-soft/50 px-3 text-ink-muted">Not configured</div></dd>
          </dl>
          <p className="mt-6 flex-1 text-[13px] text-ink-soft">Authenticator setup and recovery options appear only when enrollment is available. Role-based MFA requirements are enforced by workspace policy once multi-factor sign-in is enabled for your account.</p>
          <button type="button" disabled className="mt-6 h-11 w-fit rounded-md border border-line px-14 text-[14px] font-semibold text-ink-muted">Configure MFA</button>
        </section>
        <section className="rounded-xl border border-line bg-white p-6">
          <h2 className="mb-3 text-[18px] font-semibold text-deep-navy">Sessions &amp; Devices</h2>
          <DataTable
            columns={["Member", "Device", "IP address", "Last active"]}
            minWidth={560}
            rows={sessions.map((s) => [s.user, s.device, s.ip, fmtDateTime(s.lastActive)])}
            empty={<EmptyState icon={MonitorSmartphone} title={reachable ? "No session inventory available" : "Sessions unavailable"} body="Active sessions and revoke controls appear when session data is available." />}
          />
        </section>
      </div>
      <section className="grid grid-cols-1 gap-6 rounded-xl border border-line bg-bg-soft/40 p-6 lg:grid-cols-[1fr_340px]">
        <div>
          <h2 className="text-[17px] font-semibold text-deep-navy">Security Policy &amp; Login Alerts</h2>
          <p className="mt-2 text-[13px] text-ink-soft">Authentication requirements and alert preferences become configurable once workspace security policy is defined. Material security changes generate audit events.</p>
        </div>
        <div>
          <div className="mb-1.5 text-[13.5px] font-semibold text-deep-navy">Login Alert Preference</div>
          <div className="flex h-11 items-center rounded-md border border-line bg-white px-3 text-[13.5px] text-ink-muted">Not configured</div>
        </div>
      </section>
    </>
  );
}
