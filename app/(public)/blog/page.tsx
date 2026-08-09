import type { Metadata } from "next";
import { PageHero } from "@/components/shared/PageHero";
import { BlogExplorer } from "@/components/sections/blog/BlogExplorer";
import { getPosts } from "@/lib/data";

export const metadata: Metadata = {
  title: "Blog",
  description: "Insights, guides, and strategies from the Amplivanta team.",
};

export default async function BlogPage() {
  const posts = await getPosts();
  return (
    <>
      <PageHero
        eyebrow="Blog"
        title="Insights to Help You"
        highlight="Grow"
        description="Practical marketing advice, industry trends, and lessons from the field."
        dark
      />
      <BlogExplorer posts={posts} />
    </>
  );
}
