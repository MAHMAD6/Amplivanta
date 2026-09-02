import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { SuperShell } from "@/components/super/super-shell";

export default async function SuperLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  const user = session?.user as { name?: string | null; email?: string | null; role?: string } | undefined;
  const role = user?.role;
  if (!session?.user && process.env.NODE_ENV !== "development") redirect("/login?next=/super");
  if (session?.user && role !== "SUPER_ADMIN" && process.env.NODE_ENV !== "development") redirect("/app");

  return (
    <SuperShell adminName={user?.name || "Super Admin"} adminEmail={user?.email || "Administrator"}>
      {children}
    </SuperShell>
  );
}
