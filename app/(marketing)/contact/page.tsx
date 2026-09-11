import type { Metadata } from "next";
import Link from "next/link";
import { SitePage } from "@/components/marketing/site-shell";
import { btn, btnPrimary } from "@/components/marketing/site-buttons";
import {
  Crumb,
  Hero,
  HeroVisual,
  RouteCard,
  RouteStack,
  Section,
  Split,
} from "@/components/marketing/site-ui";
import { SiteContactForm } from "@/components/marketing/site-contact-form";

export const metadata: Metadata = {
  title: "Contact Us",
  description:
    "Use the form for general product questions, or choose a focused destination for demos, support, partnerships or affiliate matters.",
};

const ROUTES: [string, string, string][] = [
  ["Book a Demo", "Talk about Amplivanta for your business or team.", "/book-demo"],
  ["Help Center", "Find product guidance and support content.", "/resources/help-center"],
  ["Partners", "Review partnership information and current enrollment status.", "/partners"],
  ["Affiliate Program", "Review affiliate program terms and current enrollment status.", "/affiliate-program"],
];

export default function ContactPage() {
  return (
    <SitePage active="company">
      <Crumb items={["Home", "Company", "Contact Us"]} />
      <Hero
        eyebrow="COMPANY / CONTACT US"
        title="Here to help you find the right next step."
        lead="Use the form for general product questions or choose a focused destination for demos, support, partnerships, or affiliate matters. We avoid publishing unverified phone numbers, office locations, response-time promises, or public mailboxes that are not operational."
        actions={
          <>
            <Link className={btnPrimary} href="/book-demo">Book a Demo</Link>
            <Link className={btn} href="/resources/help-center">Help Center</Link>
          </>
        }
        aside={
          <HeroVisual
            title="Choose the right route"
            items={[
              "Product questions",
              "Book a demo",
              "Help Center",
              "Partner inquiries",
              "Affiliate matters",
              "Privacy & legal routes",
            ]}
          />
        }
      />

      <Section>
        <Split>
          <SiteContactForm />
          <RouteStack>
            {ROUTES.map(([title, body, href]) => (
              <RouteCard key={href} title={title} href={href}>
                {body}
              </RouteCard>
            ))}
          </RouteStack>
        </Split>
      </Section>
    </SitePage>
  );
}
