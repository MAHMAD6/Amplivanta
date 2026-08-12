"use client";

import { useState } from "react";
import { Mail, Phone, MapPin, Clock, Copy, Check, ExternalLink, Zap } from "lucide-react";
import { CONTACT_INFO } from "@/lib/constants";
import { toast } from "@/lib/toast";

export function ContactInfo() {
  const [copied, setCopied] = useState(false);

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(CONTACT_INFO.email);
    setCopied(true);
    toast.copied(`Email copied (${CONTACT_INFO.email})`);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyPhone = () => {
    navigator.clipboard.writeText(CONTACT_INFO.phone);
    toast.copied(`Phone number copied (${CONTACT_INFO.phone})`);
  };

  return (
    <div className="space-y-6">
      {/* Contact Card */}
      <div className="rounded-3xl border border-[#e9e7f0] bg-white p-8 shadow-xl shadow-black/[0.03]">
        <div className="flex items-center justify-between">
          <h3 className="font-display text-xl font-bold text-[#14121f]">Contact Details</h3>
          <span className="flex items-center gap-2 rounded-full bg-[#EFEAFE] px-3 py-1 text-xs font-semibold text-[#0d0b18]">
            <span className="h-2 w-2 rounded-full bg-[#34D399] animate-pulse" />
            Live Support
          </span>
        </div>

        <ul className="mt-6 space-y-6">
          {/* Email */}
          <li className="group flex items-start justify-between gap-4 rounded-2xl border border-transparent bg-[#f8f7fb] p-4 transition-all hover:border-[#e9e7f0] hover:bg-white">
            <div className="flex gap-4">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-grad-brand-2 text-white">
                <Mail className="h-5 w-5" />
              </span>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-[#767287]">Email Us</p>
                <a href={`mailto:${CONTACT_INFO.email}`} className="mt-0.5 font-medium text-[#14121f] hover:text-[#0d0b18] transition-colors">
                  {CONTACT_INFO.email}
                </a>
              </div>
            </div>
            <button
              onClick={handleCopyEmail}
              title="Copy Email"
              className="mt-1 flex h-8 w-8 items-center justify-center rounded-lg border border-[#e9e7f0] bg-white text-[#4a4756] transition hover:border-[#0d0b18] hover:text-[#0d0b18]"
            >
              {copied ? <Check className="h-4 w-4 text-[#0d0b18]" /> : <Copy className="h-4 w-4" />}
            </button>
          </li>

          {/* Phone */}
          <li className="group flex items-start justify-between gap-4 rounded-2xl border border-transparent bg-[#f8f7fb] p-4 transition-all hover:border-[#e9e7f0] hover:bg-white">
            <div className="flex gap-4">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-grad-brand-2 text-white">
                <Phone className="h-5 w-5" />
              </span>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-[#767287]">Call Direct</p>
                <a href={`tel:${CONTACT_INFO.phone.replace(/[^0-9+]/g, '')}`} className="mt-0.5 font-medium text-[#14121f] hover:text-[#0d0b18] transition-colors">
                  {CONTACT_INFO.phone}
                </a>
              </div>
            </div>
            <button
              onClick={handleCopyPhone}
              title="Copy Phone Number"
              className="mt-1 flex h-8 w-8 items-center justify-center rounded-lg border border-[#e9e7f0] bg-white text-[#4a4756] transition hover:border-[#0d0b18] hover:text-[#0d0b18]"
            >
              <Copy className="h-4 w-4" />
            </button>
          </li>

          {/* Office Address */}
          <li className="flex items-start gap-4 rounded-2xl border border-transparent bg-[#f8f7fb] p-4 transition-all hover:border-[#e9e7f0] hover:bg-white">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-grad-brand-2 text-white">
              <MapPin className="h-5 w-5" />
            </span>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-[#767287]">Headquarters</p>
              <p className="mt-0.5 font-medium text-[#14121f]">{CONTACT_INFO.address}</p>
            </div>
          </li>

          {/* Hours */}
          <li className="flex items-start gap-4 rounded-2xl border border-transparent bg-[#f8f7fb] p-4 transition-all hover:border-[#e9e7f0] hover:bg-white">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-grad-brand-2 text-white">
              <Clock className="h-5 w-5" />
            </span>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-[#767287]">Working Hours</p>
              <p className="mt-0.5 font-medium text-[#14121f]">{CONTACT_INFO.hours}</p>
            </div>
          </li>
        </ul>
      </div>

      {/* Stylized Minimal Map Container */}
      <div className="group relative overflow-hidden rounded-3xl border border-[#0d0b18]/10 bg-[#0d0b18] p-8 text-white shadow-xl shadow-black/10">
        <div className="absolute inset-0 bg-[radial-gradient(#6D3BF5_1px,transparent_1px)] [background-size:16px_16px] opacity-10" />
        
        <div className="relative z-10">
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-[#6D3BF5]">
              <Zap className="h-3 w-3" /> NYC Studio & HQ
            </span>
            <span className="text-xs text-white/50">40.7128° N, 74.0060° W</span>
          </div>

          <div className="my-8 flex items-center justify-center">
            <div className="relative flex h-16 w-16 items-center justify-center">
              <span className="absolute h-full w-full rounded-full bg-[#6D3BF5]/20 animate-ping" />
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#6D3BF5] text-white shadow-lg">
                <MapPin className="h-6 w-6" />
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-white/10 pt-4 text-xs text-white/70">
            <span>Visitors welcome by appointment</span>
            <a
              href="https://maps.google.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-[#6D3BF5] hover:underline"
            >
              Get Directions <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
