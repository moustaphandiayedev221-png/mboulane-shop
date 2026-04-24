"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, PackageSearch } from "lucide-react"
import { useSearchParams } from "next/navigation"
import { formatPrice } from "@/lib/store"

type OrderStatus = "confirmée" | "préparation" | "expédiée" | "livrée"

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
}

type OrderListItem = {
  id: string
  created_at: string
  status: OrderStatus
  total: number
}

function normalizePhoneDigits(v: string): string {
  return v.replace(/\D/g, "")
}

export function TrackerForm() {
  const sp = useSearchParams()
  const [orderNumber, setOrderNumber] = useState(sp.get("order") ?? "")
  const [phone, setPhone] = useState(sp.get("phone") ?? "")
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<TrackResult | null>(null)
  const [list, setList] = useState<OrderListItem[] | null>(null)

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await trackOrder()
  }

  const trackOrder = async (overrideOrderId?: string) => {
    setLoading(true)
    setError(null)
    setResult(null)
    setList(null)
    try {
      const phoneDigits = normalizePhoneDigits(phone)
      const res = await fetch("/api/orders/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: (overrideOrderId ?? orderNumber).trim(),
          phone: phoneDigits,
          firstName: firstName.trim(),
          lastName: lastName.trim(),
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

  const fetchList = async () => {
    setLoading(true)
    setError(null)
    setResult(null)
    setList(null)
    try {
      const phoneDigits = normalizePhoneDigits(phone)
      const res = await fetch("/api/orders/by-phone", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: phoneDigits, firstName: firstName.trim(), lastName: lastName.trim() }),
      })
      const data = (await res.json().catch(() => null)) as { error?: string } | OrderListItem[] | null
      if (!res.ok) {
        setError((data && "error" in data && data.error) ? data.error : "Impossible de récupérer les commandes.")
        setLoading(false)
        return
      }
      setList(Array.isArray(data) ? (data as OrderListItem[]) : [])
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
        <div className="space-y-2">
          <Label htmlFor="firstName" className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
            Prénom
          </Label>
          <Input
            id="firstName"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            placeholder="Ex. Aïssatou"
            required
            className="h-12 border-[#e8e2d8] bg-white focus-visible:ring-[#b38b6d]/30"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="lastName" className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
            Nom
          </Label>
          <Input
            id="lastName"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            placeholder="Ex. Ndiaye"
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

        <div className="rounded-[5px] border border-[#ebe5dc] bg-[#F7F3EC]/60 p-4">
          <p className="mb-3 text-xs font-bold uppercase tracking-widest text-[#6b5d4f]">Voir mes commandes</p>
          <Button
            type="button"
            onClick={fetchList}
            disabled={loading || !phone.trim() || !firstName.trim() || !lastName.trim()}
            variant="outline"
            className="mt-3 h-12 w-full rounded-full border-2 border-[#e0d9ce] font-semibold hover:bg-[#FDFBF7]"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Chargement…
              </>
            ) : (
              "Afficher mes commandes"
            )}
          </Button>
        </div>
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

      {list ? (
        <div className="mt-6 overflow-hidden rounded-[5px] border border-[#ebe5dc] bg-white shadow-sm">
          <div className="border-b border-[#ebe5dc] bg-[#F7F3EC]/60 px-4 py-3">
            <p className="text-sm font-semibold text-[#3d3429]">Mes commandes</p>
            <p className="text-xs text-[#8a7d72]">{list.length === 0 ? "Aucune commande trouvée." : `${list.length} commande(s)`}</p>
          </div>
          {list.length === 0 ? null : (
            <ul className="divide-y divide-[#ebe5dc]">
              {list.map((o) => (
                <li key={o.id} className="px-4 py-4">
                  <button
                    type="button"
                    onClick={() => {
                      setOrderNumber(o.id)
                      void trackOrder(o.id)
                    }}
                    className="w-full text-left"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="font-mono text-sm font-semibold text-[#3d3429]">N° {o.id}</p>
                        <p className="text-xs text-[#8a7d72]">
                          {new Date(o.created_at).toLocaleString("fr-FR", { dateStyle: "medium", timeStyle: "short" })}
                        </p>
                      </div>
                      <span className="rounded-full bg-[#b38b6d]/15 px-3 py-1 text-xs font-semibold text-[#8b5e4a]">
                        {statusLabels[o.status]}
                      </span>
                    </div>
                    <div className="mt-3 flex items-center justify-between text-sm">
                      <span className="text-[#6b5d4f]">Total</span>
                      <span className="font-semibold text-[#3d3429]">{formatPrice(o.total)}</span>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : null}
    </>
  )
}

