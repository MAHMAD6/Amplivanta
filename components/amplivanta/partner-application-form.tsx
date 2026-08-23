"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, User, Mail, Building2, Globe, MapPin, Briefcase, Send, Lock } from "lucide-react";

const PARTNER_TYPES = ["Agency Partner", "Consulting Partner", "Technology Partner", "Solution Partner", "Referral Partner"];
const HEARD = ["Search engine", "Social media", "Referral / word of mouth", "Event or webinar", "Existing customer", "Other"];

export function PartnerApplicationForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    try {
      await fetch("/api/contact", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ ...Object.fromEntries(new FormData(e.currentTarget) as never), subject: "Partner application" }),
      });
    } catch { /* ignore */ }
    router.push("/partners/success");
  }

  return (
    <div className="rounded-3xl border border-line bg-white p-6 shadow-card lg:p-8">
      <h2 className="font-display text-2xl font-extrabold text-deep-navy">Partner Information</h2>
      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Full Name" name="fullName" icon={User} placeholder="Enter your full name" required />
          <Field label="Work Email" name="email" type="email" icon={Mail} placeholder="Enter your work email" required />
          <Field label="Business / Organization Name" name="company" icon={Building2} placeholder="Enter your business or organization name" required />
          <Field label="Website" name="website" icon={Globe} placeholder="https://yourwebsite.com" />
          <Select label="Country" name="country" icon={MapPin} placeholder="Select your country" options={["United States", "Canada", "United Kingdom", "Australia", "Germany", "India", "Other"]} required />
          <Select label="Partner Type" name="partnerType" icon={Briefcase} placeholder="Select partner type" options={PARTNER_TYPES} required />
        </div>
        <Area label="Services Offered" name="services" placeholder="Describe the services your business provides." hint="Examples: Implementation, consulting, integration, marketing, training, etc." required />
        <Area label="Markets / Customers Served" name="markets" placeholder="Tell us about the industries, regions, or customer segments you typically serve." required />
        <div className="grid gap-4 sm:grid-cols-2">
          <Area label="Why do you want to partner with Amplivanta?" name="why" placeholder="Share what excites you about our platform and why you want to partner with us." required />
          <Area label="How do you plan to promote, sell, implement, or support Amplivanta?" name="plan" placeholder="Describe your go-to-market approach and how you plan to create value for mutual customers." required />
        </div>
        <Select label="How did you hear about us?" name="heard" icon={Briefcase} placeholder="Select an option" options={HEARD} />
        <label className="flex items-start gap-2 text-[12.5px] text-ink-soft">
          <input type="checkbox" required className="mt-0.5 accent-royal-blue" /> I have read and agree to the Partner Program Terms &amp; Conditions and Privacy Policy.
        </label>
        <button type="submit" className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-royal-blue text-[14px] font-bold text-white transition hover:bg-royal-soft">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <>Submit Partner Application <Send className="h-4 w-4" /></>}
        </button>
        <p className="flex items-center gap-1.5 text-[12px] text-ink-muted"><Lock className="h-3.5 w-3.5" /> Your information will be used only to review and manage your partner application.</p>
      </form>
    </div>
  );
}

function Field({ label, name, icon: Icon, placeholder, type = "text", required }: { label: string; name: string; icon: typeof User; placeholder: string; type?: string; required?: boolean }) {
  return (
    <div>
      <label className="mb-1 block text-[12px] font-semibold text-deep-navy">{label}{required && <span className="text-orange-cta"> *</span>}</label>
      <div className="flex h-11 items-center gap-2 rounded-xl border border-line bg-white px-3 focus-within:border-royal-blue focus-within:ring-2 focus-within:ring-royal-blue/20">
        <Icon className="h-4 w-4 text-ink-muted" />
        <input name={name} type={type} required={required} placeholder={placeholder} className="min-w-0 flex-1 bg-transparent text-[14px] focus:outline-none" />
      </div>
    </div>
  );
}
function Select({ label, name, icon: Icon, placeholder, options, required }: { label: string; name: string; icon: typeof User; placeholder: string; options: string[]; required?: boolean }) {
  return (
    <div>
      <label className="mb-1 block text-[12px] font-semibold text-deep-navy">{label}{required && <span className="text-orange-cta"> *</span>}</label>
      <div className="flex h-11 items-center gap-2 rounded-xl border border-line bg-white px-3 focus-within:border-royal-blue">
        <Icon className="h-4 w-4 text-ink-muted" />
        <select name={name} defaultValue="" required={required} className="min-w-0 flex-1 bg-transparent text-[14px] text-ink-soft focus:outline-none">
          <option value="" disabled>{placeholder}</option>
          {options.map((o) => <option key={o}>{o}</option>)}
        </select>
      </div>
    </div>
  );
}
function Area({ label, name, placeholder, hint, required }: { label: string; name: string; placeholder: string; hint?: string; required?: boolean }) {
  return (
    <div>
      <label className="mb-1 block text-[12px] font-semibold text-deep-navy">{label}{required && <span className="text-orange-cta"> *</span>}</label>
      <textarea name={name} required={required} rows={3} placeholder={placeholder} className="w-full rounded-xl border border-line bg-white px-3.5 py-2.5 text-[14px] focus:border-royal-blue focus:outline-none focus:ring-2 focus:ring-royal-blue/20" />
      {hint && <p className="mt-1 text-[11px] text-ink-muted">{hint}</p>}
    </div>
  );
}
