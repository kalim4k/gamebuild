/* Les bonus des 30 premiers membres, sur la page après achat (/bienvenue-r8m4t).

   Bonus 1 : le guide PDF, rangé dans la base (table bonus_fichiers), jamais
             dans le dépôt, qui est public.
   Bonus 2 : les visuels du jeu du membre (icône, fond, personnage, objet,
             obstacle), créés par Kie AI (GPT Image 2) à partir de sa
             description, puis allégés en WebP et gardés dans la base.

   Qui y a droit : la page après achat demande un accès (action « ouvrir »).
   Tant que le groupe n'a pas dépassé les places de la vague de bonus
   (_membres.mjs : pendant une ouverture, elles suivent le stock Chariow),
   elle reçoit un jeton signé, gardé sur le téléphone. Au-delà,
   les bonus ne s'affichent plus. Le nombre de séries d'images ne dépasse
   jamais le nombre de membres arrivés depuis l'ouverture (+ MARGE).

   Variables :
     CHARIOW_API_KEY     le nombre de membres (droit products.read)
     KIE_AI_API          clé Kie AI, pour les images
     DATABASE_URL        la base Neon (tables : node scripts/init-bonus.mjs)
     HASH_SEL            signe les jetons

   POST {action: "ouvrir"}               -> {jeton, ...état} ou {ferme: true}
   GET  ?j=                              -> état (et avance les images en cours)
   POST {action: "generer", j, jeu}      -> lance les 5 images
   POST {action: "refaire", j, sorte}    -> refait une image
   GET  ?image=<id>[&dl=nom]             -> l'image (WebP)
   GET  ?guide=1&j=                      -> le guide PDF */

import { neon } from "@neondatabase/serverless";
import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import sharp from "sharp";
import { lisProduit, bonusDe, BONUS_PLACES, BONUS_DEBUT } from "./_membres.mjs";

const REFAITS_MAX = 2;          /* images refaites au choix du membre, en plus de la série */
const ESSAIS_ECHEC = 3;         /* nouvelles tentatives gratuites quand Kie échoue */
const ATTENTE_MAX = 10 * 60e3;  /* une image toujours pas prête au bout de 10 min est abandonnée */
const MARGE = 5;               /* séries en plus du nombre de membres : Chariow compte parfois avec retard, et tes essais */

const sql = process.env.DATABASE_URL ? neon(process.env.DATABASE_URL) : null;
const CLE_KIE = process.env.KIE_AI_API || "";
const KIE = process.env.KIE_API || "https://api.kie.ai/api/v1";
const SECRET = createHmac("sha256", process.env.HASH_SEL || process.env.DATABASE_URL || "bonus").update("gb-bonus-v2").digest();

const SORTES = ["icone", "fond", "personnage", "objet", "obstacle"];
const DETOUREES = new Set(["personnage", "objet", "obstacle"]);
const NOMS_FICHIERS = { icone: "icone", fond: "fond", personnage: "personnage", objet: "objet", obstacle: "obstacle" };

/* ---------- Outils ---------- */

function jetonPour(venteId) {
  const p = Buffer.from(JSON.stringify({ v: venteId, e: Date.now() + 180 * 864e5 })).toString("base64url");
  return p + "." + createHmac("sha256", SECRET).update(p).digest("base64url");
}

function venteDuJeton(j) {
  if (typeof j !== "string" || j.length > 400) return null;
  const [p, s] = j.split(".");
  if (!p || !s) return null;
  const attendu = createHmac("sha256", SECRET).update(p).digest("base64url");
  if (s.length !== attendu.length || !timingSafeEqual(Buffer.from(s), Buffer.from(attendu))) return null;
  try {
    const o = JSON.parse(Buffer.from(p, "base64url").toString());
    return o && typeof o.v === "string" && o.e > Date.now() ? o.v : null;
  } catch { return null; }
}

function texte(v, min, max) {
  if (typeof v !== "string") return null;
  const t = v.replace(/[\u0000-\u001f<>]/g, " ").replace(/\s+/g, " ").trim();
  return t.length >= min ? t.slice(0, max) : null;
}

/* ---------- Le nombre de membres, gardé 30 s ---------- */

let cache = { t: 0, p: null };

async function membres() {
  if (cache.p && Date.now() - cache.t < 30e3) return cache.p;
  const p = await lisProduit().catch((e) => { console.error("bonus: Chariow", e && e.message); return null; });
  if (p) cache = { t: Date.now(), p };
  return p;
}

/* ---------- Kie AI : les images ---------- */

const STYLE = "Style : illustration de jeu mobile en cartoon 3D doux et brillant, couleurs vives et saturées, " +
  "formes arrondies, contours nets, éclairage chaud, qualité des meilleurs jeux mobiles. " +
  "Création originale, qui ne ressemble à aucun personnage ni à aucun jeu connu. " +
  "Aucun texte, aucune lettre, aucun chiffre, aucun logo, aucun filigrane.";

function demande(sorte, jeu) {
  const { nom, univers, personnage, objet, obstacle } = jeu;
  const seul = "entier, centré, avec de la marge tout autour, sur fond transparent. Aucun décor, aucune ombre au sol.";
  switch (sorte) {
    case "icone": return { ratio: "1:1", fond: "opaque", prompt:
      `L'icône d'application du jeu mobile « ${nom} ». Univers : ${univers}. On y voit ${personnage}, en gros plan, expressif et souriant, ` +
      `devant un décor simple et coloré de cet univers. Image carrée qui remplit tout le cadre, sans bordure ni coins arrondis. ${STYLE}` };
    case "fond": return { ratio: "9:16", fond: "opaque", prompt:
      `Le décor de fond, en format portrait, du jeu mobile « ${nom} ». Univers : ${univers}. Sans aucun personnage ni aucun objet au premier plan. ` +
      `Le centre et le bas de l'image restent assez dégagés pour qu'on joue par-dessus. ` +
      `Couleurs un peu plus douces que celles des personnages, pour qu'ils ressortent bien. ${STYLE}` };
    case "personnage": return { ratio: "1:1", fond: "transparent", prompt:
      `Le personnage principal du jeu mobile « ${nom} » : ${personnage}. Univers : ${univers}. Personnage en pied, ${seul} ${STYLE}` };
    case "objet": return { ratio: "1:1", fond: "transparent", prompt:
      `Un objet à ramasser dans le jeu mobile « ${nom} » : ${objet}. Univers : ${univers}. Un seul objet, ${seul} ${STYLE}` };
    case "obstacle": return { ratio: "1:1", fond: "transparent", prompt:
      `Un obstacle ou un ennemi du jeu mobile « ${nom} » : ${obstacle}. Univers : ${univers}. Un seul élément, ${seul} ${STYLE}` };
  }
  return null;
}

async function lanceImage(sorte, jeu) {
  const d = demande(sorte, jeu);
  const r = await fetch(KIE + "/jobs/createTask", {
    method: "POST",
    headers: { Authorization: "Bearer " + CLE_KIE, "Content-Type": "application/json" },
    body: JSON.stringify({ model: "gpt-image-2-text-to-image", input: { prompt: d.prompt, aspect_ratio: d.ratio, resolution: "1K", background: d.fond } }),
    signal: AbortSignal.timeout(15000)
  });
  const j = await r.json().catch(() => ({}));
  if (j.code !== 200 || !j.data || !j.data.taskId) throw new Error("Kie : " + (j.msg || r.status));
  return j.data.taskId;
}

/* Un fond peint au lieu d'être transparent (damier, blanc) : on l'efface depuis les bords. */
async function effaceFondClair(buf) {
  const { data, info } = await sharp(buf).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width: w, height: h } = info;
  const clair = (i) => {
    const r = data[i], g = data[i + 1], b = data[i + 2];
    return r > 185 && g > 185 && b > 185 && Math.max(r, g, b) - Math.min(r, g, b) < 20;
  };
  const vu = new Uint8Array(w * h);
  const file = new Int32Array(w * h);
  let debut = 0, fin = 0;
  const pousse = (x, y) => {
    const k = y * w + x;
    if (vu[k] || !clair(k * 4)) return;
    vu[k] = 1; file[fin++] = k;
  };
  for (let x = 0; x < w; x++) { pousse(x, 0); pousse(x, h - 1); }
  for (let y = 0; y < h; y++) { pousse(0, y); pousse(w - 1, y); }
  while (debut < fin) {
    const k = file[debut++], x = k % w, y = (k - x) / w;
    data[k * 4 + 3] = 0;
    if (x > 0) pousse(x - 1, y);
    if (x < w - 1) pousse(x + 1, y);
    if (y > 0) pousse(x, y - 1);
    if (y < h - 1) pousse(x, y + 1);
  }
  return sharp(data, { raw: { width: w, height: h, channels: 4 } }).png().toBuffer();
}

async function prepare(sorte, buf) {
  if (sorte === "fond") {
    return sharp(buf).resize({ width: 1080, withoutEnlargement: true }).webp({ quality: 80 }).toBuffer();
  }
  if (sorte === "icone") {
    return sharp(buf).resize(512, 512, { fit: "cover" }).webp({ quality: 86 }).toBuffer();
  }
  if ((await sharp(buf).stats()).isOpaque) buf = await effaceFondClair(buf);
  const coupe = await sharp(buf).trim({ threshold: 2 }).png().toBuffer().catch(() => buf);
  return sharp(coupe)
    .resize(480, 480, { fit: "inside", withoutEnlargement: true })
    .extend({ top: 16, bottom: 16, left: 16, right: 16, background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .webp({ quality: 88, alphaQuality: 100 })
    .toBuffer();
}

/* Fait avancer les images en attente : celles que Kie a finies sont allégées et rangées. */
async function avance(venteId) {
  const attente = await sql`SELECT id, sorte, tache, cree_le FROM bonus_images WHERE vente_id = ${venteId} AND etat = 'attente'`;
  await Promise.all(attente.map(async (im) => {
    try {
      const r = await fetch(KIE + "/jobs/recordInfo?taskId=" + encodeURIComponent(im.tache), {
        headers: { Authorization: "Bearer " + CLE_KIE }, signal: AbortSignal.timeout(10000)
      });
      const d = ((await r.json().catch(() => ({}))).data) || {};
      if (d.state === "success") {
        const url = JSON.parse(d.resultJson || "{}").resultUrls?.[0];
        if (!url) throw new Error("pas d'adresse");
        const brut = Buffer.from(await (await fetch(url, { signal: AbortSignal.timeout(20000) })).arrayBuffer());
        const octets = await prepare(im.sorte, brut);
        await sql`UPDATE bonus_images SET etat = 'fait', octets = ${octets}, type = 'image/webp', maj_le = now()
                  WHERE id = ${im.id} AND etat = 'attente'`;
      } else if (d.state === "fail" || Date.now() - new Date(im.cree_le).getTime() > ATTENTE_MAX) {
        console.error("bonus: image en échec", im.sorte, d.failMsg || "trop longue");
        await sql`UPDATE bonus_images SET etat = 'echec', maj_le = now() WHERE id = ${im.id} AND etat = 'attente'`;
      }
    } catch (e) {
      console.error("bonus: suivi", im.sorte, e && e.message);
    }
  }));
}

/* ---------- L'état d'un membre ---------- */

async function etat(venteId) {
  const [a] = await sql`SELECT jeu, refaits FROM bonus_acces WHERE vente_id = ${venteId}`;
  if (!a) return null;
  const lignes = await sql`SELECT DISTINCT ON (sorte) id, sorte, version, etat FROM bonus_images
                           WHERE vente_id = ${venteId} ORDER BY sorte, version DESC`;
  const echecs = await sql`SELECT sorte, count(*)::int AS n FROM bonus_images WHERE vente_id = ${venteId} AND etat = 'echec' GROUP BY sorte`;
  const nEchecs = Object.fromEntries(echecs.map((e) => [e.sorte, e.n]));
  const images = SORTES.map((s) => {
    const l = lignes.find((x) => x.sorte === s);
    if (!l) return { sorte: s, etat: "vide" };
    return { sorte: s, etat: l.etat, id: l.etat === "fait" ? l.id : null, reessai: l.etat === "echec" && (nEchecs[s] || 0) <= ESSAIS_ECHEC };
  });
  return {
    jeu: a.jeu ? { nom: a.jeu.nom } : null,
    images,
    refaitsRestants: Math.max(0, REFAITS_MAX - a.refaits),
    places: BONUS_PLACES,
    visuels: !!CLE_KIE
  };
}

async function nouvelleImage(venteId, sorte, jeu) {
  const [v] = await sql`SELECT coalesce(max(version), 0)::int AS n FROM bonus_images WHERE vente_id = ${venteId} AND sorte = ${sorte}`;
  const tache = await lanceImage(sorte, jeu);
  const id = randomBytes(16).toString("hex");
  await sql`INSERT INTO bonus_images (id, vente_id, sorte, version, tache) VALUES (${id}, ${venteId}, ${sorte}, ${v.n + 1}, ${tache})`;
}

/* ---------- La fonction ---------- */

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  if (!sql) { res.status(503).json({ erreur: "La base n'est pas reliée." }); return; }

  try {
    if (req.method === "GET") {
      const q = req.query || {};

      if (typeof q.image === "string") {
        if (!/^[0-9a-f]{32}$/.test(q.image)) { res.status(404).end(); return; }
        const [im] = await sql`SELECT octets, type, sorte FROM bonus_images WHERE id = ${q.image} AND etat = 'fait'`;
        if (!im) { res.status(404).end(); return; }
        res.setHeader("Content-Type", im.type);
        res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
        if (q.dl) {
          const nom = String(q.dl).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 40) || "jeu";
          res.setHeader("Content-Disposition", `attachment; filename="${nom}-${NOMS_FICHIERS[im.sorte]}.webp"`);
        }
        res.status(200).send(Buffer.from(im.octets));
        return;
      }

      const venteId = venteDuJeton(q.j);
      if (!venteId) { res.status(401).json({ erreur: "jeton" }); return; }

      if (q.guide) {
        const [f] = await sql`SELECT octets, type FROM bonus_fichiers WHERE nom = 'guide'`;
        if (!f) { res.status(404).json({ erreur: "Le guide n'est pas encore en ligne." }); return; }
        res.setHeader("Content-Type", f.type);
        res.setHeader("Content-Disposition", 'attachment; filename="Ton-jeu-en-ligne-etape-par-etape.pdf"');
        res.setHeader("Cache-Control", "private, max-age=3600");
        res.status(200).send(Buffer.from(f.octets));
        return;
      }

      if (CLE_KIE) await avance(venteId);
      const e = await etat(venteId);
      if (!e) { res.status(401).json({ erreur: "jeton" }); return; }
      await sql`UPDATE bonus_acces SET vu_le = now() WHERE vente_id = ${venteId}`;
      res.status(200).json(e);
      return;
    }

    if (req.method !== "POST") { res.status(405).json({ erreur: "GET ou POST seulement" }); return; }
    let corps = req.body;
    if (typeof corps === "string") { try { corps = JSON.parse(corps); } catch { corps = null; } }
    if (!corps || typeof corps !== "object") { res.status(400).json({ erreur: "Requête illisible." }); return; }

    /* Ouvrir les bonus, depuis la page après achat */
    if (corps.action === "ouvrir") {
      const p = await membres();
      if (!p) { res.status(503).json({ erreur: "indisponible" }); return; }
      const b = bonusDe(p);
      if (b.prises > b.places) { res.status(200).json({ ferme: true, places: b.places }); return; }
      const venteId = "m-" + randomBytes(8).toString("hex");
      await sql`INSERT INTO bonus_acces (vente_id, rang) VALUES (${venteId}, ${b.prises})`;
      res.status(200).json({ jeton: jetonPour(venteId), ...(await etat(venteId)) });
      return;
    }

    const venteId = venteDuJeton(corps.j);
    if (!venteId) { res.status(401).json({ erreur: "jeton" }); return; }
    const [acces] = await sql`SELECT jeu, refaits FROM bonus_acces WHERE vente_id = ${venteId}`;
    if (!acces) { res.status(401).json({ erreur: "jeton" }); return; }
    if (!CLE_KIE) { res.status(503).json({ erreur: "Le générateur n'est pas encore branché." }); return; }

    /* Créer la série de 5 images, une seule fois */
    if (corps.action === "generer") {
      if (acces.jeu) { res.status(409).json({ erreur: "deja" }); return; }
      const j = corps.jeu || {};
      const jeu = {
        nom: texte(j.nom, 2, 40),
        univers: texte(j.univers, 5, 300),
        personnage: texte(j.personnage, 3, 220),
        objet: texte(j.objet, 3, 160),
        obstacle: texte(j.obstacle, 3, 160)
      };
      const manque = Object.keys(jeu).filter((k) => !jeu[k]);
      if (manque.length) { res.status(400).json({ erreur: "champs", champs: manque }); return; }
      const p = await membres();
      const bp = p ? bonusDe(p) : null;
      const plafond = (bp ? Math.min(bp.places, bp.prises) : BONUS_PLACES) + MARGE;
      /* Seulement les séries de la vague en cours : celles d'avant ne prennent pas les places des nouveaux. */
      const [series] = await sql`SELECT count(*)::int AS n FROM bonus_acces WHERE jeu IS NOT NULL AND cree_le >= ${BONUS_DEBUT}::timestamptz`;
      if (series.n >= plafond) { res.status(429).json({ erreur: "complet" }); return; }
      const [pris] = await sql`UPDATE bonus_acces SET jeu = ${JSON.stringify(jeu)}::jsonb WHERE vente_id = ${venteId} AND jeu IS NULL RETURNING vente_id`;
      if (!pris) { res.status(409).json({ erreur: "deja" }); return; }
      const lances = await Promise.allSettled(SORTES.map((s) => nouvelleImage(venteId, s, jeu)));
      if (lances.every((l) => l.status === "rejected")) {
        console.error("bonus: Kie refuse", lances[0].reason && lances[0].reason.message);
        await sql`UPDATE bonus_acces SET jeu = NULL WHERE vente_id = ${venteId}`;
        res.status(503).json({ erreur: "Le générateur ne répond pas. Réessaie dans quelques minutes." }); return;
      }
      res.status(200).json(await etat(venteId));
      return;
    }

    /* Refaire une image (choix du membre) ou réessayer une image en échec */
    if (corps.action === "refaire") {
      const sorte = SORTES.includes(corps.sorte) ? corps.sorte : null;
      if (!sorte || !acces.jeu) { res.status(400).json({ erreur: "image" }); return; }
      const [der] = await sql`SELECT etat FROM bonus_images WHERE vente_id = ${venteId} AND sorte = ${sorte} ORDER BY version DESC LIMIT 1`;
      if (!der || der.etat === "attente") { res.status(409).json({ erreur: "en-cours" }); return; }
      const choix = der.etat !== "echec";
      if (!choix) {
        const [n] = await sql`SELECT count(*)::int AS n FROM bonus_images WHERE vente_id = ${venteId} AND sorte = ${sorte} AND etat = 'echec'`;
        if (n.n > ESSAIS_ECHEC) { res.status(429).json({ erreur: "essais" }); return; }
      } else {
        const [ok] = await sql`UPDATE bonus_acces SET refaits = refaits + 1 WHERE vente_id = ${venteId} AND refaits < ${REFAITS_MAX} RETURNING refaits`;
        if (!ok) { res.status(429).json({ erreur: "refaits" }); return; }
      }
      try {
        await nouvelleImage(venteId, sorte, acces.jeu);
      } catch (e) {
        if (choix) await sql`UPDATE bonus_acces SET refaits = refaits - 1 WHERE vente_id = ${venteId}`;
        throw e;
      }
      res.status(200).json(await etat(venteId));
      return;
    }

    res.status(400).json({ erreur: "action" });
  } catch (e) {
    console.error("bonus:", e && e.message);
    res.status(500).json({ erreur: "Erreur du serveur. Réessaie dans un instant." });
  }
}
