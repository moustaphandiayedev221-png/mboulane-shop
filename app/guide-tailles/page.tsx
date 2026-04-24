import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { LuxuryMain, LuxuryHero, LuxuryPanel } from "@/components/layout/luxury-page"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Guide des Tailles | MBOULANE SHOP",
  description:
    "Trouvez la pointure idéale pour vos sandales avec notre guide de correspondances et conseils.",
}

const BRONZE = "#b38b6d"

export default function GuideTaillesPage() {
  return (
    <LuxuryMain>
      <Header />

      <LuxuryHero
        breadcrumbs={[{ label: "Accueil", href: "/" }, { label: "Guide des tailles" }]}
        scriptTitle="Guide des tailles"
        subtitle="Correspondances EU / UK / US et longueur du pied — pour choisir la pointure parfaite."
      />

      <section className="pb-16 pt-4 md:pb-24">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <LuxuryPanel className="mb-10 overflow-hidden p-0">
            <div className="overflow-x-auto">
              <table className="w-full whitespace-nowrap text-left text-sm">
                <thead>
                  <tr className="border-b border-[#ebe5dc] bg-[#F7F3EC]/80 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#6b5d4f]">
                    <th className="px-6 py-4" style={{ color: BRONZE }}>
                      Pointure (EU)
                    </th>
                    <th className="px-6 py-4">Taille (UK)</th>
                    <th className="px-6 py-4">Taille (US)</th>
                    <th className="px-6 py-4">Longueur du pied (cm)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#ebe5dc] font-light text-[#4a4036]">
                  {[
                    { eu: "37", uk: "4", us: "6", cm: "23.5" },
                    { eu: "38", uk: "5", us: "7", cm: "24.1" },
                    { eu: "39", uk: "6", us: "8", cm: "24.8" },
                    { eu: "40", uk: "6.5", us: "8.5", cm: "25.4" },
                    { eu: "41", uk: "7", us: "9", cm: "26.0" },
                    { eu: "42", uk: "8", us: "10", cm: "26.7" },
                    { eu: "43", uk: "9", us: "11", cm: "27.3" },
                    { eu: "44", uk: "10", us: "12", cm: "27.9" },
                    { eu: "45", uk: "10.5", us: "12.5", cm: "28.6" },
                  ].map((row) => (
                    <tr key={row.eu} className="transition-colors hover:bg-[#FDFBF7]/90">
                      <td className="px-6 py-4 font-semibold tabular-nums" style={{ color: BRONZE }}>
                        {row.eu}
                      </td>
                      <td className="px-6 py-4 tabular-nums">{row.uk}</td>
                      <td className="px-6 py-4 tabular-nums">{row.us}</td>
                      <td className="px-6 py-4 tabular-nums">{row.cm}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </LuxuryPanel>

          <LuxuryPanel className="border-[#d8ccb8]/90 bg-[#FDFBF7]/95">
            <h3 className="mb-4 font-serif text-xl font-semibold text-[#3d3429] md:text-2xl">
              Comment mesurer votre pied ?
            </h3>
            <ol className="list-decimal space-y-3 pl-5 font-light leading-relaxed text-[#6b5d4f]">
              <li>Placez une feuille de papier sur le sol, contre un mur.</li>
              <li>Posez votre pied nu sur la feuille, le talon bien collé au mur.</li>
              <li>Tracez un trait devant l&apos;orteil le plus long.</li>
              <li>Mesurez la distance en centimètres entre le bord de la feuille (le mur) et le trait.</li>
              <li>Reportez-vous au tableau ci-dessus pour trouver votre pointure idéale.</li>
            </ol>
            <p className="mt-6 text-sm italic text-[#b38b6d]">
              Si vous hésitez entre deux pointures, nous vous conseillons la pointure supérieure pour un confort optimal.
            </p>
          </LuxuryPanel>
        </div>
      </section>

      <Footer />
    </LuxuryMain>
  )
}
