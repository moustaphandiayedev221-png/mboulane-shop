import { Metadata } from "next"

export const metadata: Metadata = {
  title: 'Ma Liste de Souhaits | MBOULANE SHOP',
  description: 'Retrouvez vos articles préférés dans votre liste de souhaits. MBOULANE SHOP - Sandales africaines en cuir.',
  robots: { index: false, follow: false },
}

export default function WishlistLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
