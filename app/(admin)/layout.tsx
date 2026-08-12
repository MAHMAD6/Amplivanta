import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { AdminLayoutClient } from "@/components/layout/AdminLayoutClient";
import { Toaster } from "sonner";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const user = session.user as { name?: string | null; role?: string };

  return (
    <>
      <AdminLayoutClient userName={user.name ?? "Admin"} userRole={user.role ?? "ADMIN"}>
        {children}
      </AdminLayoutClient>
      <Toaster position="top-right" theme="dark" closeButton gap={12} expand={false} />
    </>
  );
}
