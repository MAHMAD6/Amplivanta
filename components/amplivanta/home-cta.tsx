import Link from "next/link";

/** Stylized summit graphic used at the left of the closing CTA band. */
function SummitMark() {
  return (
    <svg viewBox="0 0 120 70" className="h-16 w-28 shrink-0" aria-hidden>
      <path d="M4,62 L34,20 L52,44 L66,26 L98,62 Z" fill="#1D5FD6" opacity="0.85" />
      <path d="M34,20 L44,34 L30,38 Z" fill="#ffffff" opacity="0.9" />
      <path d="M66,26 L74,36 L60,38 Z" fill="#ffffff" opacity="0.75" />
      <path d="M54,62 L84,24 L116,62 Z" fill="#F26522" opacity="0.9" />
      <path d="M84,24 L92,36 L78,38 Z" fill="#ffffff" opacity="0.9" />
    </svg>
  );
}

export function HomeCTA() {
  return (
    <section className="bg-white pb-10 pt-2">
      <div className="mx-auto max-w-[1280px] px-4 lg:px-8">
        <div className="flex flex-col items-center gap-6 rounded-2xl bg-deep-navy px-6 py-7 text-white lg:flex-row lg:justify-between lg:px-10">
          <div className="flex items-center gap-5">
            <SummitMark />
            <div className="text-center lg:text-left">
              <h2 className="font-display text-[22px] font-extrabold leading-tight lg:text-[24px]">
                Unlock Your Next Growth Opportunity
              </h2>
              <p className="mt-1 text-[13.5px] text-white/65">
                You&apos;re one step closer to what&apos;s next.
              </p>
            </div>
          </div>

          <div className="flex w-full flex-wrap items-center justify-center gap-3 sm:w-auto">
            <Link
              href="/signup"
              className="inline-flex h-12 w-full items-center justify-center rounded-lg bg-orange-cta px-6 text-sm font-semibold text-white transition hover:bg-orange-cta-hover sm:w-auto"
            >
              Start Engineering Growth
            </Link>
            <Link
              href="/demo"
              className="inline-flex h-12 w-full items-center justify-center rounded-lg border border-white/40 px-6 text-sm font-semibold text-white transition hover:bg-white/10 sm:w-auto"
            >
              Book a Demo
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
