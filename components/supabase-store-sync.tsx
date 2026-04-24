"use client"

import { useEffect, useRef } from "react"
import { useStore } from "@/lib/store"
import { createClient } from "@/lib/supabase/client"

export function SupabaseStoreSync() {
  const initializeFromSupabase = useStore((s) => s.initializeFromSupabase)
  const timerRef = useRef<number | null>(null)

  useEffect(() => {
    const schedule = () => {
      if (timerRef.current != null) window.clearTimeout(timerRef.current)
      timerRef.current = window.setTimeout(() => {
        void initializeFromSupabase()
      }, 50)
    }

    schedule()

    const supabase = createClient()
    const { data: sub } = supabase.auth.onAuthStateChange(() => {
      schedule()
    })

    return () => {
      if (timerRef.current != null) window.clearTimeout(timerRef.current)
      sub.subscription.unsubscribe()
    }
  }, [initializeFromSupabase])

  return null
}

