"use client";

/** Fire-and-forget analytics event to the server aggregator. */
export function track(name: string, properties?: Record<string, unknown>): void {
  try {
    const body = JSON.stringify({ name, properties });
    if (typeof navigator !== "undefined" && navigator.sendBeacon) {
      navigator.sendBeacon("/api/analytics-events", new Blob([body], { type: "application/json" }));
    } else {
      void fetch("/api/analytics-events", { method: "POST", headers: { "content-type": "application/json" }, body, keepalive: true });
    }
  } catch {
    /* analytics must never break the app */
  }
}
