import { Metadata } from "next"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { LuxuryMain, LuxuryHero, LuxuryPanel } from "@/components/layout/luxury-page"

export const metadata: Metadata = {
  title: "Conditions Générales de Vente | MBOULANE SHOP",
  description: "Conditions générales de vente (CGV) de MBOULANE SHOP.",
}

export default function CGVPage() {
  return (
    <LuxuryMain>
      <Header />

      <LuxuryHero
        breadcrumbs={[{ label: "Accueil", href: "/" }, { label: "CGV" }]}
        scriptTitle="Conditions générales"
        subtitle="Les règles qui encadrent vos achats sur MBOULANE SHOP."
      />

      <section className="pb-16 pt-4 md:pb-24">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <LuxuryPanel className="space-y-10 text-sm font-light leading-relaxed text-[#6b5d4f]">
            <div>
              <h2 className="mb-4 font-serif text-lg font-semibold text-[#3d3429]">1. Objet</h2>
              <p>Les présentes CGV régissent les ventes de chaussures et articles en cuir par MBOULANE SHOP.</p>
            </div>
            <div className="h-px bg-gradient-to-r from-transparent via-[#d8ccb8]/80 to-transparent" />
            <div>
              <h2 className="mb-4 font-serif text-lg font-semibold text-[#3d3429]">2. Prix</h2>
              <p>Les prix de nos produits sont indiqués en francs CFA (XOF) toutes taxes comprises.</p>
            </div>
            <div className="h-px bg-gradient-to-r from-transparent via-[#d8ccb8]/80 to-transparent" />
            <div>
              <h2 className="mb-4 font-serif text-lg font-semibold text-[#3d3429]">3. Commandes</h2>
              <p>
                Vous pouvez passer commande directement sur notre site. Nous nous réservons le droit d&apos;annuler ou
                de refuser toute commande d&apos;un client.
              </p>
            </div>
            <div className="h-px bg-gradient-to-r from-transparent via-[#d8ccb8]/80 to-transparent" />
            <div>
              <h2 className="mb-4 font-serif text-lg font-semibold text-[#3d3429]">4. Paiement</h2>
              <p>
                Orange Money et Wave sont privilégiés pour le Sénégal. Une demande de paiement par carte bancaire peut
                être étudiée selon les disponibilités ; il n’y a pas de prélèvement carte en ligne sur le site pour
                l’instant. Le paiement à la livraison peut être proposé dans la région de Dakar lorsque cette option est
                affichée au moment de la commande.
              </p>
            </div>
          </LuxuryPanel>
        </div>
      </section>

      <Footer />
    </LuxuryMain>
  )
}
