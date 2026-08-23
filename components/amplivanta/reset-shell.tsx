import Link from "next/link";
import { Lock, Mail, ShieldCheck, Zap } from "lucide-react";
import { Logo } from "@/components/layout/Logo";

const FEATURES = [
  { icon: Lock, title: "Secure Account Recovery", desc: "Industry-standard encryption protects your account and data." },
  { icon: Mail, title: "Email Verification", desc: "We'll send a secure reset link to your verified email address." },
  { icon: Zap, title: "Fast Access Restoration", desc: "Get back to what matters with a quick and simple process." },
  { icon: ShieldCheck, title: "Enterprise-Grade Security", desc: "Your privacy and security are our top priorities." },
];

/**
 * Split-screen shell for the password-reset flow. Left = dark brand panel with a
 * rising-growth chart motif; right = the caller's form. Matches the approved
 * Reset-Password design.
 */
export function ResetShell({
  heading,
  accent,
  children,
}: {
  heading: string;
  accent: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Left brand panel */}
      <div className="relative hidden overflow-hidden bg-gradient-to-br from-[#081A3A] via-[#0B2350] to-[#123]  p-10 text-white lg:flex lg:flex-col lg:justify-between">
        <div aria-hidden className="absolute -right-24 top-10 h-[420px] w-[420px] rounded-full bg-royal-blue/25 blur-3xl" />
        <ChartMotif />

        <Link href="/" className="relative z-10">
          <Logo dark />
        </Link>

        <div className="relative z-10 max-w-md">
          <h1 className="font-display text-[44px] font-extrabold leading-[1.05]">
            {heading} <span className="text-orange-cta">{accent}</span>
          </h1>
          <p className="mt-4 text-[14px] leading-relaxed text-white/70">
            Securely regain access to your account with enterprise-grade protection and peace of mind.
          </p>

          <ul className="mt-9 space-y-5">
            {FEATURES.map((f) => (
              <li key={f.title} className="flex gap-4">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/10 text-white">
                  <f.icon className="h-5 w-5" />
                </span>
                <span>
                  <span className="block text-[14px] font-bold">{f.title}</span>
                  <span className="mt-0.5 block text-[12.5px] leading-relaxed text-white/65">{f.desc}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="relative z-10" />
      </div>

      {/* Right form panel */}
      <div className="flex items-center justify-center bg-white p-6 lg:p-12">
        <div className="w-full max-w-md">
          <div className="mb-8 flex items-center justify-between">
            <Link href="/" className="lg:hidden">
              <Logo />
            </Link>
            <div className="ml-auto inline-flex items-center gap-2 rounded-xl border border-line px-3 py-2">
              <Logo tagline={false} className="[&_span]:text-[15px]" />
            </div>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}

function ChartMotif() {
  return (
    <svg aria-hidden viewBox="0 0 500 320" className="pointer-events-none absolute bottom-0 right-0 h-[320px] w-[520px] opacity-70">
      {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
        <rect key={i} x={70 + i * 48} y={300 - (i + 1) * 26} width="26" height={(i + 1) * 26} rx="4" fill="url(#bar)" opacity={0.55} />
      ))}
      <path d="M60,290 C130,250 200,240 270,180 C330,130 400,90 470,60" fill="none" stroke="#3D7DEA" strokeWidth="3" />
      <path d="M450,55 L478,52 L466,80 Z" fill="#F5731A" />
      <defs>
        <linearGradient id="bar" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0%" stopColor="#1D5FD6" stopOpacity="0.2" />
          <stop offset="100%" stopColor="#3D7DEA" stopOpacity="0.9" />
        </linearGradient>
      </defs>
    </svg>
  );
}
