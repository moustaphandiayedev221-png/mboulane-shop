"use client"

import dynamic from "next/dynamic"

const WhatsAppFloat = dynamic(
  () => import("@/components/ui/whatsapp-float").then((m) => m.WhatsAppFloat),
  { ssr: false },
)

export function DeferredWhatsAppFloat() {
  return <WhatsAppFloat />
}
