"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Check } from "lucide-react";
import { contactSchema, type ContactInput } from "@/lib/validations/contact";
import { BUDGET_OPTIONS } from "@/lib/constants";
import { MOCK_SERVICES } from "@/lib/mock-data";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";

const inputCls =
  "w-full rounded-xl border border-[#E3E3E3] bg-[#F4F4F4] px-4 py-3 text-sm text-[#0A0A0A] placeholder:text-[#9A9A9A] transition focus:border-[#B5FF2D] focus:outline-none";

export function ContactForm() {
  const [success, setSuccess] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ContactInput>({ resolver: zodResolver(contactSchema) });

  const onSubmit = async (data: ContactInput) => {
    const res = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (res.ok) setSuccess(true);
  };

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-[#E3E3E3] bg-white p-12 text-center">
        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-[#B5FF2D]">
          <Check className="h-8 w-8 text-black" />
        </span>
        <h3 className="mt-6 font-display text-2xl font-bold text-[#0A0A0A]">Thank you!</h3>
        <p className="mt-2 text-[#5A5A5A]">We&apos;ll be in touch within 24 hours.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 rounded-2xl border border-[#E3E3E3] bg-white p-8">
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-[#0A0A0A]">Full Name *</label>
          <input {...register("name")} className={inputCls} placeholder="Jane Doe" />
          {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name.message}</p>}
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-[#0A0A0A]">Email Address *</label>
          <input {...register("email")} className={inputCls} placeholder="jane@company.com" />
          {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email.message}</p>}
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-[#0A0A0A]">Phone Number</label>
          <input {...register("phone")} className={inputCls} placeholder="+1 555 000 0000" />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-[#0A0A0A]">Company</label>
          <input {...register("company")} className={inputCls} placeholder="Company Inc." />
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-[#0A0A0A]">Service Interested In</label>
          <select {...register("service")} className={inputCls} defaultValue="">
            <option value="" disabled>Select a service</option>
            {MOCK_SERVICES.map((s) => (
              <option key={s.slug} value={s.title}>{s.title}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-[#0A0A0A]">Budget Range</label>
          <select {...register("budget")} className={inputCls} defaultValue="">
            <option value="" disabled>Select a range</option>
            {BUDGET_OPTIONS.map((b) => (
              <option key={b} value={b}>{b}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-[#0A0A0A]">Message *</label>
        <textarea {...register("message")} rows={5} className={inputCls} placeholder="Tell us about your project..." />
        {errors.message && <p className="mt-1 text-sm text-red-500">{errors.message.message}</p>}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#B5FF2D] px-6 py-4 font-semibold text-black transition hover:bg-[#a0e828] disabled:opacity-60"
      >
        {isSubmitting && <LoadingSpinner className="text-black" />}
        Send Message
      </button>
    </form>
  );
}
