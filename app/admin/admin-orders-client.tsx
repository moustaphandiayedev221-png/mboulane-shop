"use client"

import { useMemo, useState } from "react"
import { Search, SlidersHorizontal, ExternalLink, Loader2, Package, Truck, CheckCircle2, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

export type OrderStatus = "confirmée" | "préparation" | "expédiée" | "livrée" | "annulée" | "remboursée"

export type AdminOrderItem = {
  product_id: string
  name: string
  image: string
  quantity: number
  size: number
  color: string
  unit_price: number
}

export type AdminOrderRow = {
  id: string
  created_at: string
  email: string
  first_name: string
  last_name: string
  phone: string
  city: string
  address: string
  notes: string | null
  payment_method: string
  subtotal: number
  delivery_fee: number
  total: number
  status: OrderStatus
  order_items: AdminOrderItem[]
}

const STATUS: { id: OrderStatus | "toutes"; label: string }[] = [
  { id: "toutes", label: "Toutes" },
  { id: "confirmée", label: "Confirmées" },
  { id: "préparation", label: "Préparation" },
  { id: "expédiée", label: "Expédiées" },
  { id: "livrée", label: "Livrées" },
  { id: "annulée", label: "Annulées" },
  { id: "remboursée", label: "Remboursées" },
]

function formatFcfa(v: number) {
  return `${Number(v || 0).toLocaleString("fr-FR")} FCFA`
}

function statusStyle(status: OrderStatus) {
  switch (status) {
    case "confirmée":
      return { label: "Confirmée", pill: "bg-amber-500/10 text-amber-800 border-amber-500/20" }
    case "préparation":
      return { label: "Préparation", pill: "bg-sky-500/10 text-sky-800 border-sky-500/20" }
    case "expédiée":
      return { label: "Expédiée", pill: "bg-violet-500/10 text-violet-800 border-violet-500/20" }
    case "livrée":
      return { label: "Livrée", pill: "bg-emerald-500/10 text-emerald-800 border-emerald-500/20" }
    case "annulée":
      return { label: "Annulée", pill: "bg-rose-500/10 text-rose-800 border-rose-500/20" }
    case "remboursée":
      return { label: "Remboursée", pill: "bg-slate-500/10 text-slate-200 border-slate-500/20" }
  }
}

function StatusIcon({ status }: { status: OrderStatus }) {
  switch (status) {
    case "confirmée":
      return <Clock className="h-4 w-4" />
    case "préparation":
      return <Package className="h-4 w-4" />
    case "expédiée":
      return <Truck className="h-4 w-4" />
    case "livrée":
      return <CheckCircle2 className="h-4 w-4" />
    case "annulée":
      return <Clock className="h-4 w-4" />
    case "remboursée":
      return <CheckCircle2 className="h-4 w-4" />
  }
}

async function updateOrderStatus(id: string, status: OrderStatus) {
  const res = await fetch(`/api/admin/orders/${encodeURIComponent(id)}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  })
  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as unknown
    const message =
      body && typeof body === "object" && "error" in body
        ? String((body as { error?: unknown }).error ?? "")
        : ""
    throw new Error(message || "Impossible de mettre à jour le statut.")
  }
}

export function AdminOrdersClient({
  orders: initialOrders,
  adminEmail,
}: {
  orders: AdminOrderRow[]
  adminEmail: string
}) {
  const [q, setQ] = useState("")
  const [tab, setTab] = useState<(typeof STATUS)[number]["id"]>("toutes")
  const [selected, setSelected] = useState<AdminOrderRow | null>(null)
  const [orders, setOrders] = useState<AdminOrderRow[]>(initialOrders)
  const [saving, setSaving] = useState<{ id: string; status: OrderStatus } | null>(null)

  const kpis = useMemo(() => {
    const total = orders.reduce((acc, o) => acc + Number(o.total || 0), 0)
    const counts = {
      toutes: orders.length,
      confirmée: orders.filter((o) => o.status === "confirmée").length,
      préparation: orders.filter((o) => o.status === "préparation").length,
      expédiée: orders.filter((o) => o.status === "expédiée").length,
      livrée: orders.filter((o) => o.status === "livrée").length,
      annulée: orders.filter((o) => o.status === "annulée").length,
      remboursée: orders.filter((o) => o.status === "remboursée").length,
    }
    return { total, counts }
  }, [orders])

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase()
    return orders.filter((o) => {
      if (tab !== "toutes" && o.status !== tab) return false
      if (!query) return true
      const hay = `${o.id} ${o.email} ${o.first_name} ${o.last_name} ${o.phone} ${o.city}`.toLowerCase()
      return hay.includes(query)
    })
  }, [orders, q, tab])

  const setStatus = async (o: AdminOrderRow, status: OrderStatus) => {
    setSaving({ id: o.id, status })
    try {
      await updateOrderStatus(o.id, status)
      setOrders((prev) => prev.map((x) => (x.id === o.id ? { ...x, status } : x)))
      setSelected((prev) => (prev?.id === o.id ? { ...prev, status } : prev))
    } finally {
      setSaving(null)
    }
  }

  return (
    <div className="space-y-6 text-white">
      <div className="rounded-2xl border border-white/10 bg-white/5 p-5 shadow-[0_18px_60px_rgba(0,0,0,0.35)] backdrop-blur md:p-6">
        <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div className="space-y-1.5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/50">
              Admin · Commandes
            </p>
            <h1 className="text-2xl font-semibold tracking-tight text-white md:text-3xl">
              Tableau de bord
            </h1>
            <p className="text-sm text-white/60">{adminEmail}</p>
          </div>

          <div className="grid grid-cols-2 gap-3 md:flex md:gap-4">
            <div className="rounded-xl border border-white/10 bg-black/20 px-4 py-3">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/45">Commandes</p>
              <p className="mt-1 text-2xl font-semibold text-white">{kpis.counts.toutes}</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-black/20 px-4 py-3">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/45">CA</p>
              <p className="mt-1 text-2xl font-semibold text-white">{formatFcfa(kpis.total)}</p>
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-3 md:grid-cols-[1fr_auto] md:items-center">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/45" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Rechercher par ID, email, nom, téléphone, ville…"
              className="h-12 rounded-xl border-white/10 bg-black/20 pl-10 text-white placeholder:text-white/35"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {STATUS.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setTab(s.id)}
                className={cn(
                  "inline-flex items-center gap-2 rounded-full border px-3 py-2 text-[11px] font-bold uppercase tracking-[0.14em] transition-all",
                  tab === s.id
                    ? "border-[#b38b6d]/60 bg-[#b38b6d]/10 text-white"
                    : "border-white/10 bg-black/20 text-white/70 hover:border-[#b38b6d]/35 hover:bg-black/30",
                )}
              >
                <SlidersHorizontal className="h-3.5 w-3.5 opacity-70" />
                {s.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/5 shadow-[0_18px_60px_rgba(0,0,0,0.35)] backdrop-blur">
        {filtered.length === 0 ? (
          <div className="p-8 text-center text-sm text-white/60">Aucune commande.</div>
        ) : (
          <div className="divide-y divide-white/10">
            {filtered.map((o) => {
              const s = statusStyle(o.status)
              return (
                <button
                  key={o.id}
                  type="button"
                  onClick={() => setSelected(o)}
                  className={cn(
                    "w-full text-left transition-colors hover:bg-white/5",
                    "px-4 py-4 md:px-6",
                  )}
                >
                  <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-3">
                        <span className="font-mono text-sm font-semibold text-white">{o.id}</span>
                        <span
                          className={cn(
                            "inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[11px] font-semibold",
                            s.pill,
                          )}
                        >
                          <StatusIcon status={o.status} />
                          {s.label}
                        </span>
                        <span className="text-xs text-white/45">
                          {new Date(String(o.created_at)).toLocaleString("fr-FR", {
                            dateStyle: "medium",
                            timeStyle: "short",
                          })}
                        </span>
                      </div>
                      <div className="mt-2 text-sm font-semibold text-white">
                        {o.first_name} {o.last_name}
                        <span className="ml-2 text-xs font-normal text-white/55">{o.email}</span>
                      </div>
                      <div className="mt-1 text-xs text-white/55">
                        {o.city} · {o.phone}
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-3 md:justify-end">
                      <div className="text-right">
                        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/45">
                          Total
                        </p>
                        <p className="text-xl font-semibold text-white">{formatFcfa(o.total)}</p>
                      </div>
                      <span className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-black/20 text-white/70">
                        <ExternalLink className="h-4 w-4" />
                      </span>
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        )}
      </div>

      <Dialog open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent className="max-w-[min(100vw-1rem,980px)] rounded-2xl border border-white/10 bg-[#0f0f12] p-0 text-white">
          {selected ? (
            <div className="grid gap-0 md:grid-cols-[1.25fr_1fr]">
              <div className="border-b border-white/10 p-6 md:border-b-0 md:border-r">
                <DialogHeader className="space-y-2 text-left">
                  <DialogTitle className="text-2xl font-semibold text-white">
                    Commande {selected.id}
                  </DialogTitle>
                  <p className="text-sm text-white/60">
                    {selected.first_name} {selected.last_name} · {selected.email}
                  </p>
                </DialogHeader>

                <div className="mt-6 grid gap-4">
                  <div className="rounded-xl border border-white/10 bg-black/20 p-4">
                    <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/45">Livraison</p>
                    <p className="mt-2 text-sm font-semibold text-white">{selected.city}</p>
                    <p className="mt-1 text-sm text-white/60">{selected.address}</p>
                    {selected.notes ? (
                      <p className="mt-3 text-xs text-white/60">
                        <span className="font-semibold">Note :</span> {selected.notes}
                      </p>
                    ) : null}
                  </div>

                  <div className="rounded-xl border border-white/10 bg-black/20 p-4">
                    <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/45">Articles</p>
                    <div className="mt-3 space-y-3">
                      {selected.order_items?.length ? (
                        selected.order_items.map((it, idx) => (
                          <div key={`${it.product_id}-${idx}`} className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <p className="truncate text-sm font-semibold text-white">{it.name}</p>
                              <p className="text-xs text-white/60">
                                Qté {it.quantity} · Taille {it.size} · {it.color}
                              </p>
                            </div>
                            <p className="shrink-0 text-sm font-semibold text-white">
                              {formatFcfa(Number(it.unit_price) * Number(it.quantity))}
                            </p>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-white/60">Aucune ligne.</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6">
                <div className="rounded-xl border border-white/10 bg-black/20 p-4">
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/45">Totaux</p>
                  <div className="mt-3 space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-white/60">Sous-total</span>
                      <span className="font-semibold text-white">{formatFcfa(selected.subtotal)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-white/60">Livraison</span>
                      <span className="font-semibold text-white">{formatFcfa(selected.delivery_fee)}</span>
                    </div>
                    <div className="mt-2 flex items-center justify-between border-t border-white/10 pt-3">
                      <span className="font-semibold text-white">Total</span>
                      <span className="text-xl font-semibold text-white">{formatFcfa(selected.total)}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 rounded-xl border border-white/10 bg-black/20 p-4">
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/45">Statut</p>

                  <div className="mt-3 grid grid-cols-2 gap-2">
                    {(["confirmée", "préparation", "expédiée", "livrée", "annulée", "remboursée"] as OrderStatus[]).map((st) => {
                      const active = selected.status === st
                      const busy = saving?.id === selected.id && saving.status === st
                      return (
                        <Button
                          key={st}
                          type="button"
                          variant={active ? "default" : "outline"}
                          className={cn(
                            "h-11 rounded-xl font-semibold",
                            active
                              ? "bg-[#b38b6d] text-black hover:bg-[#c29a7d]"
                              : "border-white/10 bg-black/20 text-white hover:bg-black/30",
                          )}
                          onClick={() => setStatus(selected, st)}
                          disabled={!!saving}
                        >
                          {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                          {statusStyle(st).label}
                        </Button>
                      )
                    })}
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  )
}

