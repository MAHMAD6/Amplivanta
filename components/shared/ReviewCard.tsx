import Image from "next/image";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface ReviewCardProps {
  name: string;
  company: string;
  role: string;
  content: string;
  rating: number;
  avatar?: string | null;
  className?: string;
}

export function ReviewCard({
  name,
  company,
  role,
  content,
  rating,
  avatar,
  className,
}: ReviewCardProps) {
  return (
    <div className={cn("flex h-full flex-col rounded-2xl border border-[#e9e7f0] bg-white p-6", className)}>
      <div className="mb-4 flex gap-1">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            className={cn(
              "h-4 w-4",
              i < rating ? "fill-amber-400 text-amber-400" : "fill-[#e9e7f0] text-[#e9e7f0]"
            )}
          />
        ))}
      </div>
      <p className="flex-1 italic text-[#4a4756]">&ldquo;{content}&rdquo;</p>
      <div className="mt-6 flex items-center gap-3">
        {avatar ? (
          <Image
            src={avatar}
            alt={name}
            width={40}
            height={40}
            className="h-10 w-10 rounded-full object-cover"
          />
        ) : (
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#0d0b18] text-sm font-bold text-[#6D3BF5]">
            {name.charAt(0)}
          </div>
        )}
        <div>
          <p className="text-sm font-semibold text-[#14121f]">{name}</p>
          <p className="text-xs text-[#4a4756]">
            {role}, {company}
          </p>
        </div>
      </div>
    </div>
  );
}
