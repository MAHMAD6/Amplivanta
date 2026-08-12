import type { Metadata } from "next";
import { Star, Users, ThumbsUp } from "lucide-react";
import { ReviewsGrid } from "@/components/sections/reviews/ReviewsGrid";
import { CtaBanner } from "@/components/sections/home/CtaBanner";
import { getReviews } from "@/lib/data";

export const metadata: Metadata = {
  title: "Reviews",
  description: "See what our clients say about working with Amplivanta.",
};

export default async function ReviewsPage() {
  const reviews = await getReviews();
  const avg =
    reviews.length > 0
      ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
      : "5.0";

  const stats = [
    { value: `${avg}/5`, label: "Average Rating", icon: Star },
    { value: `${reviews.length}+`, label: "Happy Clients", icon: Users },
    { value: "100%", label: "Recommend Rate", icon: ThumbsUp },
  ];

  return (
    <>
      <section className="relative overflow-hidden bg-[#f8f7fb] px-4 pt-36 pb-20 sm:px-6 lg:px-8">
        {/* ambient glow */}
        <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute left-1/2 top-0 h-96 w-96 -translate-x-1/2 -translate-y-1/3 rounded-full bg-[#6D3BF5]/10 blur-[110px]" />
          <div className="absolute right-10 top-20 h-64 w-64 rounded-full bg-[#E8398F]/10 blur-[100px]" />
        </div>
        <div className="relative mx-auto max-w-4xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-[#e3d9fb] bg-[#faf7ff] px-3 py-[7px] text-[12.5px] font-bold uppercase tracking-[0.02em] text-[#6D3BF5]">
            <span className="bg-grad-brand-2 h-3 w-3 rounded-full" />
            Testimonials
          </span>
          <h1 className="mt-5 font-display text-4xl font-extrabold tracking-tight text-[#14121f] md:text-6xl">
            Loved by <span className="text-gradient">Our Clients</span>
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-lg text-[#767287]">
            Real results, real words. See why teams choose to build and grow with us.
          </p>
          <div className="mt-5 flex items-center justify-center gap-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} className="h-5 w-5 fill-amber-400 text-amber-400" />
            ))}
            <span className="ml-2 text-sm font-semibold text-[#4a4756]">{avg} average</span>
          </div>

          <div className="mt-12 grid gap-4 sm:grid-cols-3">
            {stats.map((s) => {
              const Icon = s.icon;
              return (
                <div
                  key={s.label}
                  className="group rounded-2xl border border-[#e9e7f0] bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-[#e3ddf5] hover:shadow-[0_16px_34px_-18px_rgba(30,20,60,0.25)]"
                >
                  <div className="ic-violet mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-full transition group-hover:scale-105">
                    <Icon className="h-5 w-5 text-white" />
                  </div>
                  <p className="font-display text-3xl font-extrabold text-[#14121f]">{s.value}</p>
                  <p className="mt-1 text-sm text-[#767287]">{s.label}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <ReviewsGrid reviews={reviews} />



      <CtaBanner />
    </>
  );
}
