import { Metadata } from "next"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { LuxuryMain, LuxuryHero, LuxuryPanel } from "@/components/layout/luxury-page"
import { RefreshCcw, CheckCircle2, AlertCircle, Mail } from "lucide-react"

export const metadata: Metadata = {
  title: "Retours & remboursements | MBOULANE SHOP",
  description: "Politique de retours, échanges et remboursements de MBOULANE SHOP (international inclus).",
}

const BRONZE = "#b38b6d"

export default function RetoursRemboursementsPage() {
  return (
    <LuxuryMain>
      <Header />

      <LuxuryHero
        breadcrumbs={[{ label: "Accueil", href: "/" }, { label: "Retours & remboursements" }]}
        scriptTitle="Retours & remboursements"
        subtitle="Une politique claire, valable au Sénégal comme à l’international (selon les conditions ci-dessous)."
      />

      <section className="pb-16 pt-4 md:pb-24">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="space-y-8">
            <LuxuryPanel>
              <div className="mb-4 flex items-center gap-3">
                <RefreshCcw className="h-5 w-5" style={{ color: BRONZE }} />
                <h2 className="font-serif text-lg font-semibold text-[#3d3429]">Délai</h2>
              </div>
              <p className="text-sm font-light leading-relaxed text-[#6b5d4f]">
                Vous disposez de <strong className="font-semibold text-[#4a4036]">14 jours</strong> après réception pour
                demander un retour ou un échange, sous réserve d’éligibilité.
              </p>
            </LuxuryPanel>

            <LuxuryPanel>
              <div className="mb-4 flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5" style={{ color: BRONZE }} />
                <h2 className="font-serif text-lg font-semibold text-[#3d3429]">Conditions d’éligibilité</h2>
              </div>
              <ul className="list-disc space-y-2 pl-5 text-sm font-light leading-relaxed text-[#6b5d4f]">
                <li>Article non porté, propre, dans son emballage d’origine.</li>
                <li>Étiquettes et accessoires (si fournis) retournés.</li>
                <li>Demande effectuée dans le délai annoncé.</li>
              </ul>
            </LuxuryPanel>

            <LuxuryPanel>
              <div className="mb-4 flex items-center gap-3">
                <AlertCircle className="h-5 w-5" style={{ color: BRONZE }} />
                <h2 className="font-serif text-lg font-semibold text-[#3d3429]">Frais & international</h2>
              </div>
              <p className="text-sm font-light leading-relaxed text-[#6b5d4f]">
                Les frais de retour peuvent varier selon la zone. Pour l’international, les frais d’expédition retour et
                éventuels frais de douane restent à la charge du client, sauf erreur ou défaut avéré.
              </p>
            </LuxuryPanel>

            <LuxuryPanel>
              <div className="mb-4 flex items-center gap-3">
                <Mail className="h-5 w-5" style={{ color: BRONZE }} />
                <h2 className="font-serif text-lg font-semibold text-[#3d3429]">Comment demander un retour ?</h2>
              </div>
              <ol className="list-decimal space-y-2 pl-5 text-sm font-light leading-relaxed text-[#6b5d4f]">
                <li>
                  Écrivez-nous à <strong className="font-semibold text-[#4a4036]">mboulaneshop@gmail.com</strong> avec
                  votre numéro de commande.
                </li>
                <li>Nous vous indiquons la marche à suivre (adresse, étiquette si applicable).</li>
                <li>Après réception et vérification, nous lançons l’échange ou le remboursement.</li>
              </ol>
            </LuxuryPanel>
          </div>
        </div>
      </section>

      <Footer />
    </LuxuryMain>
  )
}

