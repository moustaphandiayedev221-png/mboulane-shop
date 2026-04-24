"use client"

import { useState } from "react"
import { Mail, Send, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { LuxuryScriptHeading } from "@/components/home/luxury-script-heading"
import { cn } from "@/lib/utils"

export function NewsletterSection() {
  const [email, setEmail] = useState("")
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return

    setIsLoading(true)
    setError("")
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, source: "home" }),
      })
      if (!res.ok) {
        setError("Impossible d’enregistrer votre inscription. Réessayez.")
        return
      }
      setIsSubmitted(true)
      setEmail("")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <section className="relative overflow-hidden bg-accent py-14 text-accent-foreground md:py-24">
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 25% 25%, white 1px, transparent 1px), radial-gradient(circle at 75% 75%, white 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
        aria-hidden
      />

      <div className="relative mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
        <LuxuryScriptHeading title="Restez Connecté" />

        <div className="mx-auto max-w-2xl text-center">
          <p className="mb-10 text-center text-sm font-light leading-relaxed text-accent-foreground/75 md:text-base">
            Inscrivez-vous à notre newsletter pour recevoir en exclusivité nos nouveautés,
            offres spéciales et conseils de style. Nous offrons
            <span className="font-bold tabular-nums text-white">
              {" "}
              -10% sur votre première commande{" "}
            </span>
            pour tout nouvel inscrit.
          </p>

          {isSubmitted ? (
            <div className="animate-scale-in flex flex-col items-center justify-center gap-4 rounded-xl bg-background/20 p-6 backdrop-blur-sm sm:flex-row sm:gap-5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-500">
                <Check className="h-5 w-5 text-white" aria-hidden />
              </div>
              <span className="text-lg font-semibold text-accent-foreground">
                Merci pour votre inscription !
              </span>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className={cn(
                "mx-auto flex w-full max-w-2xl flex-col gap-3 transition-[box-shadow] duration-300 sm:flex-row sm:items-stretch sm:gap-0 sm:overflow-hidden sm:rounded-full sm:border sm:border-white/25 sm:bg-gradient-to-r sm:from-white/[0.09] sm:to-white/[0.04] sm:p-1 sm:pl-2 sm:shadow-[0_12px_48px_rgba(0,0,0,0.22),inset_0_1px_0_rgba(255,255,255,0.1)] sm:backdrop-blur-xl sm:ring-1 sm:ring-white/10",
                "sm:focus-within:border-white/40 sm:focus-within:shadow-[0_16px_56px_rgba(0,0,0,0.28),inset_0_1px_0_rgba(255,255,255,0.14)] sm:focus-within:ring-white/15",
              )}
            >
              <label className="group/input relative flex flex-1 cursor-text items-center overflow-hidden rounded-2xl border border-white/25 bg-white/[0.07] shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_8px_32px_rgba(0,0,0,0.12)] backdrop-blur-md transition-colors duration-300 sm:rounded-none sm:border-0 sm:bg-transparent sm:shadow-none sm:backdrop-blur-none">
                <Mail
                  className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-white/40 transition-colors group-focus-within/input:text-[#f0d78c] sm:left-5"
                  aria-hidden
                />
                <Input
                  type="email"
                  placeholder="Votre adresse email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className={cn(
                    "h-14 w-full min-h-0 border-0 bg-transparent pl-12 pr-4 text-base text-accent-foreground shadow-none outline-none md:text-base",
                    "placeholder:text-white/45",
                    "focus-visible:border-0 focus-visible:ring-0 focus-visible:ring-offset-0",
                    "sm:h-12 sm:pl-12",
                  )}
                />
              </label>
              <Button
                type="submit"
                disabled={isLoading}
                className="h-14 shrink-0 gap-2 rounded-2xl bg-background px-8 text-base font-semibold text-foreground shadow-lg transition-all duration-300 hover:bg-white hover:shadow-xl disabled:opacity-70 sm:h-[2.75rem] sm:self-center sm:rounded-full sm:px-7 sm:shadow-md"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    Inscription...
                  </span>
                ) : (
                  <>
                    {"S'inscrire"}
                    <Send className="h-4 w-4" aria-hidden />
                  </>
                )}
              </Button>
            </form>
          )}
          {error ? (
            <p className="mx-auto mt-4 max-w-lg text-sm font-medium text-red-200">
              {error}
            </p>
          ) : null}

          <p className="mx-auto mt-8 max-w-lg text-xs leading-relaxed text-accent-foreground/50">
            En vous inscrivant, vous acceptez de recevoir nos emails marketing.
            Désabonnement possible à tout moment.
          </p>
        </div>
      </div>
    </section>
  )
}
