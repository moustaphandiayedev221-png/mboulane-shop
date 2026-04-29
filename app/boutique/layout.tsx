import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Boutique | MBOULANE SHOP',
  description: 'Parcourez notre collection de produits premium, conçus avec soin. Filtrez par catégorie, taille et prix.',
  openGraph: {
    title: 'La Boutique MBOULANE',
    description: 'Collection complète de produits premium MBOULANE',
  },
}

export default function BoutiqueLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
