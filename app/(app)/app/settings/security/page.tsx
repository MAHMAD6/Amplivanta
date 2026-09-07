import type { Metadata } from "next";
import { ShieldCheck, Smartphone, Key, AlertTriangle, LogOut } from "lucide-react";
import { StatusPill } from "@/components/amplivanta/status-pill";
import { SESSIONS } from "@/lib/settings-data";

export const metadata: Metadata = { title: "Security & 2FA" };

export default function SecurityPage() {
  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-line bg-white p-5 shadow-card">
        <div className="mb-4 flex items-center gap-2 text-[14px] font-bold text-ink"><ShieldCheck className="h-4 w-4 text-emerald-500" /> Two-Factor Authentication</div>
        <div className="space-y-3">
          {[
            { icon: Smartphone, label: "Authenticator app", desc: "Time-based codes from Google Authenticator, Authy, 1Password", enabled: true },
            { icon: Smartphone, label: "SMS backup", desc: "One-time codes via text — backup only", enabled: false },
            { icon: Key, label: "Hardware security key", desc: "YubiKey, Titan, or any FIDO2 key", enabled: false },
          ].map((m) => (
            <div key={m.label} className="flex items-center gap-3 rounded-xl border border-line p-3">
              <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${m.enabled ? "bg-emerald-500/10 text-emerald-600" : "bg-bg-soft text-ink-muted"}`}><m.icon className="h-4 w-4" /></div>
              <div className="min-w-0 flex-1">
                <div className="text-[13px] font-semibold text-ink">{m.label}</div>
                <div className="text-[11px] text-ink-muted">{m.desc}</div>
              </div>
              {m.enabled ? (
                <>
                  <StatusPill tone="green">Enabled</StatusPill>
                  <button className="rounded-lg border border-line px-3 py-1.5 text-[11.5px] font-semibold text-ink">Manage</button>
                </>
              ) : (
                <button className="rounded-lg bg-grad-cta px-3 py-1.5 text-[11.5px] font-bold text-white shadow-violet">Enable</button>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-line bg-white p-5 shadow-card">
        <div className="mb-4 text-[14px] font-bold text-ink">Security Policy</div>
        <div className="space-y-2 text-[12.5px]">
          {[
            { l: "Require MFA for all users", v: "On" },
            { l: "Minimum password length", v: "12 characters" },
            { l: "Password rotation", v: "Every 90 days" },
            { l: "Session timeout", v: "24 hours of inactivity" },
            { l: "Login alerts on new device", v: "On" },
            { l: "Allowed IP ranges", v: "Any (unrestricted)" },
          ].map((r) => (
            <div key={r.l} className="flex items-center justify-between border-b border-line pb-2 last:border-0">
              <span className="text-ink-soft">{r.l}</span>
              <span className="font-bold text-ink">{r.v}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-line bg-white p-5 shadow-card">
        <div className="mb-3 text-[14px] font-bold text-ink">Active Sessions</div>
        <div className="space-y-2">
          {SESSIONS.map((s, i) => (
            <div key={i} className="flex items-center justify-between rounded-xl border border-line p-3">
              <div>
                <div className="text-[13px] font-semibold text-ink">{s.device} {s.current && <StatusPill tone="violet" className="ml-1">This device</StatusPill>}</div>
                <div className="text-[11px] text-ink-muted">{s.location} · {s.ip} · Active {s.lastActive}</div>
              </div>
              {!s.current && <button className="inline-flex items-center gap-1 rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-[11.5px] font-bold text-red-600"><LogOut className="h-3 w-3" /> Revoke</button>}
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-red-200 bg-red-50/40 p-5">
        <div className="mb-2 flex items-center gap-2 text-[13px] font-bold text-red-700"><AlertTriangle className="h-4 w-4" /> Danger Zone</div>
        <div className="mt-3 space-y-2">
          <div className="flex items-center justify-between rounded-xl border border-red-200 bg-white p-3">
            <div><div className="text-[13px] font-semibold text-ink">Sign out of all sessions</div><div className="text-[11px] text-ink-muted">Ends every session except this device.</div></div>
            <button className="rounded-lg border border-red-300 bg-white px-3 py-1.5 text-[12px] font-bold text-red-600">Sign out all</button>
          </div>
          <div className="flex items-center justify-between rounded-xl border border-red-200 bg-white p-3">
            <div><div className="text-[13px] font-semibold text-ink">Reset workspace secrets</div><div className="text-[11px] text-ink-muted">Rotates API keys, webhook signing secrets, OAuth tokens.</div></div>
            <button className="rounded-lg bg-red-500 px-3 py-1.5 text-[12px] font-bold text-white">Reset all</button>
          </div>
        </div>
      </div>
    </div>
  );
}
