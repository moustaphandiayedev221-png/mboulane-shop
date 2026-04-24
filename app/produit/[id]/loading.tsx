import { Skeleton } from "@/components/ui/skeleton"

const SURFACE = {
  backgroundColor: "#F7F3EC",
  backgroundImage:
    "radial-gradient(circle at 1px 1px, rgba(192, 160, 128, 0.09) 1px, transparent 0)",
  backgroundSize: "28px 28px",
} as const

export default function ProduitLoading() {
  return (
    <main className="min-h-screen overflow-x-hidden pt-16" style={SURFACE}>
      <div className="border-b border-[#e5dfd4]/90 px-4 pt-20 pb-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-[1400px] space-y-6">
          <Skeleton className="mx-auto h-4 max-w-xs rounded-full bg-[#ebe6dc]" />
          <Skeleton className="mx-auto h-10 max-w-md rounded-[5px] bg-[#ebe6dc]" />
          <Skeleton className="mx-auto h-4 max-w-lg rounded-full bg-[#ebe6dc]/80" />
        </div>
      </div>

      <div className="mx-auto max-w-[1400px] px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-2 lg:gap-14">
          <Skeleton className="aspect-square w-full rounded-[5px] border border-[#e8e2d8] bg-[#ebe6dc]/90 shadow-[0_14px_44px_rgba(0,0,0,0.06)]" />
          <div className="space-y-8 pt-2">
            <div className="flex justify-between gap-4">
              <Skeleton className="h-10 w-28 rounded-[5px] bg-[#ebe6dc]" />
              <Skeleton className="h-8 w-24 rounded-full bg-[#ebe6dc]" />
            </div>
            <Skeleton className="h-12 w-4/5 rounded-[5px] bg-[#ebe6dc]" />
            <Skeleton className="h-px max-w-[12rem] rounded-full bg-[#d8ccb8]" />
            <Skeleton className="h-10 w-48 rounded-[5px] bg-[#ebe6dc]" />
            <div className="space-y-3">
              <Skeleton className="h-4 w-full rounded-full bg-[#ebe6dc]/70" />
              <Skeleton className="h-4 w-full rounded-full bg-[#ebe6dc]/70" />
              <Skeleton className="h-4 w-4/5 rounded-full bg-[#ebe6dc]/70" />
            </div>
            <div className="flex gap-2">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-12 w-14 rounded-[5px] bg-[#ebe6dc]" />
              ))}
            </div>
            <div className="flex flex-wrap gap-3 pt-4">
              <Skeleton className="h-14 min-w-[14rem] flex-1 rounded-full bg-[#cfc4b8]" />
              <Skeleton className="h-14 w-14 shrink-0 rounded-full bg-[#ebe6dc]" />
              <Skeleton className="h-14 w-14 shrink-0 rounded-full bg-[#ebe6dc]" />
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
