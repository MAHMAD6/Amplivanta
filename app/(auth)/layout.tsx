import { Toaster } from "sonner";

/**
 * Auth pages (login, signup) each own their full-page bespoke layout, so this
 * group layout is a simple pass-through plus somewhere for toasts to land.
 */
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-white">
      {children}
      <Toaster position="top-right" richColors closeButton />
    </div>
  );
}
