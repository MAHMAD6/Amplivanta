"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Star } from "lucide-react";
import { toast } from "sonner";
import { reviewSchema, type ReviewInput } from "@/lib/validations/review";
import { cn } from "@/lib/utils";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";

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
      toast.success("Thank you! Your review is pending approval.");
      reset();
      setRating(5);
    } catch {
      toast.error("Something went wrong. Please try again.");
    }
  };

  return (
    <div className="mx-auto max-w-2xl rounded-2xl border border-[#E3E3E3] bg-white p-8">
      <h3 className="font-display text-2xl font-bold text-[#0A0A0A]">Submit Your Review</h3>
      <p className="mt-2 text-sm text-[#5A5A5A]">We&apos;d love to hear about your experience.</p>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <input
              {...register("name")}
              placeholder="Full Name"
              className="w-full rounded-xl border border-[#E3E3E3] bg-[#F4F4F4] px-4 py-3 text-sm focus:border-[#B5FF2D] focus:outline-none"
            />
            {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name.message}</p>}
          </div>
          <div>
            <input
              {...register("company")}
              placeholder="Company"
              className="w-full rounded-xl border border-[#E3E3E3] bg-[#F4F4F4] px-4 py-3 text-sm focus:border-[#B5FF2D] focus:outline-none"
            />
            {errors.company && <p className="mt-1 text-sm text-red-500">{errors.company.message}</p>}
          </div>
        </div>

        <div>
          <input
            {...register("role")}
            placeholder="Your Role"
            className="w-full rounded-xl border border-[#E3E3E3] bg-[#F4F4F4] px-4 py-3 text-sm focus:border-[#B5FF2D] focus:outline-none"
          />
          {errors.role && <p className="mt-1 text-sm text-red-500">{errors.role.message}</p>}
        </div>

        <div>
          <p className="mb-2 text-sm font-medium text-[#0A0A0A]">Rating</p>
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
                >
                  <Star
                    className={cn(
                      "h-7 w-7 transition",
                      (hover || rating) >= val ? "fill-[#B5FF2D] text-[#B5FF2D]" : "fill-none text-[#E3E3E3]"
                    )}
                  />
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <textarea
            {...register("content")}
            rows={4}
            placeholder="Your review..."
            className="w-full rounded-xl border border-[#E3E3E3] bg-[#F4F4F4] px-4 py-3 text-sm focus:border-[#B5FF2D] focus:outline-none"
          />
          {errors.content && <p className="mt-1 text-sm text-red-500">{errors.content.message}</p>}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center gap-2 rounded-full bg-[#B5FF2D] px-6 py-3 font-semibold text-black transition hover:bg-[#a0e828] disabled:opacity-60"
        >
          {isSubmitting && <LoadingSpinner className="text-black" />}
          Submit Review
        </button>
      </form>
    </div>
  );
}
