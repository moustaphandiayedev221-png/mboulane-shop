"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, PackageSearch } from "lucide-react"

export function TrackerForm() {
  const [orderNumber, setOrderNumber] = useState("")
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<string | null>(null)

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setResult(null)
    await new Promise((r) => setTimeout(r, 900))
    setLoading(false)
    setResult(
      "Le suivi automatisé arrive bientôt. En attendant, envoyez-nous votre numéro de commande sur WhatsApp ou par e-mail et nous vous répondrons rapidement.",
    )
  }

  return (
    <>
      <form onSubmit={onSubmit} className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="order" className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
            Numéro de commande
          </Label>
          <Input
            id="order"
            value={orderNumber}
            onChange={(e) => setOrderNumber(e.target.value)}
            placeholder="Ex. MB-2026-00123"
            required
            className="h-12 border-[#e8e2d8] bg-white focus-visible:ring-[#b38b6d]/30"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email" className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
            Email
          </Label>
          <Input
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            placeholder="Votre email"
            required
            className="h-12 border-[#e8e2d8] bg-white focus-visible:ring-[#b38b6d]/30"
          />
        </div>
        <Button
          type="submit"
          className="h-12 w-full rounded-full font-semibold shadow-[0_12px_36px_rgba(179,139,109,0.28)]"
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Recherche…
            </>
          ) : (
            <>
              <PackageSearch className="mr-2 h-4 w-4" />
              Suivre ma commande
            </>
          )}
        </Button>
      </form>

      {result ? (
        <div className="mt-6 rounded-[5px] border border-[#ebe5dc] bg-[#F7F3EC]/70 p-4 text-sm font-light leading-relaxed text-[#6b5d4f]">
          {result}
        </div>
      ) : null}
    </>
  )
}

