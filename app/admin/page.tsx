import { redirect } from "next/navigation"

/** Route explicite : évite le 404 en dev sur `/admin` quand la page vit uniquement dans le groupe `(protected)`. */
export default function AdminIndexPage() {
  redirect("/admin/tableau")
}
