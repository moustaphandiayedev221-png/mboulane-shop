"use client"

import { useEffect, useState, Suspense } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createClient } from "@/lib/supabase/client"

function ConnexionForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get("redirect") || "/mes-commandes"

  const [mode, setMode] = useState<"connexion" | "inscription">("connexion")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState("")

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) router.replace(redirectTo)
    })
  }, [router, redirectTo])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    const trimmed = email.trim().toLowerCase()
    if (!trimmed || !trimmed.includes("@")) {
      setError("Indiquez une adresse e-mail valide.")
      return
    }
    if (password.length < 6) {
      setError("Le mot de passe doit contenir au moins 6 caractères.")
      return
    }
    if (mode === "inscription" && password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas.")
      return
    }

    const supabase = createClient()
    if (mode === "inscription") {
      const { error: signUpError } = await supabase.auth.signUp({
        email: trimmed,
        password,
      })
      if (signUpError) {
        setError(signUpError.message)
        return
      }
      router.push(redirectTo)
      return
    }

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: trimmed,
      password,
    })
    if (signInError) {
      setError(signInError.message)
      return
    }
    router.push(redirectTo)
  }

  return (
    <main className="min-h-screen bg-[#FDFBF7]">
      <Header />
      <div className="mx-auto max-w-md px-4 py-16 sm:px-6 lg:px-8">
        <h1 className="font-serif text-3xl font-semibold text-[#3d3429]">
          {mode === "connexion" ? "Connexion" : "Inscription"}
        </h1>
        <p className="mt-2 text-sm text-[#6b5d4f]">
          Accédez au suivi de vos commandes via un compte Supabase sécurisé.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6 rounded-[5px] border border-[#ebe5dc] bg-white p-6 shadow-sm">
          <div className="space-y-2">
            <Label htmlFor="email">E-mail</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="rounded-[5px] border-[#e0d9ce] bg-[#FDFBF7]"
              placeholder="vous@exemple.com"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Mot de passe</Label>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="rounded-[5px] border-[#e0d9ce] bg-[#FDFBF7]"
              placeholder="••••••••"
            />
          </div>
          {mode === "inscription" ? (
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
              <Input
                id="confirmPassword"
                type="password"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="rounded-[5px] border-[#e0d9ce] bg-[#FDFBF7]"
                placeholder="••••••••"
              />
            </div>
          ) : null}
          {error ? <p className="text-sm text-red-600">{error}</p> : null}
          <Button type="submit" className="h-12 w-full rounded-full font-semibold">
            {mode === "connexion" ? "Se connecter" : "S’inscrire"}
          </Button>
        </form>

        <p className="mt-4 text-center text-sm text-[#6b5d4f]">
          {mode === "connexion" ? "Pas de compte ?" : "Déjà un compte ?"}{" "}
          <button
            type="button"
            className="font-medium text-[#b38b6d] underline-offset-4 hover:underline"
            onClick={() => {
              setError("")
              setPassword("")
              setConfirmPassword("")
              setMode((m) => (m === "connexion" ? "inscription" : "connexion"))
            }}
          >
            {mode === "connexion" ? "Créer un compte" : "Se connecter"}
          </button>
        </p>

        <p className="mt-4 text-center text-sm text-[#6b5d4f]">
          <Link href="/mes-commandes" className="font-medium text-[#b38b6d] underline-offset-4 hover:underline">
            Voir mes commandes
          </Link>
          {" · "}
          <Link href="/" className="font-medium text-[#b38b6d] underline-offset-4 hover:underline">
            Accueil
          </Link>
        </p>
      </div>
      <Footer />
    </main>
  )
}

export default function ConnexionPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-[#FDFBF7]">
          <Header />
          <div className="mx-auto max-w-md px-4 py-16 text-center text-[#6b5d4f]">Chargement…</div>
          <Footer />
        </main>
      }
    >
      <ConnexionForm />
    </Suspense>
  )
}
