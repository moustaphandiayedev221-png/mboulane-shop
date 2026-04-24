import { Metadata } from "next"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { LuxuryMain, LuxuryHero, LuxuryPanel } from "@/components/layout/luxury-page"
import { Clock, Mail, MessageCircle, Phone, ShieldCheck } from "lucide-react"

export const metadata: Metadata = {
  title: "Service client | MBOULANE SHOP",
  description: "Contacter le service client MBOULANE SHOP : WhatsApp, email, horaires et délais de réponse.",
}

const BRONZE = "#b38b6d"

export default function ServiceClientPage() {
  return (
    <LuxuryMain>
      <Header />

      <LuxuryHero
        breadcrumbs={[{ label: "Accueil", href: "/" }, { label: "Service client" }]}
        scriptTitle="Service client"
        subtitle="Besoin d’aide ? Nous vous accompagnons avant, pendant et après votre commande."
      />

      <section className="pb-16 pt-4 md:pb-24">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 md:grid-cols-2">
            <LuxuryPanel>
              <div className="mb-4 flex items-center gap-3">
                <MessageCircle className="h-5 w-5" style={{ color: BRONZE }} />
                <h2 className="font-serif text-lg font-semibold text-[#3d3429]">WhatsApp</h2>
              </div>
              <p className="text-sm font-light leading-relaxed text-[#6b5d4f]">
                Réponse rapide : privilégiez WhatsApp pour une question sur une taille, une disponibilité ou une
                commande.
              </p>
              <a
                href="https://wa.me/22177239305"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-5 inline-flex items-center justify-center rounded-full bg-[#25D366] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#20BD5A]"
              >
                Écrire sur WhatsApp
              </a>
            </LuxuryPanel>

            <LuxuryPanel>
              <div className="mb-4 flex items-center gap-3">
                <Mail className="h-5 w-5" style={{ color: BRONZE }} />
                <h2 className="font-serif text-lg font-semibold text-[#3d3429]">Email</h2>
              </div>
              <p className="text-sm font-light leading-relaxed text-[#6b5d4f]">
                Pour les demandes détaillées (retour, facturation, partenariat) :{" "}
                <a
                  href="mailto:mboulaneshop@gmail.com"
                  className="font-semibold text-[#4a4036] underline-offset-4 hover:underline"
                >
                  mboulaneshop@gmail.com
                </a>
                .
              </p>
            </LuxuryPanel>
          </div>

          <div className="mt-8 grid gap-8 md:grid-cols-3">
            <LuxuryPanel>
              <div className="mb-4 flex items-center gap-3">
                <Phone className="h-5 w-5" style={{ color: BRONZE }} />
                <h2 className="font-serif text-lg font-semibold text-[#3d3429]">Téléphone</h2>
              </div>
              <p className="text-sm font-light leading-relaxed text-[#6b5d4f]">+221 77 23 93 05</p>
            </LuxuryPanel>

            <LuxuryPanel>
              <div className="mb-4 flex items-center gap-3">
                <Clock className="h-5 w-5" style={{ color: BRONZE }} />
                <h2 className="font-serif text-lg font-semibold text-[#3d3429]">Horaires</h2>
              </div>
              <p className="text-sm font-light leading-relaxed text-[#6b5d4f]">Lun–Sam : 9h–19h (GMT)</p>
            </LuxuryPanel>

            <LuxuryPanel>
              <div className="mb-4 flex items-center gap-3">
                <ShieldCheck className="h-5 w-5" style={{ color: BRONZE }} />
                <h2 className="font-serif text-lg font-semibold text-[#3d3429]">Délais</h2>
              </div>
              <p className="text-sm font-light leading-relaxed text-[#6b5d4f]">
                WhatsApp : souvent en quelques minutes. Email : sous 24h ouvrées.
              </p>
            </LuxuryPanel>
          </div>
        </div>
      </section>

      <Footer />
    </LuxuryMain>
  )
}

