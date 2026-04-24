"use client"

import { useEffect, useState } from "react"
import { Analytics } from "@vercel/analytics/next"

type Consent = "accepted" | "rejected" | "true" | null

function readConsent(): Consent {
  try {
    return (localStorage.getItem("cookie-consent") as Consent) ?? null
  } catch {
    return null
  }
}

export function AnalyticsGate() {
  const [enabled, setEnabled] = useState(false)

  useEffect(() => {
    const consent = readConsent()
    setEnabled(consent === "accepted" || consent === "true")

    const onStorage = (e: StorageEvent) => {
      if (e.key !== "cookie-consent") return
      const next = (e.newValue as Consent) ?? null
      setEnabled(next === "accepted" || next === "true")
    }
    window.addEventListener("storage", onStorage)
    return () => window.removeEventListener("storage", onStorage)
  }, [])

  if (!enabled) return null
  if (process.env.NODE_ENV !== "production") return null

  return <Analytics />
}

