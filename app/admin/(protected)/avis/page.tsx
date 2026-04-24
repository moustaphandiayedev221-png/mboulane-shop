"use client"

import { useEffect, useMemo, useState } from "react"
import { Plus, RefreshCcw, Search, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { cn } from "@/lib/utils"

type ReviewRow = {
  id: string
  name: string
  location: string
  rating: number
  comment: string
  review_date: string
  verified: boolean
  sort_order: number
}

const empty: ReviewRow = {
  id: "",
  name: "",
  location: "",
  rating: 5,
  comment: "",
  review_date: "",
  verified: true,
  sort_order: 0,
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="space-y-1.5">
      <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/45">{label}</span>
      {children}
    </label>
  )
}

export default function AdminAvisPage() {
  const [q, setQ] = useState("")
  const [rows, setRows] = useState<ReviewRow[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [editing, setEditing] = useState<ReviewRow>(empty)

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase()
    if (!query) return rows
    return rows.filter((r) =>
      `${r.name} ${r.location} ${r.comment} ${r.id}`.toLowerCase().includes(query),
    )
  }, [rows, q])

  const load = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/admin/reviews")
      const data = (await res.json()) as { reviews?: ReviewRow[] }
      setRows(Array.isArray(data.reviews) ? data.reviews : [])
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
      await fetch("/api/admin/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editing),
      }).then((r) => {
        if (!r.ok) throw new Error("Erreur sauvegarde")
      })
      setOpen(false)
      setEditing(empty)
      await load()
    } finally {
      setSaving(false)
    }
  }

  const toggleVerified = async (id: string, next: boolean) => {
    await fetch("/api/admin/reviews", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, verified: next }),
    })
    setRows((prev) => prev.map((x) => (x.id === id ? { ...x, verified: next } : x)))
  }

  const setOrder = async (id: string, sort_order: number) => {
    await fetch("/api/admin/reviews", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, sort_order }),
    })
    setRows((prev) => prev.map((x) => (x.id === id ? { ...x, sort_order } : x)).sort((a, b) => a.sort_order - b.sort_order))
  }

  const del = async (id: string) => {
    if (!confirm("Supprimer cet avis ?")) return
    await fetch(`/api/admin/reviews/${encodeURIComponent(id)}`, { method: "DELETE" })
    await load()
  }

  return (
    <div className="space-y-6 text-white">
      <div className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-[0_18px_60px_rgba(0,0,0,0.35)] backdrop-blur">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-white/50">Avis</p>
            <h1 className="mt-3 text-2xl font-semibold">Avis clients</h1>
            <p className="mt-2 text-sm text-white/55">Ajouter / modifier les avis affichés sur l’accueil.</p>
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
              Nouvel avis
            </Button>
          </div>
        </div>

        <div className="mt-5 flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/45" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Rechercher (nom, ville, texte)…"
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
                  <th className="px-4 py-3 md:px-6">Auteur</th>
                  <th className="px-4 py-3 md:px-6">Note</th>
                  <th className="px-4 py-3 md:px-6">Date</th>
                  <th className="px-4 py-3 md:px-6">Ordre</th>
                  <th className="px-4 py-3 md:px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {filtered.map((r) => (
                  <tr key={r.id} className="bg-white/0 hover:bg-white/5">
                    <td className="px-4 py-4 md:px-6">
                      <p className="text-sm font-semibold">{r.name}</p>
                      <p className="mt-1 text-xs text-white/55">{r.location}</p>
                      <p className="mt-2 line-clamp-2 text-xs text-white/70">{r.comment}</p>
                    </td>
                    <td className="px-4 py-4 text-sm text-white/75 md:px-6">{r.rating}/5</td>
                    <td className="px-4 py-4 text-sm text-white/75 md:px-6">{r.review_date}</td>
                    <td className="px-4 py-4 md:px-6">
                      <Input
                        type="number"
                        defaultValue={r.sort_order}
                        className="h-10 w-24 rounded-xl border-white/10 bg-black/20 text-white"
                        onBlur={(e) => {
                          const n = Number(e.target.value)
                          if (!Number.isFinite(n)) return
                          void setOrder(r.id, n)
                        }}
                      />
                    </td>
                    <td className="px-4 py-4 md:px-6">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          className={cn(
                            "h-10 rounded-xl border-white/10 bg-black/20 text-white",
                            r.verified ? "hover:text-amber-200" : "hover:text-emerald-200",
                          )}
                          onClick={() => void toggleVerified(r.id, !r.verified)}
                        >
                          {r.verified ? "Vérifié" : "Non vérifié"}
                        </Button>
                        <Button
                          variant="outline"
                          className="h-10 rounded-xl border-white/10 bg-black/20 text-white hover:text-red-200"
                          onClick={() => del(r.id)}
                          title="Supprimer"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          className="h-10 rounded-xl border-white/10 bg-black/20 text-white"
                          onClick={() => {
                            setEditing(r)
                            setOpen(true)
                          }}
                        >
                          Modifier
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

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-[min(100vw-1rem,760px)] overflow-hidden rounded-2xl border border-white/10 bg-[#0f0f12] p-0 text-white">
          <div className="sticky top-0 z-10 border-b border-white/10 bg-[#0f0f12]/95 p-6 backdrop-blur">
            <DialogHeader className="text-left">
              <DialogTitle className="text-xl font-semibold">
                {editing.id ? "Modifier l'avis" : "Nouvel avis"}
              </DialogTitle>
            </DialogHeader>
          </div>
          <div className="p-6 space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="ID (unique)">
                <Input
                  value={editing.id}
                  onChange={(e) => setEditing((s) => ({ ...s, id: e.target.value }))}
                  className="h-11 rounded-xl border-white/10 bg-black/20 text-white"
                  placeholder="ex: 1"
                />
              </Field>
              <Field label="Ordre (tri)">
                <Input
                  type="number"
                  value={editing.sort_order}
                  onChange={(e) => setEditing((s) => ({ ...s, sort_order: Number(e.target.value) }))}
                  className="h-11 rounded-xl border-white/10 bg-black/20 text-white"
                />
              </Field>
              <Field label="Nom">
                <Input
                  value={editing.name}
                  onChange={(e) => setEditing((s) => ({ ...s, name: e.target.value }))}
                  className="h-11 rounded-xl border-white/10 bg-black/20 text-white"
                />
              </Field>
              <Field label="Localisation">
                <Input
                  value={editing.location}
                  onChange={(e) => setEditing((s) => ({ ...s, location: e.target.value }))}
                  className="h-11 rounded-xl border-white/10 bg-black/20 text-white"
                />
              </Field>
              <Field label="Note (1-5)">
                <Input
                  type="number"
                  value={editing.rating}
                  onChange={(e) => setEditing((s) => ({ ...s, rating: Number(e.target.value) }))}
                  className="h-11 rounded-xl border-white/10 bg-black/20 text-white"
                />
              </Field>
              <Field label="Date (texte)">
                <Input
                  value={editing.review_date}
                  onChange={(e) => setEditing((s) => ({ ...s, review_date: e.target.value }))}
                  className="h-11 rounded-xl border-white/10 bg-black/20 text-white"
                  placeholder="ex: 15 Mars 2026"
                />
              </Field>
              <div className="md:col-span-2">
                <Field label="Commentaire">
                  <textarea
                    value={editing.comment}
                    onChange={(e) => setEditing((s) => ({ ...s, comment: e.target.value }))}
                    className={cn(
                      "min-h-28 w-full rounded-xl border border-white/10 bg-black/20 px-3 py-3 text-sm text-white outline-none",
                    )}
                  />
                </Field>
              </div>
              <Field label="Vérifié">
                <select
                  value={editing.verified ? "1" : "0"}
                  onChange={(e) => setEditing((s) => ({ ...s, verified: e.target.value === "1" }))}
                  className="h-11 w-full rounded-xl border border-white/10 bg-black/20 px-3 text-sm text-white outline-none"
                >
                  <option value="1">Oui</option>
                  <option value="0">Non</option>
                </select>
              </Field>
            </div>
          </div>
          <div className="flex items-center justify-end gap-2 border-t border-white/10 bg-[#0f0f12]/95 p-6 backdrop-blur">
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
              Enregistrer
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

