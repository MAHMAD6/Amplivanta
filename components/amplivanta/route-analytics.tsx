"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { track } from "@/lib/analytics-client";

/** Records a page_view event on every route change inside the app shell. */
export function RouteAnalytics() {
  const pathname = usePathname();
  useEffect(() => {
    track("page_view", { path: pathname });
  }, [pathname]);
  return null;
}
