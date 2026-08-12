"use client";

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  console.error("App Error Boundary Caught:", error);
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-white px-4 text-center">
      <p className="font-mono text-6xl font-bold text-lime-ink">Oops</p>
      <h1 className="mt-4 font-display text-3xl font-bold text-[#14121f]">Something went wrong</h1>
      <p className="mt-2 text-[#4a4756]">An unexpected error occurred. Please try again.</p>
      <button
        onClick={reset}
        className="mt-8 rounded-full bg-[#14121f] px-6 py-3 font-semibold text-white transition hover:bg-[#26233a]"
      >
        Try Again
      </button>
    </div>
  );
}
