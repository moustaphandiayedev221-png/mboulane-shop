import { Skeleton } from "@/components/ui/skeleton"

export default function BoutiqueLoading() {
  return (
    <main className="min-h-screen bg-background">
      <div className="pt-24 pb-16 mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row gap-8">
          <div className="w-full lg:w-1/4">
            <Skeleton className="h-96 w-full rounded-2xl" />
          </div>
          <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="space-y-4">
                <Skeleton className="h-64 w-full rounded-2xl" />
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-4 w-1/3" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  )
}
