"use client"

import type { CSSProperties } from "react"
import { COLOR_MAP } from "@/lib/data/products"
import { getColorSwatchStyle, isHexColor, isWhiteSwatch } from "@/lib/colors"
import { cn } from "@/lib/utils"

type OrderLineAttributesProps = {
  quantity: number
  size: number
  color: string
  className?: string
  /** Admin : affiche « Taille 42 » au lieu de « 42 » seul */
  verboseSize?: boolean
}

/**
 * Ligne « Qté · taille · couleur » avec pastille (fini le #hex incompréhensible pour le client).
 */
export function OrderLineAttributes({
  quantity,
  size,
  color,
  className,
  verboseSize = false,
}: OrderLineAttributesProps) {
  const c = (color || "").trim()
  const hasColor = c.length > 0 && c !== "—"
  const style = hasColor ? getColorSwatchStyle(c, COLOR_MAP) : null
  const isHex = hasColor && isHexColor(c)
  const showName = hasColor && !isHex
  const showSize = size != null && !Number.isNaN(Number(size)) && Number(size) > 0

  const swatchStyle: CSSProperties = style
    ? style.backgroundImage
      ? { ...style, backgroundSize: "cover", backgroundPosition: "center" }
      : style
    : {}

  return (
    <p className={cn("flex flex-wrap items-center gap-x-1.5 text-xs", className)}>
      <span>
        Qté {quantity}
        {showSize ? <span>{verboseSize ? ` · Taille ${size}` : ` · ${size}`}</span> : null}
      </span>
      {hasColor && style ? (
        <span className="inline-flex items-center gap-1.5">
          <span aria-hidden className="text-[0.65em] opacity-60">
            ·
          </span>
          <span
            className={cn(
              "inline-block h-3.5 w-3.5 shrink-0 rounded-full border border-black/15",
              isWhiteSwatch(c, COLOR_MAP) && "ring-1 ring-black/25",
            )}
            style={swatchStyle}
            title={c}
            aria-label={isHex ? "Aperçu de la couleur choisie" : `Couleur : ${c}`}
          />
          {showName ? <span className="text-inherit">{c}</span> : null}
        </span>
      ) : null}
    </p>
  )
}
