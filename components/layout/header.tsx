"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { Search, ShoppingBag, Heart, Menu, X, User, Footprints } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useStore } from "@/lib/store"
import { createClient } from "@/lib/supabase/client"
import { cn } from "@/lib/utils"
import { CartDrawer } from "@/components/cart/cart-drawer"
import { SearchModal } from "@/components/search/search-modal"

const navigation = [
  { name: "Accueil", href: "/" },
  { name: "Boutique", href: "/boutique" },
  { name: "À Propos", href: "/a-propos" },
  { name: "Contact", href: "/contact" },
]

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const pathname = usePathname()
  const { getCartCount, wishlist, setCartOpen } = useStore()
  const [mounted, setMounted] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [loggedIn, setLoggedIn] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    const supabase = createClient()

    const sync = async () => {
      const { data } = await supabase.auth.getSession()
      setLoggedIn(Boolean(data.session))
    }

    void sync()
    const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
      setLoggedIn(Boolean(session))
    })

    return () => {
      subscription.subscription.unsubscribe()
    }
  }, [])

  const cartCount = mounted ? getCartCount() : 0
  const wishlistCount = mounted ? wishlist.length : 0
  const accountHref = loggedIn ? "/mes-commandes" : "/connexion"

  return (
    <>
      <header
        className={cn(
          "fixed top-0 left-0 right-0 z-[100] w-full border-b border-border bg-background py-1 shadow-md",
        )}
      >
        {/* Failsafe solid background layer */}
        <div className="absolute inset-0 -z-10 bg-[#FDFBF7] opacity-100" />
        <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className={cn(
            "flex items-center justify-between h-16 md:h-20 transition-all duration-300"
          )}>
            {/* Logo : bloc sac + diamant + MBOULANE SHOP */}
            <Link href="/" aria-label="MBOULANE SHOP — Accueil" className="group relative z-[60] flex items-center gap-3">
              <div
                className={cn(
                  "relative shrink-0 overflow-hidden rounded-xl border border-[#C9A962]/35 bg-black shadow-lg shadow-black/20 transition-all duration-500 group-hover:scale-110",
                  "h-10 w-10 md:h-12 md:w-12",
                )}
              >
                <Image
                  src="/brand-ms-logo.png"
                  alt=""
                  fill
                  className="object-contain p-1"
                  sizes="(max-width: 768px) 40px, 48px"
                  priority
                />
              </div>
              <div className="flex min-w-0 flex-col gap-1">
                <div
                  className={cn(
                    "flex flex-nowrap items-baseline gap-0 whitespace-nowrap leading-none",
                    "font-serif font-bold text-foreground transition-all duration-700",
                    "text-lg sm:text-xl md:text-2xl",
                  )}
                >
                  <span className="tracking-tight">MBOULANE</span>
                  <Footprints className="inline-block h-[0.85em] w-[0.85em] shrink-0 translate-y-[0.08em] text-[#c9a14f] transition-colors duration-500 group-hover:text-[#e8cf7a] md:h-[0.9em] md:w-[0.9em]" strokeWidth={1.55} aria-hidden />
                  <span className="tracking-tight">SHOP</span>
                </div>
                <span className="text-[8px] font-bold uppercase tracking-[0.4em] text-accent/60 transition-all duration-700 md:text-[10px]">
                  Dakar • Senegal
                </span>
              </div>
            </Link>

            {/* Desktop Navigation with refined animations */}
            <div className="hidden md:flex items-center gap-2">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "group relative px-5 py-2.5 text-[0.8rem] font-bold uppercase tracking-[0.15em] transition-all duration-300",
                    pathname === item.href
                      ? "text-accent"
                      : "text-foreground/60 hover:text-foreground"
                  )}
                >
                  {item.name}
                  {/* Luxury underline animation */}
                  <span className={cn(
                    "absolute bottom-2 left-1/2 -translate-x-1/2 h-[2px] bg-accent transition-all duration-500",
                    pathname === item.href ? "w-4 opacity-100" : "w-0 opacity-0 group-hover:w-6 group-hover:opacity-40"
                  )} />
                </Link>
              ))}
            </div>

            {/* Actions with premium touch */}
            <div className="flex items-center gap-1.5 relative z-[60]">
              <Button
                variant="ghost"
                size="icon"
                className="hidden sm:flex rounded-full transition-all duration-300 hover:bg-accent/5 hover:text-accent transform hover:scale-110 active:scale-95"
                onClick={() => setSearchOpen(true)}
              >
                <Search className="h-[1.1rem] w-[1.1rem]" />
              </Button>

              <Link href={accountHref} title={loggedIn ? "Mon compte" : "Connexion"}>
                <Button
                  variant="ghost"
                  size="icon"
                  className="hidden sm:flex rounded-full transition-all duration-300 hover:bg-accent/5 hover:text-accent transform hover:scale-110 active:scale-95"
                >
                  <User className="h-[1.15rem] w-[1.15rem]" />
                </Button>
              </Link>

              <Link href="/wishlist">
                <Button variant="ghost" size="icon" className="relative rounded-full transition-all duration-300 hover:bg-accent/5 hover:text-accent transform hover:scale-110 active:scale-95">
                  <Heart className="h-[1.15rem] w-[1.15rem]" />
                  {wishlistCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 h-4.5 w-4.5 rounded-full bg-accent text-[9px] font-bold text-accent-foreground flex items-center justify-center border-2 border-background shadow-lg animate-in zoom-in duration-500">
                      {wishlistCount}
                    </span>
                  )}
                </Button>
              </Link>

              <Button
                variant="ghost"
                size="icon"
                className="relative rounded-full transition-all duration-300 hover:bg-accent/5 hover:text-accent transform hover:scale-110 active:scale-95"
                onClick={() => setCartOpen(true)}
                aria-label="Ouvrir le panier"
              >
                <ShoppingBag className="h-[1.15rem] w-[1.15rem]" />
                {cartCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 h-4.5 w-4.5 rounded-full bg-accent text-[9px] font-bold text-accent-foreground flex items-center justify-center border-2 border-background shadow-lg animate-in zoom-in duration-500">
                    {cartCount}
                  </span>
                )}
              </Button>

              {/* Mobile menu toggle */}
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden rounded-full transition-all duration-300 hover:bg-accent/10 active:scale-90"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </Button>
            </div>
          </div>
        </nav>

        {/* Elegant Mobile Navigation Overlay */}
        <div
          className={cn(
            "fixed inset-0 z-[55] bg-background md:hidden transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]",
            mobileMenuOpen ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0 pointer-events-none"
          )}
        >
          <div className="flex flex-col items-center justify-center h-full gap-8 p-6 pt-24 text-center">
            {navigation.map((item, index) => (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  "relative text-3xl font-serif font-bold tracking-tight transition-all duration-500",
                  mobileMenuOpen ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0",
                  pathname === item.href ? "text-accent" : "text-foreground/80 hover:text-accent"
                )}
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                {item.name}
                {pathname === item.href && (
                  <span className="absolute -bottom-2 left-0 right-0 h-1 bg-accent rounded-full" />
                )}
              </Link>
            ))}
            
            <div className={cn(
              "flex flex-col items-center gap-4 mt-12 transition-all duration-700",
              mobileMenuOpen ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
            )} style={{ transitionDelay: "400ms" }}>
              <Button
                variant="outline"
                size="icon"
                className="rounded-full h-12 w-12 border-2"
                onClick={() => setSearchOpen(true)}
              >
                <Search className="h-5 w-5" />
              </Button>
              <Link
                href={accountHref}
                onClick={() => setMobileMenuOpen(false)}
                className="text-sm font-semibold uppercase tracking-wider text-foreground/80 hover:text-accent"
              >
                {loggedIn ? "Mes commandes" : "Connexion"}
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Réserve la hauteur du header (py-1 + h-16 / h-20) pour que le contenu ne passe pas sous la barre fixe */}
      <div className="h-[4.5rem] w-full shrink-0 md:h-[5.5rem]" aria-hidden />

      {/* Search Modal */}
      <SearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />

      <CartDrawer />
    </>

  )
}
