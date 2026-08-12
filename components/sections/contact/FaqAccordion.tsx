"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, HelpCircle } from "lucide-react";
import { FAQS } from "@/lib/mock-data";

export function FaqAccordion() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <div className="space-y-4">
      {FAQS.map((faq, i) => {
        const isOpen = open === i;
        return (
          <div
            key={faq.q}
            className={`overflow-hidden rounded-2xl border transition-all duration-200 ${
              isOpen
                ? "border-[#0d0b18] bg-white shadow-md shadow-black/[0.02]"
                : "border-[#e9e7f0] bg-white hover:border-[#d9d5ea]"
            }`}
          >
            <button
              onClick={() => setOpen(isOpen ? null : i)}
              className="flex w-full items-center justify-between p-6 text-left"
              aria-expanded={isOpen}
            >
              <span className="flex items-center gap-3">
                <span
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl transition-colors ${
                    isOpen ? "bg-grad-brand-2 text-white" : "bg-[#f8f7fb] text-[#0d0b18]"
                  }`}
                >
                  <HelpCircle className="h-4 w-4" />
                </span>
                <span className="font-display text-base font-semibold text-[#14121f] sm:text-lg">
                  {faq.q}
                </span>
              </span>

              <span
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-transform duration-300 ${
                  isOpen ? "rotate-180 bg-[#f8f7fb] text-[#14121f]" : "text-[#767287]"
                }`}
              >
                <ChevronDown className="h-4 w-4" />
              </span>
            </button>

            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2, ease: "easeInOut" }}
                  className="overflow-hidden"
                >
                  <div className="border-t border-[#f1f0f7] px-6 py-5 text-sm leading-relaxed text-[#4a4756]">
                    {faq.a}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
