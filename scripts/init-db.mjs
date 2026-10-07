/* Crée (ou complète) le schéma des statistiques dans Neon.
   Sans danger : tout est en « IF NOT EXISTS », rien n'est supprimé.
   Usage :  npm run init-db
   La chaîne de connexion est lue dans .env.local, qui n'est jamais
   versionné. */

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { neon } from "@neondatabase/serverless";

/* ---------- Lecture de .env.local, sans dépendance ---------- */
function lisEnv(chemin) {
  let brut = "";
  try { brut = readFileSync(chemin, "utf8"); } catch { return {}; }
  const out = {};
  for (const ligne of brut.split(/\r?\n/)) {
    const m = ligne.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/i);
    if (!m) continue;
    out[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
  return out;
}

const env = { ...lisEnv(fileURLToPath(new URL("../.env.local", import.meta.url))), ...process.env };
const url = env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL manquante. Mets-la dans .env.local :");
  console.error('  DATABASE_URL="postgresql://..."');
  process.exit(1);
}

const sql = neon(url);

const etapes = [
  ["table evenements", `
    create table if not exists evenements (
      id        bigserial    primary key,
      vu_le     timestamptz  not null default now(),
      type      text         not null,
      visiteur  text         not null,
      session   text         not null,
      source    text,
      campagne  text,
      referent  text,
      pays      text,
      appareil  text,
      libelle   text,
      valeur    integer,
      promo     boolean
    )`],
  ["index par date",      `create index if not exists evenements_date_idx    on evenements (vu_le desc)`],
  ["index par type",      `create index if not exists evenements_type_idx    on evenements (type, vu_le desc)`],
  ["index par visiteur",  `create index if not exists evenements_visiteur_idx on evenements (visiteur)`],
  ["index par session",   `create index if not exists evenements_session_idx on evenements (session)`],

  /* ---------- Réponses vocales ---------- */
  ["table questions", `
    create table if not exists questions (
      id         bigserial    primary key,
      cree_le    timestamptz  not null default now(),
      session    text         not null,
      visiteur   text         not null,
      prenom     text,
      canal      text         not null,   -- bouton | texte | vocal
      objection  text         not null,   -- clé reconnue, ou « generale »
      texte      text,                    -- question écrite ou transcription
      fichier    text                     -- vocal joué
    )`],
  ["index questions par date",    `create index if not exists questions_date_idx     on questions (cree_le desc)`],
  ["index questions par session", `create index if not exists questions_session_idx  on questions (session)`],
  ["index questions par visiteur",`create index if not exists questions_visiteur_idx on questions (visiteur, cree_le desc)`],

  /* Un salut par prénom, généré une seule fois dans ta voix puis resservi.
     « _ » est le salut sans prénom. */
  ["table saluts", `
    create table if not exists saluts (
      cle      text         primary key,
      texte    text         not null,
      audio    bytea        not null,
      cree_le  timestamptz  not null default now()
    )`]
];

console.log("Connexion à Neon…");
for (const [nom, ddl] of etapes) {
  await sql(ddl);
  console.log("  ✓ " + nom);
}

for (const table of ["questions", "saluts"]) {
  const [{ n }] = await sql(`select count(*)::int as n from ${table}`);
  console.log("  table " + table + " : " + n + " lignes");
}

const [{ version }] = await sql`select version()`;
const [{ n }] = await sql`select count(*)::int as n from evenements`;
const colonnes = await sql`
  select column_name, data_type
  from information_schema.columns
  where table_name = 'evenements'
  order by ordinal_position`;

console.log("\n" + version.split(",")[0]);
console.log("table evenements : " + colonnes.length + " colonnes, " + n + " lignes");
console.log(colonnes.map(c => "  " + c.column_name.padEnd(10) + c.data_type).join("\n"));
