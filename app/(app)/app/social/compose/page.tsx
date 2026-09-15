import type { Metadata } from "next";
import { ScreenHeader } from "@/components/amplivanta/screen-kit";
import { SocialComposer } from "@/components/amplivanta/social-composer";
import { db } from "@/lib/db";
import { socialContext } from "@/lib/server/social-screens";
import { loadPreferences } from "@/lib/server/preferences";
import { isStorageConfigured, objectUrl } from "@/lib/storage";

export const metadata: Metadata = { title: "Create Post" };
export const dynamic = "force-dynamic";

export default async function ComposePage() {
  const c = await socialContext();
  let hashtagSets: { id: string; name: string; tags: string[] }[] = [];
  let mentions: { id: string; label: string; handle: string }[] = [];
  let images: { id: string; name: string; url: string }[] = [];
  let approvalRequired = false;
  if (c) {
    try {
      const [h, m, a, prefs] = await Promise.all([
        db.hashtagSet.findMany({ where: { workspaceId: c.workspaceId }, orderBy: { name: "asc" }, take: 50, select: { id: true, name: true, tags: true } }),
        db.mentionReference.findMany({ where: { workspaceId: c.workspaceId }, orderBy: { label: "asc" }, take: 50, select: { id: true, label: true, handle: true } }),
        isStorageConfigured()
          ? db.asset.findMany({ where: { workspaceId: c.workspaceId, mimeType: { startsWith: "image/" }, NOT: { tags: { has: "draft" } } }, orderBy: { createdAt: "desc" }, take: 12, select: { id: true, name: true, fileUrl: true } })
          : Promise.resolve([]),
        loadPreferences(c.workspaceId, "social.settings"),
      ]);
      hashtagSets = h;
      mentions = m;
      images = await Promise.all(a.map(async (x) => ({ id: x.id, name: x.name, url: await objectUrl(x.fileUrl) })));
      approvalRequired = prefs.values.requireApproval === true;
    } catch {
      /* composer still works without library data */
    }
  }
  return (
    <div className="mx-auto max-w-[1600px]">
      <ScreenHeader title="Create Post / Composer" subtitle="Create, customize, preview, and schedule your social media posts across multiple platforms." />
      <SocialComposer hashtagSets={hashtagSets} mentions={mentions} images={images} approvalRequired={approvalRequired} />
    </div>
  );
}
