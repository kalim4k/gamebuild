/* Prépare la base pour les bonus (page /bonus, api/bonus.mjs) :
   crée les trois tables, puis range le guide PDF (bonus 1) dans la base.

   Le guide est un produit payant : il ne va jamais dans le dépôt, qui est
   public. Il vit dans FORMATIONS/BONUS/ (exclu de git) et n'est servi que
   par /api/bonus, après vérification de l'achat.

   Usage, depuis la racine du projet, avec DATABASE_URL dans .env.local :
     node scripts/init-bonus.mjs                 tables seulement
     node scripts/init-bonus.mjs chemin/du.pdf   tables + guide */

import { readFileSync, existsSync } from "node:fs";
import { neon } from "@neondatabase/serverless";

if (!process.env.DATABASE_URL && existsSync(".env.local")) {
  for (const ligne of readFileSync(".env.local", "utf8").split(/\r?\n/)) {
    const m = ligne.match(/^([A-Z_]+)=(.*)$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].trim().replace(/^"|"$/g, "");
  }
}
if (!process.env.DATABASE_URL) { console.error("DATABASE_URL manque."); process.exit(1); }
const sql = neon(process.env.DATABASE_URL);

await sql`CREATE TABLE IF NOT EXISTS bonus_acces (
  vente_id  text PRIMARY KEY,
  rang      int,
  test      boolean NOT NULL DEFAULT false,
  jeu       jsonb,
  refaits   int NOT NULL DEFAULT 0,
  cree_le   timestamptz NOT NULL DEFAULT now(),
  vu_le     timestamptz NOT NULL DEFAULT now()
)`;
await sql`CREATE TABLE IF NOT EXISTS bonus_images (
  id        text PRIMARY KEY,
  vente_id  text NOT NULL,
  sorte     text NOT NULL,
  version   int NOT NULL DEFAULT 1,
  tache     text,
  etat      text NOT NULL DEFAULT 'attente',
  octets    bytea,
  type      text,
  cree_le   timestamptz NOT NULL DEFAULT now(),
  maj_le    timestamptz NOT NULL DEFAULT now()
)`;
await sql`CREATE INDEX IF NOT EXISTS bonus_images_vente ON bonus_images (vente_id, sorte, version)`;
await sql`CREATE TABLE IF NOT EXISTS bonus_fichiers (
  nom     text PRIMARY KEY,
  octets  bytea NOT NULL,
  type    text NOT NULL,
  maj_le  timestamptz NOT NULL DEFAULT now()
)`;
console.log("Tables prêtes.");

const pdf = process.argv[2];
if (pdf) {
  const octets = readFileSync(pdf);
  await sql`INSERT INTO bonus_fichiers (nom, octets, type) VALUES ('guide', ${octets}, 'application/pdf')
            ON CONFLICT (nom) DO UPDATE SET octets = EXCLUDED.octets, type = EXCLUDED.type, maj_le = now()`;
  const [r] = await sql`SELECT octet_length(octets) AS n FROM bonus_fichiers WHERE nom = 'guide'`;
  console.log("Guide rangé :", r.n, "octets.");
}
