import type { Metadata } from "next";
import { Plus, MoreHorizontal, AlertTriangle, CheckCircle2, XCircle } from "lucide-react";
import { PageHeader } from "@/components/amplivanta/page-header";
import { SocialSubnav } from "@/components/amplivanta/social-subnav";
import { PlatformIcon } from "@/components/amplivanta/platform-badge";
import { StatusPill } from "@/components/amplivanta/status-pill";
import { ACCOUNTS, PLATFORM_META } from "@/lib/social-data";

export const metadata: Metadata = { title: "Social Accounts" };

const HEALTH_ICON = { Healthy: CheckCircle2, Warning: AlertTriangle, Expired: XCircle };
const HEALTH_TONE = { Healthy: "green", Warning: "amber", Expired: "red" } as const;

export default function AccountsPage() {
  const attention = ACCOUNTS.filter((a) => a.status !== "Healthy");
  return (
    <div className="mx-auto max-w-[1400px]">
      <PageHeader
        title="Social Accounts"
        subtitle="Connect, manage and monitor all supported social accounts."
        actions={
          <button className="inline-flex h-10 items-center gap-1.5 rounded-xl bg-grad-cta px-4 text-[13px] font-bold text-white shadow-violet">
            <Plus className="h-3.5 w-3.5" /> Connect Account
          </button>
        }
      />
      <SocialSubnav />

      {attention.length > 0 && (
        <div className="mb-6 rounded-2xl border border-amber-300/50 bg-amber-50/50 p-4">
          <div className="flex items-center gap-2 text-[13px] font-bold text-amber-700">
            <AlertTriangle className="h-4 w-4" /> {attention.length} account{attention.length > 1 ? "s" : ""} need{attention.length === 1 ? "s" : ""} attention
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            {attention.map((a) => (
              <div key={a.id} className="flex items-center gap-2 rounded-lg border border-amber-200 bg-white px-3 py-1.5 text-[12px]">
                <PlatformIcon platform={a.platform} size={16} />
                <span className="font-semibold text-ink">{a.handle}</span>
                <span className="text-ink-muted">·</span>
                <span className={a.status === "Expired" ? "text-red-600" : "text-amber-600"}>{a.status}</span>
                <button className="rounded bg-grad-cta px-2 py-0.5 text-[10px] font-bold text-white">Reconnect</button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {ACCOUNTS.map((a) => {
          const Icon = HEALTH_ICON[a.status];
          return (
            <div key={a.id} className="rounded-2xl border border-line bg-white p-5 shadow-card">
              <div className="mb-3 flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <PlatformIcon platform={a.platform} size={44} />
                  <div>
                    <div className="text-[14px] font-bold text-ink">{PLATFORM_META[a.platform].label}</div>
                    <div className="text-[11.5px] text-ink-muted">{a.handle}</div>
                  </div>
                </div>
                <button className="text-ink-muted"><MoreHorizontal className="h-4 w-4" /></button>
              </div>
              <div className="grid grid-cols-3 gap-2 border-y border-line py-3 text-center">
                <div>
                  <div className="text-[10px] text-ink-muted">Followers</div>
                  <div className="text-[13px] font-bold text-ink">{(a.followers / 1000).toFixed(1)}K</div>
                </div>
                <div>
                  <div className="text-[10px] text-ink-muted">Engagement</div>
                  <div className="text-[13px] font-bold text-ink">{a.engagement}%</div>
                </div>
                <div>
                  <div className="text-[10px] text-ink-muted">Impressions</div>
                  <div className="text-[13px] font-bold text-ink">{(a.impressions / 1000).toFixed(1)}K</div>
                </div>
              </div>
              <div className="mt-3 flex items-center justify-between">
                <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-bold ${a.status === "Healthy" ? "bg-emerald-500/10 text-emerald-600" : a.status === "Warning" ? "bg-amber-500/10 text-amber-700" : "bg-red-500/10 text-red-600"}`}>
                  <Icon className="h-3 w-3" /> {a.status}
                </span>
                <span className="text-[10.5px] text-ink-muted">{a.type} · Added {a.addedDate}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
