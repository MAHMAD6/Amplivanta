import type { Metadata } from "next";
import Link from "next/link";
import { Diamond, ArrowUpRight, ShieldCheck } from "lucide-react";
import { LogoMark } from "@/components/layout/LogoMark";
import { AuthSignupForm } from "@/components/amplivanta/auth-signup-form";

export const metadata: Metadata = { title: "Create Account" };

const POINTS = [
  { icon: Diamond, title: "Secure & Private", desc: "Designed with protected account access, privacy-minded controls, and clear data settings." },
  { icon: ArrowUpRight, title: "All-in-One Platform", desc: "Bring marketing, CRM, analytics, content, and growth workflows together." },
];

export default function SignupPage() {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-line px-6 py-3.5 lg:px-10">
        <Link href="/" className="flex items-center gap-2.5">
          <LogoMark className="h-9 w-9" />
          <div><span className="text-[17px] font-extrabold tracking-wide text-deep-navy">AMPLIVANTA</span><div className="text-[8.5px] font-semibold uppercase tracking-[0.2em] text-royal-blue">Engineering Growth</div></div>
        </Link>
        <div className="text-[13px] text-ink-soft">Already have an account? <Link href="/login" className="font-bold text-royal-blue hover:underline">Sign in</Link></div>
      </header>

      <div className="flex flex-1 flex-col lg:flex-row">
        {/* Left brand panel */}
        <aside className="flex w-full flex-col justify-between bg-deep-navy px-8 py-10 text-white lg:w-[380px]">
          <div>
            <h1 className="font-display text-[40px] font-extrabold leading-[1.05]">Engineer <span className="text-royal-soft">Smarter Growth.</span> Built for Action.</h1>
            <p className="mt-5 text-[14px] leading-relaxed text-white/70">Automate marketing, manage customer relationships, analyze performance, and turn insights into action—all from one connected platform.</p>
            <div className="mt-8 space-y-6 border-t border-white/10 pt-8">
              {POINTS.map((p) => (
                <div key={p.title} className="flex gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/10 text-royal-soft"><p.icon className="h-5 w-5" /></span>
                  <div><div className="text-[14px] font-bold">{p.title}</div><p className="mt-0.5 text-[12px] text-white/60">{p.desc}</p></div>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="flex items-center gap-1.5 text-[13px] font-bold"><ShieldCheck className="h-4 w-4 text-royal-soft" /> Privacy Controls</div>
            <p className="mt-1 text-[11.5px] text-white/60">Manage your account and data preferences with clear settings designed to keep you informed and in control.</p>
          </div>
        </aside>

        {/* Form */}
        <div className="flex-1 px-6 py-10 lg:px-16">
          <div className="mx-auto max-w-[720px]"><AuthSignupForm /></div>
        </div>
      </div>

      {/* Footer */}
      <footer className="flex flex-wrap items-center justify-between gap-3 bg-deep-navy px-6 py-4 text-white lg:px-10">
        <div className="flex items-center gap-2.5"><LogoMark className="h-7 w-7" /><span className="text-[11.5px] text-white/60">© 2026 Amplivanta Inc.<br />All rights reserved.</span></div>
        <div className="flex flex-wrap items-center gap-6 text-[13px] text-white/70">
          <Link href="/legal/privacy" className="hover:text-white">Privacy Policy</Link>
          <Link href="/legal/terms" className="hover:text-white">Terms of Service</Link>
          <Link href="/security" className="hover:text-white">Security</Link>
          <Link href="/help" className="hover:text-white">Support</Link>
        </div>
      </footer>
    </div>
  );
}
