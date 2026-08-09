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
    <div className={cn("flex h-full flex-col rounded-2xl border border-[#E3E3E3] bg-white p-6", className)}>
      <div className="mb-4 flex gap-1">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            className={cn(
              "h-4 w-4",
              i < rating ? "fill-[#B5FF2D] text-[#B5FF2D]" : "fill-none text-[#E3E3E3]"
            )}
          />
        ))}
      </div>
      <p className="flex-1 italic text-[#5A5A5A]">&ldquo;{content}&rdquo;</p>
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
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1A3C2B] text-sm font-bold text-[#B5FF2D]">
            {name.charAt(0)}
          </div>
        )}
        <div>
          <p className="text-sm font-semibold text-[#0A0A0A]">{name}</p>
          <p className="text-xs text-[#5A5A5A]">
            {role}, {company}
          </p>
        </div>
      </div>
    </div>
  );
}
