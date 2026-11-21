/* Prépare la base pour l'espace des membres (/membres/…, api/membres.mjs) :
   crée la table des envois (liens directs et jeux) et celle des fichiers,
   puis range le playbook « Promouvoir son jeu » dans la base.

   Le playbook est réservé aux membres : il ne va jamais dans le dépôt, qui
   est public. Il pèse plus que ce qu'une fonction Vercel peut renvoyer
   (4,5 Mo) : au premier téléchargement, /api/membres le copie sur Vercel
   Blob, à une adresse impossible à deviner, puis y renvoie le visiteur.
   Ranger une nouvelle version efface l'ancienne adresse : la copie suivante
   se refait toute seule.

   Usage, depuis la racine du projet, avec DATABASE_URL dans .env.local :
     node scripts/init-membres.mjs                 tables seulement
     node scripts/init-membres.mjs chemin/du.pdf   tables + playbook (remplace l'ancien) */

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

/* sorte : « lien-direct » (Adsterra ou Monetag) ou « jeu ».
   Un même lien envoyé deux fois met la ligne à jour au lieu d'en créer une
   autre, et un membre n'a qu'un lien direct : le nouveau remplace l'ancien. */
await sql`CREATE TABLE IF NOT EXISTS envois_membres (
  id        bigserial PRIMARY KEY,
  sorte     text NOT NULL,
  prenom    text NOT NULL,
  whatsapp  text NOT NULL,
  regie     text,
  lien      text NOT NULL,
  nom_jeu   text,
  phrase    text,
  ip_hash   text,
  retenu    boolean NOT NULL DEFAULT false,
  cree_le   timestamptz NOT NULL DEFAULT now(),
  maj_le    timestamptz NOT NULL DEFAULT now(),
  UNIQUE (sorte, lien)
)`;
await sql`CREATE INDEX IF NOT EXISTS envois_membres_date ON envois_membres (sorte, maj_le DESC)`;
await sql`CREATE INDEX IF NOT EXISTS envois_membres_ip ON envois_membres (ip_hash, cree_le)`;
await sql`CREATE TABLE IF NOT EXISTS membres_fichiers (
  nom     text PRIMARY KEY,
  octets  bytea NOT NULL,
  type    text NOT NULL,
  url     text,
  maj_le  timestamptz NOT NULL DEFAULT now()
)`;
console.log("Tables prêtes.");

const pdf = process.argv[2];
if (pdf) {
  const octets = readFileSync(pdf);
  await sql`INSERT INTO membres_fichiers (nom, octets, type) VALUES ('playbook', ${octets}, 'application/pdf')
            ON CONFLICT (nom) DO UPDATE SET octets = EXCLUDED.octets, type = EXCLUDED.type, url = NULL, maj_le = now()`;
  const [r] = await sql`SELECT octet_length(octets) AS n FROM membres_fichiers WHERE nom = 'playbook'`;
  console.log("Playbook rangé :", r.n, "octets.");
}
