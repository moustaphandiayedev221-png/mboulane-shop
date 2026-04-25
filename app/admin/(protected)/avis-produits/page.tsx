"use client"

import { useEffect, useMemo, useState } from "react"
import { RefreshCcw, Search, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

type ProductReviewRow = {
  id: number
  created_at: string
  product_id: string
  name: string
  email: string | null
  rating: number
  title: string | null
  comment: string
  approved: boolean
  source: string
}

export default function AdminAvisProduitsPage() {
  const [q, setQ] = useState("")
  const [rows, setRows] = useState<ProductReviewRow[]>([])
  const [loading, setLoading] = useState(true)

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase()
    if (!query) return rows
    return rows.filter((r) =>
      `${r.product_id} ${r.name} ${r.email ?? ""} ${r.title ?? ""} ${r.comment}`.toLowerCase().includes(query),
    )
  }, [rows, q])

  const load = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/admin/product-reviews")
      const data = (await res.json()) as { reviews?: ProductReviewRow[] }
      setRows(Array.isArray(data.reviews) ? data.reviews : [])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
  }, [])

  const setApproved = async (id: number, next: boolean) => {
    await fetch("/api/admin/product-reviews", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, approved: next }),
    })
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, approved: next } : r)))
  }

  const del = async (id: number) => {
    if (!confirm("Supprimer cet avis produit ?")) return
    await fetch(`/api/admin/product-reviews/${encodeURIComponent(String(id))}`, { method: "DELETE" })
    await load()
  }

  return (
    <div className="space-y-6 text-white">
      <div className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-[0_18px_60px_rgba(0,0,0,0.35)] backdrop-blur">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-white/50">Avis</p>
            <h1 className="mt-3 text-2xl font-semibold">Avis produits</h1>
            <p className="mt-2 text-sm text-white/55">Modération des avis déposés sur les fiches produits.</p>
          </div>
          <Button
            variant="outline"
            className="h-11 rounded-xl border-white/10 bg-black/20 text-white"
            onClick={load}
            disabled={loading}
          >
            <RefreshCcw className={cn("mr-2 h-4 w-4", loading && "animate-spin")} />
            Rafraîchir
          </Button>
        </div>

        <div className="mt-5 flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/45" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Rechercher (produit, nom, email, contenu)…"
              className="h-12 rounded-xl border-white/10 bg-black/20 pl-10 text-white placeholder:text-white/35"
            />
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/5 shadow-[0_18px_60px_rgba(0,0,0,0.35)] backdrop-blur">
        {loading ? (
          <div className="p-8 text-center text-white/60">Chargement…</div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center text-white/60">Aucun avis.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-[980px] w-full">
              <thead className="bg-black/20">
                <tr className="text-left text-[10px] font-bold uppercase tracking-[0.18em] text-white/45">
                  <th className="px-4 py-3 md:px-6">Produit</th>
                  <th className="px-4 py-3 md:px-6">Client</th>
                  <th className="px-4 py-3 md:px-6">Note</th>
                  <th className="px-4 py-3 md:px-6">Contenu</th>
                  <th className="px-4 py-3 md:px-6">Statut</th>
                  <th className="px-4 py-3 md:px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {filtered.map((r) => (
                  <tr key={r.id} className="bg-white/0 hover:bg-white/5">
                    <td className="px-4 py-4 md:px-6">
                      <p className="font-mono text-xs text-white/80">{r.product_id}</p>
                      <p className="mt-1 text-[11px] text-white/45">#{r.id}</p>
                    </td>
                    <td className="px-4 py-4 md:px-6">
                      <p className="text-sm font-semibold">{r.name}</p>
                      <p className="mt-1 text-xs text-white/55">{r.email ?? "—"}</p>
                    </td>
                    <td className="px-4 py-4 text-sm text-white/75 md:px-6">{r.rating}/5</td>
                    <td className="px-4 py-4 md:px-6">
                      <p className="text-sm font-semibold">{r.title ?? "—"}</p>
                      <p className="mt-1 line-clamp-2 text-sm text-white/60">{r.comment}</p>
                    </td>
                    <td className="px-4 py-4 md:px-6">
                      <button
                        type="button"
                        onClick={() => setApproved(r.id, !r.approved)}
                        className={cn(
                          "inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-semibold",
                          r.approved
                            ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-200"
                            : "border-white/10 bg-black/20 text-white/60",
                        )}
                        title="Cliquer pour basculer"
                      >
                        {r.approved ? "Publié" : "En attente"}
                      </button>
                    </td>
                    <td className="px-4 py-4 md:px-6">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="outline"
                          className="h-10 rounded-xl border-white/10 bg-black/20 text-white hover:text-red-200"
                          onClick={() => del(r.id)}
                          title="Supprimer"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

