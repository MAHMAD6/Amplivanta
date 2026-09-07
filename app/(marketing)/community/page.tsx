import { MarketingPage } from "@/components/amplivanta/marketing-page";

export const metadata = { title: "Community" };

export default function CommunityPage() {
  return (
    <MarketingPage
      eyebrow="Community"
      title={<>Where growth operators trade playbooks.</>}
      subtitle="10,000+ marketers sharing what's working. Weekly threads, monthly AMAs, quarterly summits."
      ctas={[{ label: "Join Community", href: "#", primary: true }, { label: "Browse Threads", href: "#" }]}
      stats={[
        { value: "10K+", label: "Members" },
        { value: "42K+", label: "Threads" },
        { value: "48", label: "Countries" },
        { value: "Weekly", label: "Live AMAs" },
      ]}
    />
  );
}
