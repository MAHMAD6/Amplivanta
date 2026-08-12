"use client";

import { useState } from "react";
import { Link2, Check, Share2 } from "lucide-react";
import { toast } from "@/lib/toast";

export function ShareArticleButtons({ title }: { title: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopyLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      toast.copied("Article link copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-2">
      <button
        onClick={handleCopyLink}
        className="flex w-full items-center justify-between rounded-xl border border-[#e9e7f0] bg-[#f8f7fb] px-3.5 py-2 text-xs font-semibold text-[#14121f] transition hover:border-[#0d0b18] hover:bg-white"
      >
        <span className="flex items-center gap-2">
          {copied ? <Check className="h-3.5 w-3.5 text-[#0d0b18]" /> : <Link2 className="h-3.5 w-3.5 text-[#4a4756]" />}
          {copied ? "Link Copied!" : "Copy Article Link"}
        </span>
        <Share2 className="h-3.5 w-3.5 text-[#767287]" />
      </button>

      <div className="flex items-center gap-3 pt-1 text-xs">
        <a
          href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}`}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => toast.info("Opening Twitter / X share...")}
          className="font-medium text-[#4a4756] hover:text-[#14121f] transition"
        >
          Share on Twitter
        </a>
        <span className="text-[#e9e7f0]">•</span>
        <a
          href="https://www.linkedin.com/sharing/share-offsite/"
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => toast.info("Opening LinkedIn share...")}
          className="font-medium text-[#4a4756] hover:text-[#14121f] transition"
        >
          Share on LinkedIn
        </a>
      </div>
    </div>
  );
}
