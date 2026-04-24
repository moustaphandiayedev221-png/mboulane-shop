/**
 * Maquette : bandeau blanc, [trait fade] ◇ [script bronze] ◇ [trait fade]
 */
const BRONZE = "#b38b6d"

export function LuxuryScriptHeading({ title }: { title: string }) {
  return (
    <header className="mb-12 w-full overflow-hidden md:mb-16">
      <div className="-mx-4 bg-white py-4 shadow-[0_1px_0_rgba(0,0,0,0.06)] sm:-mx-6 sm:py-6 lg:-mx-8">
        <div className="mx-auto flex max-w-4xl items-center justify-center gap-2 px-3 sm:gap-5 sm:px-6 md:gap-6 md:px-8">
          <div className="flex min-w-0 flex-1 items-center justify-end">
            <span
              className="h-px w-full bg-gradient-to-r from-transparent via-[#b38b6d] to-[#b38b6d]"
              aria-hidden
            />
          </div>
          <span
            className="h-2 w-2 shrink-0 rotate-45 border-2 bg-white sm:h-2.5 sm:w-2.5"
            style={{ borderColor: BRONZE }}
            aria-hidden
          />
          <h2
            className="font-script min-w-0 max-w-[calc(100vw-5rem)] shrink px-0.5 text-center text-[clamp(1.15rem,4.5vw+0.35rem,2.85rem)] font-normal leading-[1.12] text-balance sm:max-w-none sm:px-1 sm:leading-none md:text-[2.85rem]"
            style={{ color: BRONZE }}
          >
            {title}
          </h2>
          <span
            className="h-2 w-2 shrink-0 rotate-45 border-2 bg-white sm:h-2.5 sm:w-2.5"
            style={{ borderColor: BRONZE }}
            aria-hidden
          />
          <div className="flex min-w-0 flex-1 items-center justify-start">
            <span
              className="h-px w-full bg-gradient-to-r from-[#b38b6d] via-[#b38b6d] to-transparent"
              aria-hidden
            />
          </div>
        </div>
      </div>
    </header>
  )
}
