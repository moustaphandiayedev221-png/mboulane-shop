export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  // Layout "racine" neutre pour /admin/*.
  // Les pages protégées sont sous /admin/(protected) et la connexion sous /admin/connexion.
  return children
}

