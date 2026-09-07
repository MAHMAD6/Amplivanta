"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Users2, Monitor, Gift, ShieldCheck } from "lucide-react";

const CHANNELS = ["Blog / Website", "YouTube", "Email Newsletter", "Social Media", "Online Community", "Other"];
const AUDIENCE = ["Marketers", "Founders / SMB owners", "Agencies", "Developers", "General business", "Other"];
const SIZES = ["Under 1,000", "1,000 – 10,000", "10,000 – 50,000", "50,000 – 250,000", "250,000+"];
const HEARD = ["Search engine", "Social media", "Referral", "Existing customer", "Event or webinar", "Other"];

export function AffiliateApplicationForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    try {
      await fetch("/api/contact", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ ...Object.fromEntries(new FormData(e.currentTarget) as never), subject: "Affiliate application" }),
      });
    } catch { /* ignore */ }
    router.push("/partners/success");
  }

  return (
    <div className="rounded-3xl border border-line bg-white p-6 shadow-card lg:p-8">
      <form onSubmit={onSubmit} className="space-y-6">
        <Group icon={Users2} title="Applicant Information">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Full Name" name="fullName" placeholder="Enter your full name" required />
            <Field label="Email Address" name="email" type="email" placeholder="Enter your email address" required />
          </div>
          <Select label="Country" name="country" placeholder="Select your country" options={["United States", "Canada", "United Kingdom", "Australia", "Germany", "India", "Other"]} required />
        </Group>

        <Group icon={Monitor} title="Your Platform">
          <Field label="Website URL (if applicable)" name="website" placeholder="https://yourwebsite.com" />
          <Field label="Social Profile URL" name="social" placeholder="https://yourprofile.com" />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Select label="Audience Type" name="audience" placeholder="Select your primary audience" options={AUDIENCE} required />
            <Select label="Estimated Audience Size (optional)" name="audienceSize" placeholder="Select audience size" options={SIZES} />
          </div>
        </Group>

        <Group icon={Gift} title="Promotion Details">
          <div>
            <label className="mb-2 block text-[12px] font-semibold text-deep-navy">Main Promotion Channel <span className="font-normal text-ink-muted">(Select all that apply)</span></label>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
              {CHANNELS.map((c) => (
                <label key={c} className="flex items-center gap-2 rounded-xl border border-line px-3 py-2 text-[12px] text-ink-soft">
                  <input type="checkbox" name="channels" value={c} className="accent-royal-blue" /> {c}
                </label>
              ))}
            </div>
          </div>
          <Area label="How do you plan to promote Amplivanta?" name="plan" placeholder="Tell us how you will introduce Amplivanta to your audience." required />
          <Select label="How did you hear about the Amplivanta Affiliate Program?" name="heard" placeholder="Select an option" options={HEARD} required />
        </Group>

        <Group icon={ShieldCheck} title="Agreements">
          <label className="flex items-start gap-2 text-[12.5px] text-ink-soft"><input type="checkbox" required className="mt-0.5 accent-royal-blue" /> I have read and agree to the Affiliate Program Terms and Conditions.</label>
          <label className="flex items-start gap-2 text-[12.5px] text-ink-soft"><input type="checkbox" required className="mt-0.5 accent-royal-blue" /> I agree to the Privacy Policy and understand how my data will be used.</label>
          <label className="flex items-start gap-2 text-[12.5px] text-ink-soft"><input type="checkbox" required className="mt-0.5 accent-royal-blue" /> I agree to disclose my affiliate relationship and will follow all applicable laws and regulations.</label>
        </Group>

        <button type="submit" className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-royal-blue text-[14px] font-bold text-white transition hover:bg-royal-soft">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Submit Application"}
        </button>
        <p className="text-center text-[12px] text-ink-muted">🔒 Your information will be used only to review and manage your affiliate application.</p>
      </form>
    </div>
  );
}

function Group({ icon: Icon, title, children }: { icon: typeof Users2; title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-[14px] font-bold text-deep-navy"><Icon className="h-4 w-4 text-royal-blue" /> {title}</div>
      {children}
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
function Select({ label, name, placeholder, options, required }: { label: string; name: string; placeholder: string; options: string[]; required?: boolean }) {
  return (
    <div>
      <label className="mb-1 block text-[12px] font-semibold text-deep-navy">{label}{required && <span className="text-orange-cta"> *</span>}</label>
      <select name={name} defaultValue="" required={required} className="h-11 w-full rounded-xl border border-line bg-white px-3 text-[14px] text-ink-soft focus:border-royal-blue focus:outline-none focus:ring-2 focus:ring-royal-blue/20">
        <option value="" disabled>{placeholder}</option>
        {options.map((o) => <option key={o}>{o}</option>)}
      </select>
    </div>
  );
}
function Area({ label, name, placeholder, required }: { label: string; name: string; placeholder: string; required?: boolean }) {
  return (
    <div>
      <label className="mb-1 block text-[12px] font-semibold text-deep-navy">{label}{required && <span className="text-orange-cta"> *</span>}</label>
      <textarea name={name} required={required} rows={3} placeholder={placeholder} className="w-full rounded-xl border border-line bg-white px-3.5 py-2.5 text-[14px] focus:border-royal-blue focus:outline-none focus:ring-2 focus:ring-royal-blue/20" />
    </div>
  );
}
