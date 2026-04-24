"use client"

import { useEffect, useMemo, useState } from "react"
import { Plus, Search, Trash2, Loader2, RefreshCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { cn } from "@/lib/utils"

type PromoRow = {
  code: string
  active: boolean
  description: string | null
  type: "percent" | "fixed"
  value: number
  min_subtotal: number
  starts_at: string | null
  ends_at: string | null
  usage_limit: number | null
  used_count: number
}

const empty: PromoRow = {
  code: "",
  active: true,
  description: null,
  type: "percent",
  value: 10,
  min_subtotal: 0,
  starts_at: null,
  ends_at: null,
  usage_limit: null,
  used_count: 0,
}

export default function AdminPromotionsPage() {
  const [q, setQ] = useState("")
  const [rows, setRows] = useState<PromoRow[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [editing, setEditing] = useState<PromoRow>(empty)

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase()
    if (!query) return rows
    return rows.filter((p) =>
      `${p.code} ${p.description ?? ""}`.toLowerCase().includes(query),
    )
  }, [rows, q])

  const load = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/admin/promotions")
      const data = (await res.json()) as { promos?: PromoRow[] }
      setRows(Array.isArray(data.promos) ? data.promos : [])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
  }, [])

  const upsert = async () => {
    setSaving(true)
    try {
      const res = await fetch("/api/admin/promotions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...editing,
          code: editing.code.trim().toUpperCase(),
        }),
      })
      if (!res.ok) throw new Error("Erreur")
      setOpen(false)
      setEditing(empty)
      await load()
    } finally {
      setSaving(false)
    }
  }

  const del = async (code: string) => {
    if (!confirm("Supprimer ce code promo ?")) return
    await fetch(`/api/admin/promotions/${encodeURIComponent(code)}`, { method: "DELETE" })
    await load()
  }

  return (
    <div className="space-y-6 text-white">
      <div className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-[0_18px_60px_rgba(0,0,0,0.35)] backdrop-blur">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-white/50">Promotions</p>
            <h1 className="mt-3 text-2xl font-semibold">Codes promo</h1>
            <p className="mt-2 text-sm text-white/55">
              Créer et gérer des codes de réduction (pourcent ou montant fixe).
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="h-11 rounded-xl border-white/10 bg-black/20 text-white"
              onClick={load}
            >
              <RefreshCcw className="mr-2 h-4 w-4" />
              Rafraîchir
            </Button>
            <Button
              className="h-11 rounded-xl bg-[#b38b6d] text-black hover:bg-[#c29a7d]"
              onClick={() => {
                setEditing(empty)
                setOpen(true)
              }}
            >
              <Plus className="mr-2 h-4 w-4" />
              Nouveau code
            </Button>
          </div>
        </div>

        <div className="mt-5 flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/45" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Rechercher par code…"
              className="h-12 rounded-xl border-white/10 bg-black/20 pl-10 text-white placeholder:text-white/35"
            />
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/5 shadow-[0_18px_60px_rgba(0,0,0,0.35)] backdrop-blur">
        {loading ? (
          <div className="p-8 text-center text-white/60">Chargement…</div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center text-white/60">Aucun code promo.</div>
        ) : (
          <div className="divide-y divide-white/10">
            {filtered.map((p) => (
              <div key={p.code} className="flex flex-col gap-3 px-4 py-4 md:flex-row md:items-center md:justify-between md:px-6">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="font-mono text-sm font-semibold">{p.code}</span>
                    <span className={cn("rounded-full border px-3 py-1 text-xs",
                      p.active ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-200" : "border-white/10 bg-black/20 text-white/60"
                    )}>
                      {p.active ? "Actif" : "Inactif"}
                    </span>
                    <span className="text-xs text-white/60">
                      {p.type === "percent" ? `${p.value}%` : `${Number(p.value).toLocaleString("fr-FR")} FCFA`}
                      {p.min_subtotal > 0 ? ` · min ${Number(p.min_subtotal).toLocaleString("fr-FR")} FCFA` : ""}
                    </span>
                  </div>
                  {p.description ? <p className="mt-1 text-xs text-white/55">{p.description}</p> : null}
                  <p className="mt-2 text-[11px] text-white/45">
                    Utilisations : {p.used_count}{p.usage_limit ? ` / ${p.usage_limit}` : ""}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    className="h-10 rounded-xl border-white/10 bg-black/20 text-white"
                    onClick={() => {
                      setEditing(p)
                      setOpen(true)
                    }}
                  >
                    Éditer
                  </Button>
                  <Button
                    variant="outline"
                    className="h-10 rounded-xl border-white/10 bg-black/20 text-white hover:text-red-200"
                    onClick={() => del(p.code)}
                    title="Supprimer"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-[min(100vw-1rem,760px)] rounded-2xl border border-white/10 bg-[#0f0f12] p-0 text-white">
          <div className="border-b border-white/10 p-6">
            <DialogHeader className="text-left">
              <DialogTitle className="text-xl font-semibold">
                {editing.code ? "Modifier" : "Nouveau"} code promo
              </DialogTitle>
            </DialogHeader>
          </div>
          <div className="grid gap-4 p-6 md:grid-cols-2">
            <label className="space-y-1.5">
              <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/45">Code</span>
              <Input
                value={editing.code}
                onChange={(e) => setEditing((s) => ({ ...s, code: e.target.value }))}
                className="h-11 rounded-xl border-white/10 bg-black/20 text-white"
                placeholder="MBOULANE10"
              />
            </label>
            <label className="space-y-1.5">
              <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/45">Actif</span>
              <select
                value={editing.active ? "1" : "0"}
                onChange={(e) => setEditing((s) => ({ ...s, active: e.target.value === "1" }))}
                className="h-11 w-full rounded-xl border border-white/10 bg-black/20 px-3 text-sm text-white outline-none"
              >
                <option value="1">Oui</option>
                <option value="0">Non</option>
              </select>
            </label>
            <label className="space-y-1.5 md:col-span-2">
              <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/45">Description</span>
              <Input
                value={editing.description ?? ""}
                onChange={(e) => setEditing((s) => ({ ...s, description: e.target.value || null }))}
                className="h-11 rounded-xl border-white/10 bg-black/20 text-white"
                placeholder="10% sur toute la boutique"
              />
            </label>
            <label className="space-y-1.5">
              <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/45">Type</span>
              <select
                value={editing.type}
                onChange={(e) => setEditing((s) => ({ ...s, type: e.target.value as PromoRow["type"] }))}
                className="h-11 w-full rounded-xl border border-white/10 bg-black/20 px-3 text-sm text-white outline-none"
              >
                <option value="percent">Pourcentage</option>
                <option value="fixed">Montant fixe</option>
              </select>
            </label>
            <label className="space-y-1.5">
              <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/45">Valeur</span>
              <Input
                type="number"
                value={editing.value}
                onChange={(e) => setEditing((s) => ({ ...s, value: Number(e.target.value) }))}
                className="h-11 rounded-xl border-white/10 bg-black/20 text-white"
              />
            </label>
            <label className="space-y-1.5">
              <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/45">Sous-total min</span>
              <Input
                type="number"
                value={editing.min_subtotal}
                onChange={(e) => setEditing((s) => ({ ...s, min_subtotal: Number(e.target.value) }))}
                className="h-11 rounded-xl border-white/10 bg-black/20 text-white"
              />
            </label>
            <label className="space-y-1.5">
              <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/45">Limite d’usage</span>
              <Input
                type="number"
                value={editing.usage_limit ?? ""}
                onChange={(e) =>
                  setEditing((s) => ({
                    ...s,
                    usage_limit: e.target.value === "" ? null : Number(e.target.value),
                  }))
                }
                className="h-11 rounded-xl border-white/10 bg-black/20 text-white"
                placeholder="illimité"
              />
            </label>
          </div>
          <div className="flex items-center justify-end gap-2 border-t border-white/10 p-6">
            <Button
              variant="outline"
              className="h-11 rounded-xl border-white/10 bg-black/20 text-white"
              onClick={() => setOpen(false)}
              disabled={saving}
            >
              Annuler
            </Button>
            <Button
              className="h-11 rounded-xl bg-[#b38b6d] text-black hover:bg-[#c29a7d]"
              onClick={upsert}
              disabled={saving}
            >
              {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Enregistrer
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

