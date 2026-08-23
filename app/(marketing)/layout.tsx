import { MarketingNav } from "@/components/amplivanta/marketing-nav";
import { MarketingFooter } from "@/components/amplivanta/marketing-footer";

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-white">
      <MarketingNav />
      <main>{children}</main>
      <MarketingFooter />
    </div>
  );
}
