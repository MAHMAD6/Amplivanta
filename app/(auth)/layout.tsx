/**
 * Auth pages (login, signup) each own their full-page bespoke layout, so this
 * group layout is a simple pass-through.
 */
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen bg-white">{children}</div>;
}
