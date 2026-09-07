import type { Metadata } from "next";
import Link from "next/link";
import { Globe, ShieldCheck, Key, ExternalLink, AlertTriangle, RotateCw, Plus } from "lucide-react";
import { StatusPill } from "@/components/amplivanta/status-pill";
import { DOMAINS } from "@/lib/settings-data";

export const metadata: Metadata = { title: "API & Domains" };

export default function ApiDomainsPage() {
  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-line bg-white p-5 shadow-card">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <div className="text-[14px] font-bold text-ink">Domains</div>
            <div className="text-[11.5px] text-ink-muted">Custom domains for landing pages, email sending, tracking.</div>
          </div>
          <button className="inline-flex h-10 items-center gap-1.5 rounded-xl bg-grad-cta px-4 text-[13px] font-bold text-white shadow-violet"><Plus className="h-3.5 w-3.5" />Add Domain</button>
        </div>
        <div className="space-y-2">
          {DOMAINS.map((d) => (
            <div key={d.domain} className="flex items-center gap-4 rounded-xl border border-line p-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet/10 text-violet"><Globe className="h-4 w-4" /></div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[13px] font-bold text-ink">{d.domain}</span>
                  {d.verified ? <StatusPill tone="green"><ShieldCheck className="mr-0.5 inline h-3 w-3" />Verified</StatusPill> : <StatusPill tone="amber"><AlertTriangle className="mr-0.5 inline h-3 w-3" />Pending DNS</StatusPill>}
                </div>
                <div className="mt-0.5 text-[11.5px] text-ink-muted">{d.purpose}</div>
                <div className="text-[11px] text-ink-muted">SSL: {d.ssl}</div>
              </div>
              <div className="flex gap-1">
                {!d.verified && <button className="rounded-lg bg-amber-500 px-2 py-1 text-[10.5px] font-bold text-white"><RotateCw className="mr-1 inline h-3 w-3" />Recheck</button>}
                <button className="rounded-lg border border-line px-2 py-1 text-[10.5px] font-semibold text-ink"><ExternalLink className="mr-1 inline h-3 w-3" />DNS Records</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-line bg-white p-5 shadow-card">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <div className="text-[14px] font-bold text-ink">API Access</div>
            <div className="text-[11.5px] text-ink-muted">Workspace-scoped API keys, rate limits, developer resources.</div>
          </div>
          <Link href="/app/integrations/api-keys" className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-line bg-white px-4 text-[13px] font-semibold text-ink"><Key className="h-3.5 w-3.5" />Manage Keys</Link>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-xl border border-line p-3">
            <div className="text-[10.5px] font-bold uppercase tracking-wider text-ink-muted">Active Keys</div>
            <div className="text-2xl font-extrabold text-ink">3</div>
          </div>
          <div className="rounded-xl border border-line p-3">
            <div className="text-[10.5px] font-bold uppercase tracking-wider text-ink-muted">Requests (7d)</div>
            <div className="text-2xl font-extrabold text-ink">454K</div>
          </div>
          <div className="rounded-xl border border-line p-3">
            <div className="text-[10.5px] font-bold uppercase tracking-wider text-ink-muted">Rate limit</div>
            <div className="text-2xl font-extrabold text-ink">5K / min</div>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-line bg-white p-5 shadow-card">
        <div className="mb-3 text-[14px] font-bold text-ink">Email Sending — DNS Records</div>
        <div className="space-y-2 text-[11.5px]">
          {[
            { type: "TXT", name: "amplivanta.com", value: "v=spf1 include:_spf.amplivanta.com ~all", status: "OK" },
            { type: "TXT", name: "amp._domainkey.amplivanta.com", value: "v=DKIM1; k=rsa; p=MIIBIjANBgkqhki…", status: "OK" },
            { type: "TXT", name: "_dmarc.amplivanta.com", value: "v=DMARC1; p=quarantine; rua=mailto:dmarc@…", status: "OK" },
            { type: "MX", name: "reply.amplivanta.com", value: "mx.amplivanta.com · priority 10", status: "OK" },
          ].map((r) => (
            <div key={r.name} className="flex items-center gap-3 rounded-lg border border-line p-2 font-mono">
              <StatusPill tone="green">{r.type}</StatusPill>
              <div className="min-w-0 flex-1">
                <div className="truncate text-[11.5px] font-semibold text-ink">{r.name}</div>
                <div className="truncate text-[10.5px] text-ink-muted">{r.value}</div>
              </div>
              <StatusPill tone="green">{r.status}</StatusPill>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
