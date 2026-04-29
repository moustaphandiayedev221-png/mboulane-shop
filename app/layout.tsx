import type { Metadata, Viewport } from 'next'
import { Poppins, Playfair_Display, Great_Vibes } from 'next/font/google'
import { getSiteBaseUrl } from '@/lib/site/base-url'
import './globals.css'
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/sonner"
import { QuickViewManager } from "@/components/products/quick-view-manager"
import { DeferredWhatsAppFloat } from "@/components/deferred-whatsapp-float.client"
import { SupabaseStoreSync } from "@/components/supabase-store-sync"
import { VisitTracker } from "@/components/analytics/visit-tracker"
import { AntiCopy } from "@/components/security/anti-copy.client"
import { VercelMetrics } from "@/components/analytics/vercel-metrics.client"

const poppins = Poppins({ 
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-poppins"
})

const playfair = Playfair_Display({ 
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-playfair"
})

const greatVibes = Great_Vibes({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-great-vibes",
})

const siteUrl = getSiteBaseUrl()

export const metadata: Metadata = {
  title: 'MBOULANE SHOP | Votre Boutique en Ligne',
  description: 'Découvrez MBOULANE SHOP, votre boutique en ligne de confiance. Retrouvez une large sélection de produits : mode, accessoires, lifestyle et bien plus. Livraison rapide au Sénégal et à l\'international.',
  metadataBase: new URL(siteUrl),
  keywords: ['boutique en ligne', 'e-commerce', 'Sénégal', 'mode', 'accessoires', 'lifestyle', 'shopping', 'tendances'],
  authors: [{ name: 'MBOULANE SHOP' }],
  creator: 'MBOULANE SHOP',
  openGraph: {
    type: 'website',
    locale: 'fr_SN',
    url: siteUrl,
    siteName: 'MBOULANE SHOP',
    title: 'MBOULANE SHOP | Votre Boutique en Ligne',
    description: 'Une large sélection de produits de qualité : mode, accessoires, lifestyle et bien plus. Livraison au Sénégal et à l\'international.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MBOULANE SHOP | Votre Boutique en Ligne',
    description: 'Une large sélection de produits de qualité : mode, accessoires, lifestyle et bien plus. Livraison au Sénégal et à l\'international.',
  },
  icons: {
    icon: [{ url: "/brand-ms-logo.png", type: "image/png", sizes: "32x32" }],
    shortcut: "/brand-ms-logo.png",
    apple: "/brand-ms-logo.png",
  },
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#F7F3EC' },
    { media: '(prefers-color-scheme: dark)', color: '#000000' },
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className={`${poppins.variable} ${playfair.variable} ${greatVibes.variable} font-sans antialiased bg-background bg-mesh`} suppressHydrationWarning>
        <ThemeProvider attribute="class" defaultTheme="light" forcedTheme="light" enableSystem={false} disableTransitionOnChange>
          {children}
          <AntiCopy />
          <VisitTracker />
          <SupabaseStoreSync />
          <QuickViewManager />
          <Toaster />
          <DeferredWhatsAppFloat />
          <VercelMetrics />
        </ThemeProvider>
      </body>
    </html>
  )
}
