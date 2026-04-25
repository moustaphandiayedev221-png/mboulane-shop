"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { LuxuryMain, LuxuryPanel } from "@/components/layout/luxury-page"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useStore, formatPrice } from "@/lib/store"
import {
  ChevronLeft,
  ChevronRight,
  CreditCard,
  Truck,
  Shield,
  Check,
  Loader2,
  MapPin,
  User,
  ShoppingBag,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { buildWhatsAppUrl } from "@/lib/whatsapp"

type PaymentMethod = "cash_on_delivery"

const paymentMethods = [
  {
    id: "cash_on_delivery" as PaymentMethod,
    name: "Paiement à la livraison",
    icon: Truck,
    description: "Vous payez au livreur lors de la réception.",
  },
]

type DeliveryZone = { name: string; price: number; time?: string }
type CheckoutSettings = { freeShippingThreshold?: number; deliveryZones?: DeliveryZone[] }

const defaultSettings: Required<CheckoutSettings> = {
  freeShippingThreshold: 50000,
  deliveryZones: [
    { name: "Dakar", price: 2000, time: "1 à 2 jours ouvrables" },
    { name: "Thiès", price: 3500, time: "2-3 jours" },
    { name: "Saint-Louis", price: 3500, time: "3-4 jours" },
    { name: "Autres régions", price: 4000, time: "4-5 jours" },
  ],
}

export default function CheckoutPage() {
  const { cart, getCartTotal, clearCart } = useStore()
  const [hydrated, setHydrated] = useState(false)
  const [step, setStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [orderComplete, setOrderComplete] = useState(false)
  const [completedOrderId, setCompletedOrderId] = useState<string | null>(null)
  const [settings, setSettings] = useState<Required<CheckoutSettings>>(defaultSettings)
  const [promoCode, setPromoCode] = useState("")
  const [promoStatus, setPromoStatus] = useState<{
    appliedCode: string | null
    discount: number
    error: string | null
    validating: boolean
  }>({ appliedCode: null, discount: 0, error: null, validating: false })
  
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "Dakar",
    notes: "",
    paymentMethod: "cash_on_delivery" as PaymentMethod,
  })

  const normalizedPhoneDigits = formData.phone.replace(/\D/g, "")
  const fallbackEmail = normalizedPhoneDigits ? `client+${normalizedPhoneDigits}@mboulane.local` : "client@mboulane.local"
  const effectiveEmail = formData.email.trim() ? formData.email.trim().toLowerCase() : fallbackEmail

  useEffect(() => {
    setHydrated(true)
    ;(async () => {
      try {
        const res = await fetch("/api/site/settings/checkout", { cache: "no-store" })
        const data = (await res.json()) as { value?: CheckoutSettings | null }
        setSettings({
          freeShippingThreshold: Number(data.value?.freeShippingThreshold ?? defaultSettings.freeShippingThreshold),
          deliveryZones: Array.isArray(data.value?.deliveryZones) ? (data.value?.deliveryZones as DeliveryZone[]) : defaultSettings.deliveryZones,
        })
      } catch {
        // ignore
      }
    })()
  }, [])

  const subtotal = getCartTotal()
  const deliveryZone =
    settings.deliveryZones.find((z) => z.name === formData.city) || settings.deliveryZones[0]
  const deliveryFee = subtotal >= settings.freeShippingThreshold ? 0 : deliveryZone.price
  const totalBeforeDiscount = subtotal + deliveryFee
  const total = Math.max(0, totalBeforeDiscount - promoStatus.discount)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  const nextStep = () => {
    if (step === 1) {
      if (!formData.firstName || !formData.lastName || !formData.phone) return
    }
    if (step === 2) {
      if (!formData.address || !formData.city) return
    }
    setStep(prev => prev + 1)
    window.scrollTo(0, 0)
  }

  const prevStep = () => {
    setStep(prev => prev - 1)
    window.scrollTo(0, 0)
  }

  const openWhatsAppCheckout = () => {
    const origin = typeof window !== "undefined" ? window.location.origin : ""
    const lines: string[] = [
      "━━━━━━━━━━━━━━━━",
      "COMMANDE CHECKOUT — MBOULANE",
      "━━━━━━━━━━━━━━━━",
      "",
      "— Détail du panier —",
      "",
    ]

    cart.forEach((item, i) => {
      const imgPath = item.product.image.startsWith("/") ? item.product.image : `/${item.product.image}`
      const imageUrl = origin ? new URL(imgPath, origin).href : imgPath
      const lineTotal = item.product.price * item.quantity

      lines.push(`Article ${i + 1}`)
      lines.push(`• Produit : ${item.product.name}`)
      lines.push(`• Référence : ${item.product.id}`)
      lines.push(`• Taille : ${item.size} · Couleur : ${item.color}`)
      lines.push(`• Quantité : ${item.quantity}`)
      lines.push(`• Prix unitaire : ${formatPrice(item.product.price)}`)
      lines.push(`• Sous-total : ${formatPrice(lineTotal)}`)
      lines.push(`• Image : ${imageUrl}`)
      lines.push(`• Page produit : ${origin ? `${origin}/produit/${item.product.id}` : `/produit/${item.product.id}`}`)
      lines.push("")
    })

    lines.push("— Totaux (selon sélection actuelle) —")
    lines.push(`Sous-total : ${formatPrice(subtotal)}`)
    lines.push(
      `Livraison (${formData.city}) : ${deliveryFee === 0 ? "Gratuite" : formatPrice(deliveryFee)}`,
    )
    if (promoStatus.appliedCode) {
      lines.push(`Code promo : ${promoStatus.appliedCode} (-${formatPrice(promoStatus.discount)})`)
    }
    lines.push(`TOTAL : ${formatPrice(total)}`)
    lines.push("")

    if (formData.firstName.trim() || formData.lastName.trim() || formData.phone.trim()) {
      lines.push("— Coordonnées —")
      if (formData.firstName.trim() || formData.lastName.trim()) {
        lines.push(`Nom : ${formData.firstName.trim()} ${formData.lastName.trim()}`.trim())
      }
      if (formData.email.trim()) lines.push(`Email : ${formData.email.trim()}`)
      if (formData.phone.trim()) lines.push(`Téléphone : ${formData.phone.trim()}`)
      lines.push("")
    }

    if (formData.address.trim() || formData.city) {
      lines.push("— Livraison —")
      lines.push(`Ville / zone : ${formData.city}`)
      if (formData.address.trim()) lines.push(`Adresse : ${formData.address.trim()}`)
      if (formData.notes.trim()) lines.push(`Instructions : ${formData.notes.trim()}`)
      lines.push("")
    }

    const pm = paymentMethods.find((m) => m.id === formData.paymentMethod)
    lines.push(`Paiement : ${pm?.name ?? "Paiement à la livraison"}`)
    lines.push("")

    lines.push("Merci de confirmer ma commande.")

    window.open(buildWhatsAppUrl(lines.join("\n")), "_blank", "noopener,noreferrer")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitError(null)

    try {
      const payload = {
        email: effectiveEmail,
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        phone: formData.phone.trim(),
        address: formData.address.trim(),
        city: formData.city,
        notes: formData.notes.trim() || null,
        paymentMethod: formData.paymentMethod,
        subtotal,
        deliveryFee,
        promoCode: promoStatus.appliedCode,
        discount: promoStatus.discount,
        total,
        items: cart.map((item) => ({
          productId: item.product.id,
          name: item.product.name,
          image: item.product.image,
          quantity: item.quantity,
          size: item.size,
          color: item.color,
          unitPrice: item.product.price,
        })),
      }

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as { error?: string } | null
        setSubmitError(data?.error || "Impossible d'enregistrer la commande. Réessayez.")
        setIsSubmitting(false)
        return
      }

      const data = (await res.json()) as { id?: string }
      const orderId = data.id ?? null
      setCompletedOrderId(orderId)
      setOrderComplete(true)
      void clearCart()
      setIsSubmitting(false)
    } catch {
      setSubmitError("Erreur réseau. Vérifiez votre connexion puis réessayez.")
      setIsSubmitting(false)
    }
  }

  const applyPromo = async () => {
    const code = promoCode.trim().toUpperCase()
    if (!code) {
      setPromoStatus((s) => ({ ...s, error: "Entrez un code promo.", appliedCode: null, discount: 0 }))
      return
    }
    setPromoStatus((s) => ({ ...s, validating: true, error: null }))
    try {
      const res = await fetch("/api/promo/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, subtotal }),
      })
      const data = (await res.json()) as
        | { valid: true; code: string; discount: number }
        | { valid: false; reason: string }
        | { error?: string }
      if (!res.ok) throw new Error("Erreur")
      if ("valid" in data && data.valid) {
        setPromoStatus({ appliedCode: data.code, discount: Number(data.discount || 0), error: null, validating: false })
      } else if ("valid" in data && !data.valid) {
        const msg =
          data.reason === "not_found"
            ? "Code introuvable."
            : data.reason === "inactive"
              ? "Code inactif."
              : data.reason === "expired"
                ? "Code expiré."
                : data.reason === "not_started"
                  ? "Code pas encore actif."
                  : data.reason === "limit_reached"
                    ? "Limite d’utilisation atteinte."
                    : data.reason === "min_subtotal"
                      ? "Sous-total trop bas pour ce code."
                      : "Code invalide."
        setPromoStatus({ appliedCode: null, discount: 0, error: msg, validating: false })
      } else {
        setPromoStatus({ appliedCode: null, discount: 0, error: "Code invalide.", validating: false })
      }
    } catch {
      setPromoStatus({ appliedCode: null, discount: 0, error: "Impossible de valider le code.", validating: false })
    }
  }

  if (!hydrated) {
    return (
      <LuxuryMain>
        <Header />
        <div className="flex min-h-[55vh] flex-col items-center justify-center gap-4 pb-16 pt-28">
          <Loader2 className="h-10 w-10 animate-spin text-[#b38b6d]" aria-hidden />
          <p className="text-sm font-medium text-[#6b5d4f]">Préparation du tunnel de commande…</p>
        </div>
        <Footer />
      </LuxuryMain>
    )
  }

  if (cart.length === 0 && !orderComplete) {
    return (
      <LuxuryMain>
        <Header />
        <div className="pb-16 pt-24 md:pt-28">
          <div className="mx-auto max-w-lg px-4 sm:px-6 lg:px-8">
            <LuxuryPanel className="py-16 text-center">
              <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full border border-[#e8e2d8] bg-[#F7F3EC]">
                <ShoppingBag className="h-10 w-10 text-[#b38b6d]/50" />
              </div>
              <h1 className="mb-4 font-serif text-3xl font-semibold text-[#3d3429]">Votre panier est vide</h1>
              <p className="mb-8 font-light text-[#6b5d4f]">
                Découvrez nos sandales premium et ajoutez-les à votre panier.
              </p>
              <Button asChild className="rounded-full px-8 shadow-[0_12px_36px_rgba(179,139,109,0.28)]">
                <Link href="/boutique">Voir la boutique</Link>
              </Button>
            </LuxuryPanel>
          </div>
        </div>
        <Footer />
      </LuxuryMain>
    )
  }

  if (orderComplete) {
    return (
      <LuxuryMain>
        <Header />
        <div className="pb-16 pt-24 md:pt-32">
          <div className="mx-auto max-w-xl px-4 text-center sm:px-6 lg:px-8">
            <LuxuryPanel className="animate-scale-in py-16">
              <div className="mx-auto mb-8 flex h-24 w-24 items-center justify-center rounded-full border border-emerald-200/80 bg-emerald-50/90 shadow-inner">
                <Check className="h-12 w-12 text-emerald-600" />
              </div>
              <h1 className="mb-4 font-serif text-4xl font-semibold tracking-tight text-[#3d3429]">
                Commande confirmée !
              </h1>
              <p className="mb-10 text-lg font-light leading-relaxed text-[#6b5d4f]">
                Merci pour votre confiance. Votre commande est en cours de préparation.
              </p>
              {completedOrderId ? (
                <p className="mb-8 rounded-[5px] border border-[#ebe5dc] bg-[#F7F3EC]/80 px-4 py-3 font-mono text-sm font-semibold text-[#3d3429]">
                  N° {completedOrderId}
                </p>
              ) : null}
              {!formData.email.trim() ? (
                <p className="-mt-4 mb-8 text-sm font-medium text-[#6b5d4f]">
                  Astuce : gardez ce numéro et votre téléphone pour retrouver votre commande dans{" "}
                  <span className="font-semibold text-[#3d3429]">Suivi de commande</span>.
                </p>
              ) : null}
              <div className="space-y-4">
                <Button
                  asChild
                  className="h-14 w-full rounded-full text-lg font-semibold shadow-[0_12px_36px_rgba(179,139,109,0.28)] transition-all hover:scale-[1.02]"
                >
                  <Link
                    href={`/suivi-commande?order=${encodeURIComponent(completedOrderId ?? "")}&phone=${encodeURIComponent(formData.phone)}`}
                  >
                    Suivre ma commande
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="h-14 w-full rounded-full border-[#e0d9ce] text-lg font-semibold hover:bg-[#FDFBF7]"
                >
                  <Link href="/boutique">Continuer mes achats</Link>
                </Button>
                <Button
                  asChild
                  variant="ghost"
                  className="h-14 w-full rounded-full font-semibold hover:bg-[#b38b6d]/10"
                >
                  <Link href="/mes-commandes">Voir mes commandes</Link>
                </Button>
                <Button variant="ghost" asChild className="h-14 w-full rounded-full font-semibold hover:bg-[#b38b6d]/10">
                  <Link href="/">Retour à l&apos;accueil</Link>
                </Button>
              </div>
            </LuxuryPanel>
          </div>
        </div>
        <Footer />
      </LuxuryMain>
    )
  }

  return (
    <LuxuryMain>
      <Header />

      <div className="pb-16 pt-24 md:pt-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="mb-10 text-center text-[11px] font-medium uppercase tracking-[0.22em] text-[#8a7d70]">
            Paiement sécurisé · même exigence que la boutique
          </p>

          {/* Stepper */}
          <div className="mx-auto mb-16 max-w-3xl px-4">
            <div className="relative flex items-center justify-between">
              <div className="absolute left-0 right-0 top-5 z-0 h-0.5 -translate-y-1/2 bg-[#ebe5dc]" />
              <div
                className="absolute left-0 top-5 z-0 h-0.5 -translate-y-1/2 bg-[#b38b6d] transition-all duration-700 ease-in-out"
                style={{ width: `${(step - 1) * 50}%` }}
              />

              {[
                { s: 1, label: "Infos", icon: User },
                { s: 2, label: "Livraison", icon: MapPin },
                { s: 3, label: "Paiement", icon: CreditCard },
              ].map((item) => (
                <div key={item.s} className="relative z-10 flex flex-col items-center">
                  <div
                    className={cn(
                      "flex h-10 w-10 items-center justify-center rounded-full border-2 text-sm font-bold transition-all duration-500",
                      step > item.s
                        ? "border-[#b38b6d] bg-[#b38b6d] text-white"
                        : step === item.s
                          ? "scale-110 border-[#b38b6d] bg-white text-[#b38b6d] shadow-[0_0_15px_rgba(179,139,109,0.35)]"
                          : "border-[#e0d9ce] bg-white text-[#9a8b7d]",
                    )}
                  >
                    {step > item.s ? <Check className="h-5 w-5" /> : item.s}
                  </div>
                  <span
                    className={cn(
                      "absolute -bottom-8 text-[11px] font-bold uppercase tracking-[0.15em] transition-colors duration-500",
                      step >= item.s ? "text-[#4a4036]" : "text-[#9a8b7d]/70",
                    )}
                  >
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-12 mt-16">
            {/* Form Steps */}
            <div className="lg:col-span-2">
              <form onSubmit={handleSubmit} className="space-y-8">
                {submitError ? (
                  <div className="rounded-[5px] border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                    {submitError}
                  </div>
                ) : null}
                
                {/* STEP 1: CONTACT INFO */}
                {step === 1 && (
                  <div className="animate-fade-in space-y-6">
                    <div className="mb-4 flex items-center gap-3">
                      <User className="h-6 w-6 text-[#b38b6d]" />
                      <h2 className="font-serif text-2xl font-semibold text-[#3d3429]">Informations de contact</h2>
                    </div>
                    <LuxuryPanel className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="firstName" className="text-xs uppercase tracking-widest font-bold text-muted-foreground">Prénom</Label>
                        <Input id="firstName" name="firstName" value={formData.firstName} onChange={handleInputChange} required className="h-14 border-[#e8e2d8] bg-white focus-visible:ring-[#b38b6d]/30" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName" className="text-xs uppercase tracking-widest font-bold text-muted-foreground">Nom</Label>
                        <Input id="lastName" name="lastName" value={formData.lastName} onChange={handleInputChange} required className="h-14 border-[#e8e2d8] bg-white focus-visible:ring-[#b38b6d]/30" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email" className="text-xs uppercase tracking-widest font-bold text-muted-foreground">
                          Email (optionnel)
                        </Label>
                        <p className="-mt-1 text-[11px] font-medium text-[#8a7d72]">
                          Recommandé pour retrouver facilement vos commandes.
                        </p>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          className="h-14 border-[#e8e2d8] bg-white focus-visible:ring-[#b38b6d]/30"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone" className="text-xs uppercase tracking-widest font-bold text-muted-foreground">Téléphone</Label>
                        <Input id="phone" name="phone" type="tel" placeholder="+221 77 XXX XX XX" value={formData.phone} onChange={handleInputChange} required className="h-14 border-[#e8e2d8] bg-white focus-visible:ring-[#b38b6d]/30" />
                      </div>
                    </LuxuryPanel>
                    <Button type="button" onClick={nextStep} className="h-12 w-full rounded-full text-base font-semibold shadow-[0_12px_36px_rgba(179,139,109,0.28)]">
                      Continuer vers la livraison
                      <ChevronRight className="h-5 w-5 ml-2" />
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={openWhatsAppCheckout}
                      className="lg:hidden h-12 w-full gap-3 rounded-full border-2 border-[#25D366]/40 bg-[#25D366]/[0.08] text-[15px] font-semibold text-[#128C7E] shadow-[0_8px_28px_rgba(37,211,102,0.18)] hover:border-[#25D366]/70 hover:bg-[#25D366]/15 active:scale-[0.99]"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        className="h-5 w-5 shrink-0 text-[#25D366]"
                        aria-hidden
                      >
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.881 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                      </svg>
                      Commander sur WhatsApp
                    </Button>
                  </div>
                )}

                {/* STEP 2: DELIVERY */}
                {step === 2 && (
                  <div className="animate-fade-in space-y-6">
                    <div className="mb-4 flex items-center gap-3">
                      <MapPin className="h-6 w-6 text-[#b38b6d]" />
                      <h2 className="font-serif text-2xl font-semibold text-[#3d3429]">Adresse de livraison</h2>
                    </div>
                    <LuxuryPanel className="space-y-8">
                      <div className="space-y-3">
                        <Label htmlFor="city" className="text-xs uppercase tracking-widest font-bold text-muted-foreground">Ville / Zone</Label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {settings.deliveryZones.map((zone) => (
                            <button
                              key={zone.name}
                              type="button"
                              onClick={() => setFormData(prev => ({ ...prev, city: zone.name }))}
                              className={cn(
                                "relative flex flex-col overflow-hidden rounded-[5px] border-2 p-4 text-left transition-all",
                                formData.city === zone.name
                                  ? "border-[#b38b6d] bg-[#FDFBF7] ring-1 ring-[#b38b6d]/35"
                                  : "border-[#e8e2d8] bg-white/80 hover:border-[#b38b6d]/35",
                              )}
                            >
                              <span className="font-bold">{zone.name}</span>
                              <span className="text-xs text-muted-foreground">{zone.time} • {formatPrice(zone.price)}</span>
                              {formData.city === zone.name && (
                                <div className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-[#b38b6d]">
                                  <Check className="h-3 w-3 text-white" />
                                </div>
                              )}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="space-y-3">
                        <Label htmlFor="address" className="text-xs uppercase tracking-widest font-bold text-muted-foreground">Adresse complète</Label>
                        <Input id="address" name="address" placeholder="Quartier, rue, numéro..." value={formData.address} onChange={handleInputChange} required className="h-14 border-[#e8e2d8] bg-white focus-visible:ring-[#b38b6d]/30" />
                      </div>
                      <div className="space-y-3">
                        <Label htmlFor="notes" className="text-xs uppercase tracking-widest font-bold text-muted-foreground">Instructions (optionnel)</Label>
                        <textarea id="notes" name="notes" rows={3} placeholder="Indications pour le livreur..." value={formData.notes} onChange={handleInputChange} className="w-full resize-none rounded-[5px] border border-[#e8e2d8] bg-white px-4 py-4 text-sm outline-none transition-all focus-visible:ring-2 focus-visible:ring-[#b38b6d]/30" />
                      </div>
                    </LuxuryPanel>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={prevStep}
                        className="h-12 w-full rounded-full border-2 border-[#e0d9ce] font-semibold hover:bg-[#FDFBF7]"
                      >
                        <ChevronLeft className="mr-2 h-5 w-5" />
                        Retour
                      </Button>
                      <Button
                        type="button"
                        onClick={nextStep}
                        className="h-12 w-full rounded-full font-semibold shadow-[0_12px_36px_rgba(179,139,109,0.28)]"
                      >
                        Passer au paiement
                        <ChevronRight className="h-5 w-5 ml-2" />
                      </Button>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={openWhatsAppCheckout}
                      className="lg:hidden h-12 w-full gap-3 rounded-full border-2 border-[#25D366]/40 bg-[#25D366]/[0.08] text-[15px] font-semibold text-[#128C7E] shadow-[0_8px_28px_rgba(37,211,102,0.18)] hover:border-[#25D366]/70 hover:bg-[#25D366]/15 active:scale-[0.99]"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        className="h-5 w-5 shrink-0 text-[#25D366]"
                        aria-hidden
                      >
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.881 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                      </svg>
                      Commander sur WhatsApp
                    </Button>
                  </div>
                )}

                {/* STEP 3: PAYMENT */}
                {step === 3 && (
                  <div className="animate-fade-in space-y-6">
                    <div className="mb-4 flex items-center gap-3">
                      <CreditCard className="h-6 w-6 text-[#b38b6d]" />
                      <h2 className="font-serif text-2xl font-semibold text-[#3d3429]">Méthode de paiement</h2>
                    </div>
                    <LuxuryPanel className="space-y-6">
                      <div className="grid gap-4">
                        {paymentMethods.map((method) => (
                          <label
                            key={method.id}
                            className={cn(
                              "relative flex cursor-pointer items-center gap-5 rounded-[5px] border-2 p-6 transition-all",
                              formData.paymentMethod === method.id
                                ? "border-[#b38b6d] bg-[#FDFBF7] shadow-sm ring-1 ring-[#b38b6d]/35"
                                : "border-[#e8e2d8] bg-white/80 hover:border-[#b38b6d]/35",
                            )}
                          >
                            <input type="radio" name="paymentMethod" value={method.id} checked={formData.paymentMethod === method.id} onChange={handleInputChange} className="sr-only" />
                            <div className={cn(
                              "flex h-14 w-14 items-center justify-center rounded-full border transition-all duration-300",
                              formData.paymentMethod === method.id
                                ? "scale-110 border-[#b38b6d] bg-[#b38b6d] text-white"
                                : "border-[#e8e2d8] bg-white text-[#6b5d4f]",
                            )}>
                              <method.icon className="h-7 w-7" />
                            </div>
                            <div className="flex-1">
                              <p className="font-bold text-lg">{method.name}</p>
                              <p className="text-sm text-muted-foreground">{method.description}</p>
                            </div>
                            {formData.paymentMethod === method.id && (
                              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#b38b6d]">
                                <Check className="h-3.5 w-3.5 text-white" />
                              </div>
                            )}
                          </label>
                        ))}
                      </div>
                    </LuxuryPanel>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={prevStep}
                        className="h-12 w-full rounded-full border-2 border-[#e0d9ce] font-semibold hover:bg-[#FDFBF7]"
                      >
                        <ChevronLeft className="mr-2 h-5 w-5" />
                        Retour
                      </Button>
                      <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="h-auto min-h-12 w-full gap-2 rounded-full px-4 py-3 text-sm font-semibold leading-tight shadow-[0_12px_36px_rgba(179,139,109,0.28)] sm:h-12 sm:py-0 sm:text-base"
                      >
                        {isSubmitting ? (
                          <Loader2 className="h-5 w-5 shrink-0 animate-spin" />
                        ) : (
                          <ShoppingBag className="h-5 w-5 shrink-0" />
                        )}
                        {isSubmitting ? (
                          "Traitement..."
                        ) : (
                          <>
                            <span className="hidden sm:inline whitespace-nowrap">{`Confirmer — ${formatPrice(total)}`}</span>
                            <span className="sm:hidden whitespace-nowrap">{`Confirmer — ${formatPrice(total)}`}</span>
                          </>
                        )}
                      </Button>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={openWhatsAppCheckout}
                      className="lg:hidden h-12 w-full gap-3 rounded-full border-2 border-[#25D366]/40 bg-[#25D366]/[0.08] text-[15px] font-semibold text-[#128C7E] shadow-[0_8px_28px_rgba(37,211,102,0.18)] hover:border-[#25D366]/70 hover:bg-[#25D366]/15 active:scale-[0.99]"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        className="h-5 w-5 shrink-0 text-[#25D366]"
                        aria-hidden
                      >
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.881 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                      </svg>
                      Commander sur WhatsApp
                    </Button>
                  </div>
                )}
              </form>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <LuxuryPanel className="sticky top-24">
                <h2 className="mb-10 flex items-center gap-3 font-serif text-2xl font-semibold text-[#3d3429]">
                  <div className="flex h-10 w-10 items-center justify-center rounded-[5px] border border-[#e8e2d8]" style={{ background: "rgba(179,139,109,0.12)" }}>
                    <ShoppingBag className="h-6 w-6 text-[#b38b6d]" />
                  </div>
                  Récapitulatif
                </h2>
 
                <div className="space-y-6 mb-10">
                  {cart.map((item) => (
                    <div key={`${item.product.id}-${item.size}`} className="flex gap-5 group/item">
                      <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-[5px] border border-[#e8e2d8] bg-[#FDFBF7] shadow-sm transition-shadow group-hover/item:shadow-md">
                        <Image
                          src={item.product.image}
                          alt={item.product.name}
                          fill
                          className="object-cover"
                          sizes="80px"
                        />
                        <span className="absolute -right-1 -top-1 z-[1] flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-[#b38b6d] text-[11px] font-bold text-white shadow-sm">
                          {item.quantity}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0 flex flex-col justify-center">
                        <p className="truncate text-sm font-bold transition-colors group-hover/item:text-[#b38b6d]">{item.product.name}</p>
                        <div className="flex items-center gap-2 mt-1.5 font-bold uppercase tracking-[0.15em] text-[9px] text-muted-foreground/60">
                           <span>TAILLE {item.size}</span>
                           <span className="h-1 w-1 rounded-full bg-border" />
                           <span>{item.color}</span>
                        </div>
                        <p className="mt-1.5 text-base font-bold text-[#b38b6d]">
                          {formatPrice(item.product.price)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
 
                <div className="mb-10 space-y-4 border-t border-dashed border-[#ebe5dc] pt-8">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground font-medium">Sous-total</span>
                    <span className="font-bold">{formatPrice(subtotal)}</span>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs uppercase tracking-widest font-bold text-muted-foreground">Code promo</Label>
                    <div className="flex gap-2">
                      <Input
                        value={promoCode}
                        onChange={(e) => setPromoCode(e.target.value)}
                        placeholder="MBOULANE10"
                        className="h-12 border-[#e8e2d8] bg-white focus-visible:ring-[#b38b6d]/30"
                      />
                      <Button
                        type="button"
                        onClick={applyPromo}
                        disabled={promoStatus.validating}
                        className="h-12 rounded-full px-6 shadow-[0_12px_36px_rgba(179,139,109,0.28)]"
                      >
                        {promoStatus.validating ? <Loader2 className="h-4 w-4 animate-spin" /> : "Appliquer"}
                      </Button>
                    </div>
                    {promoStatus.error ? (
                      <p className="text-xs font-semibold text-red-600">{promoStatus.error}</p>
                    ) : promoStatus.appliedCode ? (
                      <p className="text-xs font-semibold text-green-700">
                        Appliqué : {promoStatus.appliedCode} (-{formatPrice(promoStatus.discount)})
                      </p>
                    ) : null}
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground font-medium">Livraison ({formData.city})</span>
                    <span className="font-bold">
                      {deliveryFee === 0 ? <span className="text-green-600">Gratuite</span> : formatPrice(deliveryFee)}
                    </span>
                  </div>
                  {promoStatus.discount > 0 ? (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground font-medium">Réduction</span>
                      <span className="font-bold text-green-700">-{formatPrice(promoStatus.discount)}</span>
                    </div>
                  ) : null}
                  <div className="mt-2 flex justify-between border-t border-[#ebe5dc]/80 pt-6 font-serif text-2xl font-bold text-[#3d3429]">
                    <span>Total</span>
                    <span className="text-[#b38b6d]">{formatPrice(total)}</span>
                  </div>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  onClick={openWhatsAppCheckout}
                  className="hidden lg:flex mb-10 h-14 w-full gap-3 rounded-full border-2 border-[#25D366]/40 bg-[#25D366]/[0.08] text-[15px] font-semibold text-[#128C7E] shadow-[0_8px_28px_rgba(37,211,102,0.18)] transition-all hover:scale-[1.01] hover:border-[#25D366]/70 hover:bg-[#25D366]/15 active:scale-[0.99]"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="h-5 w-5 shrink-0 text-[#25D366]"
                    aria-hidden
                  >
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.881 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                  Commander sur WhatsApp
                </Button>

                <div className="space-y-5">
                  <div className="flex items-center gap-4 rounded-[5px] border border-transparent p-3 text-[11px] font-bold uppercase tracking-[0.12em] text-[#6b5d4f] transition-colors hover:border-[#ebe5dc] hover:bg-[#F7F3EC]/80">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#e8e2d8]" style={{ background: "rgba(179,139,109,0.12)" }}>
                      <Shield className="h-5 w-5 text-[#b38b6d]" />
                    </div>
                    Paiement 100% sécurisé
                  </div>
                  <div className="flex items-center gap-4 rounded-[5px] border border-transparent p-3 text-[11px] font-bold uppercase tracking-[0.12em] text-[#6b5d4f] transition-colors hover:border-[#ebe5dc] hover:bg-[#F7F3EC]/80">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#e8e2d8]" style={{ background: "rgba(179,139,109,0.12)" }}>
                      <Truck className="h-5 w-5 text-[#b38b6d]" />
                    </div>
                    Livraison {deliveryZone.time}
                  </div>
                </div>
              </LuxuryPanel>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </LuxuryMain>
  )
}
