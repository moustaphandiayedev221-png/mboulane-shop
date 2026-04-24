import { Metadata } from "next"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { LuxuryMain, LuxuryHero, LuxuryPanel } from "@/components/layout/luxury-page"

export const metadata: Metadata = {
  title: "Politique de Confidentialité | MBOULANE SHOP",
  description: "Politique de confidentialité de MBOULANE SHOP.",
}

export default function PolitiqueConfidentialitePage() {
  return (
    <LuxuryMain>
      <Header />

      <LuxuryHero
        breadcrumbs={[{ label: "Accueil", href: "/" }, { label: "Confidentialité" }]}
        scriptTitle="Confidentialité"
        subtitle="Transparence sur la collecte et l’usage de vos données."
      />

      <section className="pb-16 pt-4 md:pb-24">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <LuxuryPanel className="space-y-10 text-sm font-light leading-relaxed text-[#6b5d4f]">
            <div>
              <h2 className="mb-4 font-serif text-lg font-semibold text-[#3d3429]">
                1. Collecte des données personnelles
              </h2>
              <p>
                Nous collectons les données que vous nous fournissez lors de la création d&apos;un compte, d&apos;une
                commande ou de l&apos;inscription à notre newsletter.
              </p>
              <p className="mt-4">
                Pour le paiement au Sénégal, Orange Money et Wave sont privilégiés ; nous ne collectons pas sur ce site
                de coordonnées bancaires permettant un prélèvement carte en ligne. Toute modalité carte est traitée avec
                vous au cas par cas lorsque vous en faites la demande.
              </p>
            </div>
            <div className="h-px bg-gradient-to-r from-transparent via-[#d8ccb8]/80 to-transparent" />
            <div>
              <h2 className="mb-4 font-serif text-lg font-semibold text-[#3d3429]">2. Utilisation des données</h2>
              <p>
                Vos informations sont utilisées pour traiter vos commandes, personnaliser votre expérience sur notre
                site et vous envoyer des offres promotionnelles (si vous les avez acceptées).
              </p>
            </div>
            <div className="h-px bg-gradient-to-r from-transparent via-[#d8ccb8]/80 to-transparent" />
            <div>
              <h2 className="mb-4 font-serif text-lg font-semibold text-[#3d3429]">3. Protection de vos données</h2>
              <p>
                Nous mettons en œuvre toutes les mesures de sécurité nécessaires pour protéger vos informations
                personnelles contre tout accès non autorisé.
              </p>
            </div>
            <div className="h-px bg-gradient-to-r from-transparent via-[#d8ccb8]/80 to-transparent" />
            <div>
              <h2 className="mb-4 font-serif text-lg font-semibold text-[#3d3429]">4. Cookies</h2>
              <p>
                Notre site utilise des cookies pour améliorer son fonctionnement et vous offrir la meilleure expérience
                possible.
              </p>
            </div>
          </LuxuryPanel>
        </div>
      </section>

      <Footer />
    </LuxuryMain>
  )
}
