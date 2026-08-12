import type { Metadata } from "next";
import { BottomNav } from "@/components/app/BottomNav";

export const metadata: Metadata = {
  title: "SocialEarn App",
  robots: { index: false, follow: false },
};

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen justify-center bg-[#eef0f6] py-0 sm:py-8">
      {/* Phone frame */}
      <div className="relative flex min-h-screen w-full max-w-[420px] flex-col bg-white shadow-2xl sm:min-h-[860px] sm:rounded-[2.25rem] sm:ring-8 sm:ring-[#14121f]/90">
        <div className="flex flex-1 flex-col overflow-hidden sm:rounded-[2.25rem]">
          <div className="no-scrollbar flex flex-1 flex-col overflow-y-auto">
            {children}
          </div>
          <BottomNav />
        </div>
      </div>
    </div>
  );
}
