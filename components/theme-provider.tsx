'use client'

import * as React from 'react'

type Theme = 'light' | 'dark' | 'system'

interface ThemeProviderProps {
  children: React.ReactNode
  attribute?: string
  defaultTheme?: string
  /** Si défini, le thème reste fixe (ignore stockage et préférences système). */
  forcedTheme?: 'light' | 'dark'
  enableSystem?: boolean
  disableTransitionOnChange?: boolean
  storageKey?: string
}

interface ThemeProviderState {
  theme: Theme
  setTheme: (theme: Theme) => void
  resolvedTheme: string
}

const ThemeContext = React.createContext<ThemeProviderState | undefined>(undefined)

function getSystemTheme(): string {
  if (typeof window === 'undefined') return 'light'
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export function ThemeProvider({
  children,
  attribute = 'class',
  defaultTheme = 'light',
  forcedTheme,
  enableSystem = false,
  disableTransitionOnChange = false,
  storageKey = 'theme',
}: ThemeProviderProps) {
  const [theme, setThemeState] = React.useState<Theme>(
    forcedTheme ?? (defaultTheme as Theme)
  )
  const [mounted, setMounted] = React.useState(false)

  const resolvedTheme = forcedTheme
    ? forcedTheme
    : theme === 'system'
      ? getSystemTheme()
      : theme

  const applyTheme = React.useCallback(
    (resolved: string) => {
      if (typeof window === 'undefined') return
      const root = document.documentElement

      if (disableTransitionOnChange) {
        const css = document.createElement('style')
        css.appendChild(
          document.createTextNode(
            '*,*::before,*::after{transition:none!important}'
          )
        )
        document.head.appendChild(css)

        // Apply theme
        if (attribute === 'class') {
          root.classList.remove('light', 'dark')
          root.classList.add(resolved)
        } else {
          root.setAttribute(attribute, resolved)
        }

        // Force reflow then remove transition blocker
        ;(() => window.getComputedStyle(document.body))()
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            if (document.head.contains(css)) {
              document.head.removeChild(css)
            }
          })
        })
      } else {
        if (attribute === 'class') {
          root.classList.remove('light', 'dark')
          root.classList.add(resolved)
        } else {
          root.setAttribute(attribute, resolved)
        }
      }
    },
    [attribute, disableTransitionOnChange]
  )

  // Initialize theme from storage on mount (sauf thème forcé)
  React.useEffect(() => {
    setMounted(true)
    if (forcedTheme) return
    try {
      const stored = localStorage.getItem(storageKey)
      if (stored && ['light', 'dark', 'system'].includes(stored)) {
        setThemeState(stored as Theme)
      }
    } catch {}
  }, [storageKey, forcedTheme])

  // Apply theme on mount and on change
  React.useEffect(() => {
    if (!mounted) return
    applyTheme(resolvedTheme)
  }, [resolvedTheme, applyTheme, mounted])

  // Listen for system preference changes
  React.useEffect(() => {
    if (!enableSystem || !mounted) return

    const media = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = () => {
      if (theme === 'system') {
        applyTheme(getSystemTheme())
      }
    }
    media.addEventListener('change', handler)
    return () => media.removeEventListener('change', handler)
  }, [theme, enableSystem, applyTheme, mounted, forcedTheme])

  const setTheme = React.useCallback(
    (newTheme: Theme) => {
      setThemeState(newTheme)
      try {
        localStorage.setItem(storageKey, newTheme)
      } catch {}
    },
    [storageKey]
  )

  const value = React.useMemo<ThemeProviderState>(
    () => ({ theme, setTheme, resolvedTheme }),
    [theme, setTheme, resolvedTheme]
  )

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  )
}

// Drop-in replacement for next-themes useTheme hook
export function useTheme() {
  const context = React.useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}
