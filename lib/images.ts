
/**
 * Détermine si une image doit être servie sans optimisation Next.js.
 * Utile pour les URLs Supabase contenant des caractères spéciaux (points multiples, espaces)
 * qui font échouer l'optimiseur Next.js avec une erreur 500.
 */
export function shouldUnoptimize(url: string | undefined | null): boolean {
  if (!url) return false
  
  // Si c'est une URL Supabase
  if (url.includes('supabase.co')) {
    // Vérifie la présence de caractères problématiques pour l'optimiseur Next.js
    // Notamment les points multiples dans le nom du fichier (avant l'extension)
    const filename = url.split('/').pop() || ''
    const dotsCount = (filename.match(/\./g) || []).length
    
    if (dotsCount > 1) return true
    if (url.includes('%')) return true // Déjà encodé ou contient des caractères spéciaux
    if (url.includes(' ')) return true
  }
  
  return false
}
