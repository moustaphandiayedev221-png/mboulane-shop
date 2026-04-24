import { Metadata } from "next"

export const metadata: Metadata = {
  title: 'FAQ | MBOULANE SHOP',
  description: 'Trouvez des réponses à toutes vos questions concernant nos sandales artisanales, la livraison et nos services.',
}

export default function FAQLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
