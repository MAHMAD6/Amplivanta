import type { Metadata } from "next";
import { MessageSquare, Clock, ShieldCheck, Headphones, Sparkles } from "lucide-react";
import { ContactForm } from "@/components/sections/contact/ContactForm";
import { ContactInfo } from "@/components/sections/contact/ContactInfo";
import { FaqAccordion } from "@/components/sections/contact/FaqAccordion";

export const metadata: Metadata = {
  title: "Contact Us | Amplivanta",
  description:
    "Get in touch with Amplivanta. We deliver high-impact digital solutions, custom web applications, and strategy for growing businesses.",
};

const trustSignals = [
  { icon: Clock, title: "< 2 Hour Response", desc: "Fast turnarounds for all inbound inquiries" },
  { icon: ShieldCheck, title: "100% Confidential", desc: "Strict NDA and security standards" },
  { icon: Headphones, title: "Direct Team Access", desc: "Speak directly with senior directors" },
];

export default function ContactPage() {
  return (
    <div className="bg-[#f8f7fb] text-[#14121f]">
      {/* Hero Header */}
      <section className="relative overflow-hidden bg-[#f8f7fb] px-4 pt-36 pb-20 sm:px-6 lg:px-8">
        {/* Background ambient lighting */}
        <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute left-1/2 top-0 h-[420px] w-[420px] -translate-x-1/2 -translate-y-1/3 rounded-full bg-[#6D3BF5]/10 blur-[110px]" />
          <div className="absolute right-10 top-24 h-64 w-64 rounded-full bg-[#E8398F]/10 blur-[100px]" />
        </div>

        <div className="relative mx-auto max-w-4xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-[#e3d9fb] bg-[#faf7ff] px-3 py-[7px] text-[12.5px] font-bold uppercase tracking-[0.02em] text-[#6D3BF5]">
            <span className="bg-grad-brand-2 flex h-4 w-4 items-center justify-center rounded-full">
              <MessageSquare className="h-2.5 w-2.5 text-white" />
            </span>
            Direct Contact
          </span>

          <h1 className="mt-5 font-display text-4xl font-extrabold leading-[1.05] tracking-tight text-[#14121f] sm:text-6xl">
            Let&apos;s Build Something <br className="hidden sm:inline" />
            <span className="text-gradient">Extraordinary</span>
          </h1>

          <p className="mx-auto mt-5 max-w-2xl text-lg text-[#767287]">
            Have a project in mind or want to discuss strategic digital growth? Fill out the form or reach us directly. We&apos;re ready to turn your vision into reality.
          </p>

          {/* Quick Stats Grid */}
          <div className="mt-12 grid gap-4 sm:grid-cols-3">
            {trustSignals.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.title}
                  className="flex items-center gap-4 rounded-2xl border border-[#e9e7f0] bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-[#e3ddf5] hover:shadow-[0_16px_34px_-18px_rgba(30,20,60,0.25)]"
                >
                  <span className="ic-violet flex h-10 w-10 shrink-0 items-center justify-center rounded-xl">
                    <Icon className="h-5 w-5 text-white" />
                  </span>
                  <div>
                    <h4 className="text-sm font-bold text-[#14121f]">{item.title}</h4>
                    <p className="text-xs text-[#767287]">{item.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Contact Form & Info Grid */}
      <section className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1.5fr_1fr]">
          <ContactForm />
          <ContactInfo />
        </div>
      </section>

      {/* Minimalist FAQ Section */}
      <section className="border-t border-[#e9e7f0] bg-[#f8f7fb] px-4 py-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <div className="mb-12 text-center">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3.5 py-1 text-xs font-semibold uppercase tracking-wider text-[#6D3BF5] shadow-sm">
              <Sparkles className="h-3.5 w-3.5 text-[#6D3BF5]" /> Clarity & Answers
            </span>
            <h2 className="mt-4 font-display text-3xl font-bold text-[#14121f] sm:text-4xl">
              Frequently Asked Questions
            </h2>
            <p className="mt-2 text-sm text-[#4a4756]">
              Everything you need to know about starting a project with Amplivanta.
            </p>
          </div>

          <FaqAccordion />
        </div>
      </section>
    </div>
  );
}
