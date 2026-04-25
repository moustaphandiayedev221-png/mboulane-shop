"use client"

import { useEffect, useState } from "react"
import { Loader2, Plus, Save, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

type DeliveryZone = { name: string; price: number; time?: string }
type CheckoutSettings = {
  freeShippingThreshold?: number
  deliveryZones?: DeliveryZone[]
}

const defaults: CheckoutSettings = {
  freeShippingThreshold: 50000,
  deliveryZones: [
    { name: "Dakar", price: 2000, time: "Sous 24h" },
    { name: "Thiès", price: 3500, time: "Sous 24h" },
    { name: "Saint-Louis", price: 3500, time: "Sous 24h" },
    { name: "Autres régions", price: 4000, time: "Sous 24h" },
  ],
}

export default function AdminSettingsPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [value, setValue] = useState<CheckoutSettings>(defaults)

  const load = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch("/api/admin/site/settings/checkout")
      const data = (await res.json()) as { value?: CheckoutSettings | null; error?: string }
      if (!res.ok) throw new Error(data.error || "Erreur")
      setValue({ ...defaults, ...(data.value ?? {}) })
    } catch (e) {
      const message = e instanceof Error ? e.message : "Erreur"
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  const save = async () => {
    setSaving(true)
    setError(null)
    try {
      const res = await fetch("/api/admin/site/settings/checkout", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ value }),
      })
      const data = (await res.json()) as { ok?: boolean; error?: string }
      if (!res.ok) throw new Error(data.error || "Erreur")
    } catch (e) {
      const message = e instanceof Error ? e.message : "Erreur"
      setError(message)
    } finally {
      setSaving(false)
    }
  }

  useEffect(() => {
    void load()
  }, [])

  return (
    <div className="space-y-6 text-white">
      <div className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-[0_18px_60px_rgba(0,0,0,0.35)] backdrop-blur">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-white/50">Paramètres</p>
            <h1 className="mt-3 text-2xl font-semibold">Checkout & livraison</h1>
            <p className="mt-2 text-sm text-white/55">
              Seuil livraison gratuite + zones de livraison (utilisés sur la page checkout).
            </p>
          </div>
          <Button
            className="h-11 rounded-xl bg-[#b38b6d] text-black hover:bg-[#c29a7d]"
            onClick={save}
            disabled={saving || loading}
          >
            {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            Enregistrer
          </Button>
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-[0_18px_60px_rgba(0,0,0,0.35)] backdrop-blur">
        {loading ? (
          <div className="py-10 text-center text-white/60">Chargement…</div>
        ) : (
          <div className="space-y-6">
            {error ? (
              <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-100">
                {error}
              </div>
            ) : null}

            <label className="space-y-1.5">
              <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/45">
                Seuil livraison gratuite (FCFA)
              </span>
              <Input
                type="number"
                value={value.freeShippingThreshold ?? 0}
                onChange={(e) => setValue((s) => ({ ...s, freeShippingThreshold: Number(e.target.value) }))}
                className="h-11 rounded-xl border-white/10 bg-black/20 text-white"
              />
            </label>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/45">Zones de livraison</p>
                <Button
                  variant="outline"
                  className="h-10 rounded-xl border-white/10 bg-black/20 text-white"
                  onClick={() =>
                    setValue((s) => ({
                      ...s,
                      deliveryZones: [...(s.deliveryZones ?? []), { name: "Nouvelle zone", price: 0, time: "" }],
                    }))
                  }
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Ajouter
                </Button>
              </div>

              <div className="space-y-3">
                {(value.deliveryZones ?? []).map((z, idx) => (
                  <div key={idx} className="grid gap-3 rounded-xl border border-white/10 bg-black/20 p-4 md:grid-cols-7">
                    <label className="space-y-1 md:col-span-3">
                      <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/45">Nom</span>
                      <Input
                        value={z.name}
                        onChange={(e) =>
                          setValue((s) => ({
                            ...s,
                            deliveryZones: (s.deliveryZones ?? []).map((it, i) => (i === idx ? { ...it, name: e.target.value } : it)),
                          }))
                        }
                        className="h-11 rounded-xl border-white/10 bg-black/10 text-white"
                      />
                    </label>
                    <label className="space-y-1 md:col-span-2">
                      <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/45">Prix</span>
                      <Input
                        type="number"
                        value={z.price}
                        onChange={(e) =>
                          setValue((s) => ({
                            ...s,
                            deliveryZones: (s.deliveryZones ?? []).map((it, i) => (i === idx ? { ...it, price: Number(e.target.value) } : it)),
                          }))
                        }
                        className="h-11 rounded-xl border-white/10 bg-black/10 text-white"
                      />
                    </label>
                    <label className="space-y-1 md:col-span-2">
                      <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/45">Délais</span>
                      <Input
                        value={z.time ?? ""}
                        onChange={(e) =>
                          setValue((s) => ({
                            ...s,
                            deliveryZones: (s.deliveryZones ?? []).map((it, i) => (i === idx ? { ...it, time: e.target.value } : it)),
                          }))
                        }
                        className="h-11 rounded-xl border-white/10 bg-black/10 text-white"
                      />
                    </label>
                    <div className="flex items-end justify-end md:col-span-7">
                      <Button
                        variant="outline"
                        className="h-10 rounded-xl border-white/10 bg-black/10 text-white hover:text-red-200"
                        onClick={() =>
                          setValue((s) => ({
                            ...s,
                            deliveryZones: (s.deliveryZones ?? []).filter((_, i) => i !== idx),
                          }))
                        }
                        title="Supprimer la zone"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

