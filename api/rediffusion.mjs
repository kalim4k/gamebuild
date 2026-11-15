/* Les rediffusions du live, rangées dans Vercel Blob.

   À la fin d'un live, le studio enregistre deux fichiers :
     rediffusions/<date>-voix.(webm|m4a)   la voix de l'animateur
     rediffusions/<date>-live.json         le minutage des slides et de l'offre,
                                           les slides elles-mêmes et l'adresse de la voix
   La page /rediffusion lit le dernier fichier « -live.json » et rejoue le tout
   depuis le stockage de Vercel, sans LiveKit : la rediffusion ne consomme
   aucune minute.

   Variables : BLOB_READ_WRITE_TOKEN (ajoutée par Vercel quand on relie un
   magasin Blob au projet) et LIVE_MOT_DE_PASSE (le même que pour le studio).

   POST /api/rediffusion   le protocole d'envoi de @vercel/blob (jeton d'envoi
                           donné seulement avec le mot de passe du studio)
   GET  /api/rediffusion   la liste des rediffusions, la plus récente d'abord */

import { handleUpload } from "@vercel/blob/client";
import { list } from "@vercel/blob";
import { createHash, timingSafeEqual } from "node:crypto";

const DOSSIER = "rediffusions/";
const TYPES = ["audio/webm", "audio/mp4", "audio/ogg", "audio/aac", "application/json"];
const MOT_DE_PASSE = process.env.LIVE_MOT_DE_PASSE || "";

function bonMotDePasse(essai) {
  if (!MOT_DE_PASSE || typeof essai !== "string") return false;
  const a = createHash("sha256").update(essai).digest();
  const b = createHash("sha256").update(MOT_DE_PASSE).digest();
  return timingSafeEqual(a, b);
}

export default async function handler(req, res) {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    res.setHeader("Cache-Control", "no-store");
    if (req.method === "GET") { res.status(200).json({ configure: false, rediffusions: [] }); return; }
    res.status(503).json({ error: "Le stockage des rediffusions n'est pas encore relié au site." });
    return;
  }

  if (req.method === "GET") {
    try {
      const { blobs } = await list({ prefix: DOSSIER, limit: 200 });
      /* Vercel ajoute un suffixe au hasard avant l'extension : « …-live-Ab12Cd.json ». */
      const rediffusions = blobs
        .map((b) => ({ b, m: b.pathname.match(/^rediffusions\/([0-9T-]+)-live(?:-[A-Za-z0-9]+)?\.json$/) }))
        .filter((x) => x.m)
        .sort((x, y) => new Date(y.b.uploadedAt) - new Date(x.b.uploadedAt))
        .map((x) => ({ id: x.m[1], url: x.b.url, date: x.b.uploadedAt }));
      /* Le minutage de la rediffusion demandée (ou de la plus récente) est renvoyé
         tel quel : la page n'a pas à le lire sur un autre domaine. */
      const voulu = typeof req.query?.id === "string" ? req.query.id : "";
      const choisie = rediffusions.find((r) => !voulu || r.id === voulu);
      let meta = null;
      if (choisie) {
        const r = await fetch(choisie.url);
        if (r.ok) meta = await r.json();
      }
      res.setHeader("Cache-Control", "public, s-maxage=60, stale-while-revalidate=300");
      res.status(200).json({ configure: true, rediffusions, meta });
    } catch (e) {
      console.error("rediffusion:", e && e.message);
      res.setHeader("Cache-Control", "no-store");
      res.status(502).json({ configure: true, rediffusions: [], erreur: "Stockage indisponible." });
    }
    return;
  }

  if (req.method !== "POST") { res.status(405).json({ error: "GET ou POST seulement" }); return; }

  let corps = req.body;
  if (typeof corps === "string") { try { corps = JSON.parse(corps); } catch { corps = null; } }
  if (!corps || typeof corps !== "object") { res.status(400).json({ error: "Requête illisible." }); return; }

  try {
    const reponse = await handleUpload({
      body: corps,
      request: req,
      onBeforeGenerateToken: async (pathname, clientPayload) => {
        let p = null;
        try { p = JSON.parse(clientPayload || "null"); } catch { p = null; }
        if (!p || !bonMotDePasse(p.motDePasse)) throw new Error("Mot de passe incorrect.");
        if (!pathname.startsWith(DOSSIER) || !/^rediffusions\/[0-9T-]+-(voix\.(webm|m4a|ogg)|live\.json)$/.test(pathname)) throw new Error("Nom de fichier refusé.");
        return { allowedContentTypes: TYPES, maximumSizeInBytes: 300 * 1024 * 1024, addRandomSuffix: true };
      }
    });
    res.status(200).json(reponse);
  } catch (e) {
    res.status(400).json({ error: (e && e.message) || "Envoi refusé." });
  }
}
