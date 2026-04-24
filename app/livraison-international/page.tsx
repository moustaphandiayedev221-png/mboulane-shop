import { Metadata } from "next"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { LuxuryMain, LuxuryHero, LuxuryPanel } from "@/components/layout/luxury-page"
import { Globe, Plane, PackageCheck, AlertTriangle } from "lucide-react"

export const metadata: Metadata = {
  title: "Livraison internationale | MBOULANE SHOP",
  description: "Délais, transporteurs, douanes et taxes pour la livraison internationale MBOULANE SHOP.",
}

const BRONZE = "#b38b6d"

export default function LivraisonInternationalPage() {
  return (
    <LuxuryMain>
      <Header />

      <LuxuryHero
        breadcrumbs={[{ label: "Accueil", href: "/" }, { label: "Livraison internationale" }]}
        scriptTitle="Livraison internationale"
        subtitle="Europe, Amériques, Afrique et ailleurs : informations claires sur délais, transporteurs et douanes."
      />

      <section className="pb-16 pt-4 md:pb-24">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 md:grid-cols-2">
            <LuxuryPanel>
              <div className="mb-4 flex items-center gap-3">
                <Globe className="h-5 w-5" style={{ color: BRONZE }} />
                <h2 className="font-serif text-lg font-semibold text-[#3d3429]">Zones</h2>
              </div>
              <p className="text-sm font-light leading-relaxed text-[#6b5d4f]">
                Nous expédions dans la majorité des pays. Si votre destination n’apparaît pas au checkout, contactez-nous
                et nous trouverons une solution.
              </p>
            </LuxuryPanel>

            <LuxuryPanel>
              <div className="mb-4 flex items-center gap-3">
                <Plane className="h-5 w-5" style={{ color: BRONZE }} />
                <h2 className="font-serif text-lg font-semibold text-[#3d3429]">Délais</h2>
              </div>
              <p className="text-sm font-light leading-relaxed text-[#6b5d4f]">
                En moyenne <strong className="font-semibold text-[#4a4036]">5 à 10 jours ouvrés</strong> après
                expédition. Les délais peuvent varier selon les périodes et les formalités douanières.
              </p>
            </LuxuryPanel>
          </div>

          <div className="mt-8 grid gap-8 md:grid-cols-2">
            <LuxuryPanel>
              <div className="mb-4 flex items-center gap-3">
                <PackageCheck className="h-5 w-5" style={{ color: BRONZE }} />
                <h2 className="font-serif text-lg font-semibold text-[#3d3429]">Suivi</h2>
              </div>
              <p className="text-sm font-light leading-relaxed text-[#6b5d4f]">
                Dès que votre commande quitte l’atelier, vous recevez un e-mail avec un numéro de suivi. Vous pourrez
                suivre l’acheminement jusqu’à livraison.
              </p>
            </LuxuryPanel>

            <LuxuryPanel>
              <div className="mb-4 flex items-center gap-3">
                <AlertTriangle className="h-5 w-5" style={{ color: BRONZE }} />
                <h2 className="font-serif text-lg font-semibold text-[#3d3429]">Douanes & taxes</h2>
              </div>
              <p className="text-sm font-light leading-relaxed text-[#6b5d4f]">
                Selon votre pays, des frais de douane / TVA peuvent être appliqués à l’importation. Ces frais sont
                généralement à la charge du destinataire. Pour une estimation, contactez-nous.
              </p>
            </LuxuryPanel>
          </div>
        </div>
      </section>

      <Footer />
    </LuxuryMain>
  )
}

