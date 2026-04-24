"use client"

import { useState } from "react"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { LuxuryMain, LuxuryHero } from "@/components/layout/luxury-page"
import { ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

const BRONZE = "#b38b6d"

const faqs = [
  {
    question: "Où sont fabriquées vos sandales ?",
    answer:
      "Toutes nos sandales sont fièrement fabriquées à la main dans notre atelier à Dakar, au Sénégal. Nous travaillons exclusivement avec des maîtres artisans locaux.",
  },
  {
    question: "Comment entretenir le cuir de mes sandales MBOULANE ?",
    answer:
      "Nos cuirs premium sont naturels. Nous vous recommandons de les nourrir occasionnellement avec un baume ou une cire d'abeille incolore. Évitez les expositions prolongées à l'eau ou au soleil de manière excessive.",
  },
  {
    question: "Faites-vous du sur-mesure ?",
    answer:
      "Pour l'instant, nous proposons des collections fixes. Cependant, nos modèles s'adaptent très bien grâce à nos cuirs souples qui prennent la forme de votre pied après quelques ports.",
  },
  {
    question: "Quels sont les moyens de paiement acceptés ?",
    answer:
      "Orange Money et Wave sont privilégiés pour le Sénégal. Une demande de paiement par carte bancaire peut être étudiée selon les disponibilités (pas de prélèvement carte en ligne sur le site pour l’instant). Paiement à la livraison possible dans la région de Dakar.",
  },
  {
    question: "Mon article a un défaut, que faire ?",
    answer:
      "L'artisanat implique de légères variations qui font le charme de nos pièces. Si vous constatez un réel défaut structurel, contactez-nous dans les 14 jours avec des photos. Nous nous engageons à remplacer l'article.",
  },
]

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  return (
    <LuxuryMain>
      <Header />

      <LuxuryHero
        breadcrumbs={[{ label: "Accueil", href: "/" }, { label: "FAQ" }]}
        scriptTitle="Foire aux questions"
        subtitle="Tout ce que vous devez savoir sur MBOULANE — réponses claires, sans détour."
      />

      <section className="pb-16 pt-4 md:pb-24">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="space-y-3">
            {faqs.map((faq, index) => {
              const isOpen = openIndex === index
              return (
                <div
                  key={index}
                  className="overflow-hidden rounded-[5px] border border-[#d8ccb8] bg-[#FDFBF7]/98 shadow-[0_8px_28px_rgba(0,0,0,0.05)] backdrop-blur-sm transition-all duration-300"
                >
                  <button
                    type="button"
                    onClick={() => setOpenIndex(isOpen ? null : index)}
                    className="flex w-full items-center justify-between gap-4 p-6 text-left"
                  >
                    <span className="font-semibold text-[#3d3429] md:text-lg">{faq.question}</span>
                    <ChevronDown
                      className={cn(
                        "h-5 w-5 shrink-0 transition-transform duration-300",
                        isOpen ? "rotate-180" : "",
                      )}
                      style={{ color: BRONZE }}
                    />
                  </button>
                  <div
                    className={cn(
                      "overflow-hidden transition-all duration-300",
                      isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0",
                    )}
                  >
                    <div className="border-t border-[#ebe5dc] px-6 pb-6 pt-0 font-light leading-relaxed text-[#6b5d4f]">
                      <p className="pt-4">{faq.answer}</p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      <Footer />
    </LuxuryMain>
  )
}
