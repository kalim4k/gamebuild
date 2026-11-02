/* Le diagnostic (diagnostic.html) : un questionnaire de 10 questions qui
   se termine par une recommandation personnalisée.

   POST : la page envoie les réponses au fil de l'eau (une ligne par
   visite, complétée à chaque réponse). On voit donc où les gens
   abandonnent, pas seulement ceux qui finissent. Comme /api/track,
   cette fonction ne doit jamais gêner la page : elle répond 204 quoi
   qu'il arrive.

   GET : les chiffres pour l'espace admin, protégés par
   ADMIN_MOT_DE_PASSE dans l'en-tête x-mdp, comme /api/stats.

   Vie privée : aucune adresse IP, aucun numéro de téléphone. Le prénom
   est la seule donnée nominative ; la page dit à quoi servent les
   réponses. Rien n'est envoyé au pixel Meta à part le verdict. */

import { neon } from "@neondatabase/serverless";
import { createHash, timingSafeEqual } from "node:crypto";

const sql = process.env.DATABASE_URL ? neon(process.env.DATABASE_URL) : null;
const MAX_CORPS = 3000;
const NB_QUESTIONS = 10;

/* Les seules valeurs acceptées : les mêmes clés que dans diagnostic.html. */
const VALEURS = {
  pays:      ["ci", "bj", "tg", "sn", "cm", "bf", "ml", "autre"],
  age:       ["-18", "18-24", "25-34", "35-44", "45+"],
  situation: ["etudes", "salarie", "compte", "recherche", "autre"],
  temps:     ["-30", "30-60", "1-2h", "2h+"],
  idee:      ["oui", "non"],
  objectif:  ["-25k", "25-100k", "100-300k", "300k+"],
  delai:     ["semaine", "mois", "3mois", "patient"],
  budget:    ["0", "-5k", "5-20k", "20k+"]
};
const PASSIONS = new Set(["foot", "cuisine", "musique", "mangas", "mode", "vehicules", "business", "animaux", "reflexion", "dessin"]);
const VERDICTS = new Set(["oui", "condition", "pas-encore"]);

function texte(v, max) {
  if (typeof v !== "string") return null;
  const t = v.replace(/\s+/g, " ").trim();
  return t ? t.slice(0, max) : null;
}

function choix(v, cle) {
  return typeof v === "string" && VALEURS[cle].includes(v) ? v : null;
}

function appareilDe(ua) {
  const u = (ua || "").toLowerCase();
  if (/ipad|tablet|playbook|silk|android(?!.*mobi)/.test(u)) return "tablette";
  if (/mobi|iphone|ipod|android|blackberry|iemobile|opera mini/.test(u)) return "mobile";
  return "ordinateur";
}

function memeMotDePasse(donne, attendu) {
  if (!attendu) return false;
  const a = Buffer.from(String(donne || ""));
  const b = Buffer.from(attendu);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

/* ══════════════ POST : enregistre une visite ══════════════ */
async function enregistre(req, res) {
  const fini = () => { if (!res.writableEnded) res.status(204).end(); };
  try {
    if (!sql) { fini(); return; }

    let corps = req.body;
    if (typeof corps === "string") {
      if (corps.length > MAX_CORPS) { fini(); return; }
      try { corps = JSON.parse(corps); } catch { fini(); return; }
    }
    if (!corps || typeof corps !== "object") { fini(); return; }

    const session = texte(corps.session, 40);
    if (!session) { fini(); return; }

    const r = corps.r && typeof corps.r === "object" ? corps.r : {};
    const prenom = texte(String(r.prenom || "").replace(/[^\p{L}\p{M}' -]/gu, ""), 30);
    const passions = Array.isArray(r.passions)
      ? [...new Set(r.passions.filter(p => PASSIONS.has(p)))].slice(0, 3)
      : [];
    const etape = Math.min(NB_QUESTIONS, Math.max(0, Math.round(Number(corps.etape) || 0)));
    const verdict = VERDICTS.has(corps.verdict) ? corps.verdict : null;

    const ua = req.headers["user-agent"] || "";
    const ip = String(req.headers["x-forwarded-for"] || "").split(",")[0].trim() || "0";
    const sel = process.env.HASH_SEL || "game-build";
    const visiteur = createHash("sha256").update(ip + "|" + ua + "|" + sel).digest("hex").slice(0, 16);

    await sql`
      insert into diagnostics
        (session, visiteur, pays_ip, appareil, source, etape, fini, verdict, clic_offre, clic_chaine,
         prenom, pays, age, situation, temps, idee, idee_texte, passions, objectif, delai, budget)
      values
        (${session}, ${visiteur}, ${texte(req.headers["x-vercel-ip-country"], 2)}, ${appareilDe(ua)},
         ${texte(corps.source, 40)}, ${etape}, ${corps.fini === true}, ${verdict},
         ${corps.clic === "offre"}, ${corps.clic === "chaine"},
         ${prenom}, ${choix(r.pays, "pays")}, ${choix(r.age, "age")}, ${choix(r.situation, "situation")},
         ${choix(r.temps, "temps")}, ${choix(r.idee, "idee")}, ${texte(r.idee_texte, 200)},
         ${passions.length ? passions : null}::text[],
         ${choix(r.objectif, "objectif")}, ${choix(r.delai, "delai")}, ${choix(r.budget, "budget")})
      on conflict (session) do update set
        maj_le      = now(),
        etape       = greatest(diagnostics.etape, excluded.etape),
        fini        = diagnostics.fini or excluded.fini,
        verdict     = coalesce(excluded.verdict, diagnostics.verdict),
        clic_offre  = diagnostics.clic_offre or excluded.clic_offre,
        clic_chaine = diagnostics.clic_chaine or excluded.clic_chaine,
        source      = coalesce(diagnostics.source, excluded.source),
        prenom      = coalesce(excluded.prenom, diagnostics.prenom),
        pays        = coalesce(excluded.pays, diagnostics.pays),
        age         = coalesce(excluded.age, diagnostics.age),
        situation   = coalesce(excluded.situation, diagnostics.situation),
        temps       = coalesce(excluded.temps, diagnostics.temps),
        idee        = coalesce(excluded.idee, diagnostics.idee),
        idee_texte  = coalesce(excluded.idee_texte, diagnostics.idee_texte),
        passions    = coalesce(excluded.passions, diagnostics.passions),
        objectif    = coalesce(excluded.objectif, diagnostics.objectif),
        delai       = coalesce(excluded.delai, diagnostics.delai),
        budget      = coalesce(excluded.budget, diagnostics.budget)`;

    fini();
  } catch (e) {
    console.error("diagnostic:", e && e.message);
    fini();
  }
}

/* ══════════════ GET : les chiffres de l'admin ══════════════ */
async function statistiques(req, res) {
  res.setHeader("Cache-Control", "no-store");
  if (!memeMotDePasse(req.headers["x-mdp"], process.env.ADMIN_MOT_DE_PASSE)) {
    res.status(401).json({ erreur: "Mot de passe incorrect." });
    return;
  }
  if (!sql) { res.status(500).json({ erreur: "DATABASE_URL n'est pas configurée sur Vercel." }); return; }

  const j = Math.min(365, Math.max(1, parseInt(req.query.jours, 10) || 7));

  try {
    const [resume, etapes, verdicts, profil, dernieres] = await Promise.all([
      sql`
        select count(*)::int                                    as commences,
               count(*) filter (where fini)::int                as finis,
               count(*) filter (where clic_offre)::int          as clics_offre,
               count(*) filter (where clic_chaine)::int         as clics_chaine
        from diagnostics
        where cree_le > now() - make_interval(days => ${j})`,

      /* Combien ont répondu au moins à la question k : la courbe d'abandon. */
      sql`
        select k::int as question, count(d.session)::int as visites
        from generate_series(1, ${NB_QUESTIONS}) k
        left join diagnostics d
          on d.etape >= k and d.cree_le > now() - make_interval(days => ${j})
        group by k order by k`,

      sql`
        select verdict, count(*)::int as visites, count(*) filter (where clic_offre)::int as clics_offre
        from diagnostics
        where fini and verdict is not null and cree_le > now() - make_interval(days => ${j})
        group by 1 order by 2 desc`,

      /* Le profil de ceux qui sont allés au bout, question par question. */
      sql`
        with f as (
          select * from diagnostics
          where fini and cree_le > now() - make_interval(days => ${j})
        )
        select 'pays' as q, pays as v, count(*)::int as n from f group by 2
        union all select 'age', age, count(*)::int from f group by 2
        union all select 'situation', situation, count(*)::int from f group by 2
        union all select 'temps', temps, count(*)::int from f group by 2
        union all select 'idee', idee, count(*)::int from f group by 2
        union all select 'objectif', objectif, count(*)::int from f group by 2
        union all select 'delai', delai, count(*)::int from f group by 2
        union all select 'budget', budget, count(*)::int from f group by 2
        union all select 'passions', p, count(*)::int from f, unnest(f.passions) p group by 2`,

      sql`
        select cree_le, prenom, pays, age, situation, temps, objectif, delai, budget,
               passions, idee_texte, verdict, clic_offre
        from diagnostics
        where fini and cree_le > now() - make_interval(days => ${j})
        order by cree_le desc limit 50`
    ]);

    const profilPar = {};
    profil.forEach(l => {
      if (l.v == null) return;
      (profilPar[l.q] = profilPar[l.q] || []).push({ valeur: l.v, n: l.n });
    });
    Object.values(profilPar).forEach(t => t.sort((a, b) => b.n - a.n));

    res.status(200).json({
      jours: j,
      resume: resume[0] || {},
      etapes,
      verdicts,
      profil: profilPar,
      dernieres
    });
  } catch (err) {
    /* Table absente : le reste de l'admin doit continuer à marcher. */
    res.status(200).json({ jours: j, absent: true, erreur: err && err.message });
  }
}

export default async function handler(req, res) {
  if (req.method === "OPTIONS") { res.status(204).end(); return; }
  if (req.method === "POST") return enregistre(req, res);
  if (req.method === "GET") return statistiques(req, res);
  res.status(405).json({ erreur: "GET ou POST seulement" });
}
