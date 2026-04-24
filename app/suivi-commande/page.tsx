import { Metadata } from "next"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { LuxuryMain, LuxuryHero, LuxuryPanel } from "@/components/layout/luxury-page"
import { TrackerForm } from "./tracker-form"

export const metadata: Metadata = {
  title: "Suivi de commande | MBOULANE SHOP",
  description: "Suivez votre commande MBOULANE SHOP avec votre numéro de commande et votre téléphone.",
}

export default function SuiviCommandePage() {
  return (
    <LuxuryMain>
      <Header />

      <LuxuryHero
        breadcrumbs={[{ label: "Accueil", href: "/" }, { label: "Suivi de commande" }]}
        scriptTitle="Suivi de commande"
        subtitle="Entrez votre numéro de commande et votre téléphone pour retrouver l’état de livraison."
      />

      <section className="pb-16 pt-4 md:pb-24">
        <div className="mx-auto max-w-xl px-4 sm:px-6 lg:px-8">
          <LuxuryPanel>
            <TrackerForm />
          </LuxuryPanel>
        </div>
      </section>

      <Footer />
    </LuxuryMain>
  )
}

