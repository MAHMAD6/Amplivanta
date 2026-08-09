import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-white px-4 text-center">
      <p className="font-mono text-7xl font-bold text-[#B5FF2D]">404</p>
      <h1 className="mt-4 font-display text-3xl font-bold text-[#0A0A0A]">Page not found</h1>
      <p className="mt-2 text-[#5A5A5A]">The page you&apos;re looking for doesn&apos;t exist or has moved.</p>
      <Link
        href="/"
        className="mt-8 rounded-full bg-[#0A0A0A] px-6 py-3 font-semibold text-white transition hover:bg-[#1A1A1A]"
      >
        Back to Home
      </Link>
    </div>
  );
}
