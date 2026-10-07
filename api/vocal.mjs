/* Reçoit une question de visiteur et dit quel vocal lui jouer.

   Trois manières de poser une question :
   - un bouton      → { cle: "coder" }
   - un texte       → { texte: "j'ai pas de pc" }      → trié par Claude ou par mots-clés
   - un vocal       → { audio: "<base64>", mime }      → transcrit par ElevenLabs, puis trié

   Réponse : le vocal à jouer, l'adresse du salut dans ta voix, et s'il
   faut proposer WhatsApp (quand aucune objection n'a été reconnue). */

import { neon } from "@neondatabase/serverless";
import {
  chargeConfig, normalisePrenom, affichePrenom, empreinte,
  choisitVersion, classe, elevenLabsPret, transcrit
} from "./_vocaux.mjs";

const sql = process.env.DATABASE_URL ? neon(process.env.DATABASE_URL) : null;

const MAX_AUDIO = 1_500_000;   // octets — un vocal d'environ une minute et demie
const MAX_TEXTE = 600;         // signes
const MAX_PAR_HEURE = 12;      // questions par visiteur : au-delà, on renvoie vers WhatsApp

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  if (req.method !== "POST") { res.status(405).json({ erreur: "POST seulement." }); return; }

  let c = req.body;
  if (typeof c === "string") { try { c = JSON.parse(c); } catch { c = null; } }
  if (!c || typeof c !== "object") { res.status(400).json({ erreur: "Requête illisible." }); return; }

  const session = typeof c.session === "string" ? c.session.trim().slice(0, 40) : "";
  if (!session) { res.status(400).json({ erreur: "Session manquante." }); return; }

  let config;
  try { config = await chargeConfig(req); }
  catch (e) {
    console.error("vocal, config :", e && e.message);
    res.status(503).json({ erreur: "Les réponses vocales sont indisponibles pour l'instant.", whatsapp: true });
    return;
  }

  const visiteur = empreinte(req);

  /* Garde-fou : chaque question libre coûte une transcription et un tri. */
  if (sql) {
    try {
      const [{ n }] = await sql`
        select count(*)::int as n from questions
        where visiteur = ${visiteur} and cree_le > now() - interval '1 hour'`;
      if (n >= MAX_PAR_HEURE) {
        res.status(429).json({
          erreur: "Tu m'as déjà posé beaucoup de questions — écris-moi directement sur WhatsApp, ce sera plus simple.",
          whatsapp: true
        });
        return;
      }
    } catch (e) { console.error("vocal, quota :", e && e.message); }
  }

  /* ---------- Quelle objection ? ---------- */
  let canal, texte = null, objection;
  const parBouton = config.objections.find(o => o.cle === c.cle);

  if (parBouton) {
    canal = "bouton";
    objection = parBouton.cle;
  } else if (typeof c.audio === "string" && c.audio) {
    canal = "vocal";
    if (!elevenLabsPret()) {
      res.status(503).json({ erreur: "Les questions vocales ne sont pas encore ouvertes : écris ta question." });
      return;
    }
    const audio = Buffer.from(c.audio, "base64");
    if (audio.length < 800) { res.status(422).json({ erreur: "Ton vocal est trop court, réessaie." }); return; }
    if (audio.length > MAX_AUDIO) { res.status(413).json({ erreur: "Ton vocal est trop long : une minute suffit." }); return; }
    try {
      texte = (await transcrit(audio, String(c.mime || ""))).slice(0, MAX_TEXTE);
    } catch (e) {
      console.error("vocal, transcription :", e && e.message);
      res.status(502).json({ erreur: "Je n'ai pas réussi à écouter ton vocal. Tu peux écrire ta question ?" });
      return;
    }
    if (!texte) { res.status(422).json({ erreur: "Je n'ai rien entendu. Réessaie, ou écris ta question." }); return; }
    objection = (await classe(texte, config.objections)).cle;
  } else if (typeof c.texte === "string" && c.texte.trim()) {
    canal = "texte";
    texte = c.texte.trim().slice(0, MAX_TEXTE);
    objection = (await classe(texte, config.objections)).cle;
  } else {
    res.status(400).json({ erreur: "Choisis une question, ou écris la tienne." });
    return;
  }

  /* ---------- Quel vocal ? ---------- */
  const fichiers = objection === "generale"
    ? config.generale
    : (config.objections.find(o => o.cle === objection) || { fichiers: [] }).fichiers;
  const fichier = fichiers.length ? choisitVersion(fichiers, session + "|" + objection) : null;

  /* ---------- Le prénom, filtré ---------- */
  const clePrenom = normalisePrenom(c.prenom, config.interdits);

  if (sql) {
    try {
      await sql`
        insert into questions (session, visiteur, prenom, canal, objection, texte, fichier)
        values (${session}, ${visiteur}, ${clePrenom}, ${canal}, ${objection}, ${texte}, ${fichier})`;
    } catch (e) { console.error("vocal, enregistrement :", e && e.message); }
  }

  res.status(200).json({
    objection,
    canal,
    texte,
    prenom: clePrenom ? affichePrenom(clePrenom) : null,
    fichier: fichier ? "/media/vocaux/" + fichier : null,
    salut: elevenLabsPret() ? "/api/salut?p=" + encodeURIComponent(clePrenom || "_") : null,
    whatsapp: objection === "generale"
  });
}
