import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import type { ReactNode } from "react";

export function AppHeader({
  title,
  back = "/app",
  right,
}: {
  title: string;
  back?: string | null;
  right?: ReactNode;
}) {
  return (
    <header className="flex items-center justify-between px-5 pb-2 pt-5">
      {back ? (
        <Link
          href={back}
          aria-label="Back"
          className="flex h-9 w-9 items-center justify-center rounded-full text-[#14121f] transition hover:bg-[#f8f7fb]"
        >
          <ChevronLeft className="h-5 w-5" />
        </Link>
      ) : (
        <span className="h-9 w-9" />
      )}
      <h1 className="font-display text-lg font-extrabold tracking-tight text-[#14121f]">{title}</h1>
      <div className="flex h-9 w-9 items-center justify-center">{right}</div>
    </header>
  );
}
