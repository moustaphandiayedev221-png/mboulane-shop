/** Clé `site_settings` — chiffres sous la section Avis (accueil). */
export const HOME_REVIEWS_STATS_KEY = "home_reviews_stats" as const

export type ReviewsStatsHomeContent = {
  averageRating: number
  verifiedCount: number
  satisfactionPercent: number
  labelAverage: string
  labelVerified: string
  labelSatisfaction: string
}

export const DEFAULT_REVIEWS_STATS_HOME: ReviewsStatsHomeContent = {
  averageRating: 4.8,
  verifiedCount: 500,
  satisfactionPercent: 98,
  labelAverage: "Note moyenne",
  labelVerified: "Avis vérifiés",
  labelSatisfaction: "Clients satisfaits",
}

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v)
}

function numOr(v: unknown, d: number, min: number, max: number): number {
  if (typeof v === "number" && Number.isFinite(v)) {
    return Math.min(max, Math.max(min, v))
  }
  if (typeof v === "string" && v.trim() !== "") {
    const n = Number(v.replace(",", "."))
    if (Number.isFinite(n)) return Math.min(max, Math.max(min, n))
  }
  return d
}

function strOr(v: unknown, d: string): string {
  return typeof v === "string" && v.trim() !== "" ? v.trim() : d
}

function parseReviewsStats(raw: unknown): ReviewsStatsHomeContent | null {
  if (!isRecord(raw)) return null
  return {
    averageRating: numOr(raw.averageRating, DEFAULT_REVIEWS_STATS_HOME.averageRating, 0, 5),
    verifiedCount: numOr(raw.verifiedCount, DEFAULT_REVIEWS_STATS_HOME.verifiedCount, 0, 1_000_000),
    satisfactionPercent: numOr(
      raw.satisfactionPercent,
      DEFAULT_REVIEWS_STATS_HOME.satisfactionPercent,
      0,
      100,
    ),
    labelAverage: strOr(raw.labelAverage, DEFAULT_REVIEWS_STATS_HOME.labelAverage),
    labelVerified: strOr(raw.labelVerified, DEFAULT_REVIEWS_STATS_HOME.labelVerified),
    labelSatisfaction: strOr(raw.labelSatisfaction, DEFAULT_REVIEWS_STATS_HOME.labelSatisfaction),
  }
}

export function normalizeReviewsStatsHome(raw: unknown): ReviewsStatsHomeContent {
  return parseReviewsStats(raw) ?? DEFAULT_REVIEWS_STATS_HOME
}

export function parseReviewsStatsOrNull(raw: unknown): ReviewsStatsHomeContent | null {
  return parseReviewsStats(raw)
}
