import type { Metadata } from "next";
import Link from "next/link";
import { btn, btnPrimary } from "@/components/marketing/site-shell";
import {
  Card,
  CardGrid,
  Crumb,
  Hero,
  HeroVisual,
  InfoCard,
  Note,
  Panel,
  Section,
} from "@/components/marketing/site-ui";

export const metadata: Metadata = {
  title: "Sell on Amplivanta",
  description:
    "Publish downloadable marketing products to the Amplivanta Marketplace. Seller applications are reviewed before a store goes live.",
};

const STEPS = [
  ["Apply to sell", "Submit a seller application with your store name and what you intend to publish."],
  ["Build the listing", "Add the product, its media, pricing, licence and the deliverable buyers receive."],
  ["Submit for review", "A Marketplace admin reviews the listing and its files before anything is published."],
  ["Publish and get paid", "Approved listings go live. Earnings and payouts follow the operator's configured terms."],
];

export default function SellOnAmplivantaPage() {
  return (
    <>
      <Crumb items={["Home", "Marketplace", "Sell on Amplivanta"]} />
      <Hero
        eyebrow="MARKETPLACE"
        title="Publish your work to the Amplivanta Marketplace."
        lead="Sell templates, graphics, documents and toolkits to Amplivanta users. Every listing is reviewed before it goes live, and every purchase records the exact version the buyer received."
        actions={
          <>
            <Link className={btnPrimary} href="/signup">Create an account to sell</Link>
            <Link className={btn} href="/legal/marketplace-seller-agreement">Read the Seller Agreement</Link>
          </>
        }
        aside={
          <HeroVisual
            title="What selling involves"
            items={[
              "Seller application",
              "Product listing",
              "Deliverable upload",
              "Admin review",
              "Publishing",
              "Earnings & payouts",
            ]}
          />
        }
      />

      <Section
        title="How it works"
        lead="Four steps from application to a published listing."
      >
        <CardGrid cols={4}>
          {STEPS.map(([title, body], i) => (
            <Card key={title} icon={i + 1} title={title}>{body}</Card>
          ))}
        </CardGrid>
      </Section>

      <Panel>
        <InfoCard title="Terms that come from the operator, not this page">
          Commission rate, payout schedule, payout threshold, refund window and supported file types
          are Marketplace settings. They are shown in your seller dashboard once your application is
          approved, so this page does not quote figures that could differ from the ones you are
          actually held to.
        </InfoCard>
        <Note>
          Selling on the Marketplace is separate from the Partner Program and the Affiliate Program.
          Being approved for one does not enroll you in another.
        </Note>
      </Panel>
    </>
  );
}
