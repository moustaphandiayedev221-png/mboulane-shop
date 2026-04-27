"use client"

import { useEffect, useState } from "react"
import { Loader2, Save } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { ImagePicker, type UploadedImage } from "../components/image-picker"
import type { ArtisanalHomeContent, WhyChooseFeature, WhyChooseHomeContent } from "@/lib/site/home-sections"
import {
  DEFAULT_ARTISANAL_HOME,
  HOME_ARTISANAL_KEY,
  HOME_WHY_CHOOSE_KEY,
  normalizeArtisanalHome,
  normalizeWhyChooseHome,
} from "@/lib/site/home-sections"
import {
  DEFAULT_REVIEWS_STATS_HOME,
  HOME_REVIEWS_STATS_KEY,
  normalizeReviewsStatsHome,
} from "@/lib/site/reviews-stats-content"
import type { ReviewsStatsHomeContent } from "@/lib/site/reviews-stats-content"

type ContentSettings = {
  promoBanner?: {
    enabled?: boolean
    text?: string
    dismissable?: boolean
  }
}

const ICON_OPTIONS: WhyChooseFeature["icon"][] = ["sparkles", "shield", "truck", "heart"]

export default function AdminContentPage() {
  const [loading, setLoading] = useState(true)
  const [savingPromo, setSavingPromo] = useState(false)
  const [savingArtisanal, setSavingArtisanal] = useState(false)
  const [savingWhy, setSavingWhy] = useState(false)
  const [savingReviews, setSavingReviews] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [value, setValue] = useState<ContentSettings>({
    promoBanner: { enabled: true, text: "10% de réduction — Code: MBOULANE10", dismissable: true },
  })
  const [artisanal, setArtisanal] = useState<ArtisanalHomeContent>(DEFAULT_ARTISANAL_HOME)
  const [whyChoose, setWhyChoose] = useState<WhyChooseHomeContent>(() =>
    normalizeWhyChooseHome(null),
  )
  const [reviewsStats, setReviewsStats] = useState<ReviewsStatsHomeContent>(DEFAULT_REVIEWS_STATS_HOME)

  const [artisanalImage, setArtisanalImage] = useState<UploadedImage[]>([])
  const [whyChooseImage, setWhyChooseImage] = useState<UploadedImage[]>([])

  const load = async () => {
    setLoading(true)
    setError(null)
    try {
      const [rContent, rArt, rWhy, rReviews] = await Promise.all([
        fetch("/api/admin/site/settings/content"),
        fetch(`/api/admin/site/settings/${encodeURIComponent(HOME_ARTISANAL_KEY)}`),
        fetch(`/api/admin/site/settings/${encodeURIComponent(HOME_WHY_CHOOSE_KEY)}`),
        fetch(`/api/admin/site/settings/${encodeURIComponent(HOME_REVIEWS_STATS_KEY)}`),
      ])
      const dContent = (await rContent.json()) as { value?: ContentSettings | null; error?: string }
      const dArt = (await rArt.json()) as { value?: unknown; error?: string }
      const dWhy = (await rWhy.json()) as { value?: unknown; error?: string }
      const dReviews = (await rReviews.json()) as { value?: unknown; error?: string }
      if (!rContent.ok) throw new Error(dContent.error || "Erreur contenu")
      if (!rArt.ok) throw new Error(dArt.error || "Erreur section artisanale")
      if (!rWhy.ok) throw new Error(dWhy.error || "Erreur section Pourquoi")
      if (!rReviews.ok) throw new Error(dReviews.error || "Erreur chiffres avis")
      if (dContent.value) setValue(dContent.value)
      const nextArt = normalizeArtisanalHome(dArt.value)
      const nextWhy = normalizeWhyChooseHome(dWhy.value)
      setArtisanal(nextArt)
      setWhyChoose(nextWhy)
      setReviewsStats(normalizeReviewsStatsHome(dReviews.value))
      setArtisanalImage(nextArt.imageUrl ? [{ url: nextArt.imageUrl, path: "existing" }] : [])
      setWhyChooseImage(nextWhy.imageUrl ? [{ url: nextWhy.imageUrl, path: "existing" }] : [])
    } catch (e) {
      const message = e instanceof Error ? e.message : "Erreur"
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  const savePromo = async () => {
    setSavingPromo(true)
    setError(null)
    try {
      const res = await fetch("/api/admin/site/settings/content", {
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
      setSavingPromo(false)
    }
  }

  const saveArtisanal = async () => {
    setSavingArtisanal(true)
    setError(null)
    try {
      const res = await fetch(`/api/admin/site/settings/${encodeURIComponent(HOME_ARTISANAL_KEY)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ value: artisanal }),
      })
      const data = (await res.json()) as { ok?: boolean; error?: string }
      if (!res.ok) throw new Error(data.error || "Erreur")
    } catch (e) {
      const message = e instanceof Error ? e.message : "Erreur"
      setError(message)
    } finally {
      setSavingArtisanal(false)
    }
  }

  const saveWhy = async () => {
    setSavingWhy(true)
    setError(null)
    try {
      const res = await fetch(`/api/admin/site/settings/${encodeURIComponent(HOME_WHY_CHOOSE_KEY)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ value: whyChoose }),
      })
      const data = (await res.json()) as { ok?: boolean; error?: string }
      if (!res.ok) throw new Error(data.error || "Erreur")
    } catch (e) {
      const message = e instanceof Error ? e.message : "Erreur"
      setError(message)
    } finally {
      setSavingWhy(false)
    }
  }

  const saveReviews = async () => {
    setSavingReviews(true)
    setError(null)
    try {
      const res = await fetch(`/api/admin/site/settings/${encodeURIComponent(HOME_REVIEWS_STATS_KEY)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ value: reviewsStats }),
      })
      const data = (await res.json()) as { ok?: boolean; error?: string }
      if (!res.ok) throw new Error(data.error || "Erreur")
    } catch (e) {
      const message = e instanceof Error ? e.message : "Erreur"
      setError(message)
    } finally {
      setSavingReviews(false)
    }
  }

  useEffect(() => {
    void load()
  }, [])

  const bulletsText = artisanal.bullets.join("\n")

  return (
    <div className="space-y-6 text-white">
      <div className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-[0_18px_60px_rgba(0,0,0,0.35)] backdrop-blur">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-white/50">Contenu</p>
            <h1 className="mt-3 text-2xl font-semibold">Accueil &amp; messages</h1>
            <p className="mt-2 text-sm text-white/55">
              Bannière promo, <strong className="text-white/80">Collection artisanale</strong>,{" "}
              <strong className="text-white/80">Pourquoi MBOULANE</strong> et{" "}
              <strong className="text-white/80">chiffres sous les avis</strong> (Supabase{" "}
              <code className="text-white/70">site_settings</code>).
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-[0_18px_60px_rgba(0,0,0,0.35)] backdrop-blur">
        {loading ? (
          <div className="py-10 text-center text-white/60">Chargement…</div>
        ) : (
          <div className="space-y-10">
            {error ? (
              <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-100">
                {error}
              </div>
            ) : null}

            <section className="space-y-4">
              <div className="flex flex-col gap-3 border-b border-white/10 pb-4 md:flex-row md:items-center md:justify-between">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/45">Bannière promo</p>
                <Button
                  className="h-10 shrink-0 rounded-xl bg-[#b38b6d] text-black hover:bg-[#c29a7d]"
                  onClick={savePromo}
                  disabled={savingPromo}
                >
                  {savingPromo ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                  Enregistrer
                </Button>
              </div>
              <div className="grid gap-4 md:grid-cols-3">
                <label className="space-y-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/45">Activée</span>
                  <select
                    value={value.promoBanner?.enabled ? "1" : "0"}
                    onChange={(e) =>
                      setValue((s) => ({
                        ...s,
                        promoBanner: { ...s.promoBanner, enabled: e.target.value === "1" },
                      }))
                    }
                    className="h-11 w-full rounded-xl border border-white/10 bg-black/20 px-3 text-sm text-white outline-none"
                  >
                    <option value="1">Oui</option>
                    <option value="0">Non</option>
                  </select>
                </label>
                <label className="space-y-1.5 md:col-span-2">
                  <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/45">Texte</span>
                  <Input
                    value={value.promoBanner?.text ?? ""}
                    onChange={(e) =>
                      setValue((s) => ({
                        ...s,
                        promoBanner: { ...s.promoBanner, text: e.target.value },
                      }))
                    }
                    className="h-11 rounded-xl border-white/10 bg-black/20 text-white"
                  />
                </label>
                <label className="space-y-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/45">Masquable</span>
                  <select
                    value={value.promoBanner?.dismissable ? "1" : "0"}
                    onChange={(e) =>
                      setValue((s) => ({
                        ...s,
                        promoBanner: { ...s.promoBanner, dismissable: e.target.value === "1" },
                      }))
                    }
                    className="h-11 w-full rounded-xl border border-white/10 bg-black/20 px-3 text-sm text-white outline-none"
                  >
                    <option value="1">Oui</option>
                    <option value="0">Non</option>
                  </select>
                </label>
              </div>
            </section>

            <section className="space-y-4 border-t border-white/10 pt-8">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/45">
                    Collection artisanale
                  </p>
                  <p className="mt-1 text-[11px] text-white/45">Clé : {HOME_ARTISANAL_KEY}</p>
                </div>
                <Button
                  className="h-10 shrink-0 rounded-xl bg-[#b38b6d] text-black hover:bg-[#c29a7d]"
                  onClick={saveArtisanal}
                  disabled={savingArtisanal}
                >
                  {savingArtisanal ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="mr-2 h-4 w-4" />
                  )}
                  Enregistrer
                </Button>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <label className="space-y-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/45">Titre (script)</span>
                  <Input
                    value={artisanal.heading}
                    onChange={(e) => setArtisanal((a) => ({ ...a, heading: e.target.value }))}
                    className="h-11 rounded-xl border-white/10 bg-black/20 text-white"
                  />
                </label>
                <label className="space-y-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/45">
                    Image principale
                  </span>
                  <ImagePicker
                    label="Image principale"
                    bucket="site-images"
                    folder="home/artisanal"
                    multiple={false}
                    value={artisanalImage}
                    onChange={(next) => {
                      setArtisanalImage(next)
                      setArtisanal((a) => ({ ...a, imageUrl: next[0]?.url || "" }))
                    }}
                  />
                </label>
              </div>
              <label className="space-y-1.5">
                <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/45">Intro</span>
                <Textarea
                  value={artisanal.intro}
                  onChange={(e) => setArtisanal((a) => ({ ...a, intro: e.target.value }))}
                  rows={3}
                  className="rounded-xl border-white/10 bg-black/20 text-white"
                />
              </label>
              <div className="grid gap-4 md:grid-cols-2">
                <label className="space-y-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/45">
                    Sous-titre script
                  </span>
                  <Input
                    value={artisanal.scriptSub}
                    onChange={(e) => setArtisanal((a) => ({ ...a, scriptSub: e.target.value }))}
                    className="h-11 rounded-xl border-white/10 bg-black/20 text-white"
                  />
                </label>
                <label className="space-y-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/45">Titre bloc</span>
                  <Input
                    value={artisanal.title}
                    onChange={(e) => setArtisanal((a) => ({ ...a, title: e.target.value }))}
                    className="h-11 rounded-xl border-white/10 bg-black/20 text-white"
                  />
                </label>
              </div>
              <label className="space-y-1.5">
                <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/45">Badge</span>
                <Input
                  value={artisanal.badge}
                  onChange={(e) => setArtisanal((a) => ({ ...a, badge: e.target.value }))}
                  className="h-11 rounded-xl border-white/10 bg-black/20 text-white"
                />
              </label>
              <label className="space-y-1.5">
                <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/45">Paragraphe</span>
                <Textarea
                  value={artisanal.body}
                  onChange={(e) => setArtisanal((a) => ({ ...a, body: e.target.value }))}
                  rows={4}
                  className="rounded-xl border-white/10 bg-black/20 text-white"
                />
              </label>
              <label className="space-y-1.5">
                <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/45">
                  Puces (une par ligne)
                </span>
                <Textarea
                  value={bulletsText}
                  onChange={(e) =>
                    setArtisanal((a) => ({
                      ...a,
                      bullets: e.target.value
                        .split("\n")
                        .map((l) => l.trim())
                        .filter(Boolean),
                    }))
                  }
                  rows={5}
                  className="rounded-xl border-white/10 bg-black/20 text-white"
                />
              </label>
              <div className="grid gap-4 md:grid-cols-2">
                <label className="space-y-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/45">
                    Carte flottante — titre
                  </span>
                  <Input
                    value={artisanal.floatCardTitle}
                    onChange={(e) => setArtisanal((a) => ({ ...a, floatCardTitle: e.target.value }))}
                    className="h-11 rounded-xl border-white/10 bg-black/20 text-white"
                  />
                </label>
                <label className="space-y-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/45">
                    Carte flottante — sous-titre
                  </span>
                  <Input
                    value={artisanal.floatCardSubtitle}
                    onChange={(e) => setArtisanal((a) => ({ ...a, floatCardSubtitle: e.target.value }))}
                    className="h-11 rounded-xl border-white/10 bg-black/20 text-white"
                  />
                </label>
              </div>
            </section>

            <section className="space-y-4 border-t border-white/10 pt-8">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/45">
                    Pourquoi Choisir MBOULANE ?
                  </p>
                  <p className="mt-1 text-[11px] text-white/45">Clé : {HOME_WHY_CHOOSE_KEY}</p>
                </div>
                <Button
                  className="h-10 shrink-0 rounded-xl bg-[#b38b6d] text-black hover:bg-[#c29a7d]"
                  onClick={saveWhy}
                  disabled={savingWhy}
                >
                  {savingWhy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                  Enregistrer
                </Button>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <label className="space-y-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/45">Titre (script)</span>
                  <Input
                    value={whyChoose.heading}
                    onChange={(e) => setWhyChoose((w) => ({ ...w, heading: e.target.value }))}
                    className="h-11 rounded-xl border-white/10 bg-black/20 text-white"
                  />
                </label>
                <label className="space-y-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/45">Image</span>
                  <ImagePicker
                    label="Image"
                    bucket="site-images"
                    folder="home/why-choose"
                    multiple={false}
                    value={whyChooseImage}
                    onChange={(next) => {
                      setWhyChooseImage(next)
                      setWhyChoose((w) => ({ ...w, imageUrl: next[0]?.url || "" }))
                    }}
                  />
                </label>
              </div>
              <label className="space-y-1.5">
                <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/45">Intro</span>
                <Textarea
                  value={whyChoose.intro}
                  onChange={(e) => setWhyChoose((w) => ({ ...w, intro: e.target.value }))}
                  rows={3}
                  className="rounded-xl border-white/10 bg-black/20 text-white"
                />
              </label>
              <div className="grid gap-4 md:grid-cols-2">
                <label className="space-y-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/45">
                    Sous-titre script
                  </span>
                  <Input
                    value={whyChoose.scriptSub}
                    onChange={(e) => setWhyChoose((w) => ({ ...w, scriptSub: e.target.value }))}
                    className="h-11 rounded-xl border-white/10 bg-black/20 text-white"
                  />
                </label>
                <label className="space-y-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/45">
                    Titre colonne droite
                  </span>
                  <Input
                    value={whyChoose.columnTitle}
                    onChange={(e) => setWhyChoose((w) => ({ ...w, columnTitle: e.target.value }))}
                    className="h-11 rounded-xl border-white/10 bg-black/20 text-white"
                  />
                </label>
              </div>
              <label className="space-y-1.5">
                <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/45">Citation sur photo</span>
                <Textarea
                  value={whyChoose.quote}
                  onChange={(e) => setWhyChoose((w) => ({ ...w, quote: e.target.value }))}
                  rows={2}
                  className="rounded-xl border-white/10 bg-black/20 text-white"
                />
              </label>
              <label className="space-y-1.5">
                <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/45">Attribution</span>
                <Input
                  value={whyChoose.quoteAttribution}
                  onChange={(e) => setWhyChoose((w) => ({ ...w, quoteAttribution: e.target.value }))}
                  className="h-11 rounded-xl border-white/10 bg-black/20 text-white"
                />
              </label>

              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/45">Blocs (icône + titre + texte)</p>
              <div className="space-y-4">
                {whyChoose.features.map((f, i) => (
                  <div
                    key={i}
                    className="grid gap-3 rounded-xl border border-white/10 bg-black/20 p-4 md:grid-cols-[140px_1fr_1fr]"
                  >
                    <label className="space-y-1.5">
                      <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/45">Icône</span>
                      <select
                        value={f.icon}
                        onChange={(e) => {
                          const icon = e.target.value as WhyChooseFeature["icon"]
                          setWhyChoose((w) => {
                            const features = [...w.features]
                            features[i] = { ...features[i], icon }
                            return { ...w, features }
                          })
                        }}
                        className="h-11 w-full rounded-xl border border-white/10 bg-black/30 px-2 text-sm text-white outline-none"
                      >
                        {ICON_OPTIONS.map((opt) => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="space-y-1.5">
                      <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/45">Titre</span>
                      <Input
                        value={f.title}
                        onChange={(e) => {
                          const title = e.target.value
                          setWhyChoose((w) => {
                            const features = [...w.features]
                            features[i] = { ...features[i], title }
                            return { ...w, features }
                          })
                        }}
                        className="h-11 rounded-xl border-white/10 bg-black/30 text-white"
                      />
                    </label>
                    <label className="space-y-1.5 md:col-span-2 lg:col-span-1">
                      <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/45">Description</span>
                      <Textarea
                        value={f.description}
                        onChange={(e) => {
                          const description = e.target.value
                          setWhyChoose((w) => {
                            const features = [...w.features]
                            features[i] = { ...features[i], description }
                            return { ...w, features }
                          })
                        }}
                        rows={3}
                        className="rounded-xl border-white/10 bg-black/30 text-white md:col-span-2"
                      />
                    </label>
                  </div>
                ))}
              </div>
            </section>

            <section className="space-y-4 border-t border-white/10 pt-8">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/45">
                    Section Avis — bandeau chiffres
                  </p>
                  <p className="mt-1 text-[11px] text-white/45">Clé : {HOME_REVIEWS_STATS_KEY}</p>
                  <p className="mt-1 text-sm text-white/50">
                    Affiché sous le carrousel d&apos;avis (note /5, avis vérifiés, satisfaction %).
                  </p>
                </div>
                <Button
                  className="h-10 shrink-0 rounded-xl bg-[#b38b6d] text-black hover:bg-[#c29a7d]"
                  onClick={saveReviews}
                  disabled={savingReviews}
                >
                  {savingReviews ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="mr-2 h-4 w-4" />
                  )}
                  Enregistrer
                </Button>
              </div>
              <div className="grid gap-4 md:grid-cols-3">
                <label className="space-y-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/45">
                    Note moyenne (0–5)
                  </span>
                  <Input
                    type="number"
                    min={0}
                    max={5}
                    step={0.1}
                    value={reviewsStats.averageRating}
                    onChange={(e) =>
                      setReviewsStats((r) => ({
                        ...r,
                        averageRating: Number(e.target.value.replace(",", ".")) || 0,
                      }))
                    }
                    className="h-11 rounded-xl border-white/10 bg-black/20 text-white"
                  />
                </label>
                <label className="space-y-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/45">Libellé</span>
                  <Input
                    value={reviewsStats.labelAverage}
                    onChange={(e) => setReviewsStats((r) => ({ ...r, labelAverage: e.target.value }))}
                    className="h-11 rounded-xl border-white/10 bg-black/20 text-white"
                  />
                </label>
                <div className="hidden md:block" aria-hidden />
                <label className="space-y-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/45">Avis vérifiés (nombre)</span>
                  <Input
                    type="number"
                    min={0}
                    step={1}
                    value={reviewsStats.verifiedCount}
                    onChange={(e) =>
                      setReviewsStats((r) => ({
                        ...r,
                        verifiedCount: Math.max(0, Math.floor(Number(e.target.value) || 0)),
                      }))
                    }
                    className="h-11 rounded-xl border-white/10 bg-black/20 text-white"
                  />
                </label>
                <label className="space-y-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/45">Libellé</span>
                  <Input
                    value={reviewsStats.labelVerified}
                    onChange={(e) => setReviewsStats((r) => ({ ...r, labelVerified: e.target.value }))}
                    className="h-11 rounded-xl border-white/10 bg-black/20 text-white"
                  />
                </label>
                <div className="hidden md:block" aria-hidden />
                <label className="space-y-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/45">
                    Clients satisfaits (0–100)
                  </span>
                  <Input
                    type="number"
                    min={0}
                    max={100}
                    step={1}
                    value={reviewsStats.satisfactionPercent}
                    onChange={(e) =>
                      setReviewsStats((r) => ({
                        ...r,
                        satisfactionPercent: Math.min(100, Math.max(0, Math.floor(Number(e.target.value) || 0))),
                      }))
                    }
                    className="h-11 rounded-xl border-white/10 bg-black/20 text-white"
                  />
                </label>
                <label className="space-y-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/45">Libellé</span>
                  <Input
                    value={reviewsStats.labelSatisfaction}
                    onChange={(e) => setReviewsStats((r) => ({ ...r, labelSatisfaction: e.target.value }))}
                    className="h-11 rounded-xl border-white/10 bg-black/20 text-white"
                  />
                </label>
              </div>
            </section>
          </div>
        )}
      </div>
    </div>
  )
}
