"use client"

import { useEffect, useState } from "react"
import { Loader2, Save } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { ImagePicker, type UploadedImage } from "../components/image-picker"

type HeroValue = {
  title: string
  subtitle: string
  ctaLabel: string
  ctaHref: string
  backgroundImage?: string | null
  backgroundImageStoragePath?: string | null
}

const DEFAULTS: HeroValue = {
  title: "L’élégance africaine à vos pieds",
  subtitle: "Sandales premium en cuir, fabriquées avec passion au Sénégal.",
  ctaLabel: "Découvrir la boutique",
  ctaHref: "/boutique",
  // Fallback (état actuel du site) si la DB n'a pas encore d'image
  backgroundImage: "/hero-mboulane.png",
  backgroundImageStoragePath: null,
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

export default function AdminHeroPage() {
  const [value, setValue] = useState<HeroValue>(DEFAULTS)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const load = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/admin/site/hero")
      const data = (await res.json()) as { value?: HeroValue | null }
      const v = (data.value ?? {}) as Partial<HeroValue>
      setValue({
        ...DEFAULTS,
        ...v,
        // Ne laisse pas un null DB "effacer" le fallback.
        backgroundImage: v.backgroundImage ?? DEFAULTS.backgroundImage,
        backgroundImageStoragePath: v.backgroundImageStoragePath ?? null,
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
  }, [])

  const save = async () => {
    setSaving(true)
    try {
      const res = await fetch("/api/admin/site/hero", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(value),
      })
      if (!res.ok) throw new Error("Erreur")
      await load()
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div className="text-white/60">Chargement…</div>
  }

  return (
    <div className="space-y-6 text-white">
      <div className="rounded-2xl border border-white/10 bg-white/5 p-5 shadow-[0_18px_60px_rgba(0,0,0,0.35)] backdrop-blur md:p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/50">Site</p>
            <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">Hero</h1>
            <p className="mt-1 text-sm text-white/55">Texte principal de la page d’accueil.</p>
          </div>
          <Button
            className="h-11 rounded-xl bg-[#b38b6d] text-black hover:bg-[#c29a7d]"
            onClick={save}
            disabled={saving}
          >
            {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            Enregistrer
          </Button>
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-[0_18px_60px_rgba(0,0,0,0.35)] backdrop-blur">
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Titre">
            <Input
              value={value.title}
              onChange={(e) => setValue((s) => ({ ...s, title: e.target.value }))}
              className="h-11 rounded-xl border-white/10 bg-black/20 text-white"
            />
          </Field>
          <Field label="CTA (label)">
            <Input
              value={value.ctaLabel}
              onChange={(e) => setValue((s) => ({ ...s, ctaLabel: e.target.value }))}
              className="h-11 rounded-xl border-white/10 bg-black/20 text-white"
            />
          </Field>
          <div className="md:col-span-2">
            <Field label="Sous-titre">
              <textarea
                value={value.subtitle}
                onChange={(e) => setValue((s) => ({ ...s, subtitle: e.target.value }))}
                className={cn(
                  "min-h-24 w-full rounded-xl border border-white/10 bg-black/20 px-3 py-3 text-sm text-white outline-none",
                )}
              />
            </Field>
          </div>
          <Field label="CTA (lien)">
            <Input
              value={value.ctaHref}
              onChange={(e) => setValue((s) => ({ ...s, ctaHref: e.target.value }))}
              className="h-11 rounded-xl border-white/10 bg-black/20 text-white"
              placeholder="/boutique"
            />
          </Field>
          <Field label="Image de fond (optionnel)">
            <div className="space-y-3">
              <ImagePicker
                label="Image de fond"
                bucket="site-images"
                folder="hero"
                multiple={false}
                value={
                  value.backgroundImage
                    ? ([{ url: value.backgroundImage, path: value.backgroundImageStoragePath ?? "hero" }] satisfies UploadedImage[])
                    : []
                }
                onChange={(next) => {
                  const first = next[0] ?? null
                  setValue((s) => ({
                    ...s,
                    backgroundImage: first?.url ?? null,
                    backgroundImageStoragePath: first?.path ?? null,
                  }))
                }}
              />
              <p className="text-xs text-white/45">
                L’image est uploadée depuis votre appareil et stockée dans Supabase Storage.
              </p>
            </div>
          </Field>
        </div>
      </div>
    </div>
  )
}

