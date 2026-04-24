import Link from "next/link"
import Image from "next/image"
import { Facebook, Instagram, MapPin, Phone, Mail, Youtube, ArrowUpRight, ShieldCheck, Footprints } from "lucide-react"

function TikTokIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M21.6 7.2c-1.8 0-3.5-.6-4.8-1.7-1.3-1.1-2.1-2.7-2.3-4.4h-3.8v14.3c0 1.7-1.4 3.1-3.1 3.1S4.5 17 4.5 15.3s1.4-3.1 3.1-3.1c.3 0 .6 0 .9.1V8.4c-.3 0-.6-.1-.9-.1-3.8 0-7 3.1-7 7s3.1 7 7 7 7-3.1 7-7V9.6c1.5 1 3.3 1.6 5.2 1.6V7.2z" />
    </svg>
  )
}

const footerLinks = {
  shop: [
    { name: "Nouveautés", href: "/boutique?filter=nouveau" },
    { name: "Best Sellers", href: "/boutique?filter=bestseller" },
    { name: "Collections", href: "/boutique" },
    { name: "Promotions", href: "/boutique?filter=promo" },
  ],
  company: [
    { name: "À Propos", href: "/a-propos" },
    { name: "Notre Histoire", href: "/a-propos#histoire" },
    { name: "Artisanat", href: "/a-propos#artisanat" },
    { name: "Contact", href: "/contact" },
  ],
  support: [
    { name: "Connexion", href: "/connexion" },
    { name: "Mes commandes", href: "/mes-commandes" },
    { name: "Service client", href: "/service-client" },
    { name: "Suivi de commande", href: "/suivi-commande" },
    { name: "Guide des Tailles", href: "/guide-tailles" },
    { name: "Livraison", href: "/livraison" },
    { name: "Livraison internationale", href: "/livraison-international" },
    { name: "Retours", href: "/retours" },
    { name: "Retours & remboursements", href: "/politique-retours-remboursements" },
    { name: "FAQ", href: "/faq" },
    { name: "Paiement", href: "/paiement" },
    { name: "Cookies", href: "/cookies" },
  ],
}

const socialLinks = [
  { name: "Facebook", icon: Facebook, href: "https://facebook.com/mboulaneshop" },
  { name: "Instagram", icon: Instagram, href: "https://instagram.com/mboulaneshop" },
  { name: "TikTok", icon: TikTokIcon, href: "https://tiktok.com/@mboulaneshop" },
  { name: "YouTube", icon: Youtube, href: "https://youtube.com/@mboulaneshop" },
]

export function Footer() {
  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 md:py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-14">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link
              href="/"
              aria-label="MBOULANE SHOP — Accueil"
              className="group inline-flex flex-nowrap items-baseline gap-0 whitespace-nowrap leading-none font-serif text-2xl font-bold tracking-tight transition-opacity duration-300 hover:opacity-90 md:text-3xl"
            >
              MBOULANE<Footprints className="inline-block h-[0.85em] w-[0.85em] shrink-0 translate-y-[0.08em] text-[#c9a14f] transition-colors duration-300 group-hover:text-[#e8cf7a]" strokeWidth={1.55} aria-hidden />SHOP
            </Link>
            <p className="mt-5 text-sm text-primary-foreground/70 max-w-sm leading-relaxed">
              {"L'élégance africaine à vos pieds. Sandales premium en cuir, fabriquées avec passion au Sénégal par nos artisans talentueux."}
            </p>
            
            {/* Contact Info */}
            <div className="mt-7 space-y-3.5">
              <div className="flex items-center gap-3 text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors duration-300">
                <MapPin className="h-4 w-4 flex-shrink-0 text-primary-foreground/50" />
                <span>Dakar, Sénégal</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors duration-300">
                <Phone className="h-4 w-4 flex-shrink-0 text-primary-foreground/50" />
                <span>+221 77 923 93 05</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors duration-300">
                <Mail className="h-4 w-4 flex-shrink-0 text-primary-foreground/50" />
                <a href="mailto:mboulaneshop@gmail.com" className="hover:text-primary-foreground hover:underline">
                  mboulaneshop@gmail.com
                </a>
              </div>
            </div>

            {/* Social Links */}
            <div className="mt-8 flex gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="h-10 w-10 rounded-xl bg-primary-foreground/8 flex items-center justify-center hover:bg-primary-foreground/18 hover:scale-110 transition-all duration-300"
                  aria-label={social.name}
                >
                  <social.icon className="h-4.5 w-4.5" />
                </a>
              ))}
            </div>
          </div>

          {/* Shop Links */}
          <div>
            <h3 className="font-semibold text-sm uppercase tracking-[0.15em] mb-5 text-primary-foreground/90">
              Boutique
            </h3>
            <ul className="space-y-3.5">
              {footerLinks.shop.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-primary-foreground/65 hover:text-primary-foreground transition-colors duration-300 inline-flex items-center gap-1 group"
                  >
                    {link.name}
                    <ArrowUpRight className="h-3 w-3 opacity-0 -translate-y-0.5 transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h3 className="font-semibold text-sm uppercase tracking-[0.15em] mb-5 text-primary-foreground/90">
              Entreprise
            </h3>
            <ul className="space-y-3.5">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-primary-foreground/65 hover:text-primary-foreground transition-colors duration-300 inline-flex items-center gap-1 group"
                  >
                    {link.name}
                    <ArrowUpRight className="h-3 w-3 opacity-0 -translate-y-0.5 transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h3 className="font-semibold text-sm uppercase tracking-[0.15em] mb-5 text-primary-foreground/90">
              Support
            </h3>
            <ul className="space-y-3.5">
              {footerLinks.support.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-primary-foreground/65 hover:text-primary-foreground transition-colors duration-300 inline-flex items-center gap-1 group"
                  >
                    {link.name}
                    <ArrowUpRight className="h-3 w-3 opacity-0 -translate-y-0.5 transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Trust Badges */}
        <div className="mt-16 pt-8 border-t border-primary-foreground/10 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2 text-primary-foreground/70 text-sm font-medium">
             <ShieldCheck className="h-5 w-5 text-green-400" /> 
             Paiement 100% Sécurisé
          </div>
          <div className="flex flex-wrap gap-3 items-center">
            <div className="flex items-center gap-3 rounded-xl bg-primary-foreground/5 px-3 py-2">
              <Image
                src="/payments/orange-money.png"
                alt="Orange Money"
                width={150}
                height={40}
                className="h-7 w-auto"
              />
              <Image
                src="/payments/wave.png"
                alt="Wave"
                width={110}
                height={40}
                className="h-7 w-auto"
              />
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-16 pt-8 border-t border-primary-foreground/10">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex flex-col md:flex-row items-center gap-2 md:gap-6">
              <p className="text-sm text-primary-foreground/50">
                © {new Date().getFullYear()} MBOULANE SHOP. Tous droits réservés.
              </p>
              <div className="flex items-center gap-4 text-xs md:text-sm text-primary-foreground/50">
                <Link href="/mentions-legales" className="hover:text-primary-foreground transition-colors">Mentions Légales</Link>
                <Link href="/conditions-generales-vente" className="hover:text-primary-foreground transition-colors">CGV</Link>
                <Link href="/politique-confidentialite" className="hover:text-primary-foreground transition-colors">Confidentialité</Link>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-foreground/8 text-xs font-semibold tracking-wide">
                <span className="text-base">🇸🇳</span>
                Made in Senegal
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
