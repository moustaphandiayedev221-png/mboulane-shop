import { Metadata } from "next"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { LuxuryMain, LuxuryHero, LuxuryPanel } from "@/components/layout/luxury-page"

export const metadata: Metadata = {
  title: "Politique de cookies | MBOULANE SHOP",
  description: "Comprendre l'utilisation des cookies sur MBOULANE SHOP et gérer votre consentement.",
}

export default function CookiesPage() {
  return (
    <LuxuryMain>
      <Header />

      <LuxuryHero
        breadcrumbs={[{ label: "Accueil", href: "/" }, { label: "Cookies" }]}
        scriptTitle="Politique de cookies"
        subtitle="Transparence sur les traceurs : ce que nous utilisons, pourquoi, et comment gérer votre choix."
      />

      <section className="pb-16 pt-4 md:pb-24">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <LuxuryPanel className="space-y-10 text-sm font-light leading-relaxed text-[#6b5d4f]">
            <div>
              <h2 className="mb-4 font-serif text-lg font-semibold text-[#3d3429]">1. Qu’est-ce qu’un cookie ?</h2>
              <p>
                Un cookie est un petit fichier déposé sur votre appareil pour améliorer la navigation, mémoriser vos
                préférences ou mesurer l’audience.
              </p>
            </div>

            <div className="h-px bg-gradient-to-r from-transparent via-[#d8ccb8]/80 to-transparent" />

            <div>
              <h2 className="mb-4 font-serif text-lg font-semibold text-[#3d3429]">
                2. Cookies utilisés sur MBOULANE SHOP
              </h2>
              <ul className="list-disc space-y-2 pl-5">
                <li>
                  <strong className="font-semibold text-[#4a4036]">Essentiels</strong> : nécessaires au fonctionnement
                  du site (panier, wishlist, navigation).
                </li>
                <li>
                  <strong className="font-semibold text-[#4a4036]">Mesure d’audience</strong> : statistiques
                  anonymisées pour comprendre l’usage du site et l’améliorer.
                </li>
              </ul>
            </div>

            <div className="h-px bg-gradient-to-r from-transparent via-[#d8ccb8]/80 to-transparent" />

            <div>
              <h2 className="mb-4 font-serif text-lg font-semibold text-[#3d3429]">3. Gérer votre consentement</h2>
              <p>
                Vous pouvez accepter ou refuser la mesure d’audience via le bandeau cookies. En cas de refus, le site
                fonctionne normalement mais nous ne chargeons pas la mesure d’audience.
              </p>
            </div>

            <div className="h-px bg-gradient-to-r from-transparent via-[#d8ccb8]/80 to-transparent" />

            <div>
              <h2 className="mb-4 font-serif text-lg font-semibold text-[#3d3429]">4. Contact</h2>
              <p>
                Pour toute question : <span className="font-semibold text-[#4a4036]">mboulaneshop@gmail.com</span>.
              </p>
            </div>
          </LuxuryPanel>
        </div>
      </section>

      <Footer />
    </LuxuryMain>
  )
}

