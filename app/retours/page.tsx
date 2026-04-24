import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { LuxuryMain, LuxuryHero, LuxuryPanel } from "@/components/layout/luxury-page"
import { RefreshCcw, HandshakeIcon, CheckCircle } from "lucide-react"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Retours & Échanges | MBOULANE SHOP",
  description:
    "Notre politique de retours et d'échanges sous 14 jours pour garantir votre satisfaction absolue.",
}

const BRONZE = "#b38b6d"

export default function RetoursPage() {
  return (
    <LuxuryMain>
      <Header />

      <LuxuryHero
        breadcrumbs={[{ label: "Accueil", href: "/" }, { label: "Retours & échanges" }]}
        scriptTitle="Retours & échanges"
        subtitle="Votre satisfaction est notre priorité — politique claire et accompagnement attentif."
      />

      <section className="py-14 md:py-20">
        <div className="mx-auto max-w-[900px] px-4 sm:px-6 lg:px-8">
          <div className="space-y-10">
            <LuxuryPanel className="flex gap-6">
              <div
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-[#e8e2d8]"
                style={{ background: `${BRONZE}14` }}
              >
                <RefreshCcw className="h-6 w-6" style={{ color: BRONZE }} />
              </div>
              <div>
                <h2 className="mb-3 font-serif text-xl font-semibold text-[#3d3429]">
                  Politique de retour (14 jours)
                </h2>
                <p className="font-light leading-relaxed text-[#6b5d4f]">
                  Si vos sandales MBOULANE ne vous conviennent pas parfaitement ou si la taille n&apos;est pas
                  adéquate, vous disposez d&apos;un délai de 14 jours francs après réception pour nous les retourner.
                  L&apos;article doit être non porté, dans son emballage d&apos;origine, et en parfait état de revente.
                </p>
              </div>
            </LuxuryPanel>

            <LuxuryPanel className="flex gap-6">
              <div
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-[#e8e2d8]"
                style={{ background: `${BRONZE}14` }}
              >
                <CheckCircle className="h-6 w-6" style={{ color: BRONZE }} />
              </div>
              <div>
                <h2 className="mb-3 font-serif text-xl font-semibold text-[#3d3429]">
                  Comment effectuer un retour ?
                </h2>
                <ol className="list-decimal space-y-2 pl-5 font-light leading-relaxed text-[#6b5d4f]">
                  <li>
                    Contactez notre service client à <strong className="font-semibold text-[#4a4036]">mboulaneshop@gmail.com</strong>{" "}
                    avec votre numéro de commande.
                  </li>
                  <li>
                    Nous vous enverrons un bordereau de retour (les frais de port de retour peuvent être à votre charge
                    selon votre localisation).
                  </li>
                  <li>Emballez soigneusement les sandales.</li>
                  <li>
                    Une fois le colis réceptionné et vérifié à notre atelier, nous procéderons au remboursement ou à
                    l&apos;envoi de la nouvelle taille.
                  </li>
                </ol>
              </div>
            </LuxuryPanel>

            <LuxuryPanel className="flex gap-6">
              <div
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-[#e8e2d8]"
                style={{ background: `${BRONZE}14` }}
              >
                <HandshakeIcon className="h-6 w-6" style={{ color: BRONZE }} />
              </div>
              <div>
                <h2 className="mb-3 font-serif text-xl font-semibold text-[#3d3429]">
                  Échanges & défauts
                </h2>
                <p className="font-light leading-relaxed text-[#6b5d4f]">
                  Nos cuirs sont minutieusement sélectionnés. L&apos;artisanat implique une part de naturel (nuances de
                  cuir, marques d&apos;authenticité). Si une sandale présente un réel défaut de fabrication, MBOULANE
                  prendra intégralement en charge son échange dans les plus brefs délais.
                </p>
              </div>
            </LuxuryPanel>
          </div>
        </div>
      </section>

      <Footer />
    </LuxuryMain>
  )
}
