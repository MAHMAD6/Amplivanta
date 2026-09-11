import type { Metadata } from "next";
import Link from "next/link";
import { btn, btnPrimary } from "@/components/marketing/site-buttons";
import { Crumb, Hero, InfoCard, Note, Panel, Section, Split } from "@/components/marketing/site-ui";

export const metadata: Metadata = {
  title: "Your Privacy Choices",
  description: "The choices you have over how Amplivanta handles your personal data, and how to exercise them.",
};

export default function PrivacyChoicesPage() {
  return (
    <>
      <Crumb items={["Home", "Your Privacy Choices"]} />
      <Hero
        eyebrow="PRIVACY"
        title="Your privacy choices."
        lead="You can ask what personal data Amplivanta holds about you, request a copy, ask for corrections, or ask for deletion. This page explains each choice and how to make the request."
        actions={
          <>
            <Link className={btnPrimary} href="/contact">Make a request</Link>
            <Link className={btn} href="/legal/privacy">Read the Privacy Policy</Link>
          </>
        }
      />

      <Section>
        <Split>
          <InfoCard title="Choices available to you">
            <ul>
              <li>Ask what personal data is held about you and why.</li>
              <li>Request a copy of that data in a portable format.</li>
              <li>Ask for inaccurate data to be corrected.</li>
              <li>Ask for data to be deleted, where no legal obligation requires keeping it.</li>
              <li>Object to, or restrict, particular processing.</li>
              <li>Withdraw consent where processing relies on it.</li>
            </ul>
          </InfoCard>
          <InfoCard title="Cookies and analytics">
            Analytics cookies are opt-in and can be declined without affecting how the product works.
            Strictly necessary cookies handle authentication and session management and cannot be
            switched off. See the{" "}
            <Link href="/legal/cookies" className="font-semibold text-site-purple hover:underline">
              Cookie Policy
            </Link>{" "}
            for the full list.
          </InfoCard>
        </Split>
      </Section>

      <Panel>
        <InfoCard title="How to make a request">
          Send the request through the contact form, stating which choice you are exercising and the
          email address associated with your account. Requests are handled through the data-request
          process described in the Privacy Policy.
        </InfoCard>
        <Note>
          No response-time commitment is published here. The applicable statutory deadline depends on
          your jurisdiction and is described in the Privacy Policy.
        </Note>
      </Panel>
    </>
  );
}
