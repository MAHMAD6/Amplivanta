"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Send, Sparkles, ArrowRight, ShieldCheck, Clock } from "lucide-react";
import { contactSchema, type ContactInput } from "@/lib/validations/contact";
import { BUDGET_OPTIONS } from "@/lib/constants";
import { MOCK_SERVICES } from "@/lib/mock-data";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { toast } from "@/lib/toast";

export function ContactForm() {
  const [success, setSuccess] = useState(false);
  const [selectedService, setSelectedService] = useState<string>("");
  const [selectedBudget, setSelectedBudget] = useState<string>("");

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ContactInput>({
    resolver: zodResolver(contactSchema),
  });

  const handleServiceSelect = (title: string) => {
    const val = selectedService === title ? "" : title;
    setSelectedService(val);
    setValue("service", val, { shouldValidate: true });
  };

  const handleBudgetSelect = (budget: string) => {
    const val = selectedBudget === budget ? "" : budget;
    setSelectedBudget(val);
    setValue("budget", val, { shouldValidate: true });
  };

  const onSubmit = async (data: ContactInput) => {
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        setSuccess(true);
        toast.success("Inquiry Sent Successfully", {
          description: "Our senior strategist will respond within 2 business hours.",
        });
      } else {
        toast.error("Submission Failed", {
          description: "Could not send message. Please double-check your inputs and try again.",
        });
      }
    } catch (err) {
      console.error("Submission error", err);
      toast.error("Network Error", {
        description: "An unexpected error occurred while connecting to our servers.",
      });
    }
  };

  if (success) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center rounded-3xl border border-[#e9e7f0] bg-white p-12 text-center shadow-xl shadow-black/5"
      >
        <div className="relative mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-[#6D3BF5]/15">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="bg-grad-brand-2 flex h-16 w-16 items-center justify-center rounded-full"
          >
            <Check className="h-8 w-8 text-white" />
          </motion.div>
        </div>

        <h3 className="font-display text-3xl font-bold text-[#14121f]">
          Message Sent Successfully
        </h3>
        <p className="mt-3 max-w-md text-base text-[#4a4756]">
          Thank you for reaching out. A senior strategist from our team will review your inquiry and get back to you within <span className="font-semibold text-[#14121f]">2 business hours</span>.
        </p>

        <div className="mt-8 flex items-center gap-6 rounded-2xl bg-[#f8f7fb] px-6 py-4 text-xs font-medium text-[#4a4756]">
          <span className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-[#6D3BF5]" /> Fast Turnaround
          </span>
          <span className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-[#6D3BF5]" /> 100% Confidential
          </span>
        </div>

        <button
          onClick={() => {
            setSuccess(false);
            setSelectedService("");
            setSelectedBudget("");
          }}
          className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-[#6D3BF5] underline-offset-4 hover:underline"
        >
          Send another message <ArrowRight className="h-4 w-4" />
        </button>
      </motion.div>
    );
  }

  return (
    <div className="rounded-3xl border border-[#e9e7f0] bg-white p-8 sm:p-10 shadow-xl shadow-black/[0.03]">
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 rounded-full bg-[#f8f7fb] px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider text-[#6D3BF5]">
          <Sparkles className="h-3.5 w-3.5 text-[#6D3BF5]" /> Start a Conversation
        </div>
        <h2 className="mt-4 font-display text-2xl font-bold text-[#14121f] sm:text-3xl">
          How can we help your business grow?
        </h2>
        <p className="mt-2 text-sm text-[#4a4756]">
          Fill out the form below. Required fields are marked with an asterisk (*).
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Name & Email */}
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-[#14121f]">
              Full Name *
            </label>
            <input
              {...register("name")}
              type="text"
              placeholder="Jane Doe"
              className="w-full rounded-xl border border-[#e9e7f0] bg-[#f8f7fb] px-4 py-3 text-sm text-[#14121f] placeholder:text-[#767287] transition-all focus:border-[#6D3BF5] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#6D3BF5]/15"
            />
            {errors.name && (
              <p className="mt-1.5 text-xs font-medium text-red-500">{errors.name.message}</p>
            )}
          </div>

          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-[#14121f]">
              Email Address *
            </label>
            <input
              {...register("email")}
              type="email"
              placeholder="jane@company.com"
              className="w-full rounded-xl border border-[#e9e7f0] bg-[#f8f7fb] px-4 py-3 text-sm text-[#14121f] placeholder:text-[#767287] transition-all focus:border-[#6D3BF5] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#6D3BF5]/15"
            />
            {errors.email && (
              <p className="mt-1.5 text-xs font-medium text-red-500">{errors.email.message}</p>
            )}
          </div>
        </div>

        {/* Phone & Company */}
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-[#14121f]">
              Phone Number
            </label>
            <input
              {...register("phone")}
              type="tel"
              placeholder="+1 (555) 000-0000"
              className="w-full rounded-xl border border-[#e9e7f0] bg-[#f8f7fb] px-4 py-3 text-sm text-[#14121f] placeholder:text-[#767287] transition-all focus:border-[#6D3BF5] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#6D3BF5]/15"
            />
          </div>

          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-[#14121f]">
              Company Name
            </label>
            <input
              {...register("company")}
              type="text"
              placeholder="Company Inc."
              className="w-full rounded-xl border border-[#e9e7f0] bg-[#f8f7fb] px-4 py-3 text-sm text-[#14121f] placeholder:text-[#767287] transition-all focus:border-[#6D3BF5] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#6D3BF5]/15"
            />
          </div>
        </div>

        {/* Service Interested In Pills */}
        <div>
          <label className="mb-2.5 block text-xs font-semibold uppercase tracking-wider text-[#14121f]">
            Service Interested In
          </label>
          <input type="hidden" {...register("service")} />
          <div className="flex flex-wrap gap-2">
            {MOCK_SERVICES.map((s) => {
              const isSelected = selectedService === s.title;
              return (
                <button
                  key={s.slug}
                  type="button"
                  onClick={() => handleServiceSelect(s.title)}
                  className={`rounded-full px-4 py-2 text-xs font-medium transition-all ${
                    isSelected
                      ? "bg-[#0d0b18] text-white shadow-sm"
                      : "border border-[#e9e7f0] bg-[#f8f7fb] text-[#4a4756] hover:border-[#0d0b18]/30 hover:bg-white"
                  }`}
                >
                  {s.title}
                </button>
              );
            })}
          </div>
        </div>

        {/* Budget Range Pills */}
        <div>
          <label className="mb-2.5 block text-xs font-semibold uppercase tracking-wider text-[#14121f]">
            Budget Range
          </label>
          <input type="hidden" {...register("budget")} />
          <div className="flex flex-wrap gap-2">
            {BUDGET_OPTIONS.map((b) => {
              const isSelected = selectedBudget === b;
              return (
                <button
                  key={b}
                  type="button"
                  onClick={() => handleBudgetSelect(b)}
                  className={`rounded-full px-4 py-2 text-xs font-medium transition-all ${
                    isSelected
                      ? "bg-[#6D3BF5] text-white font-semibold shadow-sm"
                      : "border border-[#e9e7f0] bg-[#f8f7fb] text-[#4a4756] hover:border-[#0d0b18]/30 hover:bg-white"
                  }`}
                >
                  {b}
                </button>
              );
            })}
          </div>
        </div>

        {/* Message */}
        <div>
          <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-[#14121f]">
            Project Details & Message *
          </label>
          <textarea
            {...register("message")}
            rows={4}
            placeholder="Describe your current goals, timelines, or specific requirements..."
            className="w-full rounded-xl border border-[#e9e7f0] bg-[#f8f7fb] px-4 py-3 text-sm text-[#14121f] placeholder:text-[#767287] transition-all focus:border-[#6D3BF5] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#6D3BF5]/15"
          />
          {errors.message && (
            <p className="mt-1.5 text-xs font-medium text-red-500">{errors.message.message}</p>
          )}
        </div>

        {/* Submit button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="bg-grad-brand-2 group relative inline-flex w-full items-center justify-center gap-3 overflow-hidden rounded-xl px-8 py-4 font-display text-sm font-semibold text-white shadow-[0_8px_20px_-6px_rgba(109,59,245,0.5)] transition-all hover:-translate-y-0.5 active:scale-[0.99] disabled:opacity-60"
        >
          {isSubmitting ? (
            <LoadingSpinner className="text-[#6D3BF5]" />
          ) : (
            <>
              <span>Send Message</span>
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#6D3BF5] text-white transition-transform duration-300 group-hover:translate-x-1">
                <Send className="h-3.5 w-3.5" />
              </span>
            </>
          )}
        </button>

        <p className="text-center text-xs text-[#767287]">
          🔒 We respect your privacy. No spam. 100% confidential.
        </p>
      </form>
    </div>
  );
}
