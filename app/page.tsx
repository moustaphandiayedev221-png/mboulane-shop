import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { HeroSection } from "@/components/home/hero-section"
import { CollectionsSection } from "@/components/home/collections-section"
import { BestSellersSection } from "@/components/home/bestsellers-section"
import { NewArrivalsSection } from "@/components/home/new-arrivals-section"
import { PremiumCollectionSection } from "@/components/home/premium-collection-section"
import { ArtisanalCollectionSection } from "@/components/home/artisanal-collection-section"
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
      
      <ScrollReveal animation="slide-up" delay={100} threshold={0.1}>
        <BestSellersSection products={products} />
      </ScrollReveal>
      
      <ScrollReveal animation="slide-up" threshold={0.15}>
        <PremiumCollectionSection products={products} />
      </ScrollReveal>
      
      <ScrollReveal animation="blur-in" threshold={0.1}>
        <NewArrivalsSection products={products} />
      </ScrollReveal>
      
      <ScrollReveal animation="blur-in" threshold={0.15}>
        <ArtisanalCollectionSection products={products} content={artisanalContent} />
      </ScrollReveal>
      
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
