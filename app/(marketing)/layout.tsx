import { Toaster } from "sonner";
import { SiteHeader, SiteFooter } from "@/components/marketing/site-shell";

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-white">
      <SiteHeader />
      <main className="px-4 pb-[42px] pt-[26px] sm:px-6 lg:px-[92px] lg:pt-[34px]">{children}</main>
      <SiteFooter />
      {/* Public pages have write flows too — sharing, contact — so toasts need
          somewhere to land. */}
      <Toaster position="top-right" richColors closeButton />
    </div>
  );
}
