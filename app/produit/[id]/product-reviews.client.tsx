"use client"

import { useEffect, useMemo, useState } from "react"
import { Star, Send, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

type Review = {
  id: number
  created_at: string
  product_id: string
  name: string
  rating: number
  title: string | null
  comment: string
}

export function ProductReviews({
  productId,
  initialRating,
  initialCount,
}: {
  productId: string
  initialRating: number
  initialCount: number
}) {
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)

  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [rating, setRating] = useState<number>(5)
  const [title, setTitle] = useState("")
  const [comment, setComment] = useState("")

  // honeypot
  const [website, setWebsite] = useState("")

  const avgLabel = useMemo(() => {
    if (!Number.isFinite(initialRating) || initialCount <= 0) return "—"
    return `${Number(initialRating).toFixed(1)}/5`
  }, [initialRating, initialCount])

  const load = async () => {
    setLoading(true)
    try {
      const r = await fetch(`/api/reviews?product_id=${encodeURIComponent(productId)}`, { cache: "no-store" })
      const d = (await r.json()) as { reviews?: Review[] }
      setReviews(Array.isArray(d.reviews) ? d.reviews : [])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId])

  const submit = async () => {
    setSending(true)
    setSent(false)
    try {
      const payload = {
        productId,
        name,
        email: email.trim() ? email.trim() : null,
        rating,
        title: title.trim() ? title.trim() : null,
        comment,
        website,
      }
      const r = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      const d = (await r.json()) as { ok?: boolean; error?: string; message?: string }
      if (!r.ok) throw new Error(d.error || "Impossible d'envoyer l'avis")
      setSent(true)
      toast.success(d.message || "Avis envoyé")
      setName("")
      setEmail("")
      setRating(5)
      setTitle("")
      setComment("")
      setWebsite("")
      await load()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erreur")
    } finally {
      setSending(false)
    }
  }

  return (
    <section className="border-t border-[#e5dfd4]/90 py-16 md:py-20">
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-10 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#8a7d70]">Avis</p>
            <h2 className="mt-3 font-serif text-2xl font-semibold tracking-tight text-[#3d3429] md:text-3xl">
              Avis sur ce produit
            </h2>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={cn(
                      "h-4 w-4",
                      i < Math.floor(initialRating) ? "fill-[#D4AF37] text-[#D4AF37]" : "text-[#e0d9ce]",
                    )}
                    aria-hidden
                  />
                ))}
              </div>
              <span className="text-sm font-semibold text-[#4a4036]">{avgLabel}</span>
              <span className="text-sm text-[#6b5d4f]">
                · {initialCount} avis
              </span>
            </div>

            <div className="mt-8 space-y-5">
              {loading ? (
                <p className="text-sm text-[#6b5d4f]">Chargement…</p>
              ) : reviews.length === 0 ? (
                <p className="text-sm text-[#6b5d4f]">Aucun avis publié pour le moment.</p>
              ) : (
                reviews.map((r) => (
                  <article key={r.id} className="rounded-[5px] border border-[#d8ccb8] bg-[#FDFBF7]/95 p-5 shadow-sm">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-[#3d3429]">{r.name}</p>
                        <p className="mt-1 text-xs text-[#8a7d70]">
                          {new Date(r.created_at).toLocaleDateString("fr-FR", { year: "numeric", month: "short", day: "numeric" })}
                        </p>
                      </div>
                      <div className="flex shrink-0 items-center gap-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={cn("h-4 w-4", i < r.rating ? "fill-[#D4AF37] text-[#D4AF37]" : "text-[#e0d9ce]")}
                            aria-hidden
                          />
                        ))}
                      </div>
                    </div>
                    {r.title ? <p className="mt-3 text-sm font-semibold text-[#4a4036]">{r.title}</p> : null}
                    <p className="mt-2 text-sm leading-relaxed text-[#6b5d4f]">{r.comment}</p>
                  </article>
                ))
              )}
            </div>
          </div>

          <div className="w-full max-w-xl shrink-0 rounded-[5px] border border-[#d8ccb8] bg-[#FDFBF7]/95 p-6 shadow-[0_10px_36px_rgba(0,0,0,0.05)] backdrop-blur-sm">
            <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#8a7d70]">Laisser un avis</p>
            <p className="mt-2 text-sm text-[#6b5d4f]">
              Ton avis sera publié après validation par l’équipe.
            </p>

            <div className="mt-6 grid gap-4">
              <label className="space-y-1.5">
                <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#8a7d70]">Nom</span>
                <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex: Awa" className="h-11 rounded-xl" />
              </label>

              <label className="space-y-1.5">
                <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#8a7d70]">Email (optionnel)</span>
                <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Ex: awa@email.com" className="h-11 rounded-xl" />
              </label>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="space-y-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#8a7d70]">Note</span>
                  <select
                    value={String(rating)}
                    onChange={(e) => setRating(Number(e.target.value))}
                    className="h-11 w-full rounded-xl border border-input bg-background px-3 text-sm outline-none"
                  >
                    {[5, 4, 3, 2, 1].map((n) => (
                      <option key={n} value={String(n)}>
                        {n}/5
                      </option>
                    ))}
                  </select>
                </label>

                <label className="space-y-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#8a7d70]">Titre (optionnel)</span>
                  <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ex: Très beau" className="h-11 rounded-xl" />
                </label>
              </div>

              <label className="space-y-1.5">
                <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#8a7d70]">Commentaire</span>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Décris ton expérience…"
                  className="min-h-28 w-full rounded-xl border border-input bg-background px-3 py-3 text-sm outline-none"
                />
              </label>

              {/* honeypot invisible */}
              <input
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                className="hidden"
                tabIndex={-1}
                autoComplete="off"
                aria-hidden="true"
              />

              <Button
                type="button"
                className="h-12 gap-2 rounded-full"
                onClick={submit}
                disabled={sending}
              >
                {sent ? <CheckCircle2 className="h-4 w-4" /> : <Send className="h-4 w-4" />}
                Envoyer mon avis
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

