/* L'espace des membres (/membres/…) : le playbook et les deux formulaires
   de la vidéo « Promouvoir son jeu ».

   Le playbook : rangé dans la base (node scripts/init-membres.mjs), jamais
   dans le dépôt, qui est public. Il pèse plus que ce qu'une fonction peut
   renvoyer (4,5 Mo) : au premier téléchargement, on le copie sur Vercel Blob
   dans un dossier au nom tiré au hasard, on garde l'adresse dans la base, et
   chaque téléchargement est renvoyé vers cette copie.

   Les envois :
     « lien-direct » : le Smartlink Adsterra ou le Direct Link Monetag du
                       membre. Un seul par membre (le playbook demande une
                       seule régie) : un nouvel envoi remplace l'ancien.
     « jeu »         : le lien du jeu, pour la sélection partagée dans la
                       chaîne WhatsApp. Le même lien renvoyé met la ligne à jour.

   Variables : DATABASE_URL, ADMIN_MOT_DE_PASSE (l'admin), HASH_SEL (les
   adresses IP ne sont gardées que hachées), BLOB_READ_WRITE_TOKEN (la copie
   du playbook, ajoutée par Vercel quand le stockage Blob est relié).

   GET  ?fichier=playbook                       -> redirige vers le PDF
   POST {sorte:"lien-direct", prenom, whatsapp, regie, lien}
   POST {sorte:"jeu", prenom, whatsapp, nom_jeu, lien, phrase}
   GET  ?liste=1                     (x-mdp)    -> les envois, pour l'admin
   POST {action:"retenir", id, retenu} (x-mdp)  -> coche « retenu » */

import { neon } from "@neondatabase/serverless";
import { put } from "@vercel/blob";
import { createHash, randomBytes, timingSafeEqual } from "node:crypto";

const sql = process.env.DATABASE_URL ? neon(process.env.DATABASE_URL) : null;
const SEL = process.env.HASH_SEL || "gb-membres";
const ENVOIS_PAR_JOUR = 20;      /* par adresse IP : de quoi corriger une erreur, pas de quoi inonder */

/* ---------- Outils ---------- */

function memeMotDePasse(donne, attendu) {
  if (!attendu) return false;
  const a = Buffer.from(String(donne || ""));
  const b = Buffer.from(attendu);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

function ipHash(req) {
  const ip = String(req.headers["x-forwarded-for"] || req.socket?.remoteAddress || "").split(",")[0].trim();
  return createHash("sha256").update(SEL + "|" + ip).digest("hex").slice(0, 24);
}

function texte(v, max) {
  return String(v == null ? "" : v).replace(/[\u0000-\u001f\u007f]/g, " ").replace(/\s+/g, " ").trim().slice(0, max);
}

/* Le numéro tel qu'il est tapé, réduit à ses chiffres (avec le + s'il y est). */
function numero(v) {
  const s = String(v == null ? "" : v).trim();
  const chiffres = s.replace(/\D/g, "");
  if (chiffres.length < 8 || chiffres.length > 15) return "";
  return (s.startsWith("+") || s.startsWith("00") ? "+" : "") + chiffres.replace(/^00/, "");
}

/* Une adresse web complète, en http ou https. On ajoute https:// s'il manque. */
function lienWeb(v) {
  let s = String(v == null ? "" : v).trim();
  if (!s || s.length > 600 || /\s/.test(s)) return null;
  if (!/^https?:\/\//i.test(s)) s = "https://" + s;
  try {
    const u = new URL(s);
    if (!/^https?:$/.test(u.protocol) || !u.hostname.includes(".")) return null;
    return u;
  } catch { return null; }
}

function lisCorps(req) {
  let c = req.body;
  if (typeof c === "string") { try { c = JSON.parse(c); } catch { c = null; } }
  return c && typeof c === "object" ? c : null;
}

/* ---------- Le playbook ---------- */

async function playbook(res) {
  const [f] = await sql`SELECT url, maj_le FROM membres_fichiers WHERE nom = 'playbook'`;
  if (!f) { res.status(404).send("Le playbook n'est pas encore en ligne."); return; }
  let url = f.url;
  if (!url) {
    if (!process.env.BLOB_READ_WRITE_TOKEN) { res.status(503).send("Le stockage des fichiers n'est pas relié."); return; }
    const [g] = await sql`SELECT octets, type FROM membres_fichiers WHERE nom = 'playbook'`;
    const dossier = "membres/" + randomBytes(12).toString("hex");
    const copie = await put(dossier + "/Playbook-Promouvoir-son-jeu.pdf", Buffer.from(g.octets), {
      access: "public", contentType: g.type, cacheControlMaxAge: 86400
    });
    url = copie.downloadUrl;
    /* Seulement si personne n'a rangé une nouvelle version entre-temps. */
    await sql`UPDATE membres_fichiers SET url = ${url} WHERE nom = 'playbook' AND maj_le = ${f.maj_le}`;
  }
  res.setHeader("Cache-Control", "no-store");
  res.redirect(302, url);
}

/* ---------- Les envois des membres ---------- */

async function envoi(req, res, c) {
  if (c.site) { res.status(200).json({ ok: true }); return; }   /* champ piège : un robot l'a rempli */

  const sorte = c.sorte === "lien-direct" || c.sorte === "jeu" ? c.sorte : "";
  const prenom = texte(c.prenom, 40);
  const whatsapp = numero(c.whatsapp);
  const u = lienWeb(c.lien);
  if (!sorte) { res.status(400).json({ erreur: "Formulaire inconnu." }); return; }
  if (!prenom) { res.status(400).json({ erreur: "Écris ton prénom.", champ: "prenom" }); return; }
  if (!whatsapp) { res.status(400).json({ erreur: "Vérifie ton numéro WhatsApp, avec l'indicatif du pays.", champ: "whatsapp" }); return; }
  if (!u) { res.status(400).json({ erreur: "Colle un lien complet, qui commence par https://", champ: "lien" }); return; }
  const lien = u.href;
  const hote = u.hostname.toLowerCase();

  let regie = null, nomJeu = null, phrase = null;
  if (sorte === "lien-direct") {
    regie = c.regie === "adsterra" || c.regie === "monetag" ? c.regie : "";
    if (!regie) { res.status(400).json({ erreur: "Choisis ta régie : Adsterra ou Monetag.", champ: "regie" }); return; }
    if (/(^|\.)jouable\.app$/.test(hote)) {
      res.status(400).json({ erreur: "Ici, c'est ton lien direct Adsterra ou Monetag. Le lien de ton jeu va dans le formulaire suivant.", champ: "lien" });
      return;
    }
    if (/(^|\.)(adsterra\.com|monetag\.com)$/.test(hote)) {
      res.status(400).json({ erreur: "Ce lien ouvre ton compte, pas des pubs. Copie le lien direct que la régie te donne.", champ: "lien" });
      return;
    }
  } else {
    nomJeu = texte(c.nom_jeu, 60);
    phrase = texte(c.phrase, 160) || null;
    if (!nomJeu) { res.status(400).json({ erreur: "Écris le nom de ton jeu.", champ: "nom_jeu" }); return; }
  }

  const ip = ipHash(req);
  const [n] = await sql`SELECT count(*)::int AS n FROM envois_membres WHERE ip_hash = ${ip} AND maj_le > now() - interval '1 day'`;
  if (n.n >= ENVOIS_PAR_JOUR) { res.status(429).json({ erreur: "Tu as déjà beaucoup envoyé aujourd'hui. Réessaie demain." }); return; }

  if (sorte === "lien-direct") {
    /* Un seul lien direct par membre : on remplace le précédent. */
    const maj = await sql`
      UPDATE envois_membres SET prenom = ${prenom}, regie = ${regie}, lien = ${lien}, ip_hash = ${ip}, maj_le = now()
      WHERE sorte = 'lien-direct' AND whatsapp = ${whatsapp}
        AND NOT EXISTS (SELECT 1 FROM envois_membres x WHERE x.sorte = 'lien-direct' AND x.lien = ${lien} AND x.whatsapp <> ${whatsapp})
      RETURNING id`;
    if (maj.length) { res.status(200).json({ ok: true, remplace: true }); return; }
  }
  await sql`
    INSERT INTO envois_membres (sorte, prenom, whatsapp, regie, lien, nom_jeu, phrase, ip_hash)
    VALUES (${sorte}, ${prenom}, ${whatsapp}, ${regie}, ${lien}, ${nomJeu}, ${phrase}, ${ip})
    ON CONFLICT (sorte, lien) DO UPDATE SET
      prenom = EXCLUDED.prenom, whatsapp = EXCLUDED.whatsapp, regie = EXCLUDED.regie,
      nom_jeu = EXCLUDED.nom_jeu, phrase = EXCLUDED.phrase, ip_hash = EXCLUDED.ip_hash, maj_le = now()`;
  res.status(200).json({ ok: true });
}

/* ---------- L'admin ---------- */

async function liste(res) {
  const lignes = await sql`
    SELECT id, sorte, prenom, whatsapp, regie, lien, nom_jeu, phrase, retenu, cree_le, maj_le
    FROM envois_membres ORDER BY maj_le DESC LIMIT 1000`;
  res.status(200).json({
    jeux: lignes.filter((l) => l.sorte === "jeu"),
    liens: lignes.filter((l) => l.sorte === "lien-direct")
  });
}

/* ---------- La fonction ---------- */

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  if (!sql) { res.status(503).json({ erreur: "La base n'est pas reliée." }); return; }

  try {
    const q = req.query || {};
    if (req.method === "GET" && q.fichier === "playbook") { await playbook(res); return; }

    const admin = memeMotDePasse(req.headers["x-mdp"], process.env.ADMIN_MOT_DE_PASSE);
    if (req.method === "GET" && q.liste) {
      if (!admin) { res.status(401).json({ erreur: "Mot de passe incorrect." }); return; }
      await liste(res);
      return;
    }

    if (req.method !== "POST") { res.status(405).json({ erreur: "GET ou POST seulement." }); return; }
    const c = lisCorps(req);
    if (!c) { res.status(400).json({ erreur: "Requête illisible." }); return; }

    if (c.action === "retenir") {
      if (!admin) { res.status(401).json({ erreur: "Mot de passe incorrect." }); return; }
      const id = parseInt(c.id, 10);
      if (!id) { res.status(400).json({ erreur: "id" }); return; }
      await sql`UPDATE envois_membres SET retenu = ${!!c.retenu} WHERE id = ${id}`;
      res.status(200).json({ ok: true });
      return;
    }

    await envoi(req, res, c);
  } catch (e) {
    console.error("membres:", e && e.message);
    res.status(500).json({ erreur: "Un souci de notre côté. Réessaie dans un instant." });
  }
}
