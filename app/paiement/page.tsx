import { Metadata } from "next"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { LuxuryMain, LuxuryHero, LuxuryPanel } from "@/components/layout/luxury-page"
import { ShieldCheck, Lock, Truck } from "lucide-react"

export const metadata: Metadata = {
  title: "Paiement | MBOULANE SHOP",
  description:
    "Paiement à la livraison — vous payez au livreur lors de la réception.",
}

const BRONZE = "#b38b6d"

export default function PaiementPage() {
  return (
    <LuxuryMain>
      <Header />

      <LuxuryHero
        breadcrumbs={[{ label: "Accueil", href: "/" }, { label: "Paiement" }]}
        scriptTitle="Paiement"
        subtitle="Paiement à la livraison : vous payez au livreur lors de la réception."
      />

      <section className="pb-16 pt-4 md:pb-24">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 md:grid-cols-2">
            <LuxuryPanel>
              <div className="mb-4 flex items-center gap-3">
                <Truck className="h-5 w-5" style={{ color: BRONZE }} />
                <h2 className="font-serif text-lg font-semibold text-[#3d3429]">Paiement à la livraison</h2>
              </div>
              <p className="text-sm font-light leading-relaxed text-[#6b5d4f]">
                Vous payez votre commande au livreur lors de la réception (cash ou selon modalité convenue).
              </p>
            </LuxuryPanel>

            <LuxuryPanel>
              <div className="mb-4 flex items-center gap-3">
                <ShieldCheck className="h-5 w-5" style={{ color: BRONZE }} />
                <h2 className="font-serif text-lg font-semibold text-[#3d3429]">Conseil</h2>
              </div>
              <p className="text-sm font-light leading-relaxed text-[#6b5d4f]">
                Vérifiez le récapitulatif (produits + livraison) avant de confirmer la commande.
              </p>
            </LuxuryPanel>
          </div>

          <div className="mt-10 grid gap-8 md:grid-cols-2">
            <LuxuryPanel>
              <div className="mb-4 flex items-center gap-3">
                <Lock className="h-5 w-5" style={{ color: BRONZE }} />
                <h2 className="font-serif text-lg font-semibold text-[#3d3429]">Sécurité</h2>
              </div>
              <p className="text-sm font-light leading-relaxed text-[#6b5d4f]">
                La navigation sur le site est sécurisée (HTTPS). Les paiements mobile money passent par les circuits de
                vos opérateurs. Nous ne collectons pas sur ce site de données de carte pour un encaissement en ligne.
              </p>
            </LuxuryPanel>

            <LuxuryPanel>
              <div className="mb-4 flex items-center gap-3">
                <ShieldCheck className="h-5 w-5" style={{ color: BRONZE }} />
                <h2 className="font-serif text-lg font-semibold text-[#3d3429]">Conseils</h2>
              </div>
              <ul className="list-disc space-y-2 pl-5 text-sm font-light leading-relaxed text-[#6b5d4f]">
                <li>Vérifiez le total (produits + livraison) avant de confirmer.</li>
                <li>Paiement à la livraison : vous payez au livreur lors de la réception.</li>
                <li>Besoin d’aide ? WhatsApp ou e-mail.</li>
              </ul>
            </LuxuryPanel>
          </div>
        </div>
      </section>

      <Footer />
    </LuxuryMain>
  )
}

