/**
 * Applique supabase/migrations/*.sql sur la base Postgres du projet Supabase.
 * Les fichiers déjà listés dans `public.app_schema_migrations` sont ignorés
 * (évite de rejouer tout le dossier à chaque exécution une fois enregistrés).
 *
 * Connexion (priorité) :
 * 1) DATABASE_URL / SUPABASE_DATABASE_URL si défini
 * 2) Connexion directe en IPv6 (hostname db.<ref>.supabase.co n’a souvent que des AAAA)
 * 3) URL « direct » classique (mot de passe dans l’URI)
 * 4) Pooler Session (postgres.<ref>@aws-0-<region>.pooler) en secours (IPv4)
 *
 * Variables : NEXT_PUBLIC_SUPABASE_URL + SUPABASE_DB_PASSWORD (+ optionnel SUPABASE_POOLER_REGION)
 *
 * npm run db:migrate
 */

import fs from "fs"
import path from "path"
import dns from "node:dns/promises"
import dotenv from "dotenv"
import pg from "pg"

dotenv.config({ path: ".env.local" })
dotenv.config()

/** Ordre : zones EU d’abord (beaucoup de projets EU), puis US / AP / autres */
const POOLER_REGION_FALLBACK = [
  "eu-west-1",
  "eu-west-2",
  "eu-central-1",
  "eu-central-2",
  "eu-west-3",
  "eu-north-1",
  "eu-south-1",
  "eu-south-2",
  "us-east-1",
  "us-east-2",
  "us-west-1",
  "us-west-2",
  "ca-central-1",
  "ca-west-1",
  "sa-east-1",
  "ap-south-1",
  "ap-southeast-1",
  "ap-southeast-2",
  "ap-southeast-3",
  "ap-southeast-4",
  "ap-northeast-1",
  "ap-northeast-2",
  "ap-east-1",
  "me-central-1",
  "me-south-1",
  "af-south-1",
  "il-central-1",
]

function parseSupabaseProjectRef(apiUrl: string): string | undefined {
  const u = apiUrl.trim().replace(/\/$/, "")
  const m = u.match(/^https?:\/\/([a-z0-9-]+)\.supabase\.co$/i)
  return m?.[1]
}

function buildDirectConnectionString(ref: string, password: string): string {
  const encodedUser = encodeURIComponent("postgres")
  const encodedPass = encodeURIComponent(password)
  return `postgresql://${encodedUser}:${encodedPass}@db.${ref}.supabase.co:5432/postgres`
}

function buildPoolerUrls(ref: string, password: string, region: string): string[] {
  const user = `postgres.${ref}`
  const base = `postgresql://${encodeURIComponent(user)}:${encodeURIComponent(password)}@aws-0-${region}.pooler.supabase.com`
  return [
    `${base}:5432/postgres`, // Session
    `${base}:6543/postgres`, // Transaction
  ]
}

async function connectDirectIpv6(ref: string, password: string): Promise<pg.Client | null> {
  const hostname = `db.${ref}.supabase.co`
  try {
    /** IPv6 uniquement : dns.lookup peut renvoyer ENOTFOUND sans essayer AAAA */
    const list = await dns.resolve6(hostname)
    const address = list[0]
    if (!address) return null
    const client = new pg.Client({
      host: address,
      port: 5432,
      user: "postgres",
      password,
      database: "postgres",
      ssl: { rejectUnauthorized: false },
    })
    await client.connect()
    return client
  } catch {
    return null
  }
}

function pgSslFromConnectionString(connectionString: string): pg.ConnectionConfig["ssl"] {
  return connectionString.includes("localhost")
    ? undefined
    : { rejectUnauthorized: false }
}

function hostHint(connectionString: string): string {
  try {
    const u = new URL(connectionString.replace(/^postgresql:/, "http:"))
    return `${u.hostname}:${u.port || "5432"}`
  } catch {
    return "(url)"
  }
}

function printMissingDbHelp(): void {
  console.error(`
Impossible de se connecter à Postgres pour la migration.

Le plus fiable : Dashboard → Connect → Session pooler (port 5432), copier l’URI complète :

   DATABASE_URL=postgresql://postgres.xxxxx:...@aws-0-REGION.pooler.supabase.com:5432/postgres

Sinon (mot de passe = celui de la base dans Settings → Database, pas les clés JWT) :

   NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
   SUPABASE_DB_PASSWORD=...

Si « password authentication failed » : réinitialise le mot de passe base dans le dashboard
et mets à jour SUPABASE_DB_PASSWORD.
`)
}

async function main() {
  const explicit =
    process.env.DATABASE_URL?.trim() ||
    process.env.SUPABASE_DATABASE_URL?.trim()

  const apiUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ||
    process.env.SUPABASE_URL?.trim()
  const password =
    process.env.SUPABASE_DB_PASSWORD?.trim() ||
    process.env.POSTGRES_PASSWORD?.trim() ||
    process.env.DATABASE_PASSWORD?.trim() ||
    process.env.PG_PASSWORD?.trim()

  const ref =
    process.env.SUPABASE_PROJECT_REF?.trim() ||
    (apiUrl ? parseSupabaseProjectRef(apiUrl) : undefined)

  const migrationsDir = path.join(process.cwd(), "supabase/migrations")
  if (!fs.existsSync(migrationsDir)) {
    console.error("Dossier migrations introuvable:", migrationsDir)
    process.exit(1)
  }

  const migrationFiles = fs
    .readdirSync(migrationsDir)
    .filter((f) => f.endsWith(".sql"))
    .sort()

  if (migrationFiles.length === 0) {
    console.warn("Aucun fichier .sql trouvé dans", migrationsDir)
    return
  }

  console.log(`Découvert ${migrationFiles.length} fichiers de migration.`)

  /** (label, factory) */

  type Attempt = { label: string; connect: () => Promise<pg.Client> }

  const attempts: Attempt[] = []

  if (explicit) {
    attempts.push({
      label: hostHint(explicit),
      connect: async () => {
        const c = new pg.Client({
          connectionString: explicit,
          ssl: pgSslFromConnectionString(explicit),
        })
        await c.connect()
        return c
      },
    })
  }

  if (password && ref) {
    attempts.push({
      label: `${ref} via IPv6 direct`,
      connect: async () => {
        const c = await connectDirectIpv6(ref, password)
        if (!c) throw new Error("IPv6 direct indisponible")
        return c
      },
    })

    const directCs = buildDirectConnectionString(ref, password)
    attempts.push({
      label: hostHint(directCs),
      connect: async () => {
        const c = new pg.Client({
          connectionString: directCs,
          ssl: pgSslFromConnectionString(directCs),
        })
        await c.connect()
        return c
      },
    })

    const preferred = process.env.SUPABASE_POOLER_REGION?.trim()
    const regionsOrdered = preferred
      ? [
          preferred,
          ...POOLER_REGION_FALLBACK.filter((r) => r !== preferred),
        ]
      : POOLER_REGION_FALLBACK

    for (const region of regionsOrdered) {
      const urls = buildPoolerUrls(ref, password, region)
      for (const cs of urls) {
        attempts.push({
          label: hostHint(cs),
          connect: async () => {
            const c = new pg.Client({
              connectionString: cs,
              ssl: pgSslFromConnectionString(cs),
            })
            await c.connect()
            return c
          },
        })
      }
    }
  }

  if (attempts.length === 0) {
    printMissingDbHelp()
    process.exit(1)
  }

  let lastErr: unknown
  for (const { label, connect } of attempts) {
    let client: pg.Client | undefined
    try {
      console.log(`Tentative de connexion : ${label}...`)
      client = await connect()

      await client.query(`
        create table if not exists public.app_schema_migrations (
          filename text primary key,
          applied_at timestamptz not null default now()
        );
      `)

      let appliedCount = 0
      for (const file of migrationFiles) {
        const already = await client.query(
          "select 1 from public.app_schema_migrations where filename = $1",
          [file],
        )
        if ((already.rowCount ?? 0) > 0) {
          console.log("Déjà enregistrée, ignorée:", file)
          continue
        }
        const sql = fs.readFileSync(path.join(migrationsDir, file), "utf8")
        await client.query("BEGIN")
        try {
          await client.query(sql)
          await client.query("insert into public.app_schema_migrations (filename) values ($1)", [file])
          await client.query("COMMIT")
        } catch (migrationErr) {
          await client.query("ROLLBACK").catch(() => {})
          throw migrationErr
        }
        console.log("Migration appliquée:", file)
        appliedCount += 1
      }

      console.log(
        `🎉 Migrations : ${appliedCount} nouvelle(s) sur ${migrationFiles.length} fichier(s) (via ${label}).`,
      )
      await client.end()
      return
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : String(e)
      console.warn(`❌ Échec sur ${label}: ${message}`)
      lastErr = e
      await client?.end().catch(() => {})
      // On continue vers l'essai suivant si celui-ci a échoué à la connexion ou à la requête
    }
  }

  console.error(`\n😭 Échec final après ${attempts.length} tentative(s).`)
  if (lastErr instanceof Error) {
    console.error("Dernière erreur détaillée:", lastErr.message)
  }
  process.exit(1)
}

main()
