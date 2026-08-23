import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { SuperShell } from "@/components/amplivanta/super-shell";

export default async function SuperLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  const role = (session?.user as { role?: string } | undefined)?.role;
  if (!session?.user && process.env.NODE_ENV !== "development") redirect("/login?next=/super");
  if (session?.user && role !== "SUPER_ADMIN" && process.env.NODE_ENV !== "development") redirect("/app");

  return <SuperShell>{children}</SuperShell>;
}
