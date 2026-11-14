/* Le live : jetons d'accès LiveKit et modération.

   La voix de l'animateur, les changements de slide et le chat passent par
   LiveKit Cloud. Ce site ne fait que distribuer les jetons d'accès :
   - un spectateur reçoit un jeton pour écouter et écrire dans le chat,
     sans pouvoir publier de son ni changer les slides ;
   - l'animateur reçoit un jeton complet, après son mot de passe.

   Variables à mettre dans les réglages de Vercel :
     LIVEKIT_URL         l'adresse du projet, du type wss://xxxx.livekit.cloud
     LIVEKIT_API_KEY     la clé d'API du projet
     LIVEKIT_API_SECRET  le secret qui va avec
     LIVE_MOT_DE_PASSE   le mot de passe de l'espace animateur (12 caractères ou plus)

   GET  /api/live                                   → le live est-il en cours ?
   POST /api/live { action: "jeton", nom }          → jeton de spectateur
   POST /api/live { action: "jeton", role: "animateur", motDePasse }
   POST /api/live { action: "chat", motDePasse, identite, autorise }
                                                    → couper ou rendre le chat à quelqu'un */

import { AccessToken, RoomServiceClient } from "livekit-server-sdk";
import { createHash, randomBytes, timingSafeEqual } from "node:crypto";

const SALLE = "gamebuild-live";
const ANIMATEUR = "animateur";      /* l'identité de l'animateur, que les pages reconnaissent */
const MAX_CORPS = 2000;

const URL_LIVE = process.env.LIVEKIT_URL || "";
const CLE = process.env.LIVEKIT_API_KEY || "";
const SECRET = process.env.LIVEKIT_API_SECRET || "";
const MOT_DE_PASSE = process.env.LIVE_MOT_DE_PASSE || "";

const configure = () => Boolean(URL_LIVE && CLE && SECRET);
const salle = () => new RoomServiceClient(URL_LIVE.replace(/^ws/, "http"), CLE, SECRET);

function bonMotDePasse(essai) {
  if (!MOT_DE_PASSE || typeof essai !== "string") return false;
  const a = createHash("sha256").update(essai).digest();
  const b = createHash("sha256").update(MOT_DE_PASSE).digest();
  return timingSafeEqual(a, b);
}

/* Un prénom affichable : pas de lien, pas de caractères de contrôle, 24 caractères au plus. */
function prenom(v) {
  if (typeof v !== "string") return null;
  const t = v.normalize("NFC").replace(/[\u0000-\u001f\u007f<>]/g, "").replace(/\s+/g, " ").trim().slice(0, 24);
  if (t.length < 2 || /https?:|www\.|\.com\b/i.test(t)) return null;
  return t;
}

async function jeton(identite, nom, droits, heures) {
  const at = new AccessToken(CLE, SECRET, { identity: identite, name: nom, ttl: heures * 3600 });
  at.addGrant({ room: SALLE, roomJoin: true, canSubscribe: true, ...droits });
  return at.toJwt();
}

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");

  if (req.method === "GET") {
    if (!configure()) { res.status(200).json({ configure: false, enDirect: false }); return; }
    try {
      const gens = await salle().listParticipants(SALLE);
      const anim = gens.find((p) => p.identity === ANIMATEUR);
      const etat = anim && anim.attributes ? anim.attributes.etat : "";
      res.setHeader("Cache-Control", "public, s-maxage=10, stale-while-revalidate=20");
      res.status(200).json({ configure: true, enDirect: etat === "direct", spectateurs: Math.max(0, gens.length - (anim ? 1 : 0)) });
    } catch {
      /* La salle n'existe pas tant que personne n'y est entré. */
      res.setHeader("Cache-Control", "public, s-maxage=10, stale-while-revalidate=20");
      res.status(200).json({ configure: true, enDirect: false, spectateurs: 0 });
    }
    return;
  }

  if (req.method !== "POST") { res.status(405).json({ erreur: "GET ou POST seulement" }); return; }
  if (!configure()) { res.status(503).json({ erreur: "Le live n'est pas encore configuré." }); return; }

  let corps = req.body;
  if (typeof corps === "string") {
    if (corps.length > MAX_CORPS) { res.status(413).json({ erreur: "Trop long." }); return; }
    try { corps = JSON.parse(corps); } catch { corps = null; }
  }
  if (!corps || typeof corps !== "object") { res.status(400).json({ erreur: "Requête illisible." }); return; }

  try {
    if (corps.action === "jeton" && corps.role === "animateur") {
      if (!bonMotDePasse(corps.motDePasse)) { res.status(403).json({ erreur: "Mot de passe incorrect." }); return; }
      const nom = prenom(corps.nom) || "Animateur";
      const j = await jeton(ANIMATEUR, nom, { canPublish: true, canPublishData: true, canUpdateOwnMetadata: true, roomAdmin: true }, 6);
      res.status(200).json({ url: URL_LIVE, jeton: j, identite: ANIMATEUR });
      return;
    }

    if (corps.action === "jeton") {
      const nom = prenom(corps.nom);
      if (!nom) { res.status(400).json({ erreur: "Écris ton prénom (2 lettres au moins, sans lien)." }); return; }
      const identite = "v-" + randomBytes(8).toString("hex");
      const j = await jeton(identite, nom, { canPublish: false, canPublishData: true, canUpdateOwnMetadata: false }, 4);
      res.status(200).json({ url: URL_LIVE, jeton: j, identite });
      return;
    }

    if (corps.action === "chat") {
      if (!bonMotDePasse(corps.motDePasse)) { res.status(403).json({ erreur: "Mot de passe incorrect." }); return; }
      const identite = typeof corps.identite === "string" ? corps.identite.slice(0, 40) : "";
      if (!/^v-[0-9a-f]{16}$/.test(identite)) { res.status(400).json({ erreur: "Spectateur inconnu." }); return; }
      await salle().updateParticipant(SALLE, identite, {
        permission: { canSubscribe: true, canPublish: false, canPublishData: corps.autorise === true, canUpdateMetadata: false }
      });
      res.status(200).json({ ok: true });
      return;
    }

    res.status(400).json({ erreur: "Action inconnue." });
  } catch (e) {
    console.error("live:", e && e.message);
    res.status(502).json({ erreur: "LiveKit ne répond pas. Réessaie dans un instant." });
  }
}
