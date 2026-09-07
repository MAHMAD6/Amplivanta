"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { GradientButton } from "./brand-gradient";

export function SignupForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const fd = new FormData(e.currentTarget);
    const workspaceName = String(fd.get("workspaceName") || "");
    const { error: authError } = await authClient.signUp.email({
      name: String(fd.get("name")),
      email: String(fd.get("email")),
      password: String(fd.get("password")),
    });
    if (authError) {
      setLoading(false);
      setError(authError.message || "Signup failed");
      return;
    }
    // Name the auto-provisioned workspace from the form, then land in the app.
    if (workspaceName) {
      await fetch("/api/workspace", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name: workspaceName }),
      }).catch(() => {});
    }
    setLoading(false);
    router.push("/app");
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-ink">Full name</label>
          <input name="name" required className="w-full rounded-lg border border-line bg-white px-3 py-2.5 text-sm focus:border-violet focus:outline-none focus:ring-2 focus:ring-violet/20" />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-ink">Workspace</label>
          <input name="workspaceName" required placeholder="Acme Inc." className="w-full rounded-lg border border-line bg-white px-3 py-2.5 text-sm focus:border-violet focus:outline-none focus:ring-2 focus:ring-violet/20" />
        </div>
      </div>

      <div>
        <label className="mb-1.5 block text-xs font-semibold text-ink">Work email</label>
        <input name="email" type="email" required autoComplete="email" className="w-full rounded-lg border border-line bg-white px-3 py-2.5 text-sm focus:border-violet focus:outline-none focus:ring-2 focus:ring-violet/20" />
      </div>

      <div>
        <label className="mb-1.5 block text-xs font-semibold text-ink">Password</label>
        <input name="password" type="password" required minLength={8} autoComplete="new-password" className="w-full rounded-lg border border-line bg-white px-3 py-2.5 text-sm focus:border-violet focus:outline-none focus:ring-2 focus:ring-violet/20" />
        <p className="mt-1 text-[11px] text-ink-muted">8+ characters. Use a strong, unique password.</p>
      </div>

      <label className="flex items-start gap-2 text-xs text-ink-soft">
        <input type="checkbox" required className="mt-0.5 h-4 w-4 rounded border-line accent-violet" />
        <span>
          I agree to the{" "}
          <Link href="/legal/terms" className="font-semibold text-violet hover:underline">Terms</Link> and{" "}
          <Link href="/legal/privacy" className="font-semibold text-violet hover:underline">Privacy Policy</Link>.
        </span>
      </label>

      <GradientButton as="button" size="lg" className="w-full">
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create workspace"}
      </GradientButton>
    </form>
  );
}
