"use client"

import { useStore } from "@/lib/store"
import { QuickView } from "./quick-view"

export function QuickViewManager() {
  const { quickViewProduct, isQuickViewOpen, setQuickViewOpen } = useStore()

  return (
    <QuickView 
      product={quickViewProduct} 
      isOpen={isQuickViewOpen} 
      onClose={() => setQuickViewOpen(false)} 
    />
  )
}
