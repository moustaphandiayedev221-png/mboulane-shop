"use client"

export default function GlobalError({
  error: _error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html lang="fr">
      <body>
        <div className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground gap-6 px-4">
          <h1 className="text-4xl font-serif font-bold text-destructive">Erreur Critique</h1>
          <p className="text-muted-foreground text-center">Une erreur système inattendue s&apos;est produite.</p>
          <button
            onClick={() => reset()}
            className="px-6 py-3 bg-black text-white rounded-full font-medium"
          >
            Recharger la page
          </button>
        </div>
      </body>
    </html>
  )
}
