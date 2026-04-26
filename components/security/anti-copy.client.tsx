"use client"

import { useEffect } from "react"

function isEditableTarget(t: EventTarget | null): boolean {
  if (!(t instanceof HTMLElement)) return false
  const tag = t.tagName
  if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return true
  if (t.isContentEditable) return true
  return Boolean(t.closest("[contenteditable='true']"))
}

export function AntiCopy() {
  useEffect(() => {
    const captureOpts: AddEventListenerOptions = { capture: true }

    const onContextMenu = (e: MouseEvent) => {
      if (isEditableTarget(e.target)) return
      e.preventDefault()
    }

    const onDragStart = (e: DragEvent) => {
      const t = e.target
      if (t instanceof HTMLImageElement) e.preventDefault()
    }

    const onCopy = (e: ClipboardEvent) => {
      if (isEditableTarget(e.target)) return
      e.preventDefault()
    }

    document.addEventListener("contextmenu", onContextMenu, captureOpts)
    document.addEventListener("dragstart", onDragStart, captureOpts)
    document.addEventListener("copy", onCopy, captureOpts)

    return () => {
      document.removeEventListener("contextmenu", onContextMenu, captureOpts)
      document.removeEventListener("dragstart", onDragStart, captureOpts)
      document.removeEventListener("copy", onCopy, captureOpts)
    }
  }, [])

  return null
}

