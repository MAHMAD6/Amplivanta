import type { Metadata } from "next";
import { InfoList } from "@/components/amplivanta/screen-kit";
import { PreferencesForm } from "@/components/amplivanta/preferences-form";
import { PREFERENCE_SCOPES } from "@/lib/preferences";
import { loadPreferences } from "@/lib/server/preferences";
import { isAdminRole, socialContext } from "@/lib/server/social-screens";

export const metadata: Metadata = { title: "Platform Settings" };
export const dynamic = "force-dynamic";

export default async function PlatformSettingsPage() {
  const c = await socialContext();
  const prefs = await loadPreferences(c?.workspaceId ?? null, "social.platform");
  return (
    <div className="mx-auto max-w-[1600px]">
      <h1 className="font-display text-[30px] font-bold text-deep-navy">Platform Settings</h1>
      <p className="mb-5 mt-1 text-[14.5px] text-ink-soft">Configure general preferences, publishing rules, notifications, media behavior, privacy, and advanced options for Social Publishing.</p>
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
        <PreferencesForm def={PREFERENCE_SCOPES["social.platform"]} values={prefs.values} path="/app/social/platform-settings" canEdit={prefs.reachable && isAdminRole(c?.role)} layout="sidebar" />
        <aside className="h-fit rounded-xl border border-line bg-white p-5">
          <h2 className="text-[16px] font-semibold text-deep-navy">Settings Guidance</h2>
          <InfoList
            rows={[
              { title: "Defaults", body: "Configure default behavior only when workflow requirements are defined." },
              { title: "Approval & permissions", body: "Governance options depend on workspace roles and the process you configure." },
              { title: "Notifications", body: "Notification behavior follows saved preferences and available integrations." },
              { title: "Content & media", body: "Media and URL handling reflect the settings you explicitly select." },
              { title: "Integrations & sync", body: "Synchronization depends on connected services and their available capabilities." },
            ]}
          />
        </aside>
      </div>
    </div>
  );
}
