import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { AppShell } from "@/components/amplivanta/app-shell";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  // Authoritative server-side guard for the product app. The edge middleware
  // only does a fast cookie presence check; this verifies the real session.
  // Dev keeps the demo workspace open without login (mirrors the super layout).
  const session = await auth();
  if (!session?.user && process.env.NODE_ENV !== "development") {
    redirect("/login?next=/app");
  }

  return <AppShell>{children}</AppShell>;
}
