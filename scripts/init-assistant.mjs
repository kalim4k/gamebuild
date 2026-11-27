/* Prépare l'assistant des membres : crée ses deux tables et range le savoir.

   Usage : node scripts/init-assistant.mjs <savoir.json>

   savoir.json : [{id, ordre, titre, adresse, duree, texte}], une entrée par
   vidéo de formation, « texte » étant la transcription minutée ([m:ss] …).
   Ce fichier ne va JAMAIS dans le dépôt, qui est public : les vidéos des
   membres sont réservées. Relancer le script remplace le savoir : une vidéo
   absente du fichier est retirée. Lit DATABASE_URL dans .env.local. */

import { readFileSync } from "node:fs";
import { neon } from "@neondatabase/serverless";

const fichier = process.argv[2];
if (!fichier) { console.error("Usage : node scripts/init-assistant.mjs <savoir.json>"); process.exit(1); }

if (!process.env.DATABASE_URL) {
  for (const l of readFileSync(new URL("../.env.local", import.meta.url), "utf8").split(/\r?\n/)) {
    const m = l.match(/^\s*DATABASE_URL\s*=\s*(.*)\s*$/);
    if (m) process.env.DATABASE_URL = m[1].replace(/^["']|["']$/g, "");
  }
}
const sql = neon(process.env.DATABASE_URL);

await sql`create table if not exists assistant_savoir (
  id       text primary key,
  ordre    int  not null default 0,
  titre    text not null,
  adresse  text not null,
  duree    text,
  texte    text not null,
  maj_le   timestamptz not null default now()
)`;
await sql`create table if not exists assistant_questions (
  id          bigserial primary key,
  cree_le     timestamptz not null default now(),
  visiteur    text not null,
  question    text not null,
  reponse     text,
  modele      text,
  entree      int,
  cache_lu    int,
  cache_ecrit int,
  sortie      int,
  ms          int,
  erreur      text
)`;
await sql`create index if not exists assistant_questions_date_idx on assistant_questions (cree_le desc)`;
await sql`create index if not exists assistant_questions_visiteur_idx on assistant_questions (visiteur, cree_le desc)`;

const videos = JSON.parse(readFileSync(fichier, "utf8"));
if (!Array.isArray(videos) || !videos.length) throw new Error("savoir.json vide");
for (const v of videos) {
  if (!v.id || !v.titre || !v.adresse || !v.texte) throw new Error("entrée incomplète : " + JSON.stringify(v).slice(0, 80));
  await sql`insert into assistant_savoir (id, ordre, titre, adresse, duree, texte, maj_le)
    values (${v.id}, ${v.ordre || 0}, ${v.titre}, ${v.adresse}, ${v.duree || null}, ${v.texte}, now())
    on conflict (id) do update set ordre = excluded.ordre, titre = excluded.titre, adresse = excluded.adresse,
      duree = excluded.duree, texte = excluded.texte, maj_le = now()`;
}
const ids = videos.map(v => v.id);
await sql`delete from assistant_savoir where not (id = any(${ids}))`;
const [n] = await sql`select count(*)::int as n, sum(length(texte))::int as caracteres from assistant_savoir`;
console.log(`Savoir rangé : ${n.n} vidéos, ${n.caracteres} caractères.`);
