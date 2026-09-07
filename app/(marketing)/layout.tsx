import { Toaster } from "sonner";
import { MarketingNav } from "@/components/amplivanta/marketing-nav";
import { MarketingFooter } from "@/components/amplivanta/marketing-footer";

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-white">
      <MarketingNav />
      <main>{children}</main>
      <MarketingFooter />
      {/* Public pages have write flows too — sharing a listing, form errors —
          so they need somewhere for a toast to land. */}
      <Toaster position="top-right" richColors closeButton />
    </div>
  );
}
