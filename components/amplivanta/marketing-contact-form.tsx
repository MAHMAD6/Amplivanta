"use client";

import { useState } from "react";
import { Loader2, Check, Send } from "lucide-react";

const SUBJECTS = ["Sales & pricing", "Book a demo", "Product support", "Partnerships", "Press & media", "Something else"];

export function MarketingContactForm() {
  const [loading, setLoading] = useState(false);
  const [ok, setOk] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    try {
      await fetch("/api/contact", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(Object.fromEntries(new FormData(e.currentTarget) as never)),
      });
    } catch { /* ignore */ }
    setLoading(false);
    setOk(true);
    (e.target as HTMLFormElement).reset();
  }

  return (
    <div className="rounded-3xl border border-line bg-white p-6 shadow-card lg:p-8">
      <h2 className="font-display text-2xl font-extrabold text-deep-navy">Send us a message</h2>
      <p className="mt-1 text-[14px] text-ink-soft">Fill out the form below and we&apos;ll get back to you.</p>
      {ok && (
        <div className="mt-4 flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">
          <Check className="h-4 w-4" /> Message sent — our team will reach out shortly.
        </div>
      )}
      <form onSubmit={onSubmit} className="mt-5 space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field name="fullName" placeholder="Full Name *" required />
          <Field name="email" type="email" placeholder="Email Address *" required />
        </div>
        <Field name="company" placeholder="Company Name (Optional)" />
        <div>
          <label className="mb-1 block text-[12px] font-semibold text-deep-navy">Subject *</label>
          <select name="subject" required defaultValue="" className="h-12 w-full rounded-xl border border-line bg-white px-3.5 text-[14px] text-ink-soft focus:border-royal-blue focus:outline-none focus:ring-2 focus:ring-royal-blue/20">
            <option value="" disabled>Select a topic</option>
            {SUBJECTS.map((s) => <option key={s}>{s}</option>)}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-[12px] font-semibold text-deep-navy">Message *</label>
          <textarea name="message" required rows={5} placeholder="How can we help you?" className="w-full rounded-xl border border-line bg-white px-3.5 py-3 text-[14px] focus:border-royal-blue focus:outline-none focus:ring-2 focus:ring-royal-blue/20" />
        </div>
        <p className="flex items-center gap-1.5 text-[12px] text-ink-muted">🔒 We respect your privacy. Your information will never be shared.</p>
        <button type="submit" className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-royal-blue text-[14px] font-semibold text-white transition hover:bg-royal-soft">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <>Send Message <Send className="h-4 w-4" /></>}
        </button>
      </form>
    </div>
  );
}

function Field({ name, placeholder, type = "text", required }: { name: string; placeholder: string; type?: string; required?: boolean }) {
  return (
    <input
      name={name}
      type={type}
      required={required}
      placeholder={placeholder}
      className="h-12 w-full rounded-xl border border-line bg-white px-3.5 text-[14px] focus:border-royal-blue focus:outline-none focus:ring-2 focus:ring-royal-blue/20"
    />
  );
}
