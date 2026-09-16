/**
 * Next.js calls register() once when the server process boots. We use it to
 * fail fast on invalid environment configuration in production.
 */
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { assertEnv } = await import("@/lib/env");
    assertEnv();
    // Marketing Automation scheduler: resumes delayed workflow runs, sends
    // scheduled emails and publishes scheduled pages once a minute, so no
    // external cron is required. Set MARKETING_SCHEDULER=off to disable.
    const g = globalThis as { __marketingTick?: boolean };
    if (process.env.MARKETING_SCHEDULER !== "off" && !g.__marketingTick) {
      g.__marketingTick = true;
      let busy = false;
      setInterval(async () => {
        if (busy) return;
        busy = true;
        try {
          const { marketingTick } = await import("@/lib/server/marketing-runtime");
          await marketingTick();
        } catch {
          /* database unavailable; retry next minute */
        } finally {
          busy = false;
        }
      }, 60_000).unref();
    }
  }
}
