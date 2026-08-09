"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Plus, Minus } from "lucide-react";
import { FAQS } from "@/lib/mock-data";

export function FaqAccordion() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <div className="mx-auto max-w-3xl divide-y divide-[#E3E3E3] rounded-2xl border border-[#E3E3E3] bg-white">
      {FAQS.map((faq, i) => (
        <div key={faq.q} className="p-6">
          <button
            onClick={() => setOpen(open === i ? null : i)}
            className="flex w-full items-center justify-between text-left"
            aria-expanded={open === i}
          >
            <span className="font-display text-lg font-semibold text-[#0A0A0A]">{faq.q}</span>
            {open === i ? (
              <Minus className="h-5 w-5 shrink-0 text-[#B5FF2D]" />
            ) : (
              <Plus className="h-5 w-5 shrink-0 text-[#5A5A5A]" />
            )}
          </button>
          <AnimatePresence initial={false}>
            {open === i && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="overflow-hidden"
              >
                <p className="pt-3 text-[#5A5A5A]">{faq.a}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}
    </div>
  );
}
