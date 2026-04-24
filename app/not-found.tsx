import Link from "next/link"
import { ArrowLeft, Home } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"

export default function NotFound() {
  return (
    <main className="min-h-screen flex flex-col">
      <Header />
      
      <div className="flex-1 flex items-center justify-center relative overflow-hidden pt-20">
        {/* Background Gradients */}
        <div className="absolute inset-0 bg-background" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-accent/5 rounded-full blur-[120px] pointer-events-none" />
        
        {/* Typography decorative element */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[60%] text-[20rem] md:text-[30rem] font-serif font-bold text-accent/[0.03] select-none pointer-events-none leading-none">
          404
        </div>
        
        <div className="relative z-10 mx-auto max-w-2xl px-4 sm:px-6 lg:px-8 text-center animate-fade-in">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 mb-8 px-4 py-2 rounded-full border border-accent/20 bg-accent/5 backdrop-blur-sm animate-slide-up" style={{ animationDelay: '100ms' }}>
            <div className="h-2 w-2 rounded-full bg-accent animate-pulse-glow" />
            <span className="text-xs font-semibold text-accent uppercase tracking-wider">Erreur 404</span>
          </div>
          
          <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6 animate-slide-up" style={{ animationDelay: '200ms' }}>
            Page Introuvable
          </h1>
          
          <p className="text-lg md:text-xl text-muted-foreground leading-relaxed mb-10 max-w-lg mx-auto animate-slide-up" style={{ animationDelay: '300ms' }}>
            Il semble que vous vous soyez égaré. La page que vous recherchez n&apos;existe pas ou a été déplacée.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up" style={{ animationDelay: '400ms' }}>
            <Button size="lg" className="rounded-xl h-12 px-8 gap-2 shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-300 w-full sm:w-auto" asChild>
              <Link href="/">
                <Home className="h-4 w-4" />
                Retour à l&apos;accueil
              </Link>
            </Button>
            
            <Button size="lg" variant="outline" className="rounded-xl h-12 px-8 gap-2 backdrop-blur-sm bg-background/50 transition-all duration-300 w-full sm:w-auto hover:border-accent/50 group" asChild>
              <Link href="/boutique">
                Découvrir la collection
                <ArrowLeft className="h-4 w-4 rotate-180 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
            </Button>
          </div>
          
          {/* Quick Links */}
          <div className="mt-16 pt-10 border-t border-border/50 animate-slide-up" style={{ animationDelay: '500ms' }}>
            <p className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-6">Liens Utiles</p>
            <div className="flex flex-wrap justify-center gap-x-8 gap-y-4 text-sm font-medium">
              <Link href="/boutique?filter=nouveau" className="text-foreground/70 hover:text-accent transition-colors duration-300">Nouveautés</Link>
              <Link href="/boutique?filter=bestseller" className="text-foreground/70 hover:text-accent transition-colors duration-300">Best Sellers</Link>
              <Link href="/a-propos" className="text-foreground/70 hover:text-accent transition-colors duration-300">À Propos</Link>
              <Link href="/contact" className="text-foreground/70 hover:text-accent transition-colors duration-300">Contact</Link>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </main>
  )
}
