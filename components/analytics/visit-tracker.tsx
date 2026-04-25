"use client"

import { useEffect } from "react"

function safePathname(): string {
  try {
    return window.location.pathname || "/"
  } catch {
    return "/"
  }
}

export function VisitTracker() {
  useEffect(() => {
    // 1 event / session / path
    const path = safePathname()
    const key = `mb:visit:${path}`
    if (sessionStorage.getItem(key)) return
    sessionStorage.setItem(key, "1")

    const payload = JSON.stringify({ path })

    // Prefer sendBeacon when possible (non-bloquant).
    const ok = navigator.sendBeacon?.("/api/analytics/visit", new Blob([payload], { type: "application/json" }))
    if (ok) return

    void fetch("/api/analytics/visit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: payload,
      keepalive: true,
    }).catch(() => {})
  }, [])

  return null
}

