"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { Button } from "@/components/ui/button"
import { formatPrice } from "@/lib/store"
import { createClient } from "@/lib/supabase/client"

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

type OrderRow = {
  id: string
  created_at: string
  total: number
  status: OrderStatus
  order_items: OrderItem[]
}

const statusLabels: Record<OrderStatus, string> = {
  confirmée: "Confirmée",
  préparation: "En préparation",
  expédiée: "Expédiée",
  livrée: "Livrée",
}

export default function MesCommandesPage() {
  const router = useRouter()
  const [email, setEmail] = useState<string | null>(null)
  const [orders, setOrders] = useState<OrderRow[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user?.email) {
        router.replace("/connexion?redirect=/mes-commandes")
        return
      }
      setEmail(data.user.email)
      fetch("/api/orders")
        .then((r) => (r.ok ? r.json() : Promise.reject()))
        .then((d) => setOrders(Array.isArray(d) ? (d as OrderRow[]) : []))
        .finally(() => setLoading(false))
    })
  }, [router])

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/connexion")
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#FDFBF7]">
        <Header />
        <div className="mx-auto max-w-3xl px-4 py-16 text-center text-[#6b5d4f]">Chargement…</div>
        <Footer />
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#FDFBF7]">
      <Header />
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-serif text-3xl font-semibold text-[#3d3429]">Mes commandes</h1>
            <p className="mt-1 text-sm text-[#6b5d4f]">{email}</p>
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={handleLogout}
            className="rounded-full border-[#e0d9ce] font-semibold"
          >
            Déconnexion
          </Button>
        </div>

        {orders.length === 0 ? (
          <div className="mt-10 rounded-[5px] border border-[#ebe5dc] bg-white p-10 text-center shadow-sm">
            <p className="text-[#6b5d4f]">Aucune commande enregistrée pour cet e-mail.</p>
            <p className="mt-2 text-sm text-[#8a7d72]">
              Passez une commande avec le même e-mail que celui utilisé à la connexion pour la voir ici.
            </p>
            <Button asChild className="mt-6 rounded-full font-semibold">
              <Link href="/boutique">Découvrir la boutique</Link>
            </Button>
          </div>
        ) : (
          <ul className="mt-10 space-y-6">
            {orders.map((order) => (
              <li key={order.id} className="overflow-hidden rounded-[5px] border border-[#ebe5dc] bg-white shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#ebe5dc] bg-[#F7F3EC]/60 px-4 py-3 sm:px-6">
                  <div>
                    <p className="font-mono text-sm font-semibold text-[#3d3429]">N° {order.id}</p>
                    <p className="text-xs text-[#8a7d72]">
                      {new Date(order.created_at).toLocaleString("fr-FR", { dateStyle: "medium", timeStyle: "short" })}
                    </p>
                  </div>
                  <span className="rounded-full bg-[#b38b6d]/15 px-3 py-1 text-xs font-semibold text-[#8b5e4a]">
                    {statusLabels[order.status]}
                  </span>
                </div>
                <div className="px-4 py-4 sm:px-6">
                  <ul className="space-y-3">
                    {order.order_items.map((line, i) => (
                      <li key={`${line.product_id}-${i}`} className="flex gap-3">
                        <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-[5px] border border-[#ebe5dc] bg-[#F7F3EC]">
                          <Image src={line.image || "/placeholder.svg"} alt={line.name} fill className="object-cover" sizes="56px" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-[#3d3429]">{line.name}</p>
                          <p className="text-xs text-[#8a7d72]">
                            Qté {line.quantity}
                            {line.size ? ` · ${line.size}` : ""}
                            {line.color ? ` · ${line.color}` : ""}
                          </p>
                        </div>
                        <p className="shrink-0 text-sm font-semibold text-[#3d3429]">
                          {formatPrice(line.unit_price * line.quantity)}
                        </p>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-4 flex flex-wrap justify-between gap-2 border-t border-[#ebe5dc] pt-4 text-sm">
                    <span className="text-[#6b5d4f]">Total</span>
                    <span className="font-semibold text-[#3d3429]">{formatPrice(order.total)}</span>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
      <Footer />
    </main>
  )
}
