"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, PackageSearch } from "lucide-react"
import { useSearchParams } from "next/navigation"

type OrderStatus = "confirmée" | "préparation" | "expédiée" | "livrée" | "annulée" | "remboursée"

type OrderItem = {
  product_id: string
  name: string
  image: string
  quantity: number
  size: number
  color: string
  unit_price: number
}

type TrackResult = {
  id: string
  created_at: string
  status: OrderStatus
  total: number
  delivery_fee: number
  city: string
  address: string
  order_items: OrderItem[]
}

const statusLabels: Record<OrderStatus, string> = {
  confirmée: "Confirmée",
  préparation: "En préparation",
  expédiée: "Expédiée",
  livrée: "Livrée",
  annulée: "Annulée",
  remboursée: "Remboursée",
}

function normalizePhoneDigits(v: string): string {
  return v.replace(/\D/g, "")
}

export function TrackerForm() {
  const sp = useSearchParams()
  const [orderNumber, setOrderNumber] = useState(sp.get("order") ?? "")
  const [phone, setPhone] = useState(sp.get("phone") ?? "")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<TrackResult | null>(null)

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await trackOrder()
  }

  const trackOrder = async (overrideOrderId?: string) => {
    setLoading(true)
    setError(null)
    setResult(null)
    try {
      const phoneDigits = normalizePhoneDigits(phone)
      const res = await fetch("/api/orders/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: (overrideOrderId ?? orderNumber).trim(),
          phone: phoneDigits,
        }),
      })
      const data = (await res.json().catch(() => null)) as { error?: string } | TrackResult | null
      if (!res.ok) {
        setError((data && "error" in data && data.error) ? data.error : "Commande introuvable.")
        setLoading(false)
        return
      }
      setResult(data as TrackResult)
      setLoading(false)
    } catch {
      setError("Erreur réseau. Vérifiez votre connexion puis réessayez.")
      setLoading(false)
    }
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
            placeholder="Ex. MB-1777048185032-404"
            required
            className="h-12 border-[#e8e2d8] bg-white focus-visible:ring-[#b38b6d]/30"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone" className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
            Téléphone
          </Label>
          <Input
            id="phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            type="tel"
            placeholder="+221 77 XXX XX XX"
            required
            className="h-12 border-[#e8e2d8] bg-white focus-visible:ring-[#b38b6d]/30"
          />
        </div>
        <Button type="submit" className="h-12 w-full rounded-full font-semibold shadow-[0_12px_36px_rgba(179,139,109,0.28)]" disabled={loading}>
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

      {error ? (
        <div className="mt-6 rounded-[5px] border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">
          {error}
        </div>
      ) : null}

      {result ? (
        <div className="mt-6 overflow-hidden rounded-[5px] border border-[#ebe5dc] bg-white shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#ebe5dc] bg-[#F7F3EC]/60 px-4 py-3">
            <div>
              <p className="font-mono text-sm font-semibold text-[#3d3429]">N° {result.id}</p>
              <p className="text-xs text-[#8a7d72]">
                {new Date(result.created_at).toLocaleString("fr-FR", { dateStyle: "medium", timeStyle: "short" })}
              </p>
            </div>
            <span className="rounded-full bg-[#b38b6d]/15 px-3 py-1 text-xs font-semibold text-[#8b5e4a]">
              {statusLabels[result.status]}
            </span>
          </div>

          <div className="px-4 py-4 text-sm text-[#6b5d4f]">
            <p>
              <span className="font-semibold text-[#3d3429]">Livraison</span> · {result.city} · {result.address}
            </p>
            <p className="mt-2">
              <span className="font-semibold text-[#3d3429]">Articles</span> · {result.order_items.length}
            </p>
          </div>
        </div>
      ) : null}
    </>
  )
}

