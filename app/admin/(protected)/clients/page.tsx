"use client"

import { useEffect, useMemo, useState } from "react"
import { Search, RefreshCcw } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

type CustomerRow = {
  id: string
  created_at: string
  updated_at: string
  email: string
  first_name: string | null
  last_name: string | null
  phone: string | null
  city: string | null
  address: string | null
  last_order_id: string | null
  last_order_at: string | null
  orders_count: number
  total_spent: number
}

export default function AdminClientsPage() {
  const [q, setQ] = useState("")
  const [rows, setRows] = useState<CustomerRow[]>([])
  const [loading, setLoading] = useState(true)

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase()
    if (!query) return rows
    return rows.filter((c) =>
      `${c.email} ${c.first_name ?? ""} ${c.last_name ?? ""} ${c.phone ?? ""} ${c.city ?? ""}`
        .toLowerCase()
        .includes(query),
    )
  }, [rows, q])

  const load = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/admin/customers")
      const data = (await res.json()) as { customers?: CustomerRow[] }
      setRows(Array.isArray(data.customers) ? data.customers : [])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
  }, [])

  return (
    <div className="space-y-6 text-white">
      <div className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-[0_18px_60px_rgba(0,0,0,0.35)] backdrop-blur">
        <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-white/50">Clients</p>
        <h1 className="mt-3 text-2xl font-semibold">Base clients</h1>
        <p className="mt-2 text-sm text-white/55">
          Liste unifiée des clients (créée automatiquement à partir des commandes).
        </p>

        <div className="mt-5 flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/45" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Rechercher par email, nom, téléphone, ville…"
              className="h-12 rounded-xl border-white/10 bg-black/20 pl-10 text-white placeholder:text-white/35"
            />
          </div>
          <Button
            variant="outline"
            className="h-12 rounded-xl border-white/10 bg-black/20 text-white"
            onClick={load}
            title="Rafraîchir"
          >
            <RefreshCcw className="mr-2 h-4 w-4" />
            Rafraîchir
          </Button>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/5 shadow-[0_18px_60px_rgba(0,0,0,0.35)] backdrop-blur">
        {loading ? (
          <div className="p-8 text-center text-white/60">Chargement…</div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center text-white/60">Aucun client.</div>
        ) : (
          <div className="divide-y divide-white/10">
            {filtered.map((c) => (
              <div key={c.id} className="px-4 py-4 md:px-6">
                <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">{c.email}</p>
                    <p className="mt-1 text-xs text-white/55">
                      {(c.first_name || c.last_name) ? `${c.first_name ?? ""} ${c.last_name ?? ""}`.trim() : "—"}{" "}
                      {c.phone ? `· ${c.phone}` : ""} {c.city ? `· ${c.city}` : ""}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-white/60">
                    <span className="rounded-full border border-white/10 bg-black/20 px-3 py-1">
                      {c.orders_count} commande(s)
                    </span>
                    <span className="rounded-full border border-white/10 bg-black/20 px-3 py-1">
                      {Number(c.total_spent || 0).toLocaleString("fr-FR")} FCFA
                    </span>
                  </div>
                </div>
                {c.last_order_id ? (
                  <p className="mt-2 text-[11px] text-white/45">
                    Dernière commande : <span className="font-mono">{c.last_order_id}</span>{" "}
                    {c.last_order_at ? `· ${new Date(c.last_order_at).toLocaleString("fr-FR")}` : ""}
                  </p>
                ) : null}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

