import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { HeroSection } from "@/components/home/hero-section"
import { CollectionsSection } from "@/components/home/collections-section"
import { HomeProductsLive } from "@/components/home/home-products-live"
import { WhyChooseSection } from "@/components/home/why-choose-section"
import { ReviewsSection } from "@/components/home/reviews-section"
import { NewsletterSection } from "@/components/home/newsletter-section"
import { ScrollReveal } from "@/components/ui/scroll-reveal"
import { Marquee } from "@/components/ui/marquee"
import { getProducts, getReviews } from "@/lib/catalog"
import { getHeroContent } from "@/lib/site/hero"
import { getArtisanalHomeContent, getWhyChooseHomeContent } from "@/lib/site/home-sections"

export default async function HomePage() {
  const [products, reviews, heroContent, artisanalContent, whyChooseContent] = await Promise.all([
    getProducts(),
    getReviews(),
    getHeroContent(),
    getArtisanalHomeContent(),
    getWhyChooseHomeContent(),
  ])
  return (
    <main className="min-h-screen overflow-x-hidden">
      <Header />
      <HeroSection hero={heroContent} />
      
      <Marquee />
      
      <ScrollReveal animation="blur-in">
        <CollectionsSection />
      </ScrollReveal>

      <HomeProductsLive initialProducts={products} artisanalContent={artisanalContent} />
      
      <ScrollReveal animation="scale-up" threshold={0.2}>
        <WhyChooseSection content={whyChooseContent} />
      </ScrollReveal>
      
      <ScrollReveal animation="slide-up" threshold={0.1}>
        <ReviewsSection items={reviews} />
      </ScrollReveal>
      
      <ScrollReveal animation="blur-in" threshold={0.2}>
        <NewsletterSection />
      </ScrollReveal>
      
      <Footer />
    </main>
  )
}
