import { HeroSection } from "@/components/sections/home/HeroSection";
import { LogoCloud } from "@/components/sections/home/LogoCloud";
import { AboutBanner } from "@/components/sections/home/AboutBanner";
import { StatsSection } from "@/components/sections/home/StatsSection";
import { ServicesOverview } from "@/components/sections/home/ServicesOverview";
import { PortfolioPreview } from "@/components/sections/home/PortfolioPreview";
import { TestimonialsSection } from "@/components/sections/home/TestimonialsSection";
import { BlogPreview } from "@/components/sections/home/BlogPreview";
import { CtaBanner } from "@/components/sections/home/CtaBanner";
import { getFeaturedPortfolio, getFeaturedReviews, getRecentPosts } from "@/lib/data";

export default async function HomePage() {
  const [portfolio, reviews, posts] = await Promise.all([
    getFeaturedPortfolio(3),
    getFeaturedReviews(6),
    getRecentPosts(3),
  ]);

  return (
    <>
      <HeroSection />
      <LogoCloud />
      <AboutBanner />
      <StatsSection />
      <ServicesOverview />
      <PortfolioPreview items={portfolio} />
      <TestimonialsSection reviews={reviews} />
      <BlogPreview posts={posts} />
      <CtaBanner />
    </>
  );
}
