"use client"

import { useCallback, startTransition } from "react"
import dynamic from "next/dynamic"
import { useStore } from "@/lib/store"

const QuickView = dynamic(
  () => import("./quick-view").then((m) => m.QuickView),
  { ssr: false },
)

export function QuickViewManager() {
  const quickViewProduct = useStore((s) => s.quickViewProduct)
  const isQuickViewOpen = useStore((s) => s.isQuickViewOpen)
  const setQuickViewOpen = useStore((s) => s.setQuickViewOpen)
  const onClose = useCallback(() => {
    startTransition(() => setQuickViewOpen(false))
  }, [setQuickViewOpen])

  return (
    <QuickView
      product={quickViewProduct}
      isOpen={isQuickViewOpen}
      onClose={onClose}
    />
  )
}
