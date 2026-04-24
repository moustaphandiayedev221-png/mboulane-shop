"use client"

import { useEffect, useMemo, useState, useCallback } from "react"
import { RefreshCcw, Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type NewsletterRow = {
  id: number
  created_at: string
  email: string
  source: string
  subscribed: boolean
}

export default function AdminNewsletterPage() {
  const [q, setQ] = useState("")
  const [rows, setRows] = useState<NewsletterRow[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(50)
  const [total, setTotal] = useState(0)

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase()
    if (!query) return rows
    return rows.filter((r) => `${r.email} ${r.source}`.toLowerCase().includes(query))
  }, [rows, q])

  const load = useCallback(async (nextPage = page, nextPageSize = pageSize) => {
    setLoading(true)
    try {
      const qs = new URLSearchParams({
        page: String(nextPage),
        pageSize: String(nextPageSize),
      })
      const res = await fetch(`/api/admin/newsletter?${qs}`)
      const data = (await res.json()) as { subscribers?: NewsletterRow[]; total?: number; page?: number; pageSize?: number }
      setRows(Array.isArray(data.subscribers) ? data.subscribers : [])
      setTotal(Number(data.total ?? 0))
      setPage(Number(data.page ?? nextPage))
      setPageSize(Number(data.pageSize ?? nextPageSize))
    } finally {
      setLoading(false)
    }
  }, [page, pageSize])

  useEffect(() => {
    void load()
  }, [load])

  const toggle = async (email: string, next: boolean) => {
    setSaving(email)
    try {
      await fetch("/api/admin/newsletter", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, subscribed: next }),
      }).then((r) => {
        if (!r.ok) throw new Error("Erreur mise à jour")
      })
      setRows((prev) => prev.map((x) => (x.email === email ? { ...x, subscribed: next } : x)))
    } finally {
      setSaving(null)
    }
  }

  const totalPages = Math.max(1, Math.ceil(total / pageSize))

  return (
    <div className="space-y-6 text-white">
      <div className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-[0_18px_60px_rgba(0,0,0,0.35)] backdrop-blur">
        <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-white/50">Newsletter</p>
        <h1 className="mt-3 text-2xl font-semibold">Abonnés</h1>
        <p className="mt-2 text-sm text-white/55">
          Gérer les inscriptions newsletter (activer/désactiver).
        </p>

        <div className="mt-5 flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/45" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Rechercher par email…"
              className="h-12 rounded-xl border-white/10 bg-black/20 pl-10 text-white placeholder:text-white/35"
            />
          </div>
          <Button
            variant="outline"
            className="h-12 rounded-xl border-white/10 bg-black/20 text-white"
            onClick={() => load(page, pageSize)}
            title="Rafraîchir"
          >
            <RefreshCcw className="mr-2 h-4 w-4" />
            Rafraîchir
          </Button>
          <Button
            variant="outline"
            className="h-12 rounded-xl border-white/10 bg-black/20 text-white"
            asChild
            title="Exporter CSV"
          >
            <a href="/api/admin/newsletter/export">Exporter CSV</a>
          </Button>
        </div>

        <div className="mt-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <p className="text-xs text-white/55">
            Total: <span className="font-semibold text-white/80">{total}</span>
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              className="h-10 rounded-xl border-white/10 bg-black/20 text-white"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
            >
              Précédent
            </Button>
            <span className="text-xs text-white/60">
              Page <span className="font-semibold text-white/80">{page}</span> / {totalPages}
            </span>
            <Button
              variant="outline"
              className="h-10 rounded-xl border-white/10 bg-black/20 text-white"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
            >
              Suivant
            </Button>
            <select
              value={pageSize}
              onChange={(e) => {
                setPage(1)
                setPageSize(Number(e.target.value))
              }}
              className={cn(
                "h-10 rounded-xl border border-white/10 bg-black/20 px-3 text-xs text-white outline-none",
              )}
              aria-label="Taille de page"
            >
              {[25, 50, 100, 200].map((n) => (
                <option key={n} value={n}>
                  {n} / page
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/5 shadow-[0_18px_60px_rgba(0,0,0,0.35)] backdrop-blur">
        {loading ? (
          <div className="p-8 text-center text-white/60">Chargement…</div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center text-white/60">Aucun abonné.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-[820px] w-full">
              <thead className="bg-black/20">
                <tr className="text-left text-[10px] font-bold uppercase tracking-[0.18em] text-white/45">
                  <th className="px-4 py-3 md:px-6">Email</th>
                  <th className="px-4 py-3 md:px-6">Source</th>
                  <th className="px-4 py-3 md:px-6">Créé</th>
                  <th className="px-4 py-3 md:px-6 text-right">Statut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {filtered.map((r) => (
                  <tr key={r.email} className="bg-white/0 hover:bg-white/5">
                    <td className="px-4 py-4 text-sm font-semibold md:px-6">{r.email}</td>
                    <td className="px-4 py-4 text-sm text-white/70 md:px-6">{r.source}</td>
                    <td className="px-4 py-4 text-sm text-white/70 md:px-6">
                      {r.created_at ? new Date(r.created_at).toLocaleString("fr-FR") : "—"}
                    </td>
                    <td className="px-4 py-4 md:px-6">
                      <div className="flex justify-end">
                        <Button
                          variant="outline"
                          className={cn(
                            "h-10 rounded-xl border-white/10 bg-black/20 text-white",
                            r.subscribed ? "hover:text-amber-200" : "hover:text-emerald-200",
                          )}
                          disabled={saving === r.email}
                          onClick={() => toggle(r.email, !r.subscribed)}
                        >
                          {r.subscribed ? "Abonné" : "Désabonné"}
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

