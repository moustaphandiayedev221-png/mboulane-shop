"use client"

import { useEffect, useMemo, useState } from "react"
import { ExternalLink, Loader2, Plus, Save, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import type { ContactInfoIcon, ContactInfoItem, ContactPageContent } from "@/lib/site/contact-page"
import { CONTACT_PAGE_KEY, DEFAULT_CONTACT_PAGE, normalizeContactPage } from "@/lib/site/contact-page"

const ICON_OPTIONS: { value: ContactInfoIcon; label: string }[] = [
  { value: "mapPin", label: "Adresse" },
  { value: "phone", label: "Téléphone" },
  { value: "mail", label: "Email" },
  { value: "clock", label: "Horaires" },
]

export default function AdminContactPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [content, setContent] = useState<ContactPageContent>(() => structuredClone(DEFAULT_CONTACT_PAGE))

  const load = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/admin/site/settings/${encodeURIComponent(CONTACT_PAGE_KEY)}`)
      const data = (await res.json()) as { value?: unknown; error?: string }
      if (!res.ok) throw new Error(data.error || "Erreur chargement")
      setContent(normalizeContactPage(data.value))
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
      const res = await fetch(`/api/admin/site/settings/${encodeURIComponent(CONTACT_PAGE_KEY)}`, {
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

  const updateItem = (index: number, patch: Partial<ContactInfoItem>) => {
    setContent((c) => {
      const items = [...c.items]
      items[index] = { ...items[index], ...patch }
      return { ...c, items }
    })
  }

  const addItem = () => {
    setContent((c) => ({
      ...c,
      items: [...c.items, { icon: "mapPin", title: "", content: "", detail: "" }],
    }))
  }

  const removeItem = (index: number) => {
    setContent((c) => ({ ...c, items: c.items.filter((_, i) => i !== index) }))
  }

  const previewHref = useMemo(() => "/contact", [])

  return (
    <div className="space-y-6 text-white">
      <div className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-[0_18px_60px_rgba(0,0,0,0.35)] backdrop-blur">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-white/50">Contact</p>
            <h1 className="mt-3 text-2xl font-semibold">Page Contact</h1>
            <p className="mt-2 text-sm text-white/55">
              Modifie les blocs “Adresse / Téléphone / Email / Horaires” et la carte WhatsApp.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              asChild
              variant="outline"
              className="h-10 rounded-xl border-white/10 bg-black/20 text-white hover:bg-black/30"
            >
              <a href={previewHref} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="mr-2 h-4 w-4" />
                Ouvrir la page
              </a>
            </Button>
            <Button
              className="h-10 rounded-xl bg-[#b38b6d] text-black hover:bg-[#c29a7d]"
              onClick={save}
              disabled={saving || loading}
            >
              {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              Enregistrer
            </Button>
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
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/45">Hero</p>
              <div className="grid gap-4 md:grid-cols-2">
                <label className="space-y-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/45">Titre script</span>
                  <Input
                    value={content.hero.scriptTitle}
                    onChange={(e) => setContent((c) => ({ ...c, hero: { ...c.hero, scriptTitle: e.target.value } }))}
                    className="h-11 rounded-xl border-white/10 bg-black/20 text-white"
                  />
                </label>
                <label className="space-y-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/45">Badge</span>
                  <Input
                    value={content.hero.eyebrowLabel}
                    onChange={(e) => setContent((c) => ({ ...c, hero: { ...c.hero, eyebrowLabel: e.target.value } }))}
                    className="h-11 rounded-xl border-white/10 bg-black/20 text-white"
                  />
                </label>
              </div>
              <label className="space-y-1.5">
                <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/45">Sous-titre</span>
                <Textarea
                  value={content.hero.subtitle}
                  onChange={(e) => setContent((c) => ({ ...c, hero: { ...c.hero, subtitle: e.target.value } }))}
                  rows={3}
                  className="rounded-xl border-white/10 bg-black/20 text-white"
                />
              </label>
            </section>

            <section className="space-y-4 border-t border-white/10 pt-8">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/45">Coordonnées</p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  className="h-10 rounded-xl border-white/10 bg-black/20 text-white hover:bg-black/30"
                  onClick={addItem}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Ajouter un élément
                </Button>
              </div>

              <label className="space-y-1.5">
                <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/45">Titre section</span>
                <Input
                  value={content.contactInfoHeading}
                  onChange={(e) => setContent((c) => ({ ...c, contactInfoHeading: e.target.value }))}
                  className="h-11 rounded-xl border-white/10 bg-black/20 text-white"
                />
              </label>

              <div className="space-y-4">
                {content.items.map((item, idx) => (
                  <div key={idx} className="rounded-xl border border-white/10 bg-black/20 p-4">
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/50">
                        Élément {idx + 1}
                      </p>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 rounded-full text-white/60 hover:bg-white/10 hover:text-white"
                        onClick={() => removeItem(idx)}
                        aria-label="Supprimer"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="grid gap-3 md:grid-cols-[180px_1fr]">
                      <label className="space-y-1.5">
                        <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/45">Icône</span>
                        <select
                          value={item.icon}
                          onChange={(e) => updateItem(idx, { icon: e.target.value as ContactInfoIcon })}
                          className="h-11 w-full rounded-xl border border-white/10 bg-black/30 px-3 text-sm text-white outline-none"
                        >
                          {ICON_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      </label>
                      <label className="space-y-1.5">
                        <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/45">Titre</span>
                        <Input
                          value={item.title}
                          onChange={(e) => updateItem(idx, { title: e.target.value })}
                          className="h-11 rounded-xl border-white/10 bg-black/30 text-white"
                        />
                      </label>
                      <label className="space-y-1.5 md:col-span-2">
                        <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/45">Contenu</span>
                        <Input
                          value={item.content}
                          onChange={(e) => updateItem(idx, { content: e.target.value })}
                          className="h-11 rounded-xl border-white/10 bg-black/30 text-white"
                        />
                      </label>
                      <label className="space-y-1.5 md:col-span-2">
                        <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/45">Détail</span>
                        <Input
                          value={item.detail}
                          onChange={(e) => updateItem(idx, { detail: e.target.value })}
                          className="h-11 rounded-xl border-white/10 bg-black/30 text-white"
                        />
                      </label>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="space-y-4 border-t border-white/10 pt-8">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/45">Bloc WhatsApp</p>

              <div className="grid gap-4 md:grid-cols-2">
                <label className="space-y-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/45">Activé</span>
                  <select
                    value={content.whatsapp.enabled ? "1" : "0"}
                    onChange={(e) =>
                      setContent((c) => ({ ...c, whatsapp: { ...c.whatsapp, enabled: e.target.value === "1" } }))
                    }
                    className="h-11 w-full rounded-xl border border-white/10 bg-black/20 px-3 text-sm text-white outline-none"
                  >
                    <option value="1">Oui</option>
                    <option value="0">Non</option>
                  </select>
                </label>
                <label className="space-y-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/45">
                    Téléphone (E.164)
                  </span>
                  <Input
                    value={content.whatsapp.phoneE164}
                    onChange={(e) => setContent((c) => ({ ...c, whatsapp: { ...c.whatsapp, phoneE164: e.target.value } }))}
                    className="h-11 rounded-xl border-white/10 bg-black/20 text-white"
                    placeholder="+221779239305"
                  />
                </label>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <label className="space-y-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/45">Titre</span>
                  <Input
                    value={content.whatsapp.heading}
                    onChange={(e) => setContent((c) => ({ ...c, whatsapp: { ...c.whatsapp, heading: e.target.value } }))}
                    className="h-11 rounded-xl border-white/10 bg-black/20 text-white"
                  />
                </label>
                <label className="space-y-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/45">Label bouton</span>
                  <Input
                    value={content.whatsapp.buttonLabel}
                    onChange={(e) => setContent((c) => ({ ...c, whatsapp: { ...c.whatsapp, buttonLabel: e.target.value } }))}
                    className="h-11 rounded-xl border-white/10 bg-black/20 text-white"
                  />
                </label>
              </div>

              <label className="space-y-1.5">
                <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/45">Texte</span>
                <Textarea
                  value={content.whatsapp.body}
                  onChange={(e) => setContent((c) => ({ ...c, whatsapp: { ...c.whatsapp, body: e.target.value } }))}
                  rows={3}
                  className="rounded-xl border-white/10 bg-black/20 text-white"
                />
              </label>
            </section>
          </div>
        )}
      </div>
    </div>
  )
}

