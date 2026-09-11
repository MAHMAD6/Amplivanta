"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { toast } from "@/lib/toast";
import { Field, FormGrid, inputClass } from "./site-ui";
import { btnPrimary } from "./site-buttons";

const TOPICS = ["Product question", "Demo", "Partnership", "Affiliate Program", "Other"];

/**
 * Contact form.
 *
 * Success is reported only when the submission service confirms delivery. A
 * failed request reports the failure — the reference is explicit that a fake
 * success message, ticket number or response time must never be shown before
 * the production service has actually accepted the message.
 */
export function SiteContactForm() {
  const [sent, setSent] = useState(false);
  const [pending, start] = useTransition();

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const payload = Object.fromEntries(new FormData(form) as never);
    start(async () => {
      try {
        const res = await fetch("/api/contact", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error(String(res.status));
        setSent(true);
        form.reset();
        toast.success("Message sent", { description: "Our team will reply to the address you gave." });
      } catch {
        toast.error("Your message could not be sent", {
          description: "The submission service did not confirm delivery. Please try again shortly.",
        });
      }
    });
  };

  return (
    <div className="rounded-[15px] border border-site-line bg-white p-5">
      <h3 className="m-0 mb-4 text-[18px] font-extrabold text-site-ink">Send a message</h3>

      <form onSubmit={onSubmit}>
        <FormGrid>
          <Field label="Full name">
            <input name="fullName" required className={inputClass} />
          </Field>
          <Field label="Email address">
            <input name="email" type="email" required className={inputClass} />
          </Field>
          <Field label="Company (optional)">
            <input name="company" className={inputClass} />
          </Field>
          <Field label="Topic">
            <select name="topic" defaultValue="" className={inputClass}>
              <option value="" disabled>Choose a topic</option>
              {TOPICS.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </Field>
          <Field label="Message" full>
            <textarea name="message" required rows={6} className={`${inputClass} min-h-[135px] resize-y`} />
          </Field>
        </FormGrid>

        <div className="mt-3.5 flex flex-wrap items-center gap-2.5">
          <button type="submit" disabled={pending} className={`${btnPrimary} disabled:opacity-60`}>
            {pending && <Loader2 aria-hidden className="mr-2 h-4 w-4 animate-spin" />}
            Send Message
          </button>
          <span className="text-[12px] leading-[1.45] text-[#6F7B91]">
            By submitting, you acknowledge the{" "}
            <Link href="/legal/privacy" className="font-semibold text-site-purple hover:underline">
              Privacy Policy
            </Link>
            .
          </span>
        </div>
      </form>

      <div
        role="status"
        className="mt-4 rounded-xl border border-[#E7EBF3] bg-white px-4 py-3 text-[12.8px] leading-[1.48] text-[#5F6D83]"
      >
        {sent
          ? "Your message was accepted by the submission service. Any ticket reference or response time will come from that service, not from this page."
          : "Submission status appears here after a real form event. No confirmation, ticket number or response time is shown before the service confirms delivery."}
      </div>
    </div>
  );
}
