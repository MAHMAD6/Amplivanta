"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { User, Building2, Check, Bookmark, ArrowRight, Sparkles, Zap, BarChart3, Users2, Lock, LifeBuoy, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

const STEPS = ["Account Type", "Business Profile", "Goals & Channels", "Integrations", "Team & Launch"];
const RECOMMENDED = [
  { name: "Google Analytics 4", logo: "🟡", desc: "Track website traffic, user behavior, and campaign performance.", bullets: ["Traffic & acquisition tracking", "Goal & conversion tracking", "Audience insights"] },
  { name: "Google Ads", logo: "🔵", desc: "Sync your ad campaigns and performance data to track ROI.", bullets: ["Campaign performance", "Cost & conversion tracking", "Audience sync"] },
  { name: "HubSpot", logo: "🧡", desc: "Sync contacts, deals, and activities to streamline your pipeline.", bullets: ["Contact & company sync", "Deal & pipeline sync", "Activity & task sync"] },
];
const MORE_TOOLS = ["Meta Ads", "Mailchimp", "Shopify", "Slack", "LinkedIn Ads", "Microsoft Clarity", "Zapier", "Webhooks"];
const GOALS = ["Generate more leads", "Increase conversions", "Grow social presence", "Automate marketing", "Improve retention", "Scale content"];
const CHANNELS = ["Email", "Social", "Paid Ads", "SEO", "Landing Pages", "Webinars"];
const AI_RECS = [
  { icon: Zap, title: "Connect your channels early", hint: "Save time by connecting your marketing channels now." },
  { icon: BarChart3, title: "Define clear growth goals", hint: "Goals help our AI tailor insights that drive results." },
  { icon: Users2, title: "Invite your team", hint: "Collaboration unlocks faster execution and better outcomes." },
];

export function OnboardingClient() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [accountType, setAccountType] = useState<"Individual" | "Company">("Individual");
  const [goals, setGoals] = useState<string[]>([]);
  const [channels, setChannels] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  // Resume progress from a prior session.
  useEffect(() => {
    try {
      const raw = localStorage.getItem("amplivanta.onboarding");
      if (raw) {
        const s = JSON.parse(raw);
        setStep(s.step ?? 0);
        setAccountType(s.accountType ?? "Individual");
        setGoals(s.goals ?? []);
        setChannels(s.channels ?? []);
      }
    } catch { /* ignore */ }
  }, []);

  function persist(next: Partial<{ step: number; accountType: string; goals: string[]; channels: string[] }>) {
    const state = { step, accountType, goals, channels, ...next };
    try { localStorage.setItem("amplivanta.onboarding", JSON.stringify(state)); } catch { /* ignore */ }
  }

  const pct = Math.round(((step + (step === STEPS.length - 1 ? 1 : 0)) / STEPS.length) * 100);

  function toggle(list: string[], set: (v: string[]) => void, key: string, field: "goals" | "channels") {
    const next = list.includes(key) ? list.filter((x) => x !== key) : [...list, key];
    set(next);
    persist({ [field]: next } as never);
  }

  async function finish() {
    setSaving(true);
    try {
      await fetch("/api/onboarding/complete", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ accountType, goals, channels }),
      });
      localStorage.removeItem("amplivanta.onboarding");
    } catch { /* ignore */ }
    router.push("/app");
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_340px]">
      {/* Main */}
      <div>
        <h1 className="font-display text-[34px] font-extrabold leading-tight text-ink">Welcome to Amplivanta</h1>
        <p className="mt-1 text-[15px] text-ink-soft">Let&apos;s set up your workspace and engineer growth faster.</p>

        {/* Stepper */}
        <div className="mt-8 flex items-center">
          {STEPS.map((s, i) => (
            <div key={s} className="flex flex-1 items-center last:flex-none">
              <div className="flex flex-col items-center">
                <div className={cn("flex h-8 w-8 items-center justify-center rounded-full text-[12px] font-bold transition", i < step ? "bg-emerald-500 text-white" : i === step ? "bg-grad-brand text-white shadow-violet" : "border-2 border-line bg-white text-ink-muted")}>
                  {i < step ? <Check className="h-4 w-4" /> : i + 1}
                </div>
                <span className={cn("mt-1.5 whitespace-nowrap text-[11px] font-medium", i === step ? "text-violet" : "text-ink-muted")}>{s}</span>
              </div>
              {i < STEPS.length - 1 && <div className={cn("mx-2 h-0.5 flex-1 rounded-full", i < step ? "bg-emerald-500" : "bg-line")} />}
            </div>
          ))}
        </div>

        {/* Step body */}
        <div className="mt-10">
          {step === 0 && (
            <>
              <h2 className="text-[16px] font-bold text-ink">Choose your account type</h2>
              <p className="mt-0.5 text-[13px] text-ink-soft">This helps us personalize your experience.</p>
              <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
                {([["Individual", User, "Perfect for freelancers, consultants, and solo marketers."], ["Company", Building2, "Ideal for teams and organizations growing together."]] as const).map(([label, Icon, hint]) => (
                  <button key={label} onClick={() => { setAccountType(label); persist({ accountType: label }); }} className={cn("relative rounded-2xl border-2 p-6 text-center transition", accountType === label ? "border-violet bg-violet/[0.03]" : "border-line bg-white hover:border-violet/40")}>
                    {accountType === label && <span className="absolute right-3 top-3 flex h-6 w-6 items-center justify-center rounded-full bg-violet text-white"><Check className="h-3.5 w-3.5" /></span>}
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-violet/10 text-violet"><Icon className="h-6 w-6" /></div>
                    <div className="mt-3 text-[15px] font-bold text-ink">{label}</div>
                    <div className="mt-1 text-[12.5px] text-ink-soft">{hint}</div>
                  </button>
                ))}
              </div>
              <div className="mt-4 flex items-center gap-2 rounded-xl bg-bg-soft/60 p-4 text-[12.5px] text-ink-soft"><Sparkles className="h-4 w-4 text-violet" /><span><b className="text-ink">Not sure?</b> You can change this later from your workspace settings.</span></div>
            </>
          )}

          {step === 1 && (
            <>
              <h2 className="text-[16px] font-bold text-ink">Tell us about your business</h2>
              <p className="mt-0.5 text-[13px] text-ink-soft">Optional — helps our AI tailor recommendations.</p>
              <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Input label={accountType === "Company" ? "Company name" : "Your name"} placeholder="Acme Inc." />
                <Input label="Industry" placeholder="Software / SaaS" />
                <Input label="Website" placeholder="https://" />
                <Input label="Team size" placeholder="1–10" />
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <h2 className="text-[16px] font-bold text-ink">What are your growth goals?</h2>
              <p className="mt-0.5 text-[13px] text-ink-soft">Select all that apply.</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {GOALS.map((g) => <Chip key={g} active={goals.includes(g)} onClick={() => toggle(goals, setGoals, g, "goals")}>{g}</Chip>)}
              </div>
              <h3 className="mt-6 text-[14px] font-bold text-ink">Channels you use</h3>
              <div className="mt-3 flex flex-wrap gap-2">
                {CHANNELS.map((c) => <Chip key={c} active={channels.includes(c)} onClick={() => toggle(channels, setChannels, c, "channels")}>{c}</Chip>)}
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-[16px] font-bold text-ink">Connect your favorite tools</h2>
                  <p className="mt-0.5 text-[13px] text-ink-soft">Integrate Amplivanta with the tools you already use. You can connect more apps anytime from Settings.</p>
                </div>
                <div className="hidden shrink-0 items-center gap-2 rounded-xl border border-line bg-bg-soft/50 p-2.5 sm:flex">
                  <ShieldCheck className="h-5 w-5 text-violet" />
                  <div className="text-[11px]"><div className="font-bold text-ink">Your data is secure</div><div className="text-ink-muted">Industry-standard encryption.</div></div>
                </div>
              </div>
              <div className="mt-4 flex items-center gap-2 text-[12.5px] font-bold text-ink">Recommended integrations <span className="rounded-full bg-violet/10 px-2 py-0.5 text-[10px] font-semibold text-violet">Suggested for you</span></div>
              <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-3">
                {RECOMMENDED.map((r) => (
                  <div key={r.name} className="rounded-xl border border-line bg-white p-4">
                    <div className="mb-2 flex items-start justify-between"><span className="text-[18px]">{r.logo}</span><span className="rounded-full bg-violet/10 px-2 py-0.5 text-[9.5px] font-semibold text-violet">Recommended</span></div>
                    <div className="text-[13.5px] font-bold text-ink">{r.name}</div>
                    <p className="mt-0.5 text-[11px] text-ink-muted">{r.desc}</p>
                    <ul className="mt-2 space-y-1">
                      {r.bullets.map((b) => <li key={b} className="flex items-center gap-1.5 text-[11px] text-ink-soft"><Check className="h-3 w-3 text-emerald-600" /> {b}</li>)}
                    </ul>
                    <button className="mt-3 h-9 w-full rounded-lg bg-grad-cta text-[12px] font-bold text-white shadow-violet">Connect {r.name.split(" ")[0]}</button>
                  </div>
                ))}
              </div>
              <div className="mt-4 text-[12.5px] font-bold text-ink">More integrations</div>
              <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
                {MORE_TOOLS.map((n) => (
                  <div key={n} className="rounded-xl border border-line bg-white p-3">
                    <div className="text-[12.5px] font-semibold text-ink">{n}</div>
                    <button className="mt-2 h-8 w-full rounded-lg border border-line text-[11.5px] font-semibold text-violet hover:border-violet/40">Connect</button>
                  </div>
                ))}
              </div>
            </>
          )}

          {step === 4 && (
            <>
              <h2 className="text-[16px] font-bold text-ink">Invite your team & launch</h2>
              <p className="mt-0.5 text-[13px] text-ink-soft">Add teammates now or launch solo — you can invite anytime.</p>
              <div className="mt-5 space-y-2">
                <Input label="Invite by email" placeholder="teammate@company.com" />
                <button className="text-[12.5px] font-semibold text-violet">+ Add another</button>
              </div>
              <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50/50 p-4 text-[13px] text-emerald-700">
                <b>You&apos;re all set.</b> Click launch to enter your workspace with tailored next-best actions.
              </div>
            </>
          )}
        </div>

        {/* Actions */}
        <div className="mt-10 flex items-center justify-between">
          <button className="inline-flex h-11 items-center gap-2 rounded-xl border border-line bg-white px-5 text-[13px] font-semibold text-ink hover:border-ink/30" onClick={() => { persist({ step }); }}>
            <Bookmark className="h-4 w-4" /> Save &amp; Continue Later
          </button>
          <div className="flex gap-2">
            {step > 0 && <button className="h-11 rounded-xl border border-line bg-white px-5 text-[13px] font-semibold text-ink hover:border-ink/30" onClick={() => { const n = step - 1; setStep(n); persist({ step: n }); }}>Back</button>}
            {step < STEPS.length - 1 ? (
              <button className="inline-flex h-11 items-center gap-2 rounded-xl bg-grad-cta px-6 text-[13px] font-bold text-white shadow-violet" onClick={() => { const n = step + 1; setStep(n); persist({ step: n }); }}>
                {step === 0 ? "Start Engineering Growth" : "Continue"} <ArrowRight className="h-4 w-4" />
              </button>
            ) : (
              <button disabled={saving} className="inline-flex h-11 items-center gap-2 rounded-xl bg-grad-cta px-6 text-[13px] font-bold text-white shadow-violet disabled:opacity-60" onClick={finish}>
                {saving ? "Launching…" : "Launch Workspace"} <ArrowRight className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Right column */}
      <div className="space-y-4">
        <div className="rounded-2xl border border-line bg-white p-5 shadow-card">
          <div className="flex items-center justify-between"><span className="text-[13px] font-bold text-ink">Setup Progress</span><span className="text-[13px] font-bold text-violet">{pct}% Complete</span></div>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-bg-soft"><div className="h-full rounded-full bg-grad-brand transition-all" style={{ width: `${pct}%` }} /></div>
          <div className="mt-2 text-[11px] text-ink-muted">{step + (step === STEPS.length - 1 ? 1 : 0)} of {STEPS.length} steps completed</div>
        </div>

        <div className="rounded-2xl border border-line bg-white p-5 shadow-card">
          <div className="mb-3 text-[13px] font-bold text-ink">Onboarding Steps</div>
          <ul className="space-y-2.5">
            {STEPS.map((s, i) => (
              <li key={s} className="flex items-center justify-between text-[12.5px]">
                <span className="flex items-center gap-2">
                  <span className={cn("flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold", i < step ? "bg-emerald-500 text-white" : i === step ? "bg-violet text-white" : "bg-bg-soft text-ink-muted")}>{i < step ? "✓" : i + 1}</span>
                  <span className={i === step ? "font-semibold text-ink" : "text-ink-soft"}>{i + 1}. {s}</span>
                </span>
                {i === step ? <span className="rounded-full bg-violet/10 px-2 py-0.5 text-[10px] font-bold text-violet">Current</span> : i > step ? <Lock className="h-3 w-3 text-ink-muted" /> : null}
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-2xl border border-line bg-white p-5 shadow-card">
          <div className="mb-3 flex items-center gap-1.5 text-[13px] font-bold text-ink"><Sparkles className="h-4 w-4 text-violet" /> AI Setup Recommendations</div>
          <div className="space-y-3">
            {AI_RECS.map((r) => (
              <div key={r.title} className="flex gap-2.5 rounded-xl border border-line p-3">
                <r.icon className="h-4 w-4 shrink-0 text-violet" />
                <div><div className="text-[12.5px] font-semibold text-ink">{r.title}</div><div className="mt-0.5 text-[11px] text-ink-muted">{r.hint}</div></div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-line bg-white p-5 shadow-card">
          <div className="flex items-center gap-1.5 text-[13px] font-bold text-ink"><LifeBuoy className="h-4 w-4 text-violet" /> Need help getting started?</div>
          <p className="mt-1 text-[12px] text-ink-soft">Book a 1:1 onboarding call with our growth experts.</p>
          <a className="mt-2 inline-flex items-center gap-1 text-[12.5px] font-semibold text-violet">Schedule a Call <ArrowRight className="h-3.5 w-3.5" /></a>
        </div>
      </div>
    </div>
  );
}

function Input({ label, placeholder }: { label: string; placeholder: string }) {
  return (
    <label className="block">
      <span className="mb-1 block text-[12px] font-semibold text-ink">{label}</span>
      <input placeholder={placeholder} className="h-11 w-full rounded-xl border border-line bg-white px-3 text-[13px] focus:border-violet focus:outline-none" />
    </label>
  );
}
function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick} className={cn("rounded-full border px-4 py-2 text-[12.5px] font-semibold transition", active ? "border-violet bg-violet/10 text-violet" : "border-line bg-white text-ink-soft hover:border-violet/40")}>
      {active && <Check className="mr-1 inline h-3 w-3" />}{children}
    </button>
  );
}
