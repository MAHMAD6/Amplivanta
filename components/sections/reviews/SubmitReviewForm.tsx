"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Star, ShieldCheck, Sparkles, Clock } from "lucide-react";
import { toast } from "@/lib/toast";
import { reviewSchema, type ReviewInput } from "@/lib/validations/review";
import { cn } from "@/lib/utils";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";

const RATING_LABELS = ["Poor", "Fair", "Good", "Great", "Excellent"];

const PERKS = [
  { icon: Sparkles, text: "Featured on our homepage" },
  { icon: ShieldCheck, text: "Verified & spam-protected" },
  { icon: Clock, text: "Reviewed within 24 hours" },
];

export function SubmitReviewForm() {
  const [rating, setRating] = useState(5);
  const [hover, setHover] = useState(0);
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ReviewInput>({
    resolver: zodResolver(reviewSchema),
    defaultValues: { rating: 5 },
  });

  const onSubmit = async (data: ReviewInput) => {
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, rating }),
      });
      if (!res.ok) throw new Error();
      toast.success("Review Submitted", {
        description: "Thank you! Your testimonial has been submitted for moderation.",
      });
      reset();
      setRating(5);
    } catch {
      toast.error("Submission Failed", {
        description: "Something went wrong while submitting your review. Please try again.",
      });
    }
  };

  return (
    <div className="mx-auto grid max-w-5xl overflow-hidden rounded-3xl border border-[#e9e7f0] bg-white shadow-[0_24px_60px_-30px_rgba(30, 20, 60,0.35)] md:grid-cols-[0.85fr_1fr]">
      {/* intro panel */}
      <div className="relative overflow-hidden bg-[#0d0b18] p-8 lg:p-10">
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-10 -left-10 h-56 w-56 rounded-full bg-[#6D3BF5]/15 blur-3xl"
        />
        <div className="relative">
          <span className="inline-block rounded-full border border-[#6D3BF5]/30 bg-[#6D3BF5]/10 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-[#6D3BF5]">
            Share Feedback
          </span>
          <h3 className="mt-5 font-display text-3xl font-bold text-white">
            Worked with us? <span className="text-[#6D3BF5]">Tell the world.</span>
          </h3>
          <p className="mt-3 text-sm leading-relaxed text-white/70">
            Your words help other teams decide with confidence. Takes under a minute.
          </p>
          <ul className="mt-8 space-y-4">
            {PERKS.map((p) => {
              const Icon = p.icon;
              return (
                <li key={p.text} className="flex items-center gap-3 text-sm text-white/80">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#6D3BF5]/15 text-[#6D3BF5]">
                    <Icon className="h-4 w-4" />
                  </span>
                  {p.text}
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      {/* form panel */}
      <div className="p-8 lg:p-10">
        <h3 className="font-display text-2xl font-bold text-[#14121f]">Submit Your Review</h3>
        <p className="mt-2 text-sm text-[#4a4756]">We&apos;d love to hear about your experience.</p>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <input
              {...register("name")}
              placeholder="Full Name"
              className="w-full rounded-xl border border-[#e9e7f0] bg-[#f8f7fb] px-4 py-3 text-sm focus:border-[#6D3BF5] focus:outline-none"
            />
            {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name.message}</p>}
          </div>
          <div>
            <input
              {...register("company")}
              placeholder="Company"
              className="w-full rounded-xl border border-[#e9e7f0] bg-[#f8f7fb] px-4 py-3 text-sm focus:border-[#6D3BF5] focus:outline-none"
            />
            {errors.company && <p className="mt-1 text-sm text-red-500">{errors.company.message}</p>}
          </div>
        </div>

        <div>
          <input
            {...register("role")}
            placeholder="Your Role"
            className="w-full rounded-xl border border-[#e9e7f0] bg-[#f8f7fb] px-4 py-3 text-sm focus:border-[#6D3BF5] focus:outline-none"
          />
          {errors.role && <p className="mt-1 text-sm text-red-500">{errors.role.message}</p>}
        </div>

        <div className="flex items-center justify-between rounded-xl border border-[#e9e7f0] bg-[#f8f7fb] px-4 py-3">
          <p className="text-sm font-medium text-[#14121f]">Rating</p>
          <div className="flex items-center gap-2">
            <span className="w-16 text-right text-xs font-medium text-[#4a4756]">
              {RATING_LABELS[(hover || rating) - 1]}
            </span>
            <div className="flex gap-1">
            {Array.from({ length: 5 }).map((_, i) => {
              const val = i + 1;
              return (
                <button
                  key={val}
                  type="button"
                  onClick={() => {
                    setRating(val);
                    setValue("rating", val);
                  }}
                  onMouseEnter={() => setHover(val)}
                  onMouseLeave={() => setHover(0)}
                  aria-label={`${val} stars`}
                  className="transition hover:scale-110"
                >
                  <Star
                    className={cn(
                      "h-7 w-7 transition",
                      (hover || rating) >= val ? "fill-[#6D3BF5] text-[#6D3BF5]" : "fill-none text-[#e9e7f0]"
                    )}
                  />
                </button>
              );
            })}
            </div>
          </div>
        </div>

        <div>
          <textarea
            {...register("content")}
            rows={4}
            placeholder="Your review..."
            className="w-full rounded-xl border border-[#e9e7f0] bg-[#f8f7fb] px-4 py-3 text-sm focus:border-[#6D3BF5] focus:outline-none"
          />
          {errors.content && <p className="mt-1 text-sm text-red-500">{errors.content.message}</p>}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#6D3BF5] px-6 py-3 font-semibold text-white transition hover:bg-[#5B2FE0] disabled:opacity-60 sm:w-auto"
        >
          {isSubmitting && <LoadingSpinner className="text-black" />}
          Submit Review
        </button>
        </form>
      </div>
    </div>
  );
}
