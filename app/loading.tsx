import { Footprints } from "lucide-react"

export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-accent border-t-transparent" />
        <p className="flex flex-nowrap items-baseline justify-center gap-0 whitespace-nowrap font-serif text-xl font-bold leading-none tracking-tight animate-pulse">
          MBOULANE<Footprints className="inline-block h-5 w-5 shrink-0 translate-y-[0.1em] text-[#c9a14f]" strokeWidth={1.55} aria-hidden />SHOP
        </p>
      </div>
    </div>
  )
}
