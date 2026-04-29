import { Metadata } from "next"

export const metadata: Metadata = {
  title: 'Caisse sécurisée | MBOULANE SHOP',
  description: 'Finalisez votre commande de produits premium en toute sécurité.',
  robots: { index: false, follow: false },
}

export default function CheckoutLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
