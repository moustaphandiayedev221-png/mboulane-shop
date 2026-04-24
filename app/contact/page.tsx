"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { LuxuryMain, LuxuryHero, LuxuryPanel, LuxurySectionBleed } from "@/components/layout/luxury-page"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { MapPin, Phone, Mail, Clock, MessageCircle, Send, Check, Loader2, Sparkles } from "lucide-react"
import { useForm, type SubmitHandler } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"

const BRONZE = "#b38b6d"

const contactInfo = [
  {
    icon: MapPin,
    title: "Adresse",
    content: "Dakar, Sénégal",
    detail: "Quartier Plateau",
  },
  {
    icon: Phone,
    title: "Téléphone",
    content: "+221 77 923 93 05",
    detail: "Lun–Sam : 9h–19h",
  },
  {
    icon: Mail,
    title: "Email",
    content: "mboulaneshop@gmail.com",
    detail: "Réponse sous 24h",
  },
  {
    icon: Clock,
    title: "Horaires",
    content: "Lun – Sam : 9h – 19h",
    detail: "Dimanche : fermé",
  },
]

const formSchema = z.object({
  name: z.string().min(3, "Le nom doit comporter au moins 3 caractères"),
  email: z.string().email("Email invalide"),
  phone: z
    .string()
    .optional()
    .refine((val) => !val || /^\+?[0-9\s-]{8,}$/.test(val), "Format de téléphone invalide"),
  subject: z.string().min(1, "Veuillez sélectionner un sujet"),
  message: z.string().min(10, "Le message est trop court"),
})

type FormData = z.infer<typeof formSchema>

export default function ContactPage() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: "", email: "", phone: "", subject: "", message: "" },
  })

  const onSubmit: SubmitHandler<FormData> = async (values) => {
    setIsSubmitting(true)
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      })
      if (res.ok) setIsSubmitted(true)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <LuxuryMain>
      <Header />

      <LuxuryHero
        breadcrumbs={[{ label: "Accueil", href: "/" }, { label: "Contact" }]}
        scriptTitle="Contact"
        subtitle="Une question, une suggestion ou besoin d’aide ? Notre équipe vous accompagne avec la même exigence que sur notre boutique."
        eyebrow={
          <span className="inline-flex items-center gap-2 rounded-full border border-[#e0d9ce] bg-white/90 px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#6b5d4f] shadow-sm">
            <Sparkles className="h-3 w-3" style={{ color: BRONZE }} aria-hidden />
            Parlons ensemble
          </span>
        }
      />

      <section className="py-12 md:py-16">
        <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-3">
            <div className="space-y-8 lg:col-span-1">
              <div>
                <h2 className="mb-6 font-serif text-xl font-semibold tracking-tight text-[#3d3429] md:text-2xl">
                  Nos coordonnées
                </h2>
                <div className="space-y-6">
                  {contactInfo.map((item) => (
                    <div key={item.title} className="flex gap-4">
                      <div
                        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-[#e8e2d8]"
                        style={{ background: `${BRONZE}14` }}
                      >
                        <item.icon className="h-5 w-5" style={{ color: BRONZE }} />
                      </div>
                      <div>
                        <h3 className="font-medium text-[#3d3429]">{item.title}</h3>
                        <p className="text-[#4a4036]">
                          {item.title === "Email" ? (
                            <a href={`mailto:${item.content}`} className="hover:underline">
                              {item.content}
                            </a>
                          ) : (
                            item.content
                          )}
                        </p>
                        <p className="text-sm font-light text-[#6b5d4f]">{item.detail}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <LuxuryPanel className="border-[#cfe8d4]/80 bg-[#f6fdf8]/95">
                <div className="mb-4 flex items-center gap-3">
                  <MessageCircle className="h-6 w-6 text-[#25D366]" />
                  <h3 className="font-semibold text-[#3d3429]">WhatsApp</h3>
                </div>
                <p className="mb-4 text-sm font-light leading-relaxed text-[#6b5d4f]">
                  Pour une réponse plus rapide, écrivez-nous directement sur WhatsApp.
                </p>
                <Button className="w-full bg-[#25D366] text-white hover:bg-[#20BD5A]" asChild>
                  <a href="https://wa.me/221779239305" target="_blank" rel="noopener noreferrer">
                    <MessageCircle className="mr-2 h-4 w-4" />
                    Discuter sur WhatsApp
                  </a>
                </Button>
              </LuxuryPanel>
            </div>

            <div className="lg:col-span-2">
              <LuxuryPanel>
                <h2 className="mb-6 font-serif text-xl font-semibold tracking-tight text-[#3d3429] md:text-2xl">
                  Envoyez-nous un message
                </h2>

                {isSubmitted ? (
                  <div className="py-12 text-center">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full border border-emerald-200/80 bg-emerald-50/90">
                      <Check className="h-8 w-8 text-emerald-600" />
                    </div>
                    <h3 className="mb-2 font-semibold text-xl text-[#3d3429]">Message envoyé !</h3>
                    <p className="mb-6 font-light text-[#6b5d4f]">
                      Merci de nous avoir contactés. Nous vous répondrons dans les plus brefs délais.
                    </p>
                    <Button onClick={() => setIsSubmitted(false)} className="rounded-full">
                      Envoyer un autre message
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="name" className="text-[#4a4036]">
                          Nom complet
                        </Label>
                        <Input
                          id="name"
                          {...register("name")}
                          required
                          className={cn(
                            "h-11 border-[#e8e2d8] bg-white focus-visible:ring-[#b38b6d]/30",
                            errors.name && "border-red-400 focus-visible:ring-red-400",
                          )}
                        />
                        {errors.name && (
                          <p className="text-[10px] font-medium text-red-500">{errors.name.message}</p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email" className="text-[#4a4036]">
                          Email
                        </Label>
                        <Input
                          id="email"
                          type="email"
                          {...register("email")}
                          required
                          className={cn(
                            "h-11 border-[#e8e2d8] bg-white focus-visible:ring-[#b38b6d]/30",
                            errors.email && "border-red-400 focus-visible:ring-red-400",
                          )}
                        />
                        {errors.email && (
                          <p className="text-[10px] font-medium text-red-500">{errors.email.message}</p>
                        )}
                      </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="phone" className="text-[#4a4036]">
                          Téléphone
                        </Label>
                        <Input
                          id="phone"
                          type="tel"
                          placeholder="+221 77 XXX XX XX"
                          {...register("phone")}
                          className={cn(
                            "h-11 border-[#e8e2d8] bg-white focus-visible:ring-[#b38b6d]/30",
                            errors.phone && "border-red-400 focus-visible:ring-red-400",
                          )}
                        />
                        {errors.phone && (
                          <p className="text-[10px] font-medium text-red-500">{errors.phone.message}</p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="subject" className="text-[#4a4036]">
                          Sujet
                        </Label>
                        <select
                          id="subject"
                          {...register("subject")}
                          required
                          className={cn(
                            "h-11 w-full rounded-md border border-[#e8e2d8] bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#b38b6d]/30",
                            errors.subject && "border-red-400 focus:ring-red-400",
                          )}
                        >
                          <option value="">Sélectionnez un sujet</option>
                          <option value="commande">Question sur une commande</option>
                          <option value="produit">Question sur un produit</option>
                          <option value="livraison">Livraison</option>
                          <option value="retour">Retour / échange</option>
                          <option value="partenariat">Partenariat</option>
                          <option value="autre">Autre</option>
                        </select>
                        {errors.subject && (
                          <p className="text-[10px] font-medium text-red-500">{errors.subject.message}</p>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="message" className="text-[#4a4036]">
                        Message
                      </Label>
                      <textarea
                        id="message"
                        rows={5}
                        {...register("message")}
                        required
                        className={cn(
                          "w-full resize-none rounded-md border border-[#e8e2d8] bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#b38b6d]/30",
                          errors.message && "border-red-400 focus:ring-red-400",
                        )}
                        placeholder="Décrivez votre demande en détail..."
                      />
                      {errors.message && (
                        <p className="text-[10px] font-medium text-red-500">{errors.message.message}</p>
                      )}
                    </div>

                    <Button
                      type="submit"
                      size="lg"
                      className="w-full gap-2 rounded-full shadow-[0_12px_36px_rgba(179,139,109,0.28)]"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Envoi en cours...
                        </>
                      ) : (
                        <>
                          <Send className="h-4 w-4" />
                          Envoyer le message
                        </>
                      )}
                    </Button>
                  </form>
                )}
              </LuxuryPanel>
            </div>
          </div>
        </div>
      </section>

      <LuxurySectionBleed variant="cream">
        <div className="text-center">
          <h2 className="mb-4 font-serif text-2xl font-semibold text-[#3d3429] md:text-3xl">
            Questions fréquentes
          </h2>
          <p className="mx-auto mb-8 max-w-2xl font-light text-[#6b5d4f]">
            Consultez notre FAQ pour trouver rapidement des réponses aux questions les plus courantes.
          </p>
          <Button variant="outline" className="rounded-full border-[#e0d9ce] bg-white hover:bg-[#FDFBF7]" asChild>
            <Link href="/faq">Voir la FAQ</Link>
          </Button>
        </div>
      </LuxurySectionBleed>

      <Footer />
    </LuxuryMain>
  )
}
