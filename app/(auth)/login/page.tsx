import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { LogIn, UserPlus, TrendingUp, ShieldCheck, LifeBuoy, Lock, Layers, Headphones, ArrowRight } from "lucide-react";
import { LogoMark } from "@/components/layout/LogoMark";
import { AuthSignInForm } from "@/components/amplivanta/auth-signin-form";

export const metadata: Metadata = { title: "Sign In" };

const NAV = [
  { icon: LogIn, label: "Sign In", href: "/login", active: true },
  { icon: UserPlus, label: "Sign Up", href: "/signup" },
  { icon: TrendingUp, label: "Why Amplivanta", href: "/platform" },
  { icon: ShieldCheck, label: "Security", href: "/security" },
  { icon: LifeBuoy, label: "Support", href: "/help" },
];
const POINTS = [
  { icon: Lock, title: "Secure & Private", desc: "Your data is protected with enterprise-grade security and access controls." },
  { icon: Layers, title: "All-in-One Platform", desc: "Everything you need to attract, engage, and grow your business — in one place." },
  { icon: Headphones, title: "Here to Help", desc: "Our support team is ready to assist you whenever you need it." },
];

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <div className="flex flex-1 flex-col lg:flex-row">
        {/* Left nav sidebar */}
        <aside className="flex w-full flex-col bg-deep-navy px-6 py-8 text-white lg:w-[300px]">
          <Link href="/" className="flex flex-col items-start gap-1">
            <LogoMark className="h-11 w-11" />
            <div><span className="text-[18px] font-extrabold tracking-wide">AMPLIVANTA</span><div className="text-[9px] font-semibold uppercase tracking-[0.2em] text-white/50">Engineering Growth</div></div>
          </Link>
          <nav className="mt-10 space-y-1">
            {NAV.map((n) => (
              <Link key={n.label} href={n.href} className={`flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-[14px] font-semibold transition ${n.active ? "bg-royal-blue text-white" : "text-white/70 hover:bg-white/5 hover:text-white"}`}>
                <n.icon className="h-4.5 w-4.5" /> {n.label}
              </Link>
            ))}
          </nav>
          <div className="mt-auto hidden rounded-2xl border border-white/10 bg-white/5 p-4 lg:block">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10"><ShieldCheck className="h-5 w-5" /></span>
            <div className="mt-2 text-[13px] font-bold">Secure by design</div>
            <p className="mt-1 text-[11.5px] text-white/60">Your data is protected with enterprise-grade security and best practices.</p>
          </div>
        </aside>

        {/* Content */}
        <div className="flex-1 px-6 py-8 lg:px-14 lg:py-10">
          <div className="flex justify-end text-[13px] text-ink-soft">
            New to Amplivanta? <Link href="/signup" className="ml-1.5 font-bold text-royal-blue hover:underline">Create an account</Link>
          </div>

          <div className="mx-auto mt-6 grid max-w-[1000px] gap-10 lg:grid-cols-2">
            <div>
              <h1 className="font-display text-[46px] font-extrabold leading-none text-deep-navy">Welcome back</h1>
              <p className="mt-3 text-[15px] text-ink-soft">Sign in to your Amplivanta account</p>
              <div className="mt-2 h-1 w-10 rounded-full bg-royal-blue" />
              <div className="mt-10 space-y-7">
                {POINTS.map((p) => (
                  <div key={p.title} className="flex gap-3.5">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-royal-tint text-royal-blue"><p.icon className="h-5 w-5" /></span>
                    <div><div className="text-[15px] font-bold text-deep-navy">{p.title}</div><p className="mt-0.5 text-[13px] leading-relaxed text-ink-soft">{p.desc}</p></div>
                  </div>
                ))}
              </div>
              <div className="mt-8 border-t border-line pt-5">
                <div className="text-[13px] font-bold text-deep-navy">Need help?</div>
                <p className="mt-1 text-[13px] text-ink-soft">Visit our <Link href="/help" className="font-semibold text-royal-blue">Help Center</Link> or contact our support team.</p>
              </div>
            </div>

            <div className="lg:pt-2">
              <Suspense fallback={<div className="min-h-[420px] rounded-2xl border border-line bg-white shadow-card" />}>
                <AuthSignInForm />
              </Suspense>
            </div>
          </div>

          <p className="mt-10 text-center text-[13px] text-ink-muted">By signing in, you agree to our <Link href="/legal/terms" className="font-semibold text-royal-blue">Terms of Service</Link> and <Link href="/legal/privacy" className="font-semibold text-royal-blue">Privacy Policy</Link>.</p>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-deep-navy px-6 py-6 text-white lg:px-10">
        <div className="mx-auto flex max-w-[1280px] flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2.5"><LogoMark className="h-8 w-8" /><div><span className="text-[15px] font-extrabold">AMPLIVANTA</span><div className="text-[8.5px] font-semibold uppercase tracking-[0.2em] text-white/50">Engineering Growth</div></div></div>
          <div className="flex flex-wrap items-center gap-6 text-[13px] text-white/70">
            <Link href="/security" className="hover:text-white">Security</Link>
            <Link href="/legal/privacy" className="hover:text-white">Privacy Policy</Link>
            <Link href="/legal/terms" className="hover:text-white">Terms of Service</Link>
            <Link href="/help" className="hover:text-white">Support</Link>
          </div>
          <Link href="/signup" className="inline-flex h-10 items-center gap-2 rounded-xl border border-white/30 px-4 text-[13px] font-bold text-white hover:bg-white/10">Start Engineering Growth <ArrowRight className="h-4 w-4" /></Link>
        </div>
        <div className="mx-auto mt-4 max-w-[1280px] text-[11.5px] text-white/40">© 2026 Amplivanta Inc. All rights reserved.</div>
      </footer>
    </div>
  );
}
