/** Les 4 collections d’accueil « Nos Collections » (ordre maquette). */
export const HOME_COLLECTION_LABELS = [
  "Classique",
  "Mode & Tendance",
  "Premium",
  "Artisanal & Unique",
] as const

export type HomeCollectionLabel = (typeof HOME_COLLECTION_LABELS)[number]

/** Sous-titres cursive sur les visuels — textes identiques à la maquette (image 1). */
export const HOME_COLLECTION_SUBTITLES: Record<HomeCollectionLabel, string> = {
  Classique: "Élégance Intemporelle",
  "Mode & Tendance": "Style et Élégance",
  Premium: "Raffinement Élevé",
  "Artisanal & Unique": "Savoir-Faire Authentique",
}

/** Images locales (fallback si la colonne `categories.image` est vide). */
export const HOME_COLLECTION_LOCAL_IMAGES: Record<HomeCollectionLabel, string> = {
  Classique: "/collections/classique.png",
  "Mode & Tendance": "/collections/mode-et-tendance.png",
  Premium: "/collections/premium.png",
  "Artisanal & Unique": "/collections/artisanal-et-unique.png",
}
