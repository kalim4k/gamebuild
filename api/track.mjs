/* Reçoit les événements de la page de vente et les range dans Neon.
   Appelée par le petit script en bas d'index.html.

   Règle absolue : cette fonction ne doit JAMAIS faire échouer la page
   de vente. En cas de problème de base, elle répond quand même 204 et
   le visiteur ne voit rien.

   Vie privée : on n'enregistre aucune adresse IP. Le compteur de
   visiteurs uniques repose sur une empreinte à sens unique (SHA-256 de
   l'IP + navigateur + un sel secret), qu'on ne peut pas remonter vers
   une personne, et qui n'est pas stockée sur son appareil. */

import { neon } from "@neondatabase/serverless";
import { createHash } from "node:crypto";

const TYPES = new Set(["vue", "scroll", "clic", "sortie"]);
const MAX_CORPS = 2000;              // un événement légitime fait ~200 octets

const sql = process.env.DATABASE_URL ? neon(process.env.DATABASE_URL) : null;

function texte(v, max) {
  if (typeof v !== "string") return null;
  const t = v.trim();
  return t ? t.slice(0, max) : null;
}

function entier(v, min, max) {
  const n = Number(v);
  if (!Number.isFinite(n)) return null;
  return Math.min(max, Math.max(min, Math.round(n)));
}

function appareilDe(ua) {
  const u = (ua || "").toLowerCase();
  if (/ipad|tablet|playbook|silk|android(?!.*mobi)/.test(u)) return "tablette";
  if (/mobi|iphone|ipod|android|blackberry|iemobile|opera mini/.test(u)) return "mobile";
  return "ordinateur";
}

export default async function handler(req, res) {
  if (req.method === "OPTIONS") { res.status(204).end(); return; }
  if (req.method !== "POST") { res.status(405).json({ erreur: "POST seulement" }); return; }

  /* On répond toujours 204, quoi qu'il arrive en dessous. */
  const fini = () => { if (!res.writableEnded) res.status(204).end(); };

  try {
    if (!sql) { fini(); return; }

    let corps = req.body;
    if (typeof corps === "string") {
      if (corps.length > MAX_CORPS) { fini(); return; }
      try { corps = JSON.parse(corps); } catch { fini(); return; }
    }
    if (!corps || typeof corps !== "object") { fini(); return; }

    const type = texte(corps.type, 12);
    const session = texte(corps.session, 40);
    if (!type || !TYPES.has(type) || !session) { fini(); return; }

    const ua = req.headers["user-agent"] || "";
    const ip = String(req.headers["x-forwarded-for"] || "").split(",")[0].trim() || "0";
    const sel = process.env.HASH_SEL || "game-build";
    const visiteur = createHash("sha256").update(ip + "|" + ua + "|" + sel).digest("hex").slice(0, 16);

    await sql`
      insert into evenements
        (type, visiteur, session, source, campagne, referent, pays, appareil, libelle, valeur, promo)
      values
        (${type}, ${visiteur}, ${session},
         ${texte(corps.source, 60)}, ${texte(corps.campagne, 80)}, ${texte(corps.referent, 120)},
         ${texte(req.headers["x-vercel-ip-country"], 2)}, ${appareilDe(ua)},
         ${texte(corps.libelle, 80)}, ${entier(corps.valeur, 0, 86400)},
         ${typeof corps.promo === "boolean" ? corps.promo : null})`;

    fini();
  } catch (e) {
    console.error("track:", e && e.message);
    fini();
  }
}
