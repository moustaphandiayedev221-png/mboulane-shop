"use client"

import { useState, useEffect, useRef } from "react"
import * as Dialog from "@radix-ui/react-dialog"
import { Search, X } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { formatPrice } from "@/lib/store"
import type { Product } from "@/lib/store"
import { cn } from "@/lib/utils"

interface SearchModalProps {
  isOpen: boolean
  onClose: () => void
}

export function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const [query, setQuery] = useState("")
  const [products, setProducts] = useState<Product[]>([])
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100)
    } else {
      setQuery("")
    }
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) return
    let cancelled = false
    fetch("/api/catalog")
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((data: Product[]) => {
        if (!cancelled && Array.isArray(data)) setProducts(data)
      })
      .catch(() => {
        /* garde liste vide ; pas de blocage UI */
      })
    return () => {
      cancelled = true
    }
  }, [isOpen])

  const filteredProducts = query.trim() === "" 
    ? []
    : products.filter(p => 
        p.name.toLowerCase().includes(query.toLowerCase()) || 
        p.category.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 5) // Limit to 5 results

  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => (!open ? onClose() : undefined)}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[110] bg-background/80 backdrop-blur-sm" />
        <Dialog.Content
          className={cn(
            "fixed left-1/2 top-[10vh] z-[111] w-[calc(100%-2rem)] max-w-2xl -translate-x-1/2",
            "bg-card rounded-2xl shadow-2xl border border-border overflow-hidden",
            "transition-all duration-300 animate-in fade-in zoom-in-95",
            "focus:outline-none",
          )}
        >
          <Dialog.Title className="sr-only">Recherche</Dialog.Title>
          <Dialog.Description className="sr-only">Recherchez un produit dans le catalogue</Dialog.Description>

          {/* Search Input Area */}
          <div className="flex items-center px-4 py-4 border-b border-border">
            <Search className="h-5 w-5 text-muted-foreground ml-2" aria-hidden />
            <input
              ref={inputRef}
              type="text"
              placeholder="Rechercher des sandales, catégories..."
              className="flex-1 bg-transparent border-none focus:outline-none text-lg px-4 text-foreground placeholder:text-muted-foreground"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <Dialog.Close asChild>
              <button
                onClick={onClose}
                className="p-2 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Fermer la recherche"
              >
                <X className="h-5 w-5" aria-hidden />
              </button>
            </Dialog.Close>
          </div>

          {/* Results Area */}
          <div className="max-h-[60vh] overflow-y-auto">
            {query.trim() !== "" && filteredProducts.length === 0 && (
              <div className="p-8 text-center text-muted-foreground">
                Aucun résultat pour &quot;{query}&quot;
              </div>
            )}

            {filteredProducts.length > 0 && (
              <div className="p-2">
                <div className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Produits
                </div>
                <div className="space-y-1">
                  {filteredProducts.map((product) => (
                    <Dialog.Close key={product.id} asChild>
                      <Link
                        href={`/produit/${product.id}`}
                        onClick={onClose}
                        className="flex items-center gap-4 p-3 rounded-xl hover:bg-muted/50 transition-colors group"
                      >
                        <div className="relative h-16 w-16 rounded-lg bg-muted overflow-hidden flex-shrink-0 border border-border/50">
                          <Image
                            src={product.image}
                            alt={product.name}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                            sizes="64px"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-card-foreground truncate">{product.name}</h4>
                          <p className="text-sm text-muted-foreground truncate">{product.category}</p>
                        </div>
                        <div className="text-right pl-4">
                          <p className="font-bold text-accent">{formatPrice(product.price)}</p>
                        </div>
                      </Link>
                    </Dialog.Close>
                  ))}
                </div>
              </div>
            )}

            {/* Default Suggestions (when empty) */}
            {query.trim() === "" && (
              <div className="p-6">
                <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                  Recherches Populaires
                </div>
                <div className="flex flex-wrap gap-2">
                  {["Sandale Dakar", "Premium", "Cuir Artisanal", "Nouveauté"].map((tag) => (
                    <button
                      key={tag}
                      onClick={() => setQuery(tag)}
                      className="px-3 py-1.5 bg-muted/50 hover:bg-muted text-sm font-medium rounded-full transition-colors border border-border/50"
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-3 bg-muted/30 border-t border-border flex justify-between items-center text-xs text-muted-foreground">
            <span>
              Appuyez sur{" "}
              <kbd className="px-1.5 py-0.5 rounded-md bg-background border border-border shadow-sm font-mono text-[10px]">
                ESC
              </kbd>{" "}
              pour fermer
            </span>
            <span>{filteredProducts.length} résultat{filteredProducts.length > 1 ? 's' : ''}</span>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
