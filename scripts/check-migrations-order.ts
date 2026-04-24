/**
 * Vérifie que supabase/migrations/*.sql suit un préfixe numérique strict (001_, 002_, …)
 * pour réduire les erreurs d’ordre (015 / 016 sensibles aux DROP FUNCTION).
 *
 * npm run db:check-migrations
 */

import fs from "fs"
import path from "path"

const dir = path.join(process.cwd(), "supabase", "migrations")

function main() {
  if (!fs.existsSync(dir)) {
    console.error("Dossier supabase/migrations introuvable.")
    process.exit(1)
  }
  const files = fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".sql"))
    .sort()

  if (files.length === 0) {
    console.error("Aucun fichier .sql dans supabase/migrations.")
    process.exit(1)
  }

  const nums: number[] = []
  for (const f of files) {
    const m = f.match(/^(\d{3})_[\w-]+\.sql$/)
    if (!m) {
      console.error(`Nom de migration invalide (attendu NNN_nom.sql) : ${f}`)
      process.exit(1)
    }
    nums.push(parseInt(m[1]!, 10))
  }

  for (let i = 1; i < nums.length; i++) {
    if (nums[i]! <= nums[i - 1]!) {
      console.error("Ordre ou numérotation incorrecte après tri :", files.join(", "))
      process.exit(1)
    }
  }

  const expected = []
  for (let n = nums[0]!; n <= nums[nums.length - 1]!; n++) {
    expected.push(n)
  }
  const missing = expected.filter((n) => !nums.includes(n))
  if (missing.length) {
    console.error("Numéros de migration manquants dans la plage :", missing.join(", "))
    process.exit(1)
  }

  console.log(`OK — ${files.length} migrations, plage ${nums[0]}–${nums[nums.length - 1]}.`)
}

main()
