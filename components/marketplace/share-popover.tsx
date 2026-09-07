"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Facebook, Link2, Linkedin, Share2, X } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Share a product.
 *
 * The URL shared is always the PUBLIC product page, never the signed-in
 * `/app` route — a recipient without an account would otherwise land on a
 * login redirect instead of the listing.
 */
export function SharePopover({
  url,
  title,
  className,
}: {
  url: string;
  title: string;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const encodedUrl = encodeURIComponent(url);
  const encodedText = encodeURIComponent(title);

  const targets = [
    { label: "Facebook", icon: Facebook, href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}` },
    { label: "LinkedIn", icon: Linkedin, href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}` },
    { label: "X (Twitter)", icon: XIcon, href: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedText}` },
    { label: "WhatsApp", icon: WhatsAppIcon, href: `https://wa.me/?text=${encodedText}%20${encodedUrl}` },
  ];

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard access can be refused (insecure context, permission policy).
      // Select the text instead so the reader can copy it themselves.
      const input = ref.current?.querySelector<HTMLInputElement>("input[data-share-url]");
      input?.select();
    }
  };

  return (
    <div ref={ref} className={cn("relative", className)}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="dialog"
        className="inline-flex h-12 items-center gap-2 rounded-xl border border-line bg-white px-4 text-[13.5px] font-bold text-deep-navy transition hover:bg-bg-soft"
      >
        <Share2 aria-hidden className="h-4 w-4" /> Share
      </button>

      {open && (
        <div
          role="dialog"
          aria-label={`Share ${title}`}
          className="absolute left-0 top-full z-30 mt-2 w-[268px] rounded-2xl border border-line bg-white p-4 shadow-card-lg"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-[13.5px] font-extrabold text-deep-navy">Share this product</h3>
            <button type="button" aria-label="Close" onClick={() => setOpen(false)} className="text-ink-muted hover:text-deep-navy">
              <X aria-hidden className="h-4 w-4" />
            </button>
          </div>

          <ul className="mt-3 space-y-1">
            {targets.map((t) => (
              <li key={t.label}>
                <a
                  href={t.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 rounded-xl px-2.5 py-2.5 text-[13px] font-semibold text-deep-navy transition hover:bg-bg-soft"
                >
                  <t.icon aria-hidden className="h-4 w-4 text-royal-blue" />
                  {t.label}
                </a>
              </li>
            ))}
            <li>
              <button
                type="button"
                onClick={copy}
                className="flex w-full items-center gap-3 rounded-xl px-2.5 py-2.5 text-[13px] font-semibold text-deep-navy transition hover:bg-bg-soft"
              >
                {copied ? (
                  <Check aria-hidden className="h-4 w-4 text-emerald-600" />
                ) : (
                  <Link2 aria-hidden className="h-4 w-4 text-royal-blue" />
                )}
                {copied ? "Link copied" : "Copy link"}
              </button>
            </li>
          </ul>

          <label className="mt-2 block">
            <span className="sr-only">Product link</span>
            <input
              data-share-url
              readOnly
              value={url}
              onFocus={(e) => e.currentTarget.select()}
              className="w-full rounded-lg border border-line bg-bg-soft px-2.5 py-2 text-[11.5px] text-ink-muted"
            />
          </label>
        </div>
      )}
    </div>
  );
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={className} fill="currentColor">
      <path d="M18.9 2H22l-7.5 8.6L23.3 22h-6.9l-5.4-7-6.2 7H1.7l8-9.2L.9 2h7l4.9 6.5L18.9 2Zm-1.2 18h1.9L7.4 4H5.4l12.3 16Z" />
    </svg>
  );
}

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={className} fill="currentColor">
      <path d="M12 2a10 10 0 0 0-8.6 15L2 22l5.2-1.4A10 10 0 1 0 12 2Zm0 18a8 8 0 0 1-4.1-1.1l-.3-.2-3 .8.8-2.9-.2-.3A8 8 0 1 1 12 20Zm4.4-5.8c-.2-.1-1.4-.7-1.6-.8s-.4-.1-.5.1l-.7.9c-.1.2-.3.2-.5.1a6.6 6.6 0 0 1-3.2-2.8c-.2-.4.2-.4.6-1.2.1-.1 0-.3 0-.4l-.7-1.7c-.2-.4-.4-.4-.5-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.7 11.8 11.8 0 0 0 4.5 4c2.1.8 2.1.5 2.5.5a2.7 2.7 0 0 0 1.8-1.3 2.2 2.2 0 0 0 .2-1.3c-.1-.1-.2-.2-.4-.3Z" />
    </svg>
  );
}
