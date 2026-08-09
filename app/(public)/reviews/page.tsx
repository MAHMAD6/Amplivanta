import type { Metadata } from "next";
import { ReviewsGrid } from "@/components/sections/reviews/ReviewsGrid";
import { SubmitReviewForm } from "@/components/sections/reviews/SubmitReviewForm";
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
    { value: `${avg}/5`, label: "Average Rating" },
    { value: `${reviews.length}+`, label: "Happy Clients" },
    { value: "100%", label: "Recommend Rate" },
  ];

  return (
    <>
      <section className="bg-[#1A3C2B] px-4 pt-36 pb-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <span className="inline-block rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-widest text-[#B5FF2D]">
            Testimonials
          </span>
          <h1 className="mt-4 font-display text-4xl font-bold text-white md:text-6xl">
            Loved by <span className="text-[#B5FF2D]">Our Clients</span>
          </h1>
          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            {stats.map((s) => (
              <div key={s.label} className="rounded-2xl border border-white/10 bg-white/5 p-6">
                <p className="font-mono text-3xl font-bold text-[#B5FF2D]">{s.value}</p>
                <p className="mt-1 text-sm text-white/70">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <ReviewsGrid reviews={reviews} />

      <section className="bg-[#F4F4F4] px-4 py-20 sm:px-6 lg:px-8">
        <SubmitReviewForm />
      </section>

      <CtaBanner />
    </>
  );
}
