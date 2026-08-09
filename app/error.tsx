"use client";

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-white px-4 text-center">
      <p className="font-mono text-6xl font-bold text-[#B5FF2D]">Oops</p>
      <h1 className="mt-4 font-display text-3xl font-bold text-[#0A0A0A]">Something went wrong</h1>
      <p className="mt-2 text-[#5A5A5A]">An unexpected error occurred. Please try again.</p>
      <button
        onClick={reset}
        className="mt-8 rounded-full bg-[#0A0A0A] px-6 py-3 font-semibold text-white transition hover:bg-[#1A1A1A]"
      >
        Try Again
      </button>
    </div>
  );
}
