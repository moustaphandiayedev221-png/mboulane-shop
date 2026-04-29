"use client"

import { Analytics } from "@vercel/analytics/react"
import { SpeedInsights } from "@vercel/speed-insights/next"
import { usePathname } from "next/navigation"

export function VercelMetrics() {
  const pathname = usePathname()

  // On désactive l'analytics et le speed insights sur les routes admin
  // pour éviter que les performances de l'admin n'impactent le score global public.
  if (pathname?.startsWith("/admin")) {
    return null
  }

  return (
    <>
      <Analytics />
      <SpeedInsights />
    </>
  )
}
