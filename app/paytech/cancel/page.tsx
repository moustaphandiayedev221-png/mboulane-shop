import Link from "next/link"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { LuxuryMain, LuxuryPanel } from "@/components/layout/luxury-page"
import { Button } from "@/components/ui/button"

export default async function PaytechCancelPage(props: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const sp = await props.searchParams
  const ref = typeof sp.ref === "string" ? sp.ref : Array.isArray(sp.ref) ? sp.ref[0] : null

  return (
    <LuxuryMain>
      <Header />
      <div className="pb-16 pt-24 md:pt-32">
        <div className="mx-auto max-w-xl px-4 text-center sm:px-6 lg:px-8">
          <LuxuryPanel className="py-14">
            <p className="mb-3 text-[11px] font-medium uppercase tracking-[0.22em] text-[#8a7d70]">PayTech</p>
            <h1 className="mb-4 font-serif text-4xl font-semibold tracking-tight text-[#3d3429]">Paiement annulé</h1>
            <p className="mb-8 text-lg font-light leading-relaxed text-[#6b5d4f]">
              Aucun débit n’a été effectué. Vous pouvez réessayer ou choisir le paiement à la livraison.
            </p>
            {ref ? (
              <p className="mb-8 rounded-[5px] border border-[#ebe5dc] bg-[#F7F3EC]/80 px-4 py-3 font-mono text-sm font-semibold text-[#3d3429]">
                Référence : {ref}
              </p>
            ) : null}
            <div className="space-y-4">
              <Button asChild className="h-14 w-full rounded-full text-lg font-semibold shadow-[0_12px_36px_rgba(179,139,109,0.28)]">
                <Link href="/checkout">Retour au checkout</Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="h-14 w-full rounded-full border-[#e0d9ce] text-lg font-semibold hover:bg-[#FDFBF7]"
              >
                <Link href="/boutique">Retour à la boutique</Link>
              </Button>
            </div>
          </LuxuryPanel>
        </div>
      </div>
      <Footer />
    </LuxuryMain>
  )
}

