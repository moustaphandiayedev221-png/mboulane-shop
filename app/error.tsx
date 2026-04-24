"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
    if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
      void import("@sentry/nextjs").then((Sentry) => {
        Sentry.captureException(error)
      })
    }
  }, [error])

  return (
    <div className="min-h-[50vh] flex flex-col items-center justify-center gap-6 px-4">
      <div className="text-center space-y-4">
        <h2 className="text-2xl font-bold font-serif text-destructive">Une erreur est survenue</h2>
        <p className="text-muted-foreground max-w-md mx-auto">
          Nous sommes désolés, un problème inattendu s&apos;est produit. Vous pouvez réessayer ; si le souci
          persiste, contactez-nous via la page contact.
        </p>
      </div>
      <Button 
        onClick={() => reset()}
        size="lg"
        className="rounded-full shadow-lg"
      >
        Réessayer
      </Button>
    </div>
  )
}
