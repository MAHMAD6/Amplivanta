"use client";

import { useState } from "react";
import { ImageOff, Maximize2, X } from "lucide-react";
import { cn } from "@/lib/utils";

export type GalleryImage = { src: string; alt: string };

/**
 * Listing gallery: primary image with a thumbnail rail.
 *
 * A product with no images renders an explicit placeholder rather than a
 * decorative one, so a seller can see that images are still missing.
 */
export function ProductGallery({ images, title }: { images: GalleryImage[]; title: string }) {
  const [active, setActive] = useState(0);
  const [expanded, setExpanded] = useState(false);

  if (images.length === 0) {
    return (
      <div className="flex aspect-[4/3] w-full items-center justify-center rounded-2xl border border-line bg-bg-soft">
        <div className="text-center">
          <ImageOff aria-hidden className="mx-auto h-7 w-7 text-ink-muted" />
          <p className="mt-2 text-[12.5px] font-semibold text-ink-muted">No images uploaded</p>
        </div>
      </div>
    );
  }

  const current = images[Math.min(active, images.length - 1)];

  return (
    <>
      <div className="flex gap-3">
        {images.length > 1 && (
          <div
            role="tablist"
            aria-label={`${title} images`}
            className="flex w-[76px] shrink-0 flex-col gap-2.5"
          >
            {images.map((img, i) => (
              <button
                key={`${img.src}-${i}`}
                role="tab"
                type="button"
                aria-selected={i === active}
                aria-label={`Image ${i + 1} of ${images.length}`}
                onClick={() => setActive(i)}
                className={cn(
                  "aspect-square overflow-hidden rounded-xl border-2 bg-white transition",
                  i === active ? "border-royal-blue" : "border-line hover:border-royal-blue/40",
                )}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={img.src} alt="" className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
        )}

        <div className="relative min-w-0 flex-1">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={current.src}
            alt={current.alt || title}
            className="aspect-[4/3] w-full rounded-2xl border border-line bg-white object-contain"
          />
          <button
            type="button"
            onClick={() => setExpanded(true)}
            aria-label="Expand image"
            className="absolute right-3 top-3 rounded-full border border-line bg-white/95 p-2 text-ink-soft shadow-card transition hover:text-royal-blue"
          >
            <Maximize2 aria-hidden className="h-4 w-4" />
          </button>
        </div>
      </div>

      {expanded && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`${title} — enlarged image`}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-6"
          onClick={() => setExpanded(false)}
        >
          <button
            type="button"
            aria-label="Close"
            onClick={() => setExpanded(false)}
            className="absolute right-6 top-6 rounded-full bg-white p-2.5 text-deep-navy shadow-card"
          >
            <X aria-hidden className="h-5 w-5" />
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={current.src}
            alt={current.alt || title}
            className="max-h-full max-w-full rounded-xl bg-white object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </>
  );
}
