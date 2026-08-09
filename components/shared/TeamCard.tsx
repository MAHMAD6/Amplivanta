import Image from "next/image";
import { Linkedin, Twitter } from "lucide-react";

interface TeamCardProps {
  name: string;
  role: string;
  bio?: string | null;
  image?: string | null;
  linkedin?: string | null;
  twitter?: string | null;
}

export function TeamCard({ name, role, bio, image, linkedin, twitter }: TeamCardProps) {
  return (
    <div className="group overflow-hidden rounded-2xl border border-[#E3E3E3] bg-white transition-shadow hover:shadow-xl">
      <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-[#1A3C2B] to-[#0F2A1D]">
        {image ? (
          <Image
            src={image}
            alt={name}
            fill
            sizes="(max-width: 768px) 100vw, 25vw"
            className="object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <span className="font-display text-5xl font-bold text-[#B5FF2D]/80">{name.charAt(0)}</span>
          </div>
        )}
        <div className="absolute inset-x-0 bottom-0 flex translate-y-full gap-3 bg-black/40 p-3 backdrop-blur-sm transition-transform group-hover:translate-y-0">
          {linkedin && (
            <a href={linkedin} target="_blank" rel="noopener noreferrer" aria-label={`${name} on LinkedIn`}>
              <Linkedin className="h-5 w-5 text-white hover:text-[#B5FF2D]" />
            </a>
          )}
          {twitter && (
            <a href={twitter} target="_blank" rel="noopener noreferrer" aria-label={`${name} on Twitter`}>
              <Twitter className="h-5 w-5 text-white hover:text-[#B5FF2D]" />
            </a>
          )}
        </div>
      </div>
      <div className="p-5">
        <h3 className="font-display text-lg font-bold text-[#0A0A0A]">{name}</h3>
        <p className="text-sm font-medium text-[#B5FF2D]">{role}</p>
        {bio && <p className="mt-2 text-sm text-[#5A5A5A]">{bio}</p>}
      </div>
    </div>
  );
}
