"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Lock, Shield, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createClient } from "@/lib/supabase/client"
import { cn } from "@/lib/utils"

export default function AdminConnexionPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const reason = searchParams.get("reason")
    if (reason === "disabled") {
      setError("Admin désactivé. Définissez ADMIN_EMAILS dans l’environnement.")
      return
    }
    if (reason === "denied") {
      setError("Accès refusé. Cet e-mail n’est pas autorisé pour l’admin.")
      return
    }
    const supabase = createClient()
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) router.replace("/admin/tableau")
    })
  }, [router, searchParams])

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    const trimmed = email.trim().toLowerCase()
    if (!trimmed || !trimmed.includes("@")) {
      setError("Indiquez une adresse e-mail valide.")
      return
    }
    if (password.length < 6) {
      setError("Mot de passe invalide.")
      return
    }

    setLoading(true)
    try {
      const supabase = createClient()
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: trimmed,
        password,
      })
      if (signInError) {
        setError("Accès refusé.")
        setLoading(false)
        return
      }
      router.replace("/admin/tableau")
    } catch {
      setError("Accès refusé.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-[#0f0f12] text-white">
      <div
        className="absolute inset-0 opacity-60"
        style={{
          background:
            "radial-gradient(ellipse 80% 55% at 50% 0%, rgba(179,139,109,0.18) 0%, transparent 60%), radial-gradient(ellipse 90% 70% at 10% 20%, rgba(255,255,255,0.06) 0%, transparent 55%)",
        }}
      />

      <div className="relative mx-auto flex min-h-screen max-w-[1100px] items-center justify-center px-4 py-16">
        <div className="grid w-full gap-8 md:grid-cols-[1.05fr_0.95fr] md:gap-10">
          <section className="hidden md:flex flex-col justify-center">
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-white/50">
              Back‑office sécurisé
            </p>
            <h1 className="mt-4 text-4xl font-semibold tracking-tight">
              Connexion Admin
            </h1>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-white/60">
              Accès réservé aux administrateurs autorisés. Pas d’inscription publique.
            </p>

            <div className="mt-8 grid max-w-md gap-3">
              {[
                { icon: Shield, t: "Accès filtré", d: "Autorisation par email (ADMIN_EMAILS)." },
                { icon: Lock, t: "Session Supabase", d: "Connexion via Supabase Auth." },
              ].map((b) => (
                <div
                  key={b.t}
                  className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur"
                >
                  <div className="mt-0.5 flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-black/20">
                    <b.icon className="h-5 w-5 text-[#b38b6d]" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{b.t}</p>
                    <p className="mt-1 text-xs text-white/55">{b.d}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-[0_22px_70px_rgba(0,0,0,0.45)] backdrop-blur md:p-8">
            <div className="mb-6">
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-white/50">
                Authentification
              </p>
              <h2 className="mt-2 text-2xl font-semibold">Se connecter</h2>
              <p className="mt-2 text-sm text-white/55">
                Cette page est dédiée à l’admin (sans inscription).
              </p>
            </div>

            <form onSubmit={submit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-white/70">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-12 rounded-xl border-white/10 bg-black/20 text-white placeholder:text-white/35"
                  placeholder="admin@exemple.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-white/70">Mot de passe</Label>
                <Input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-12 rounded-xl border-white/10 bg-black/20 text-white placeholder:text-white/35"
                  placeholder="••••••••"
                />
              </div>

              {error ? (
                <p className={cn("text-sm font-semibold text-red-300")}>
                  {error}
                </p>
              ) : null}

              <Button
                type="submit"
                className="h-12 w-full rounded-xl bg-[#b38b6d] text-black hover:bg-[#c29a7d]"
                disabled={loading}
              >
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Accéder au back‑office
              </Button>
            </form>
          </section>
        </div>
      </div>
    </main>
  )
}

