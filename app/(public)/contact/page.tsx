import type { Metadata } from "next";
import { ContactForm } from "@/components/sections/contact/ContactForm";
import { ContactInfo } from "@/components/sections/contact/ContactInfo";
import { FaqAccordion } from "@/components/sections/contact/FaqAccordion";

export const metadata: Metadata = {
  title: "Contact",
  description: "Let's talk. Reach out to Amplivanta and start growing your business today.",
};

export default function ContactPage() {
  return (
    <>
      <section className="bg-[#1A3C2B] px-4 pt-36 pb-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <span className="inline-block rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-widest text-[#B5FF2D]">
            Contact
          </span>
          <h1 className="mt-4 font-display text-4xl font-bold text-white md:text-6xl">
            Let&apos;s <span className="text-[#B5FF2D]">Talk</span>
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-lg text-white/70">
            Tell us about your goals and we&apos;ll show you how to reach them.
          </p>
        </div>
      </section>

      <section className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1.5fr_1fr]">
          <ContactForm />
          <ContactInfo />
        </div>
      </section>

      <section className="bg-[#F4F4F4] px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-center font-display text-4xl font-bold text-[#0A0A0A]">
            Frequently Asked Questions
          </h2>
          <div className="mt-10">
            <FaqAccordion />
          </div>
        </div>
      </section>
    </>
  );
}
