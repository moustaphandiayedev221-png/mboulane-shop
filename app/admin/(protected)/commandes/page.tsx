import { createServiceRoleClient } from "@/lib/supabase/admin"
import { assertAdmin } from "@/lib/admin/auth"
import { AdminOrdersClient, type AdminOrderRow } from "../../admin-orders-client"

export default async function AdminOrdersPage() {
  const check = await assertAdmin()
  if (!check.ok) {
    // Le layout protégé redirige déjà, mais on garde ce garde-fou
    // pour éviter tout accès service_role si le composant est rendu isolément.
    return null
  }
  const admin = createServiceRoleClient()
  const { data: orders } = await admin
    .from("orders")
    .select(
      "id, created_at, email, first_name, last_name, phone, city, address, notes, payment_method, subtotal, delivery_fee, total, status, order_items (product_id, name, image, quantity, size, color, unit_price)",
    )
    .order("created_at", { ascending: false })
    .limit(200)

  return (
    <AdminOrdersClient
      adminEmail={check.email}
      orders={(orders ?? []) as unknown as AdminOrderRow[]}
    />
  )
}

