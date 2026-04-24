"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { cn } from "@/lib/utils"
import { WHATSAPP_WA_ME } from "@/lib/whatsapp"

const HINT_HIDE_MS = 3200

export function WhatsAppFloat() {
  const [hintOpen, setHintOpen] = useState(false)
  const [tapPulse, setTapPulse] = useState(false)
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const clearHideTimer = useCallback(() => {
    if (hideTimer.current != null) {
      clearTimeout(hideTimer.current)
      hideTimer.current = null
    }
  }, [])

  useEffect(() => () => clearHideTimer(), [clearHideTimer])

  const openHint = useCallback(() => {
    clearHideTimer()
    setHintOpen(true)
  }, [clearHideTimer])

  const scheduleHideHint = useCallback(() => {
    clearHideTimer()
    hideTimer.current = setTimeout(() => setHintOpen(false), HINT_HIDE_MS)
  }, [clearHideTimer])

  const onTouchStart = () => {
    openHint()
    setTapPulse(true)
    window.setTimeout(() => setTapPulse(false), 550)
  }

  const onTouchEnd = () => {
    scheduleHideHint()
  }

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-40 flex justify-end pb-[max(1rem,env(safe-area-inset-bottom))] pr-0 pt-0 md:pr-6 lg:pr-8">
      <div
        className="pointer-events-auto flex max-w-[calc(100vw-0.5rem)] shrink-0 items-center gap-2 pl-3 sm:max-w-none sm:gap-3 sm:pl-4"
        onMouseEnter={openHint}
        onMouseLeave={() => {
          clearHideTimer()
          setHintOpen(false)
        }}
      >
        <span
          className={cn(
            "pointer-events-none origin-right rounded-full border border-neutral-200/90 bg-white/95 px-3 py-2 text-left text-[11px] font-medium leading-tight text-neutral-800 shadow-md backdrop-blur-sm transition-all duration-300 ease-out sm:text-xs",
            "max-w-[min(17rem,calc(100vw-4rem))] sm:max-w-none",
            "scale-95 opacity-0",
            hintOpen && "scale-100 opacity-100",
          )}
          aria-hidden
        >
          Contactez un conseiller
        </span>

        <a
          href={`https://wa.me/${WHATSAPP_WA_ME}`}
          target="_blank"
          rel="noopener noreferrer"
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
          onFocus={openHint}
          onBlur={scheduleHideHint}
          className={cn(
            "group/wa relative flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg ring-1 ring-white/30 transition-all duration-300 ease-out",
            "hover:scale-105 hover:bg-[#20BD5A] hover:shadow-xl",
            "active:scale-95",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#25D366] focus-visible:ring-offset-2",
            tapPulse && "animate-whatsapp-nudge",
          )}
          aria-label="Discuter sur WhatsApp — Contactez un conseiller"
          title="WhatsApp +221 77 23 93 05"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="relative z-[1] h-[1.35rem] w-[1.35rem] motion-safe:transition-[transform] motion-safe:duration-300 motion-reduce:group-hover/wa:animate-none group-hover/wa:motion-safe:animate-[whatsapp-icon-wiggle_0.85s_ease-in-out_infinite]"
            aria-hidden
          >
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.881 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
          </svg>
        </a>
      </div>
    </div>
  )
}
