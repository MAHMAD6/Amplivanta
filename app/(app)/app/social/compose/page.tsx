import type { Metadata } from "next";
import { PageHeader } from "@/components/amplivanta/page-header";
import { SocialSubnav } from "@/components/amplivanta/social-subnav";
import { ComposerClient } from "@/components/amplivanta/composer-client";
import { Save, Send, Sparkles } from "lucide-react";

export const metadata: Metadata = { title: "Create Post — Amplivanta" };

export default function ComposePage() {
  return (
    <div className="mx-auto max-w-[1500px]">
      <PageHeader
        title="Create Post"
        subtitle="Compose once. Customize per platform. Preview, schedule, and publish."
        actions={
          <>
            <button className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-line bg-white px-4 text-[13px] font-semibold text-ink hover:border-ink/30"><Save className="h-3.5 w-3.5" /> Save Draft</button>
            <button className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-violet/30 bg-white px-4 text-[13px] font-bold text-violet hover:bg-violet/5"><Sparkles className="h-3.5 w-3.5" /> AI Assist</button>
            <button className="inline-flex h-10 items-center gap-1.5 rounded-xl bg-grad-cta px-4 text-[13px] font-bold text-white shadow-violet"><Send className="h-3.5 w-3.5" /> Schedule</button>
          </>
        }
      />
      <SocialSubnav />
      <ComposerClient />
    </div>
  );
}
