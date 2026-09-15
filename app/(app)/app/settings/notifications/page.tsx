import type { Metadata } from "next";
import { SettingsHeader } from "@/components/amplivanta/settings-header";
import { NotificationMatrix, SubmitFor } from "@/components/amplivanta/settings-ui";
import { NOTIFICATION_CATEGORIES } from "@/lib/preferences";
import { loadPreferences } from "@/lib/server/preferences";
import { settingsContext } from "@/lib/server/settings-screens";
import { fmtDateTime } from "@/components/amplivanta/screen-kit";

export const metadata: Metadata = { title: "Notification Settings" };
export const dynamic = "force-dynamic";

export default async function NotificationSettingsPage() {
  const c = await settingsContext();
  const prefs = await loadPreferences(c?.workspaceId ?? null, "workspace.notifications");
  const canEdit = Boolean(c?.isAdmin && prefs.reachable);
  return (
    <>
      <SettingsHeader
        title="Notification Settings"
        subtitle="Control in-app and email notification preferences within workspace policy."
        actions={<SubmitFor form="notification-settings" label="Save Preferences" disabled={!canEdit} />}
      />
      <section className="rounded-xl border border-line bg-white p-5">
        <NotificationMatrix rows={NOTIFICATION_CATEGORIES} values={prefs.values as Record<string, string>} canEdit={canEdit} />
        <div className="mt-10 rounded-lg border border-line bg-bg-soft/40 px-5 py-4 text-[13px] text-ink-soft">
          Critical notification behavior is governed by platform and workspace policy and is not silently disabled when required.
          {prefs.updatedAt ? ` Preferences last saved ${fmtDateTime(prefs.updatedAt)}.` : ""}
          {!c?.isAdmin ? " Only workspace admins can change these preferences." : ""}
        </div>
      </section>
    </>
  );
}
