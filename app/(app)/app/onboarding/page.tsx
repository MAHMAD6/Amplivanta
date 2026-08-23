import type { Metadata } from "next";
import { OnboardingClient } from "@/components/amplivanta/onboarding-client";

export const metadata: Metadata = { title: "Onboarding — Amplivanta" };

export default function OnboardingPage() {
  return (
    <div className="mx-auto max-w-[1300px]">
      <OnboardingClient />
    </div>
  );
}
