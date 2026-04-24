import { Metadata } from "next"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { LuxuryMain, LuxuryHero, LuxuryPanel } from "@/components/layout/luxury-page"

export const metadata: Metadata = {
  title: "Mentions Légales | MBOULANE SHOP",
  description: "Mentions légales de MBOULANE SHOP.",
}

export default function MentionsLegalesPage() {
  return (
    <LuxuryMain>
      <Header />

      <LuxuryHero
        breadcrumbs={[{ label: "Accueil", href: "/" }, { label: "Mentions légales" }]}
        scriptTitle="Mentions légales"
      />

      <section className="pb-16 pt-4 md:pb-24">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <LuxuryPanel className="space-y-10 text-sm font-light leading-relaxed text-[#6b5d4f]">
            <div>
              <h2 className="mb-4 font-serif text-lg font-semibold text-[#3d3429]">1. Éditeur du site</h2>
              <p>
                MBOULANE SHOP
                <br />
                Siège social : Dakar, Sénégal
                <br />
                NINEA : XXXXXXXX
                <br />
                Email : mboulaneshop@gmail.com
                <br />
                Téléphone : +221 77 923 93 05
              </p>
            </div>
            <div className="h-px bg-gradient-to-r from-transparent via-[#d8ccb8]/80 to-transparent" />
            <div>
              <h2 className="mb-4 font-serif text-lg font-semibold text-[#3d3429]">2. Hébergement</h2>
              <p>
                Le site est hébergé par Vercel Inc.
                <br />
                340 S Lemon Ave #4133
                <br />
                Walnut, CA 91789, USA
              </p>
            </div>
            <div className="h-px bg-gradient-to-r from-transparent via-[#d8ccb8]/80 to-transparent" />
            <div>
              <h2 className="mb-4 font-serif text-lg font-semibold text-[#3d3429]">3. Propriété intellectuelle</h2>
              <p>
                L&apos;ensemble de ce site relève de la législation sénégalaise et internationale sur le droit
                d&apos;auteur et la propriété intellectuelle. Tous les droits de reproduction sont réservés.
              </p>
            </div>
            <div className="h-px bg-gradient-to-r from-transparent via-[#d8ccb8]/80 to-transparent" />
            <div>
              <h2 className="mb-4 font-serif text-lg font-semibold text-[#3d3429]">
                4. Moyens de paiement (information)
              </h2>
              <p>
                Orange Money et Wave sont privilégiés pour le Sénégal. Une demande de paiement par carte bancaire peut
                être étudiée selon les disponibilités ; il n’y a pas de prélèvement carte en ligne sur ce site pour
                l’instant. Le paiement à la livraison peut être proposé dans la région de Dakar lorsque cette option est
                indiquée lors de la commande.
              </p>
            </div>
          </LuxuryPanel>
        </div>
      </section>

      <Footer />
    </LuxuryMain>
  )
}
