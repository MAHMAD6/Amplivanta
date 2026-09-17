import type { Metadata } from "next";
import { AlertCircle, Diamond, KeyRound, MonitorSmartphone } from "lucide-react";
import { db } from "@/lib/db";
import { SettingsHeader } from "@/components/amplivanta/settings-header";
import { DataTable, EmptyState, StatGrid, fmtDateTime, fmtInt } from "@/components/amplivanta/screen-kit";
import { settingsContext } from "@/lib/server/settings-screens";
import { auth } from "@/lib/auth";
import { fmtDate } from "@/components/amplivanta/screen-kit";
import { RevokeSessionButton, TwoFactorPanel } from "@/components/amplivanta/security-ui";

export const metadata: Metadata = { title: "Security & 2FA" };
export const dynamic = "force-dynamic";

/**
 * Two-factor enrolment is real: the TOTP secret is stored encrypted, recovery
 * codes as hashes, and sign-in requires a code once enrolled. Sessions are
 * shown from recorded rows and can be ended by workspace admins.
 */
export default async function SecurityPage() {
  const c = await settingsContext();
  const session = await auth();
  const userId = (session?.user as { id?: string } | undefined)?.id ?? c?.userId ?? null;
  let me: { twoFactorEnabledAt: Date | null; twoFactorRecoveryCodes: string[] } | null = null;
  let enrolled = 0;
  let members = 0;
  let sessions: { id: string; user: string; device: string; ip: string; lastActive: Date }[] = [];
  let reachable = Boolean(c);
  if (c) {
    try {
      const memberRows = await db.membership.findMany({ where: { workspaceId: c.workspaceId }, select: { userId: true } });
      members = memberRows.length;
      const ids = memberRows.map((m) => m.userId);
      [me, enrolled] = await Promise.all([
        userId ? db.user.findUnique({ where: { id: userId }, select: { twoFactorEnabledAt: true, twoFactorRecoveryCodes: true } }) : Promise.resolve(null),
        db.user.count({ where: { id: { in: ids }, twoFactorEnabledAt: { not: null } } }),
      ]);
      const rows = await db.userSession.findMany({
        where: { userId: { in: ids }, revokedAt: null },
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
          { label: "MFA Enrollment", icon: KeyRound, value: members ? `${enrolled} of ${members}` : null, hint: members ? "Members with two-factor on" : undefined },
          { label: "Active Sessions", icon: MonitorSmartphone, value: sessions.length ? fmtInt(sessions.length) : null },
          { label: "Two-factor on your account", icon: AlertCircle, value: me ? (me.twoFactorEnabledAt ? "On" : "Off") : null },
          { label: "Recovery codes", icon: Diamond, value: me?.twoFactorEnabledAt ? String(me.twoFactorRecoveryCodes.length) : null, hint: me?.twoFactorEnabledAt ? "Unused codes" : undefined },
        ]}
      />
      <div className="mb-5 grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_1.3fr]">
        <section className="flex flex-col rounded-xl border border-line bg-white p-6">
          <h2 className="text-[18px] font-semibold text-deep-navy">Multi-Factor Authentication</h2>
          <p className="mt-1 text-[13px] text-ink-soft">Protect sign-in with a time-based code from an authenticator app. Recovery codes cover a lost device.</p>
          {me ? (
            <TwoFactorPanel enabled={Boolean(me.twoFactorEnabledAt)} enabledAt={me.twoFactorEnabledAt ? fmtDate(me.twoFactorEnabledAt) : null} recoveryLeft={me.twoFactorRecoveryCodes.length} />
          ) : (
            <p className="mt-4 text-[13px] text-ink-muted">Sign in to manage two-factor authentication for your account.</p>
          )}
        </section>
        <section className="rounded-xl border border-line bg-white p-6">
          <h2 className="mb-3 text-[18px] font-semibold text-deep-navy">Sessions &amp; Devices</h2>
          <DataTable
            columns={["Member", "Device", "IP address", "Last active", ""]}
            minWidth={620}
            rows={sessions.map((s) => [s.user, s.device, s.ip, fmtDateTime(s.lastActive), <RevokeSessionButton key="r" id={s.id} canRevoke={Boolean(c?.isAdmin)} />])}
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
