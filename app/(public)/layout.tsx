import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { PageTransition } from "@/components/shared/PageTransition";
import { InitialLoader } from "@/components/shared/InitialLoader";
import { Toaster } from "sonner";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <InitialLoader />
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-[#14121f] focus:px-4 focus:py-2 focus:text-sm focus:text-white"
      >
        Skip to main content
      </a>
      <Navbar />
      <main id="main">
        <PageTransition>{children}</PageTransition>
      </main>
      <Footer />
      <Toaster position="bottom-right" theme="dark" closeButton gap={12} />
    </>
  );
}
