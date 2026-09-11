import type { Metadata } from "next";
import Link from "next/link";
import { btnPrimary } from "@/components/marketing/site-buttons";
import { Crumb, Hero, InfoCard, Note, Panel, Section, Split } from "@/components/marketing/site-ui";

export const metadata: Metadata = {
  title: "Accessibility",
  description: "How Amplivanta approaches accessibility, what is in place today, and how to report a barrier.",
};

export default function AccessibilityPage() {
  return (
    <>
      <Crumb items={["Home", "Accessibility"]} />
      <Hero
        eyebrow="ACCESSIBILITY"
        title="Building an interface people can actually use."
        lead="Amplivanta aims to meet WCAG 2.1 AA. This page states what is in place today rather than claiming a conformance level that has not been independently assessed."
        actions={<Link className={btnPrimary} href="/contact">Report a barrier</Link>}
      />

      <Section>
        <Split>
          <InfoCard title="In place today">
            <ul>
              <li>Semantic landmarks and headings on public pages.</li>
              <li>Visible keyboard focus, and dialogs that trap and restore focus.</li>
              <li>Text alternatives for meaningful images; decorative marks are hidden from assistive technology.</li>
              <li>Colour contrast checked against WCAG AA for body and interface text.</li>
              <li>Layouts that reflow to a single column on small screens without horizontal scrolling.</li>
              <li>Wide data tables scroll within their own region rather than the page.</li>
            </ul>
          </InfoCard>
          <InfoCard title="Known gaps">
            <ul>
              <li>No independent audit has been carried out, so no formal conformance claim is made.</li>
              <li>Some data-dense admin screens are still being reviewed for screen-reader flow.</li>
              <li>Third-party embeds may not meet the same standard as the platform itself.</li>
            </ul>
          </InfoCard>
        </Split>
      </Section>

      <Panel>
        <InfoCard title="Reporting a barrier">
          If something prevents you from completing a task, tell us through the contact form. Include
          the page, what you were trying to do, and the assistive technology and browser you were
          using. That detail is what makes a report reproducible.
        </InfoCard>
        <Note>
          No response-time commitment or remediation deadline is published here; publishing one before
          a process exists to meet it would be a claim we could not keep.
        </Note>
      </Panel>
    </>
  );
}
