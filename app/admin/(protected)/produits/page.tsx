"use client"

import { useEffect, useMemo, useState } from "react"
import Image from "next/image"
import { Plus, Search, Trash2, Pencil, Loader2, Check, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import { ImagePicker, type UploadedImage } from "../components/image-picker"

type ProductRow = {
  id: string
  name: string
  price: number
  original_price: number | null
  image: string
  images: string[]
  image_storage_path?: string | null
  images_storage_paths?: string[]
  color_variants?: Array<{
    color: string
    images: string[]
    images_storage_paths: string[]
  }>
  description: string
  category: string
  sizes: number[]
  colors: string[]
  in_stock: boolean
  stock_quantity?: number | null
  badge: string | null
  rating: number
  review_count: number
  sort_order: number
}

type CategoryRow = { id: number; label: string; sort_order: number }

const empty: ProductRow = {
  id: "",
  name: "",
  price: 0,
  original_price: null,
  image: "",
  images: [],
  image_storage_path: null,
  images_storage_paths: [],
  color_variants: [],
  description: "",
  category: "",
  sizes: [],
  colors: [],
  in_stock: true,
  stock_quantity: null,
  badge: null,
  rating: 0,
  review_count: 0,
  sort_order: 0,
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="space-y-1.5">
      <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/45">
        {label}
      </span>
      {children}
    </label>
  )
}

export default function AdminProductsPage() {
  const [q, setQ] = useState("")
  const [rows, setRows] = useState<ProductRow[]>([])
  const [categories, setCategories] = useState<CategoryRow[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [editing, setEditing] = useState<ProductRow>(empty)
  const [images, setImages] = useState<UploadedImage[]>([])
  const [mainImage, setMainImage] = useState<UploadedImage[]>([])
  const [variantImages, setVariantImages] = useState<Record<string, UploadedImage[]>>({})
  const [sizeDraft, setSizeDraft] = useState("")
  const [colorDraft, setColorDraft] = useState("#b38b6d")

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase()
    if (!query) return rows
    return rows.filter((p) =>
      `${p.id} ${p.name} ${p.category}`.toLowerCase().includes(query),
    )
  }, [rows, q])

  const load = async () => {
    setLoading(true)
    try {
      const [pr, cr] = await Promise.all([
        fetch("/api/admin/catalog/products"),
        fetch("/api/admin/catalog/categories"),
      ])
      const pdata = (await pr.json()) as { products?: ProductRow[] }
      const cdata = (await cr.json()) as { categories?: CategoryRow[] }
      setRows(Array.isArray(pdata.products) ? pdata.products : [])
      setCategories(Array.isArray(cdata.categories) ? cdata.categories : [])
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
      const imageUrl = mainImage[0]?.url || editing.image
      const imagePath = mainImage[0]?.path || editing.image_storage_path || null

      const galleryUrls = images.map((i) => i.url)
      const galleryPaths = images.map((i) => i.path)

      const colorVariants = (editing.colors ?? []).map((c) => {
        const imgs = variantImages[c] ?? []
        return {
          color: c,
          images: imgs.map((i) => i.url),
          images_storage_paths: imgs.map((i) => i.path),
        }
      })

      await fetch("/api/admin/catalog/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...editing,
          image: imageUrl,
          image_storage_path: imagePath,
          images: galleryUrls,
          images_storage_paths: galleryPaths,
          color_variants: colorVariants,
        }),
      }).then(async (r) => {
        if (!r.ok) throw new Error("Erreur sauvegarde")
      })
      setOpen(false)
      setEditing(empty)
      setMainImage([])
      setImages([])
      setSizeDraft("")
      setVariantImages({})
      setColorDraft("#b38b6d")
      await load()
    } finally {
      setSaving(false)
    }
  }

  const del = async (id: string) => {
    if (!confirm("Supprimer ce produit ?")) return
    await fetch(`/api/admin/catalog/products/${encodeURIComponent(id)}`, { method: "DELETE" })
    await load()
  }

  return (
    <div className="space-y-6 text-white">
      <div className="rounded-2xl border border-white/10 bg-white/5 p-5 shadow-[0_18px_60px_rgba(0,0,0,0.35)] backdrop-blur md:p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/50">
              Catalogue
            </p>
            <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">Produits</h1>
            <p className="mt-1 text-sm text-white/55">
              Ajouter / modifier les produits affichés sur le site.
            </p>
          </div>
          <Button
            className="h-11 rounded-xl bg-[#b38b6d] text-black hover:bg-[#c29a7d]"
            onClick={() => {
              setEditing(empty)
              setMainImage([])
              setImages([])
              setVariantImages({})
              setSizeDraft("")
              setColorDraft("#b38b6d")
              setOpen(true)
            }}
          >
            <Plus className="mr-2 h-4 w-4" />
            Nouveau produit
          </Button>
        </div>

        <div className="mt-5 flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/45" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Rechercher (id, nom, catégorie)…"
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
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center text-white/60">Aucun produit.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-[900px] w-full">
              <thead className="bg-black/20">
                <tr className="text-left text-[10px] font-bold uppercase tracking-[0.18em] text-white/45">
                  <th className="px-4 py-3 md:px-6">Produit</th>
                  <th className="px-4 py-3 md:px-6">Catégorie</th>
                  <th className="px-4 py-3 md:px-6">Prix</th>
                  <th className="px-4 py-3 md:px-6">Stock</th>
                  <th className="px-4 py-3 md:px-6">Statut</th>
                  <th className="px-4 py-3 md:px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {filtered.map((p) => (
                  <tr key={p.id} className="bg-white/0 hover:bg-white/5">
                    <td className="px-4 py-4 md:px-6">
                      <div className="flex items-center gap-3">
                        <div className="relative h-12 w-12 overflow-hidden rounded-xl border border-white/10 bg-black/20">
                          {p.image ? (
                            <Image
                              src={p.image}
                              alt={p.name}
                              fill
                              className="object-cover"
                              sizes="(max-width: 768px) 40vw, 96px"
                            />
                          ) : null}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold">{p.name}</p>
                          <p className="mt-1 truncate font-mono text-[11px] text-white/45">#{p.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-sm text-white/75 md:px-6">{p.category}</td>
                    <td className="px-4 py-4 text-sm text-white/75 md:px-6">
                      {Number(p.price).toLocaleString("fr-FR")} FCFA
                    </td>
                    <td className="px-4 py-4 text-sm text-white/75 md:px-6">
                      {typeof p.stock_quantity === "number" ? p.stock_quantity : "—"}
                    </td>
                    <td className="px-4 py-4 md:px-6">
                      <span
                        className={cn(
                          "inline-flex items-center gap-1 rounded-full border px-3 py-1 text-[11px] font-semibold",
                          p.in_stock
                            ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-200"
                            : "border-white/10 bg-black/20 text-white/60",
                        )}
                      >
                        {p.in_stock ? <Check className="h-3.5 w-3.5" /> : <X className="h-3.5 w-3.5" />}
                        {p.in_stock ? "En stock" : "Rupture"}
                      </span>
                    </td>
                    <td className="px-4 py-4 md:px-6">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="outline"
                          className="h-10 rounded-xl border-white/10 bg-black/20 text-white"
                          onClick={() => {
                            setEditing(p)
                            setMainImage(
                              p.image
                                ? [
                                    {
                                      url: p.image,
                                      path: p.image_storage_path || "existing",
                                    },
                                  ]
                                : [],
                            )
                            setImages(
                              (p.images ?? []).map((u, i) => ({
                                url: u,
                                path: (p.images_storage_paths ?? [])[i] || `existing-${i}`,
                              })),
                            )
                            setVariantImages(() => {
                              const next: Record<string, UploadedImage[]> = {}
                              for (const v of p.color_variants ?? []) {
                                next[v.color] = (v.images ?? []).map((url, i) => ({
                                  url,
                                  path: (v.images_storage_paths ?? [])[i] || `existing-variant-${i}`,
                                }))
                              }
                              return next
                            })
                            setSizeDraft("")
                            setColorDraft("#b38b6d")
                            setOpen(true)
                          }}
                        >
                          <Pencil className="mr-2 h-4 w-4" />
                          Modifier
                        </Button>
                        <Button
                          variant="outline"
                          className="h-10 rounded-xl border-white/10 bg-black/20 text-white hover:text-red-200"
                          onClick={() => del(p.id)}
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
        <DialogContent className="max-h-[90vh] max-w-[min(100vw-1rem,920px)] overflow-hidden rounded-2xl border border-white/10 bg-[#0f0f12] p-0 text-white">
          <div className="sticky top-0 z-10 border-b border-white/10 bg-[#0f0f12]/95 p-6 backdrop-blur">
            <DialogHeader className="text-left">
              <DialogTitle className="text-xl font-semibold">
                {editing.id ? "Modifier le produit" : "Nouveau produit"}
              </DialogTitle>
            </DialogHeader>
          </div>
          <div className="max-h-[calc(90vh-156px)] overflow-y-auto p-6 pb-28">
            <div className="grid gap-4 md:grid-cols-2">
            <Field label="ID">
              <Input
                value={editing.id}
                onChange={(e) => setEditing((s) => ({ ...s, id: e.target.value }))}
                className="h-11 rounded-xl border-white/10 bg-black/20 text-white"
                placeholder="ex: 9"
              />
            </Field>
            <Field label="Nom">
              <Input
                value={editing.name}
                onChange={(e) => setEditing((s) => ({ ...s, name: e.target.value }))}
                className="h-11 rounded-xl border-white/10 bg-black/20 text-white"
                placeholder="Sandale …"
              />
            </Field>
            <Field label="Prix">
              <Input
                type="number"
                value={editing.price}
                onChange={(e) => setEditing((s) => ({ ...s, price: Number(e.target.value) }))}
                className="h-11 rounded-xl border-white/10 bg-black/20 text-white"
              />
            </Field>
            <Field label="Catégorie">
              <select
                value={editing.category}
                onChange={(e) => setEditing((s) => ({ ...s, category: e.target.value }))}
                className="h-11 w-full rounded-xl border border-white/10 bg-black/20 px-3 text-sm text-white outline-none"
              >
                <option value="" disabled>
                  Choisir…
                </option>
                {categories
                  .slice()
                  .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
                  .map((c) => (
                    <option key={c.id} value={c.label}>
                      {c.label}
                    </option>
                  ))}
              </select>
            </Field>
            <div className="md:col-span-2">
              <Field label="Description">
                <textarea
                  value={editing.description}
                  onChange={(e) => setEditing((s) => ({ ...s, description: e.target.value }))}
                  className={cn(
                    "min-h-24 w-full rounded-xl border border-white/10 bg-black/20 px-3 py-3 text-sm text-white outline-none",
                  )}
                />
              </Field>
            </div>
            <div className="md:col-span-2">
              <ImagePicker
                label="Image principale"
                folder={`products/${editing.id || "new"}`}
                multiple={false}
                value={mainImage}
                onChange={setMainImage}
              />
            </div>
            <div className="md:col-span-2">
              <ImagePicker
                label="Galerie (images)"
                folder={`products/${editing.id || "new"}`}
                multiple={true}
                value={images}
                onChange={setImages}
              />
            </div>
            <Field label="Badge (optionnel)">
              <Input
                value={editing.badge ?? ""}
                onChange={(e) => setEditing((s) => ({ ...s, badge: e.target.value || null }))}
                className="h-11 rounded-xl border-white/10 bg-black/20 text-white"
                placeholder="Cuir Premium"
              />
            </Field>
            <Field label="Stock (quantité)">
              <Input
                type="number"
                value={editing.stock_quantity ?? ""}
                onChange={(e) =>
                  setEditing((s) => ({
                    ...s,
                    stock_quantity: e.target.value === "" ? null : Number(e.target.value),
                  }))
                }
                className="h-11 rounded-xl border-white/10 bg-black/20 text-white"
                placeholder="ex: 12"
              />
            </Field>
            <Field label="Tailles (ex: 39,40,41)">
              <div className="space-y-2">
                <div className="flex gap-2">
                  <Input
                    value={sizeDraft}
                    onChange={(e) => setSizeDraft(e.target.value)}
                    className="h-11 rounded-xl border-white/10 bg-black/20 text-white"
                    placeholder="ex: 41"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    className="h-11 rounded-xl border-white/10 bg-black/20 text-white"
                    onClick={() => {
                      const n = Number(sizeDraft)
                      if (!Number.isFinite(n)) return
                      setEditing((s) => ({
                        ...s,
                        sizes: Array.from(new Set([...(s.sizes ?? []), n])).sort((a, b) => a - b),
                      }))
                      setSizeDraft("")
                    }}
                  >
                    Ajouter
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {(editing.sizes ?? []).map((n) => (
                    <button
                      key={n}
                      type="button"
                      className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-xs text-white/80 hover:text-red-200"
                      title="Retirer"
                      onClick={() => setEditing((s) => ({ ...s, sizes: (s.sizes ?? []).filter((x) => x !== n) }))}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>
            </Field>
            <Field label="Couleurs (picker)">
              <div className="space-y-2">
                <div className="flex gap-2">
                  <div className="flex h-11 items-center gap-3 rounded-xl border border-white/10 bg-black/20 px-3">
                    <input
                      type="color"
                      value={colorDraft}
                      onChange={(e) => setColorDraft(e.target.value)}
                      className="h-7 w-10 cursor-pointer rounded"
                      aria-label="Choisir une couleur"
                    />
                    <p className="font-mono text-xs text-white/70">{colorDraft.toUpperCase()}</p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    className="h-11 rounded-xl border-white/10 bg-black/20 text-white"
                    onClick={() => {
                      const c = String(colorDraft || "").trim().toLowerCase()
                      if (!c) return
                      setEditing((s) => ({
                        ...s,
                        colors: Array.from(new Set([...(s.colors ?? []), c])),
                      }))
                      setVariantImages((prev) => (prev[c] ? prev : { ...prev, [c]: [] }))
                      setColorDraft("#b38b6d")
                    }}
                  >
                    Ajouter
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {(editing.colors ?? []).map((c) => (
                    <button
                      key={c}
                      type="button"
                      className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/20 px-3 py-1 text-xs text-white/80 hover:text-red-200"
                      title="Retirer"
                      onClick={() => {
                        setEditing((s) => ({ ...s, colors: (s.colors ?? []).filter((x) => x !== c) }))
                        setVariantImages((prev) => {
                          const { [c]: _removed, ...rest } = prev
                          return rest
                        })
                      }}
                    >
                      <span
                        className="h-3 w-3 rounded-full border border-white/20"
                        style={{ backgroundColor: c }}
                        aria-hidden="true"
                      />
                      <span className="font-mono">{c.toUpperCase()}</span>
                    </button>
                  ))}
                </div>
              </div>
            </Field>
            <div className="md:col-span-2">
              <div className="space-y-3 rounded-2xl border border-white/10 bg-black/10 p-4">
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/45">
                  Images par couleur (variantes)
                </p>
                {(editing.colors ?? []).length === 0 ? (
                  <p className="text-sm text-white/55">Ajoutez d’abord des couleurs.</p>
                ) : (
                  <div className="space-y-4">
                    {(editing.colors ?? []).map((c) => (
                      <div key={c} className="rounded-xl border border-white/10 bg-black/20 p-4">
                        <div className="flex items-center gap-3">
                          <span
                            className="h-4 w-4 rounded-full border border-white/20"
                            style={{ backgroundColor: c }}
                            aria-hidden="true"
                          />
                          <p className="font-mono text-xs font-semibold text-white/80">{c.toUpperCase()}</p>
                        </div>
                        <div className="mt-3">
                          <ImagePicker
                            label="Images pour cette couleur"
                            folder={`products/${editing.id || "new"}/colors/${c.replace("#", "")}`}
                            multiple={true}
                            value={variantImages[c] ?? []}
                            onChange={(next) => setVariantImages((prev) => ({ ...prev, [c]: next }))}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <Field label="Disponible">
              <select
                value={editing.in_stock ? "1" : "0"}
                onChange={(e) => setEditing((s) => ({ ...s, in_stock: e.target.value === "1" }))}
                className="h-11 w-full rounded-xl border border-white/10 bg-black/20 px-3 text-sm text-white outline-none"
              >
                <option value="1">En stock</option>
                <option value="0">Rupture</option>
              </select>
            </Field>
            </div>
          </div>
          <div className="sticky bottom-0 z-10 flex items-center justify-end gap-2 border-t border-white/10 bg-[#0f0f12]/95 p-6 pb-[calc(1.5rem+env(safe-area-inset-bottom))] backdrop-blur">
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

