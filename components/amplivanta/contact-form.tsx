"use client";

import { useState } from "react";
import { Loader2, Check } from "lucide-react";
import { GradientButton } from "./brand-gradient";

export function ContactForm() {
  const [loading, setLoading] = useState(false);
  const [ok, setOk] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    await new Promise((r) => setTimeout(r, 700));
    setLoading(false);
    setOk(true);
    (e.target as HTMLFormElement).reset();
  }

  return (
    <form onSubmit={onSubmit} className="rounded-3xl border border-line bg-white p-6 shadow-card lg:p-8">
      {ok && (
        <div className="mb-4 flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">
          <Check className="h-4 w-4" /> Message sent — we&apos;ll be in touch within one business day.
        </div>
      )}
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="First name" name="firstName" required />
        <Field label="Last name" name="lastName" required />
      </div>
      <Field label="Work email" name="email" type="email" required />
      <Field label="Company" name="company" />
      <div className="mb-4">
        <label className="mb-1.5 block text-xs font-semibold text-ink">Intent</label>
        <select name="intent" className="w-full rounded-lg border border-line bg-white px-3 py-2.5 text-sm focus:border-violet focus:outline-none focus:ring-2 focus:ring-violet/20">
          <option>General question</option>
          <option>Book a demo</option>
          <option>Enterprise pricing</option>
          <option>Support</option>
          <option>Partner / press</option>
        </select>
      </div>
      <div className="mb-6">
        <label className="mb-1.5 block text-xs font-semibold text-ink">How can we help?</label>
        <textarea name="message" required rows={5} className="w-full rounded-lg border border-line bg-white px-3 py-2.5 text-sm focus:border-violet focus:outline-none focus:ring-2 focus:ring-violet/20" />
      </div>
      <GradientButton as="button" size="lg" className="w-full">
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Send message"}
      </GradientButton>
    </form>
  );
}

function Field({ label, name, type = "text", required }: { label: string; name: string; type?: string; required?: boolean }) {
  return (
    <div className="mb-4">
      <label className="mb-1.5 block text-xs font-semibold text-ink">
        {label}
        {required && <span className="text-pink-brand"> *</span>}
      </label>
      <input
        name={name}
        type={type}
        required={required}
        className="w-full rounded-lg border border-line bg-white px-3 py-2.5 text-sm focus:border-violet focus:outline-none focus:ring-2 focus:ring-violet/20"
      />
    </div>
  );
}
