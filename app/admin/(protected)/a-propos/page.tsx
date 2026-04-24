"use client"

import { useEffect, useState } from "react"
import { ExternalLink, Loader2, Plus, RotateCcw, Save, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import type { AboutPageContent, AboutTimelineItem, AboutValueIcon, AboutValueItem } from "@/lib/site/about-page"
import { ABOUT_PAGE_KEY, DEFAULT_ABOUT_PAGE, normalizeAboutPage } from "@/lib/site/about-page"
import { ImagePicker, type UploadedImage } from "../components/image-picker"

const ICON_OPTIONS: AboutValueIcon[] = ["heart", "users", "leaf", "award"]

/** Permet d’afficher l’aperçu Next/Image quand l’image n’a pas de chemin Storage (fichier local /public ou URL saisie). */
const ABOUT_IMAGE_PREVIEW_PATH = "__about_local__"

export default function AdminAboutPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [content, setContent] = useState<AboutPageContent>(() => structuredClone(DEFAULT_ABOUT_PAGE))

  const storyParagraphsText = content.story.paragraphs.join("\n\n")

  const load = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/admin/site/settings/${encodeURIComponent(ABOUT_PAGE_KEY)}`)
      const data = (await res.json()) as { value?: unknown; error?: string }
      if (!res.ok) throw new Error(data.error || "Erreur chargement")
      setContent(normalizeAboutPage(data.value))
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur")
    } finally {
      setLoading(false)
    }
  }

  const save = async () => {
    setSaving(true)
    setError(null)
    try {
      const res = await fetch(`/api/admin/site/settings/${encodeURIComponent(ABOUT_PAGE_KEY)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ value: content }),
      })
      const data = (await res.json()) as { ok?: boolean; error?: string }
      if (!res.ok) throw new Error(data.error || "Erreur enregistrement")
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur")
    } finally {
      setSaving(false)
    }
  }

  useEffect(() => {
    void load()
  }, [])

  const setStoryParagraphsFromText = (text: string) => {
    const paragraphs = text
      .split(/\n\s*\n/)
      .map((p) => p.trim())
      .filter(Boolean)
    setContent((c) => ({
      ...c,
      story: { ...c.story, paragraphs: paragraphs.length > 0 ? paragraphs : [""] },
    }))
  }

  const updateValueItem = (index: number, patch: Partial<AboutValueItem>) => {
    setContent((c) => {
      const items = [...c.values.items]
      items[index] = { ...items[index], ...patch }
      return { ...c, values: { ...c.values, items } }
    })
  }

  const addValueItem = () => {
    setContent((c) => ({
      ...c,
      values: {
        ...c.values,
        items: [...c.values.items, { icon: "heart" as const, title: "", description: "" }],
      },
    }))
  }

  const removeValueItem = (index: number) => {
    setContent((c) => ({
      ...c,
      values: { ...c.values, items: c.values.items.filter((_, i) => i !== index) },
    }))
  }

  const updateTimelineItem = (index: number, patch: Partial<AboutTimelineItem>) => {
    setContent((c) => {
      const items = [...c.timeline.items]
      items[index] = { ...items[index], ...patch }
      return { ...c, timeline: { ...c.timeline, items } }
    })
  }

  const addTimelineItem = () => {
    setContent((c) => ({
      ...c,
      timeline: {
        ...c.timeline,
        items: [...c.timeline.items, { year: "", title: "", description: "" }],
      },
    }))
  }

  const removeTimelineItem = (index: number) => {
    setContent((c) => ({
      ...c,
      timeline: { ...c.timeline, items: c.timeline.items.filter((_, i) => i !== index) },
    }))
  }

  return (
    <div className="space-y-6 text-white">
      <div className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-[0_18px_60px_rgba(0,0,0,0.35)] backdrop-blur">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-white/50">Site public</p>
            <h1 className="mt-3 text-2xl font-semibold">À propos</h1>
            <p className="mt-2 max-w-xl text-sm text-white/55">
              Texte et structure de la page{" "}
              <code className="text-white/70">/a-propos</code>. Stocké dans Supabase ({""}
              <code className="text-white/70">site_settings</code>, clé{" "}
              <code className="text-white/70">{ABOUT_PAGE_KEY}</code>
              ).
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              className="rounded-xl border-white/20 bg-transparent text-white hover:bg-white/10"
              asChild
            >
              <a href="/a-propos" target="_blank" rel="noopener noreferrer">
                <ExternalLink className="mr-2 h-4 w-4" />
                Voir la page
              </a>
            </Button>
            <Button
              variant="outline"
              className="rounded-xl border-white/20 bg-transparent text-white hover:bg-white/10"
              onClick={() => setContent(structuredClone(DEFAULT_ABOUT_PAGE))}
              type="button"
            >
              <RotateCcw className="mr-2 h-4 w-4" />
              Réinitialiser le formulaire
            </Button>
            <Button
              className="rounded-xl bg-[#b38b6d] text-black hover:bg-[#c29a7d]"
              onClick={save}
              disabled={saving || loading}
              type="button"
            >
              {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              Enregistrer
            </Button>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-[0_18px_60px_rgba(0,0,0,0.35)] backdrop-blur">
        {loading ? (
          <div className="py-16 text-center text-white/60">Chargement…</div>
        ) : (
          <div className="space-y-10">
            {error ? (
              <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-100">{error}</div>
            ) : null}

            <section className="space-y-4">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/45">Référencement</p>
              <div className="grid gap-4 md:grid-cols-2">
                <label className="space-y-1.5 md:col-span-2">
                  <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/45">
                    Titre (&lt;title&gt;)
                  </span>
                  <Input
                    value={content.metaTitle}
                    onChange={(e) => setContent((c) => ({ ...c, metaTitle: e.target.value }))}
                    className="rounded-xl border-white/10 bg-black/20 text-white"
                  />
                </label>
                <label className="space-y-1.5 md:col-span-2">
                  <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/45">Meta description</span>
                  <Textarea
                    value={content.metaDescription}
                    onChange={(e) => setContent((c) => ({ ...c, metaDescription: e.target.value }))}
                    rows={3}
                    className="rounded-xl border-white/10 bg-black/20 text-white"
                  />
                </label>
              </div>
            </section>

            <section className="space-y-4 border-t border-white/10 pt-10">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/45">En-tête</p>
              <div className="grid gap-4 md:grid-cols-2">
                <label className="space-y-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/45">Titre script</span>
                  <Input
                    value={content.hero.scriptTitle}
                    onChange={(e) => setContent((c) => ({ ...c, hero: { ...c.hero, scriptTitle: e.target.value } }))}
                    className="rounded-xl border-white/10 bg-black/20 text-white"
                  />
                </label>
                <label className="space-y-1.5 md:col-span-2">
                  <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/45">Sous-titre</span>
                  <Textarea
                    value={content.hero.subtitle}
                    onChange={(e) => setContent((c) => ({ ...c, hero: { ...c.hero, subtitle: e.target.value } }))}
                    rows={2}
                    className="rounded-xl border-white/10 bg-black/20 text-white"
                  />
                </label>
                <label className="space-y-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/45">
                    Badge — emoji / symbole
                  </span>
                  <Input
                    value={content.hero.eyebrowEmoji}
                    onChange={(e) => setContent((c) => ({ ...c, hero: { ...c.hero, eyebrowEmoji: e.target.value } }))}
                    className="rounded-xl border-white/10 bg-black/20 text-white"
                  />
                </label>
                <label className="space-y-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/45">Badge — libellé</span>
                  <Input
                    value={content.hero.eyebrowLabel}
                    onChange={(e) => setContent((c) => ({ ...c, hero: { ...c.hero, eyebrowLabel: e.target.value } }))}
                    className="rounded-xl border-white/10 bg-black/20 text-white"
                  />
                </label>
              </div>
            </section>

            <section className="space-y-4 border-t border-white/10 pt-10">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/45">Bloc histoire</p>
              <div className="grid gap-4">
                <div className="space-y-3">
                  <ImagePicker
                    label="Image principale"
                    bucket="site-images"
                    folder="about"
                    multiple={false}
                    value={
                      content.story.imageSrc
                        ? ([
                            {
                              url: content.story.imageSrc,
                              path: content.story.imageStoragePath ?? ABOUT_IMAGE_PREVIEW_PATH,
                            },
                          ] satisfies UploadedImage[])
                        : []
                    }
                    onChange={(next) => {
                      const first = next[0] ?? null
                      if (!first) {
                        setContent((c) => ({
                          ...c,
                          story: {
                            ...c.story,
                            imageSrc: DEFAULT_ABOUT_PAGE.story.imageSrc,
                            imageStoragePath: null,
                          },
                        }))
                        return
                      }
                      setContent((c) => ({
                        ...c,
                        story: {
                          ...c.story,
                          imageSrc: first.url,
                          imageStoragePath:
                            first.path === ABOUT_IMAGE_PREVIEW_PATH ? null : first.path,
                        },
                      }))
                    }}
                  />
                  <p className="text-xs text-white/45">
                    Choisissez une photo depuis cet appareil (galerie ou appareil photo). Le fichier est envoyé vers
                    Supabase Storage ; l’aperçu s’affiche ci‑dessus.
                  </p>
                </div>
                <label className="space-y-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/45">
                    Ou URL / chemin (ex. /collection-artisan.jpg)
                  </span>
                  <Input
                    value={content.story.imageSrc}
                    onChange={(e) =>
                      setContent((c) => ({
                        ...c,
                        story: {
                          ...c.story,
                          imageSrc: e.target.value,
                          imageStoragePath: null,
                        },
                      }))
                    }
                    className="rounded-xl border-white/10 bg-black/20 text-white"
                    placeholder="/collection-artisan.jpg"
                  />
                </label>
                <label className="space-y-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/45">Titre</span>
                  <Input
                    value={content.story.heading}
                    onChange={(e) => setContent((c) => ({ ...c, story: { ...c.story, heading: e.target.value } }))}
                    className="rounded-xl border-white/10 bg-black/20 text-white"
                  />
                </label>
                <label className="space-y-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/45">
                    Paragraphes (séparés par une ligne vide)
                  </span>
                  <Textarea
                    value={storyParagraphsText}
                    onChange={(e) => setStoryParagraphsFromText(e.target.value)}
                    rows={8}
                    className="rounded-xl border-white/10 bg-black/20 font-mono text-sm text-white"
                  />
                </label>
                <div className="grid gap-4 md:grid-cols-2">
                  <label className="space-y-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/45">
                      Bouton — libellé
                    </span>
                    <Input
                      value={content.story.ctaLabel}
                      onChange={(e) =>
                        setContent((c) => ({ ...c, story: { ...c.story, ctaLabel: e.target.value } }))
                      }
                      className="rounded-xl border-white/10 bg-black/20 text-white"
                    />
                  </label>
                  <label className="space-y-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/45">
                      Bouton — lien
                    </span>
                    <Input
                      value={content.story.ctaHref}
                      onChange={(e) =>
                        setContent((c) => ({ ...c, story: { ...c.story, ctaHref: e.target.value } }))
                      }
                      className="rounded-xl border-white/10 bg-black/20 text-white"
                    />
                  </label>
                </div>
              </div>
            </section>

            <section className="space-y-4 border-t border-white/10 pt-10">
              <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/45">Valeurs</p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="rounded-lg border-white/20 text-white hover:bg-white/10"
                  onClick={addValueItem}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Ajouter une valeur
                </Button>
              </div>
              <div className="grid gap-4 md:grid-cols-3">
                <label className="space-y-1.5 md:col-span-3">
                  <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/45">Sur-titre</span>
                  <Input
                    value={content.values.eyebrow}
                    onChange={(e) =>
                      setContent((c) => ({ ...c, values: { ...c.values, eyebrow: e.target.value } }))
                    }
                    className="rounded-xl border-white/10 bg-black/20 text-white"
                  />
                </label>
                <label className="space-y-1.5 md:col-span-3">
                  <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/45">Titre</span>
                  <Input
                    value={content.values.heading}
                    onChange={(e) =>
                      setContent((c) => ({ ...c, values: { ...c.values, heading: e.target.value } }))
                    }
                    className="rounded-xl border-white/10 bg-black/20 text-white"
                  />
                </label>
                <label className="space-y-1.5 md:col-span-3">
                  <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/45">Introduction</span>
                  <Textarea
                    value={content.values.intro}
                    onChange={(e) =>
                      setContent((c) => ({ ...c, values: { ...c.values, intro: e.target.value } }))
                    }
                    rows={2}
                    className="rounded-xl border-white/10 bg-black/20 text-white"
                  />
                </label>
              </div>
              <div className="space-y-4">
                {content.values.items.map((item, i) => (
                  <div
                    key={i}
                    className="rounded-xl border border-white/10 bg-black/20 p-4"
                  >
                    <div className="mb-3 flex justify-end">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="text-red-300 hover:bg-red-500/20 hover:text-red-100"
                        onClick={() => removeValueItem(i)}
                        disabled={content.values.items.length <= 1}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Supprimer
                      </Button>
                    </div>
                    <div className="grid gap-3 md:grid-cols-4">
                      <label className="space-y-1.5">
                        <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/45">Icône</span>
                        <select
                          value={item.icon}
                          onChange={(e) =>
                            updateValueItem(i, { icon: e.target.value as AboutValueIcon })
                          }
                          className="h-11 w-full rounded-xl border border-white/10 bg-black/40 px-3 text-sm text-white outline-none"
                        >
                          {ICON_OPTIONS.map((ic) => (
                            <option key={ic} value={ic}>
                              {ic}
                            </option>
                          ))}
                        </select>
                      </label>
                      <label className="space-y-1.5 md:col-span-3">
                        <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/45">Titre</span>
                        <Input
                          value={item.title}
                          onChange={(e) => updateValueItem(i, { title: e.target.value })}
                          className="rounded-xl border-white/10 bg-black/30 text-white"
                        />
                      </label>
                      <label className="space-y-1.5 md:col-span-4">
                        <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/45">
                          Description
                        </span>
                        <Textarea
                          value={item.description}
                          onChange={(e) => updateValueItem(i, { description: e.target.value })}
                          rows={2}
                          className="rounded-xl border-white/10 bg-black/30 text-white"
                        />
                      </label>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="space-y-4 border-t border-white/10 pt-10">
              <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/45">Frise chronologique</p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="rounded-lg border-white/20 text-white hover:bg-white/10"
                  onClick={addTimelineItem}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Ajouter une étape
                </Button>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <label className="space-y-1.5 md:col-span-2">
                  <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/45">Titre de section</span>
                  <Input
                    value={content.timeline.heading}
                    onChange={(e) =>
                      setContent((c) => ({ ...c, timeline: { ...c.timeline, heading: e.target.value } }))
                    }
                    className="rounded-xl border-white/10 bg-black/20 text-white"
                  />
                </label>
                <label className="space-y-1.5 md:col-span-2">
                  <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/45">Introduction</span>
                  <Input
                    value={content.timeline.intro}
                    onChange={(e) =>
                      setContent((c) => ({ ...c, timeline: { ...c.timeline, intro: e.target.value } }))
                    }
                    className="rounded-xl border-white/10 bg-black/20 text-white"
                  />
                </label>
              </div>
              <div className="space-y-4">
                {content.timeline.items.map((item, i) => (
                  <div key={i} className="rounded-xl border border-white/10 bg-black/20 p-4">
                    <div className="mb-3 flex justify-end">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="text-red-300 hover:bg-red-500/20 hover:text-red-100"
                        onClick={() => removeTimelineItem(i)}
                        disabled={content.timeline.items.length <= 1}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Supprimer
                      </Button>
                    </div>
                    <div className="grid gap-3 md:grid-cols-3">
                      <label className="space-y-1.5">
                        <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/45">Année</span>
                        <Input
                          value={item.year}
                          onChange={(e) => updateTimelineItem(i, { year: e.target.value })}
                          className="rounded-xl border-white/10 bg-black/30 text-white"
                        />
                      </label>
                      <label className="space-y-1.5 md:col-span-2">
                        <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/45">Titre</span>
                        <Input
                          value={item.title}
                          onChange={(e) => updateTimelineItem(i, { title: e.target.value })}
                          className="rounded-xl border-white/10 bg-black/30 text-white"
                        />
                      </label>
                      <label className="space-y-1.5 md:col-span-3">
                        <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/45">
                          Description
                        </span>
                        <Textarea
                          value={item.description}
                          onChange={(e) => updateTimelineItem(i, { description: e.target.value })}
                          rows={2}
                          className="rounded-xl border-white/10 bg-black/30 text-white"
                        />
                      </label>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="space-y-4 border-t border-white/10 pt-10">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/45">Bloc final (fond sombre)</p>
              <div className="grid gap-4">
                <label className="space-y-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/45">Titre</span>
                  <Input
                    value={content.closing.heading}
                    onChange={(e) =>
                      setContent((c) => ({ ...c, closing: { ...c.closing, heading: e.target.value } }))
                    }
                    className="rounded-xl border-white/10 bg-black/20 text-white"
                  />
                </label>
                <label className="space-y-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/45">Texte</span>
                  <Textarea
                    value={content.closing.body}
                    onChange={(e) =>
                      setContent((c) => ({ ...c, closing: { ...c.closing, body: e.target.value } }))
                    }
                    rows={3}
                    className="rounded-xl border-white/10 bg-black/20 text-white"
                  />
                </label>
                <div className="grid gap-4 md:grid-cols-2">
                  <label className="space-y-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/45">
                      Bouton principal — libellé
                    </span>
                    <Input
                      value={content.closing.primaryLabel}
                      onChange={(e) =>
                        setContent((c) => ({ ...c, closing: { ...c.closing, primaryLabel: e.target.value } }))
                      }
                      className="rounded-xl border-white/10 bg-black/20 text-white"
                    />
                  </label>
                  <label className="space-y-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/45">
                      Bouton principal — lien
                    </span>
                    <Input
                      value={content.closing.primaryHref}
                      onChange={(e) =>
                        setContent((c) => ({ ...c, closing: { ...c.closing, primaryHref: e.target.value } }))
                      }
                      className="rounded-xl border-white/10 bg-black/20 text-white"
                    />
                  </label>
                  <label className="space-y-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/45">
                      Bouton secondaire — libellé
                    </span>
                    <Input
                      value={content.closing.secondaryLabel}
                      onChange={(e) =>
                        setContent((c) => ({ ...c, closing: { ...c.closing, secondaryLabel: e.target.value } }))
                      }
                      className="rounded-xl border-white/10 bg-black/20 text-white"
                    />
                  </label>
                  <label className="space-y-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/45">
                      Bouton secondaire — lien
                    </span>
                    <Input
                      value={content.closing.secondaryHref}
                      onChange={(e) =>
                        setContent((c) => ({ ...c, closing: { ...c.closing, secondaryHref: e.target.value } }))
                      }
                      className="rounded-xl border-white/10 bg-black/20 text-white"
                    />
                  </label>
                </div>
              </div>
            </section>
          </div>
        )}
      </div>
    </div>
  )
}
