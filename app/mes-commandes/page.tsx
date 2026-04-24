"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"

export default function MesCommandesPage() {
  const router = useRouter()

  useEffect(() => {
    router.replace("/suivi-commande")
  }, [router])

  return (
    <main className="min-h-screen bg-[#FDFBF7]">
      <Header />
      <div className="mx-auto max-w-3xl px-4 py-16 text-center text-[#6b5d4f]">Redirection…</div>
      <Footer />
    </main>
  )
}
