export function isHexColor(input: string): boolean {
  const s = String(input || "").trim()
  return /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(s)
}

export function normalizeHexColor(input: string): string | null {
  if (!isHexColor(input)) return null
  return input.trim().toLowerCase()
}

/**
 * Retourne un style CSS prêt à être appliqué à une pastille de couleur.
 * - Supporte les couleurs Hex (ex. "#b38b6d") enregistrées depuis l'admin
 * - Supporte les couleurs nommées mappées en Hex ou en gradient
 */
export function getColorSwatchStyle(
  rawColor: string,
  colorMap: Record<string, string>,
): { backgroundColor?: string; backgroundImage?: string } {
  const hex = normalizeHexColor(rawColor)
  if (hex) return { backgroundColor: hex }

  const mapped = colorMap[rawColor]
  if (!mapped) return { backgroundColor: "#CCCCCC" }

  const v = String(mapped)
  if (v.startsWith("linear-gradient(") || v.startsWith("radial-gradient(")) {
    return { backgroundImage: v }
  }
  return { backgroundColor: v }
}

export function isWhiteSwatch(rawColor: string, colorMap: Record<string, string>): boolean {
  if (rawColor.trim().toLowerCase() === "blanc") return true
  const hex = normalizeHexColor(rawColor)
  if (hex) return hex === "#fff" || hex === "#ffffff"
  const mapped = colorMap[rawColor]
  if (!mapped) return false
  return String(mapped).trim().toLowerCase() === "#fff" || String(mapped).trim().toLowerCase() === "#ffffff"
}

