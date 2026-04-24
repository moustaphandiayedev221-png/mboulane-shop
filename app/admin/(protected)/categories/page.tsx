"use client"

import { useEffect, useMemo, useState } from "react"
import Image from "next/image"
import { Plus, Search, Trash2, Loader2, Pencil, FolderTree } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ImagePicker, type UploadedImage } from "../components/image-picker"

type CategoryRow = {
  id: number
  label: string
  sort_order: number
  image?: string | null
  image_storage_path?: string | null
  subtitle?: string | null
}

export default function AdminCategoriesPage() {
  const [q, setQ] = useState("")
  const [rows, setRows] = useState<CategoryRow[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [label, setLabel] = useState("")
  const [sortOrder, setSortOrder] = useState(0)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [image, setImage] = useState<UploadedImage[]>([])
  const [subtitle, setSubtitle] = useState("")
  const [seeding, setSeeding] = useState(false)
  const [seedError, setSeedError] = useState<string | null>(null)

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase()
    if (!query) return rows
    return rows.filter((c) => c.label.toLowerCase().includes(query))
  }, [rows, q])

  const load = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/admin/catalog/categories")
      const data = (await res.json()) as { categories?: CategoryRow[] }
      setRows(Array.isArray(data.categories) ? data.categories : [])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
  }, [])

  const createOrUpdate = async () => {
    setSaving(true)
    try {
      const payload = {
        label: label.trim(),
        sort_order: sortOrder,
        image: image[0]?.url ?? null,
        image_storage_path: image[0]?.path ?? null,
        subtitle: subtitle.trim() || null,
      }
      const res =
        editingId == null
          ? await fetch("/api/admin/catalog/categories", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(payload),
            })
          : await fetch(`/api/admin/catalog/categories/${editingId}`, {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(payload),
            })
      if (!res.ok) throw new Error("Erreur")
      setOpen(false)
      setLabel("")
      setSortOrder(0)
      setEditingId(null)
      setImage([])
      setSubtitle("")
      await load()
    } finally {
      setSaving(false)
    }
  }

  const del = async (id: number) => {
    if (!confirm("Supprimer cette catégorie ?")) return
    await fetch(`/api/admin/catalog/categories/${id}`, { method: "DELETE" })
    await load()
  }

  /** Remplit la table Supabase avec les 4 collections (accueil) — sans ça l’admin est vide alors que la boutique affiche des valeurs de secours. */
  const seedDefaults = async () => {
    setSeeding(true)
    setSeedError(null)
    try {
      const res = await fetch("/api/admin/catalog/seed-default-categories", { method: "POST" })
      const data = (await res.json()) as { error?: string }
      if (!res.ok) throw new Error(data.error || "Erreur")
      await load()
    } catch (e) {
      setSeedError(e instanceof Error ? e.message : "Erreur")
    } finally {
      setSeeding(false)
    }
  }

  return (
    <div className="space-y-6 text-white">
      <div className="rounded-2xl border border-white/10 bg-white/5 p-5 shadow-[0_18px_60px_rgba(0,0,0,0.35)] backdrop-blur md:p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/50">Catalogue</p>
            <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">Catégories</h1>
            <p className="mt-1 text-sm text-white/55">Gérer les catégories affichées dans la boutique.</p>
          </div>
          <Button
            className="h-11 rounded-xl bg-[#b38b6d] text-black hover:bg-[#c29a7d]"
            onClick={() => {
              setEditingId(null)
              setLabel("")
              setSortOrder(0)
              setImage([])
              setSubtitle("")
              setOpen(true)
            }}
          >
            <Plus className="mr-2 h-4 w-4" />
            Nouvelle catégorie
          </Button>
        </div>

        <div className="mt-5 flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/45" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Rechercher…"
              className="h-12 rounded-xl border-white/10 bg-black/20 pl-10 text-white placeholder:text-white/35"
            />
          </div>
          <Button
            variant="outline"
            className="h-12 rounded-xl border-white/10 bg-black/20 text-white"
            onClick={load}
          >
            Rafraîchir
          </Button>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/5 shadow-[0_18px_60px_rgba(0,0,0,0.35)] backdrop-blur">
        {loading ? (
          <div className="p-8 text-center text-white/60">Chargement…</div>
        ) : filtered.length === 0 && rows.length === 0 ? (
          <div className="space-y-5 p-8">
            <div className="rounded-xl border border-amber-500/25 bg-amber-500/10 px-5 py-4 text-left text-sm leading-relaxed text-white/85">
              <p className="font-semibold text-white">Pourquoi la liste est vide ?</p>
              <p className="mt-2 text-white/75">
                La page d&apos;accueil peut afficher les <strong className="text-white">4 collections</strong> même sans
                lignes en base : le site utilise alors des{" "}
                <strong className="text-white">images et textes locaux par défaut</strong>. L&apos;admin ne montre que ce
                qui est réellement enregistré dans Supabase (<code className="text-white/90">categories</code>).
              </p>
              <p className="mt-3 text-white/65">
                Clique ci-dessous pour créer les quatre catégories (titres, sous-titres, chemins d&apos;images comme sur
                l&apos;accueil), ou lance{" "}
                <code className="rounded bg-black/30 px-1 py-0.5 text-[13px]">npm run db:seed</code> depuis le projet.
              </p>
            </div>
            {seedError ? (
              <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-center text-sm text-red-100">
                {seedError}
              </div>
            ) : null}
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Button
                className="h-11 rounded-xl bg-[#b38b6d] text-black hover:bg-[#c29a7d]"
                onClick={seedDefaults}
                disabled={seeding}
              >
                {seeding ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <FolderTree className="mr-2 h-4 w-4" />
                )}
                Importer les 4 collections (accueil)
              </Button>
            </div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center text-white/60">Aucun résultat pour cette recherche.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-[900px] w-full">
              <thead className="bg-black/20">
                <tr className="text-left text-[10px] font-bold uppercase tracking-[0.18em] text-white/45">
                  <th className="px-4 py-3 md:px-6">Catégorie</th>
                  <th className="px-4 py-3 md:px-6">Sous-titre</th>
                  <th className="px-4 py-3 md:px-6">Ordre</th>
                  <th className="px-4 py-3 md:px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {filtered.map((c) => (
                  <tr key={c.id} className="bg-white/0 hover:bg-white/5">
                    <td className="px-4 py-4 md:px-6">
                      <div className="flex items-center gap-3">
                        <div className="relative h-10 w-10 overflow-hidden rounded-xl border border-white/10 bg-black/20">
                          {c.image ? (
                            <Image
                              src={c.image}
                              alt={c.label}
                              fill
                              className="object-cover"
                              sizes="(max-width: 768px) 40vw, 96px"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-xs font-bold text-white/70">
                              {c.label.trim().slice(0, 1).toUpperCase()}
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold">{c.label}</p>
                          <p className="mt-1 font-mono text-[11px] text-white/45">#{c.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="max-w-[220px] px-4 py-4 text-sm text-white/70 md:px-6">
                      <span className="line-clamp-2 font-script text-[13px] text-white/85">
                        {c.subtitle?.trim() || "—"}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-sm text-white/75 md:px-6">{c.sort_order}</td>
                    <td className="px-4 py-4 md:px-6">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="outline"
                          className="h-10 rounded-xl border-white/10 bg-black/20 text-white"
                          onClick={() => {
                            setEditingId(c.id)
                            setLabel(c.label)
                            setSortOrder(c.sort_order)
                            setImage(
                              c.image
                                ? [
                                    {
                                      url: c.image,
                                      path: c.image_storage_path || "existing",
                                    },
                                  ]
                                : [],
                            )
                            setSubtitle(c.subtitle?.trim() ?? "")
                            setOpen(true)
                          }}
                          title="Modifier"
                        >
                          <Pencil className="mr-2 h-4 w-4" />
                          Modifier
                        </Button>
                        <Button
                          variant="outline"
                          className="h-10 rounded-xl border-white/10 bg-black/20 text-white hover:text-red-200"
                          onClick={() => del(c.id)}
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

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-[min(100vw-1rem,640px)] rounded-2xl border border-white/10 bg-[#0f0f12] p-0 text-white">
          <div className="border-b border-white/10 p-6">
            <DialogHeader className="text-left">
              <DialogTitle className="text-xl font-semibold">
                {editingId == null ? "Nouvelle catégorie" : "Modifier la catégorie"}
              </DialogTitle>
            </DialogHeader>
          </div>
          <div className="grid gap-4 p-6">
            <ImagePicker
              label="Image de catégorie"
              bucket="site-images"
              folder={`categories/${editingId ?? "new"}`}
              multiple={false}
              value={image}
              onChange={setImage}
            />
            <label className="space-y-1.5">
              <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/45">Label</span>
              <Input
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                className="h-11 rounded-xl border-white/10 bg-black/20 text-white"
                placeholder="Premium"
              />
            </label>
            <label className="space-y-1.5">
              <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/45">
                Sous-titre (accueil, sur le visuel)
              </span>
              <Input
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                className="h-11 rounded-xl border-white/10 bg-black/20 text-white"
                placeholder="Élégance Intemporelle"
              />
            </label>
            <label className="space-y-1.5">
              <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/45">Ordre</span>
              <Input
                type="number"
                value={sortOrder}
                onChange={(e) => setSortOrder(Number(e.target.value))}
                className="h-11 rounded-xl border-white/10 bg-black/20 text-white"
              />
            </label>
          </div>
          <div className="flex items-center justify-end gap-2 border-t border-white/10 p-6">
            <Button
              variant="outline"
              className="h-11 rounded-xl border-white/10 bg-black/20 text-white"
              onClick={() => {
                setOpen(false)
                setEditingId(null)
                setImage([])
                setSubtitle("")
              }}
              disabled={saving}
            >
              Annuler
            </Button>
            <Button
              className="h-11 rounded-xl bg-[#b38b6d] text-black hover:bg-[#c29a7d]"
              onClick={createOrUpdate}
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

