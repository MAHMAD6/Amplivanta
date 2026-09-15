import type { Metadata } from "next";
import { AlertTriangle, Info, ShieldCheck, User } from "lucide-react";
import { PreferencesForm } from "@/components/amplivanta/preferences-form";
import { PREFERENCE_SCOPES } from "@/lib/preferences";
import { loadPreferences } from "@/lib/server/preferences";
import { isAdminRole, socialContext } from "@/lib/server/social-screens";
import { fmtDateTime } from "@/components/amplivanta/screen-kit";

export const metadata: Metadata = { title: "Social Publishing Settings" };
export const dynamic = "force-dynamic";

export default async function SocialSettingsPage() {
  const c = await socialContext();
  const prefs = await loadPreferences(c?.workspaceId ?? null, "social.settings");
  return (
    <div className="mx-auto max-w-[1600px]">
      <h1 className="font-display text-[30px] font-bold text-deep-navy">Social Publishing Settings</h1>
      <p className="mb-5 mt-1 text-[14.5px] text-ink-soft">Configure your social publishing preferences and behaviors.</p>
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_420px]">
        <PreferencesForm def={PREFERENCE_SCOPES["social.settings"]} values={prefs.values} path="/app/social/settings" canEdit={prefs.reachable && isAdminRole(c?.role)} />
        <aside className="space-y-5">
          <section className="flex gap-4 rounded-xl border border-line bg-white p-5">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-royal-tint text-[#3B3FD8]"><Info className="h-5 w-5" /></span>
            <div className="space-y-2 text-[13px] text-ink-soft">
              <h2 className="text-[16px] font-semibold text-deep-navy">About These Settings</h2>
              <p>These settings control default behaviors across the Social Publishing module.</p>
              <p>Changes apply to future content unless explicitly changed at the time of posting or scheduling.</p>
              <p>{prefs.updatedAt ? `Last saved ${fmtDateTime(prefs.updatedAt)}.` : "No settings have been saved yet; every option is unset."}</p>
            </div>
          </section>
          <section className="rounded-xl border border-line bg-white p-5">
            <h2 className="mb-3 flex items-center gap-3 text-[16px] font-semibold text-deep-navy"><span className="flex h-11 w-11 items-center justify-center rounded-full bg-royal-tint text-[#3B3FD8]"><ShieldCheck className="h-5 w-5" /></span> Important Notes</h2>
            <ul className="space-y-3 pl-14 text-[13px]">
              <li><div className="flex items-center gap-2 font-semibold text-deep-navy"><User className="h-4 w-4" /> Admin Only</div><div className="text-ink-soft">These settings are restricted to users with admin permissions.</div></li>
              <li><div className="flex items-center gap-2 font-semibold text-deep-navy"><AlertTriangle className="h-4 w-4" /> Unsaved Changes</div><div className="text-ink-soft">Changes are lost if you navigate away before saving.</div></li>
            </ul>
          </section>
        </aside>
      </div>
    </div>
  );
}
