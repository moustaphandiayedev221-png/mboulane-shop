import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { LuxuryMain, LuxuryHero, LuxuryPanel } from "@/components/layout/luxury-page"
import { MapPin, Globe, Clock, Package } from "lucide-react"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Livraison | MBOULANE SHOP",
  description:
    "Toutes les informations sur la livraison de nos sandales : coûts, délais pour le Sénégal et l'international.",
}

const BRONZE = "#b38b6d"

export default function LivraisonPage() {
  return (
    <LuxuryMain>
      <Header />

      <LuxuryHero
        breadcrumbs={[{ label: "Accueil", href: "/" }, { label: "Livraison" }]}
        scriptTitle="Livraison"
        subtitle="Où que vous soyez, MBOULANE veille à ce que vos sandales arrivent avec soin."
      />

      <section className="pb-16 pt-4 md:pb-24">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 grid gap-8 md:grid-cols-2">
            <LuxuryPanel>
              <div
                className="mb-6 flex h-12 w-12 items-center justify-center rounded-full border border-[#e8e2d8]"
                style={{ background: `${BRONZE}14` }}
              >
                <MapPin className="h-6 w-6" style={{ color: BRONZE }} />
              </div>
              <h2 className="mb-3 font-serif text-xl font-semibold text-[#3d3429]">
                Livraison locale (Sénégal)
              </h2>
              <p className="mb-4 font-light leading-relaxed text-[#6b5d4f]">
                Pour nos clients au Sénégal, nous expédions rapidement via nos livreurs partenaires depuis Dakar.
              </p>
              <ul className="space-y-2 text-sm font-light text-[#6b5d4f]">
                <li className="flex items-center gap-2">
                  <Clock className="h-4 w-4 shrink-0" style={{ color: BRONZE }} />
                  <strong className="font-semibold text-[#4a4036]">Délai :</strong> 24 h à 48 h ouvrés
                </li>
                <li className="flex items-center gap-2">
                  <Package className="h-4 w-4 shrink-0" style={{ color: BRONZE }} />
                  <strong className="font-semibold text-[#4a4036]">Coût :</strong> à partir de 2 500 FCFA à Dakar (variable en régions)
                </li>
              </ul>
            </LuxuryPanel>

            <LuxuryPanel>
              <div
                className="mb-6 flex h-12 w-12 items-center justify-center rounded-full border border-[#e8e2d8]"
                style={{ background: `${BRONZE}14` }}
              >
                <Globe className="h-6 w-6" style={{ color: BRONZE }} />
              </div>
              <h2 className="mb-3 font-serif text-xl font-semibold text-[#3d3429]">
                Livraison internationale
              </h2>
              <p className="mb-4 font-light leading-relaxed text-[#6b5d4f]">
                Nous expédions nos sandales dans le monde entier (Europe, Amériques, reste de l&apos;Afrique) via DHL
                Express.
              </p>
              <ul className="space-y-2 text-sm font-light text-[#6b5d4f]">
                <li className="flex items-center gap-2">
                  <Clock className="h-4 w-4 shrink-0" style={{ color: BRONZE }} />
                  <strong className="font-semibold text-[#4a4036]">Délai :</strong> 5 à 10 jours ouvrés
                </li>
                <li className="flex items-center gap-2">
                  <Package className="h-4 w-4 shrink-0" style={{ color: BRONZE }} />
                  <strong className="font-semibold text-[#4a4036]">Coût :</strong> selon destination (calculé au passage en caisse)
                </li>
              </ul>
            </LuxuryPanel>
          </div>

          <LuxuryPanel className="mx-auto max-w-3xl text-center">
            <h3 className="mb-4 font-serif text-xl font-semibold text-[#3d3429] md:text-2xl">
              Suivi de commande
            </h3>
            <p className="font-light leading-relaxed text-[#6b5d4f]">
              Dès que votre commande quitte notre atelier artisanal, vous recevrez un e-mail avec votre numéro de suivi.
              Vous pourrez suivre vos sandales MBOULANE jusqu&apos;à votre porte.
            </p>
          </LuxuryPanel>
        </div>
      </section>

      <Footer />
    </LuxuryMain>
  )
}
