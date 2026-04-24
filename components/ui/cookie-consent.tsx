"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Cookie, X } from "lucide-react"
import { Button } from "@/components/ui/button"

export function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const isConsentGiven = localStorage.getItem("cookie-consent")
    if (!isConsentGiven) {
      const timer = setTimeout(() => setIsVisible(true), 1500)
      return () => clearTimeout(timer)
    }
  }, [])

  if (!isVisible) return null

  const handleAccept = () => {
    localStorage.setItem("cookie-consent", "accepted")
    window.dispatchEvent(new StorageEvent("storage", { key: "cookie-consent", newValue: "accepted" }))
    setIsVisible(false)
  }

  const handleReject = () => {
    localStorage.setItem("cookie-consent", "rejected")
    window.dispatchEvent(new StorageEvent("storage", { key: "cookie-consent", newValue: "rejected" }))
    setIsVisible(false)
  }

  return (
    <div
      className="animate-in slide-in-from-bottom-5 fixed z-[130] flex max-h-[85dvh] w-[min(100%,calc(100vw-1.5rem))] flex-col gap-3 overflow-y-auto overscroll-contain rounded-2xl border border-border bg-card p-4 shadow-2xl sm:max-h-none sm:overflow-visible sm:p-6 md:left-auto md:right-4 md:bottom-4 md:w-[400px] left-[max(0.75rem,env(safe-area-inset-left))] right-[max(0.75rem,env(safe-area-inset-right))] bottom-[max(0.75rem,env(safe-area-inset-bottom))]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="cookie-consent-title"
    >
      <div className="flex shrink-0 items-start justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2 sm:gap-3">
          <div className="shrink-0 rounded-full bg-accent/10 p-2">
            <Cookie className="h-5 w-5 text-accent" />
          </div>
          <h3 id="cookie-consent-title" className="font-bold leading-tight">
            Cookies
          </h3>
        </div>
        <button
          type="button"
          onClick={() => setIsVisible(false)}
          className="shrink-0 text-muted-foreground transition-colors hover:text-foreground"
          aria-label="Fermer"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
      <p className="shrink-0 text-sm leading-relaxed text-muted-foreground">
        Nous utilisons des cookies pour améliorer votre expérience. Vous pouvez accepter ou refuser.
      </p>
      <div className="mt-1 flex min-h-0 shrink-0 flex-col gap-2 sm:gap-3">
        <div className="flex flex-col gap-2 sm:flex-row sm:gap-3">
          <Button
            type="button"
            onClick={handleReject}
            variant="outline"
            className="h-11 w-full shrink-0 font-bold sm:h-10 sm:flex-1"
          >
            Refuser
          </Button>
          <Button type="button" onClick={handleAccept} className="h-11 w-full shrink-0 font-bold sm:h-10 sm:flex-1">
            Accepter
          </Button>
        </div>
        <Link
          href="/cookies"
          className="text-center text-xs font-semibold text-accent underline-offset-4 hover:underline sm:text-left"
        >
          En savoir plus (politique cookies)
        </Link>
      </div>
    </div>
  )
}
