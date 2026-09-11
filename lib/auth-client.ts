"use client";

import { signIn as nextAuthSignIn, signOut as nextAuthSignOut, useSession as nextAuthUseSession } from "next-auth/react";

export const authClient = {
  signIn: {
    email: async ({ email, password }: { email: string; password: string }) => {
      try {
        const res = await nextAuthSignIn("credentials", {
          email,
          password,
          redirect: false,
        });
        if (res?.error) {
          return { error: { message: "Invalid email or password." } };
        }
        return { data: res, error: null };
      } catch (err: unknown) {
        return { error: { message: err instanceof Error ? err.message : "Authentication failed." } };
      }
    },
  },
  signUp: {
    email: async ({
      name,
      email,
      password,
      turnstileToken,
    }: {
      name: string;
      email: string;
      password: string;
      /** Cloudflare Turnstile token, when the challenge is enabled. */
      turnstileToken?: string;
    }) => {
      try {
        const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, email, password, "cf-turnstile-response": turnstileToken }),
        });
        const data = await res.json();
        if (!res.ok) {
          return { error: { message: data.error || "Registration failed." } };
        }
        // Automatically sign in after registration
        const signInRes = await nextAuthSignIn("credentials", {
          email,
          password,
          redirect: false,
        });
        if (signInRes?.error) {
          return { error: { message: "Account created, but automatic login failed. Please sign in." } };
        }
        return { data, error: null };
      } catch (err: unknown) {
        return { error: { message: err instanceof Error ? err.message : "Registration failed." } };
      }
    },
  },
  signOut: async () => {
    return nextAuthSignOut({ callbackUrl: "/login" });
  },
  useSession: () => {
    return nextAuthUseSession();
  },
};

export const { signIn, signUp, signOut, useSession } = authClient;
