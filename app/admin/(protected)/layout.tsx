import { redirect } from "next/navigation"
import { assertAdmin } from "@/lib/admin/auth"
import { AdminShell } from "../admin-shell"

export default async function AdminProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const admin = await assertAdmin()
  if (!admin.ok) {
    if (admin.status === 403 && admin.error === "Admin désactivé") {
      redirect("/admin/connexion?reason=disabled")
    }
    if (admin.status === 401) redirect("/admin/connexion?reason=auth")
    redirect("/admin/connexion?reason=denied")
  }

  return <AdminShell adminEmail={admin.email}>{children}</AdminShell>
}

