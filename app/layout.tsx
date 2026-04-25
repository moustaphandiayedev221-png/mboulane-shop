import type { Metadata, Viewport } from 'next'
import { Poppins, Playfair_Display, Great_Vibes } from 'next/font/google'
import { getSiteBaseUrl } from '@/lib/site/base-url'
import './globals.css'
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/sonner"
import { WhatsAppFloat } from "@/components/ui/whatsapp-float"
import { QuickViewManager } from "@/components/products/quick-view-manager"
import { SupabaseStoreSync } from "@/components/supabase-store-sync"
import { VisitTracker } from "@/components/analytics/visit-tracker"

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
  title: 'MBOULANE SHOP | Sandales Africaines Premium en Cuir',
  description: 'Découvrez MBOULANE SHOP - Sandales modernes en cuir inspirées du style africain. Élégance, confort et authenticité. Livraison au Sénégal et en Afrique.',
  metadataBase: new URL(siteUrl),
  keywords: ['sandales', 'cuir', 'africain', 'Sénégal', 'luxe', 'artisanat', 'mode', 'chaussures'],
  authors: [{ name: 'MBOULANE SHOP' }],
  creator: 'MBOULANE SHOP',
  openGraph: {
    type: 'website',
    locale: 'fr_SN',
    url: siteUrl,
    siteName: 'MBOULANE SHOP',
    title: 'MBOULANE SHOP | L\'élégance africaine à vos pieds',
    description: 'Sandales africaines premium en cuir. Artisanat de qualité, design moderne.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MBOULANE SHOP | Sandales Africaines Premium',
    description: 'L\'élégance africaine à vos pieds',
  },
  icons: {
    icon: [{ url: "/brand-ms-logo.png", type: "image/png", sizes: "32x32" }],
    shortcut: "/brand-ms-logo.png",
    apple: "/brand-ms-logo.png",
  },
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#F9F2E0' },
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
          <VisitTracker />
          <SupabaseStoreSync />
          <QuickViewManager />
          <Toaster />
          <WhatsAppFloat />
        </ThemeProvider>
      </body>
    </html>
  )
}
