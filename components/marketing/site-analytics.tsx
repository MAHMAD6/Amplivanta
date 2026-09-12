"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import type { SiteEvent } from "@/lib/site-events";

/** Fire-and-forget public-site event. Never throws, never blocks navigation. */
export function trackSite(name: SiteEvent, path = typeof window !== "undefined" ? window.location.pathname : "") {
  try {
    const body = JSON.stringify({ name, path });
    if (navigator.sendBeacon) navigator.sendBeacon("/api/site-events", new Blob([body], { type: "application/json" }));
    else void fetch("/api/site-events", { method: "POST", body, keepalive: true });
  } catch {
    /* ignore */
  }
}

const CTA_PATHS = ["/signup", "/book-demo", "/contact", "/marketplace/sell", "/pricing"];

/**
 * Counts page views and a few meaningful interactions on the public site:
 * primary CTA clicks, search submissions, outbound links, and any element
 * marked `data-track="<event>"`. Mounted once in the marketing layout.
 */
export function SiteAnalytics() {
  const pathname = usePathname();

  useEffect(() => {
    trackSite("page_view", pathname);
  }, [pathname]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const el = (e.target as HTMLElement | null)?.closest<HTMLElement>("a,button,[data-track]");
      if (!el) return;
      const explicit = el.dataset.track;
      if (explicit) return trackSite(explicit as SiteEvent);
      if (el instanceof HTMLAnchorElement) {
        const url = new URL(el.href, window.location.href);
        if (url.origin !== window.location.origin) return trackSite("outbound_click");
        if (CTA_PATHS.some((p) => url.pathname === p || url.pathname.startsWith(`${p}?`))) trackSite("cta_click");
      }
    };
    const onSubmit = (e: SubmitEvent) => {
      const form = e.target as HTMLFormElement | null;
      if (form?.getAttribute("role") === "search") trackSite("search_submitted");
    };
    document.addEventListener("click", onClick, { capture: true });
    document.addEventListener("submit", onSubmit, { capture: true });
    return () => {
      document.removeEventListener("click", onClick, { capture: true });
      document.removeEventListener("submit", onSubmit, { capture: true });
    };
  }, []);

  return null;
}
