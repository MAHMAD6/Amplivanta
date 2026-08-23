"use client";

import { useState } from "react";
import { Loader2, Check, Users2, Filter, Mail, UserCheck, BarChart3, PenLine } from "lucide-react";

const ACHIEVE = [
  { icon: Users2, label: "Generate More Leads" },
  { icon: Filter, label: "Improve Conversions" },
  { icon: Mail, label: "Marketing Automation" },
  { icon: UserCheck, label: "Customer Retention" },
  { icon: BarChart3, label: "Analytics & Reporting" },
  { icon: PenLine, label: "Other (Tell us more)" },
];
const SIZES = ["1–10", "11–50", "51–200", "201–500", "500+"];
const SOLUTIONS = ["AI Advisor", "Marketing Automation", "CRM & Pipeline", "Social Publishing", "Creative Studio", "Analytics & Reports"];

export function MarketingDemoForm() {
  const [loading, setLoading] = useState(false);
  const [ok, setOk] = useState(false);
  const [picked, setPicked] = useState<string[]>([]);

  function toggle(label: string) {
    setPicked((p) => (p.includes(label) ? p.filter((x) => x !== label) : [...p, label]));
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    try {
      await fetch("/api/contact", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ ...Object.fromEntries(new FormData(e.currentTarget) as never), subject: "Book a demo", message: `Goals: ${picked.join(", ") || "—"}` }),
      });
    } catch { /* ignore */ }
    setLoading(false);
    setOk(true);
  }

  return (
    <div className="rounded-3xl border border-line bg-white p-6 shadow-card lg:p-8">
      <h2 className="font-display text-2xl font-extrabold text-deep-navy">Book Your Demo</h2>
      <p className="mt-1 text-[13.5px] text-ink-soft">Fill out the form and our team will get back to you within 1 business day.</p>
      {ok && (
        <div className="mt-4 flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">
          <Check className="h-4 w-4" /> Thanks — we&apos;ll be in touch within 1 business day to schedule your demo.
        </div>
      )}
      <form onSubmit={onSubmit} className="mt-5 space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Full Name" name="fullName" placeholder="Enter your full name" required />
          <Field label="Work Email" name="email" type="email" placeholder="name@company.com" required />
          <Field label="Company Name" name="company" placeholder="Enter your company name" required />
          <Select label="Job Title" name="jobTitle" placeholder="Select your job title" options={["Founder / CEO", "Marketing Lead", "Growth / Demand Gen", "Sales Lead", "Operations", "Other"]} />
          <Select label="Company Size" name="companySize" placeholder="Select company size" options={SIZES} />
          <Field label="Phone Number" name="phone" placeholder="(201) 555-0123" />
        </div>
        <Select label="I'm interested in" name="interest" placeholder="Select solutions" options={SOLUTIONS} />
        <div>
          <label className="mb-2 block text-[12px] font-semibold text-deep-navy">What would you like to achieve? <span className="font-normal text-ink-muted">(Select all that apply)</span></label>
          <div className="grid gap-2 sm:grid-cols-3">
            {ACHIEVE.map((a) => (
              <button type="button" key={a.label} onClick={() => toggle(a.label)} className={`flex items-center gap-2 rounded-xl border px-3 py-2.5 text-[12.5px] font-medium transition ${picked.includes(a.label) ? "border-royal-blue bg-royal-tint text-royal-blue" : "border-line text-ink-soft hover:border-royal-blue/40"}`}>
                <a.icon className="h-4 w-4" /> {a.label}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="mb-1 block text-[12px] font-semibold text-deep-navy">Tell us about your goals or challenges <span className="font-normal text-ink-muted">(optional)</span></label>
          <textarea name="goals" rows={3} placeholder="Share any details that will help us prepare for your demo…" className="w-full rounded-xl border border-line bg-white px-3.5 py-3 text-[14px] focus:border-royal-blue focus:outline-none focus:ring-2 focus:ring-royal-blue/20" />
        </div>
        <p className="flex items-center gap-1.5 text-[12px] text-ink-muted">🔒 Your data is secure and will never be shared.</p>
        <button type="submit" className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-orange-cta text-[14px] font-bold text-white transition hover:bg-orange-cta-hover">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Book My Demo"}
        </button>
      </form>
    </div>
  );
}

function Field({ label, name, placeholder, type = "text", required }: { label: string; name: string; placeholder: string; type?: string; required?: boolean }) {
  return (
    <div>
      <label className="mb-1 block text-[12px] font-semibold text-deep-navy">{label}{required && <span className="text-orange-cta"> *</span>}</label>
      <input name={name} type={type} required={required} placeholder={placeholder} className="h-11 w-full rounded-xl border border-line bg-white px-3.5 text-[14px] focus:border-royal-blue focus:outline-none focus:ring-2 focus:ring-royal-blue/20" />
    </div>
  );
}
function Select({ label, name, placeholder, options }: { label: string; name: string; placeholder: string; options: string[] }) {
  return (
    <div>
      <label className="mb-1 block text-[12px] font-semibold text-deep-navy">{label}<span className="text-orange-cta"> *</span></label>
      <select name={name} defaultValue="" required className="h-11 w-full rounded-xl border border-line bg-white px-3 text-[14px] text-ink-soft focus:border-royal-blue focus:outline-none focus:ring-2 focus:ring-royal-blue/20">
        <option value="" disabled>{placeholder}</option>
        {options.map((o) => <option key={o}>{o}</option>)}
      </select>
    </div>
  );
}
