import { Metadata } from "next"

export const metadata: Metadata = {
  title: 'Contactez-nous | MBOULANE SHOP',
  description: 'Une question sur nos sandales ou votre commande ? Contactez MBOULANE SHOP, nous sommes là pour vous aider.',
}

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
