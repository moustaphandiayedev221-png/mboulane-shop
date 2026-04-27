import type { Product } from "@/lib/data/products"

let cache: Product[] | null = null
let inflight: Promise<Product[]> | null = null

export function getSearchCatalogFromCache(): Product[] | null {
  return cache
}

export function prefetchSearchCatalog(): Promise<Product[]> {
  if (cache) return Promise.resolve(cache)
  if (inflight) return inflight
  inflight = fetch("/api/catalog")
    .then((r) => (r.ok ? r.json() : Promise.reject(new Error("catalog"))))
    .then((data: Product[]) => {
      cache = Array.isArray(data) ? data : []
      inflight = null
      return cache
    })
    .catch(() => {
      inflight = null
      return []
    })
  return inflight
}

export function scheduleSearchCatalogPrefetch(): void {
  if (cache || typeof window === "undefined") return
  const run = () => {
    void prefetchSearchCatalog()
  }
  const idle = (window as unknown as { requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number })
    .requestIdleCallback
  if (typeof idle === "function") {
    idle(run, { timeout: 4_000 })
  } else {
    window.setTimeout(run, 2_000)
  }
}
