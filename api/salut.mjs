/* Sert « Salut Kossi, j'espère que tu vas bien. » dans ta voix clonée.

   Chaque prénom n'est généré qu'UNE fois chez ElevenLabs, puis rangé dans
   Neon et resservi : le millième Kossi ne coûte plus rien.

   Garde-fous :
   - le prénom passe par le même filtre que dans /api/vocal ; tout ce qui
     n'est pas propre retombe sur le salut sans prénom ;
   - plafond de nouveaux prénoms par jour (SALUT_MAX_JOUR, 300 par défaut) :
     au-delà, salut sans prénom. Une attaque qui inventerait des milliers
     de prénoms coûterait au pire un dollar par jour ;
   - réponses partielles (206) gérées : Safari sur iPhone les exige pour
     lire un son. */

import { neon } from "@neondatabase/serverless";
import { chargeConfig, normalisePrenom, texteSalut, elevenLabsPret, synthese, versionVoix } from "./_vocaux.mjs";

const sql = process.env.DATABASE_URL ? neon(process.env.DATABASE_URL) : null;
const MAX_NOUVEAUX_PAR_JOUR = Math.max(0, parseInt(process.env.SALUT_MAX_JOUR || "300", 10) || 300);

/* Stocké sous « kossi|<version de voix> » : un salut fait avec une autre
   voix ou un autre modèle n'est jamais resservi. */
function stockage(cle) { return cle + "|" + versionVoix(); }

async function lit(cle) {
  const [l] = await sql`select encode(audio, 'base64') as b64 from saluts where cle = ${stockage(cle)}`;
  return l ? Buffer.from(l.b64, "base64") : null;
}

async function genere(cle) {
  const texte = texteSalut(cle);
  const audio = await synthese(texte);
  await sql`
    insert into saluts (cle, texte, audio)
    values (${stockage(cle)}, ${texte}, decode(${audio.toString("base64")}, 'base64'))
    on conflict (cle) do nothing`;
  return audio;
}

function envoieAudio(req, res, audio, cache) {
  res.setHeader("Content-Type", "audio/mpeg");
  res.setHeader("Accept-Ranges", "bytes");
  res.setHeader("Cache-Control", cache);

  const m = /^bytes=(\d*)-(\d*)$/.exec(String(req.headers.range || "").trim());
  if (m && (m[1] || m[2])) {
    const total = audio.length;
    let debut = m[1] ? parseInt(m[1], 10) : Math.max(0, total - parseInt(m[2], 10));
    let fin = m[1] && m[2] ? parseInt(m[2], 10) : total - 1;
    if (fin >= total) fin = total - 1;
    if (!(debut >= 0) || debut > fin) {
      res.statusCode = 416;
      res.setHeader("Content-Range", "bytes */" + total);
      res.end();
      return;
    }
    res.statusCode = 206;
    res.setHeader("Content-Range", "bytes " + debut + "-" + fin + "/" + total);
    res.setHeader("Content-Length", String(fin - debut + 1));
    res.end(req.method === "HEAD" ? undefined : audio.subarray(debut, fin + 1));
    return;
  }

  res.statusCode = 200;
  res.setHeader("Content-Length", String(audio.length));
  res.end(req.method === "HEAD" ? undefined : audio);
}

export default async function handler(req, res) {
  if (req.method !== "GET" && req.method !== "HEAD") { res.statusCode = 405; res.end(); return; }
  if (!sql) { res.statusCode = 503; res.end(); return; }

  /* Sans voix réglée, rien à lire ni à générer : la clé de stockage
     dépend de la voix. */
  if (!elevenLabsPret()) { res.statusCode = 404; res.end(); return; }

  let interdits = [];
  try { interdits = (await chargeConfig(req)).interdits; } catch { /* filtre de base seulement */ }
  const demande = String((req.query && req.query.p) || "_");
  const cle = demande === "_" ? "_" : (normalisePrenom(demande, interdits) || "_");

  try {
    let audio = await lit(cle);
    let cache = "public, max-age=604800";

    if (!audio) {
      let cible = cle;
      if (cle !== "_") {
        const [{ n }] = await sql`select count(*)::int as n from saluts where cree_le > now() - interval '1 day'`;
        if (n >= MAX_NOUVEAUX_PAR_JOUR) {
          cible = "_";
          cache = "no-store";   // ne pas figer un salut anonyme à l'adresse d'un prénom
        }
      }
      audio = (cible !== cle && await lit(cible)) || await genere(cible);
    }

    envoieAudio(req, res, audio, cache);
  } catch (e) {
    console.error("salut :", e && e.message);
    res.statusCode = 502;
    res.end();
  }
}
