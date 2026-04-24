/** Affiché : +221 77 923 93 05 — format wa.me sans espaces ni + */
export const WHATSAPP_WA_ME = "221779239305"

export function buildWhatsAppUrl(message: string): string {
  return `https://wa.me/${WHATSAPP_WA_ME}?text=${encodeURIComponent(message)}`
}
