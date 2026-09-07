import type { Metadata } from "next";
import { NOTIFICATION_CATEGORIES } from "@/lib/settings-data";
import { Check } from "lucide-react";

export const metadata: Metadata = { title: "Notification Settings" };

export default function NotificationSettingsPage() {
  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-line bg-white shadow-card">
        <div className="border-b border-line p-4">
          <div className="text-[14px] font-bold text-ink">Notification Preferences</div>
          <div className="text-[11.5px] text-ink-muted">Toggle channels per category. Critical alerts (security, billing failures) always fire regardless of settings.</div>
        </div>
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-line bg-bg-soft/40 text-[10.5px] font-bold uppercase tracking-wider text-ink-muted">
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3 text-center">In-app</th>
              <th className="px-4 py-3 text-center">Email</th>
              <th className="px-4 py-3 text-center">SMS</th>
              <th className="px-4 py-3">Frequency</th>
            </tr>
          </thead>
          <tbody>
            {NOTIFICATION_CATEGORIES.map((c) => (
              <tr key={c.key} className="border-b border-line last:border-0">
                <td className="px-4 py-3">
                  <div className="text-[13px] font-semibold text-ink">{c.label}</div>
                  <div className="text-[11px] text-ink-muted">{c.desc}</div>
                </td>
                <td className="px-4 py-3 text-center"><Toggle on={c.inApp} /></td>
                <td className="px-4 py-3 text-center"><Toggle on={c.email} /></td>
                <td className="px-4 py-3 text-center"><Toggle on={c.sms} /></td>
                <td className="px-4 py-3">
                  <select className="rounded-lg border border-line bg-white px-2 py-1 text-[11.5px]">
                    <option>Real-time</option><option>Digest — daily</option><option>Digest — weekly</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="rounded-2xl border border-line bg-white p-5 shadow-card">
        <div className="mb-3 text-[14px] font-bold text-ink">Digest Settings</div>
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Daily digest time" value="8:00 AM PST" />
          <Field label="Weekly digest day" value="Monday" />
          <Field label="Digest email" value="alex@amplivanta.com" />
        </div>
      </div>

      <div className="flex items-center justify-between rounded-2xl border border-violet/25 bg-gradient-to-br from-violet/[0.05] to-orange-brand/[0.05] p-4">
        <div className="text-[12.5px] text-ink-soft"><span className="font-bold text-ink">Do Not Disturb</span> — mute non-critical notifications during quiet hours.</div>
        <Toggle on />
      </div>

      <div className="flex justify-end gap-2">
        <button className="rounded-xl border border-line bg-white px-4 py-2 text-[13px] font-semibold text-ink">Cancel</button>
        <button className="rounded-xl bg-grad-cta px-4 py-2 text-[13px] font-bold text-white shadow-violet">Save Preferences</button>
      </div>
    </div>
  );
}

function Toggle({ on }: { on: boolean }) {
  return (
    <div className={`relative mx-auto h-5 w-9 rounded-full p-0.5 ${on ? "bg-grad-brand-2" : "bg-bg-soft"}`}>
      <span className={`block h-4 w-4 rounded-full bg-white shadow transition ${on ? "translate-x-4" : ""}`} />
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <label className="mb-1 block text-[11px] font-semibold text-ink-muted">{label}</label>
      <input defaultValue={value} className="w-full rounded-lg border border-line bg-white px-3 py-2 text-[13px] focus:border-violet focus:outline-none" />
    </div>
  );
}
