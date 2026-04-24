import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Boutique | MBOULANE SHOP - Sandales Africaines Premium',
  description: 'Parcourez notre collection de sandales artisanales premium en cuir, conçues à Dakar. Filtrez par catégorie, taille et prix.',
  openGraph: {
    title: 'La Boutique MBOULANE',
    description: 'Collection complète de sandales africaines en cuir premium',
  },
}

export default function BoutiqueLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
