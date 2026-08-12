import { LogoMark } from "@/components/layout/LogoMark";
import { SITE_SHORT } from "@/lib/constants";

export default function Loading() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="flex flex-col items-center gap-6">
        <div className="flex items-center gap-3">
          <LogoMark className="h-10 w-10" />
          <span className="font-display text-2xl font-bold tracking-tight text-[#14121f]">
            {SITE_SHORT}
          </span>
        </div>
        <div className="w-48 h-[3px] rounded-full bg-[#e9e7f0] overflow-hidden">
          <div className="h-full w-full rounded-full bg-[#0d0b18] origin-left animate-[loading-bar_1.2s_ease-in-out_infinite]" />
        </div>
        <style>{`
          @keyframes loading-bar {
            0% { transform: scaleX(0); transform-origin: left; }
            50% { transform: scaleX(1); transform-origin: left; }
            50.1% { transform: scaleX(1); transform-origin: right; }
            100% { transform: scaleX(0); transform-origin: right; }
          }
        `}</style>
      </div>
    </div>
  );
}
