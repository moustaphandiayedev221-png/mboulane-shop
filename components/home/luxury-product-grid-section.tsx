import type { ReactNode } from "react"
import { LuxuryScriptHeading } from "@/components/home/luxury-script-heading"

const luxurySurfaceStyle = {
  backgroundColor: "#F7F3EC",
  backgroundImage:
    "radial-gradient(circle at 1px 1px, rgba(192, 160, 128, 0.09) 1px, transparent 0)",
  backgroundSize: "28px 28px",
} as const

export function LuxuryProductGridSection({
  title,
  children,
  footer,
}: {
  title: string
  children: ReactNode
  footer?: ReactNode
}) {
  return (
    <section className="py-14 md:py-24" style={luxurySurfaceStyle}>
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
        <LuxuryScriptHeading title={title} />
        {children}
        {footer ? (
          <div className="mt-10 flex justify-center md:mt-12">{footer}</div>
        ) : null}
      </div>
    </section>
  )
}
