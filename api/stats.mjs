/* Renvoie les statistiques agrégées à l'espace admin.
   Protégée par ADMIN_MOT_DE_PASSE, envoyé dans l'en-tête x-mdp.
   Tout est calculé côté base : la réponse pèse quelques kilo-octets,
   quel que soit le nombre d'événements enregistrés. */

import { neon } from "@neondatabase/serverless";
import { timingSafeEqual } from "node:crypto";

const sql = process.env.DATABASE_URL ? neon(process.env.DATABASE_URL) : null;

/* Comparaison à durée constante : une comparaison avec === laisse
   deviner le mot de passe caractère par caractère. */
function memeMotDePasse(donne, attendu) {
  if (!attendu) return false;
  const a = Buffer.from(String(donne || ""));
  const b = Buffer.from(attendu);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

const FUSEAU = "Africa/Lome";

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");

  if (!memeMotDePasse(req.headers["x-mdp"], process.env.ADMIN_MOT_DE_PASSE)) {
    res.status(401).json({ erreur: "Mot de passe incorrect." });
    return;
  }
  if (!sql) {
    res.status(500).json({ erreur: "DATABASE_URL n'est pas configurée sur Vercel." });
    return;
  }

  const j = Math.min(365, Math.max(1, parseInt(req.query.jours, 10) || 7));

  try {
    const [resume, parJour, entonnoir, boutons, sources, pays, appareils, parHeure, paliers] =
      await Promise.all([

      sql`
        select
          count(*) filter (where type = 'vue')                                as vues,
          count(distinct visiteur)                                           as visiteurs,
          count(distinct session)                                            as sessions,
          count(*) filter (where type = 'clic')                              as clics,
          count(distinct session) filter (where type = 'clic')               as sessions_clic,
          coalesce(round(avg(valeur) filter (where type = 'sortie')), 0)::int as duree,
          coalesce(round(avg(valeur) filter (where type = 'scroll')), 0)::int as scroll_moyen
        from evenements
        where vu_le > now() - make_interval(days => ${j})`,

      sql`
        select to_char(date_trunc('day', vu_le at time zone ${FUSEAU}), 'YYYY-MM-DD') as jour,
               count(*) filter (where type = 'vue')   as vues,
               count(distinct visiteur)               as visiteurs,
               count(*) filter (where type = 'clic')  as clics
        from evenements
        where vu_le > now() - make_interval(days => ${j})
        group by 1 order by 1`,

      sql`
        select
          count(distinct session)                                                    as arrivees,
          count(distinct session) filter (where type = 'scroll' and valeur >= 25)    as quart,
          count(distinct session) filter (where type = 'scroll' and valeur >= 50)    as moitie,
          count(distinct session) filter (where type = 'scroll' and valeur >= 75)    as trois_quarts,
          count(distinct session) filter (where type = 'clic')                       as clics
        from evenements
        where vu_le > now() - make_interval(days => ${j})`,

      sql`
        select coalesce(libelle, 'sans nom') as libelle, count(*)::int as clics
        from evenements
        where type = 'clic' and vu_le > now() - make_interval(days => ${j})
        group by 1 order by 2 desc limit 10`,

      sql`
        select coalesce(nullif(source, ''), nullif(referent, ''), 'direct') as source,
               count(*) filter (where type = 'vue')::int                   as vues,
               count(distinct session) filter (where type = 'clic')::int    as clics
        from evenements
        where vu_le > now() - make_interval(days => ${j})
        group by 1 order by 2 desc limit 12`,

      sql`
        select coalesce(pays, '??') as pays, count(distinct session)::int as sessions
        from evenements
        where vu_le > now() - make_interval(days => ${j})
        group by 1 order by 2 desc limit 12`,

      sql`
        select coalesce(appareil, 'inconnu') as appareil, count(distinct session)::int as sessions
        from evenements
        where vu_le > now() - make_interval(days => ${j})
        group by 1 order by 2 desc`,

      sql`
        select extract(hour from vu_le at time zone ${FUSEAU})::int as heure,
               count(*) filter (where type = 'vue')::int            as vues,
               count(*) filter (where type = 'clic')::int           as clics
        from evenements
        where vu_le > now() - make_interval(days => ${j})
        group by 1 order by 1`,

      sql`
        select valeur as palier, count(distinct session)::int as sessions
        from evenements
        where type = 'scroll' and vu_le > now() - make_interval(days => ${j})
        group by 1 order by 1`
    ]);

    const r = resume[0] || {};
    const e = entonnoir[0] || {};
    const nb = (v) => Number(v || 0);

    res.status(200).json({
      jours: j,
      genere_le: new Date().toISOString(),
      resume: {
        vues: nb(r.vues),
        visiteurs: nb(r.visiteurs),
        sessions: nb(r.sessions),
        clics: nb(r.clics),
        sessions_clic: nb(r.sessions_clic),
        /* Taux de clic : part des visites qui ont cliqué sur un bouton
           d'achat. C'est le chiffre à surveiller avant tout. */
        taux_clic: nb(r.sessions) ? +(nb(r.sessions_clic) / nb(r.sessions) * 100).toFixed(1) : 0,
        duree: nb(r.duree),
        scroll_moyen: nb(r.scroll_moyen)
      },
      entonnoir: {
        arrivees: nb(e.arrivees),
        quart: nb(e.quart),
        moitie: nb(e.moitie),
        trois_quarts: nb(e.trois_quarts),
        clics: nb(e.clics)
      },
      parJour: parJour.map(l => ({ jour: l.jour, vues: nb(l.vues), visiteurs: nb(l.visiteurs), clics: nb(l.clics) })),
      parHeure: parHeure.map(l => ({ heure: nb(l.heure), vues: nb(l.vues), clics: nb(l.clics) })),
      boutons: boutons.map(l => ({ libelle: l.libelle, clics: nb(l.clics) })),
      sources: sources.map(l => ({ source: l.source, vues: nb(l.vues), clics: nb(l.clics) })),
      pays: pays.map(l => ({ pays: l.pays, sessions: nb(l.sessions) })),
      appareils: appareils.map(l => ({ appareil: l.appareil, sessions: nb(l.sessions) })),
      paliers: paliers.map(l => ({ palier: nb(l.palier), sessions: nb(l.sessions) }))
    });
  } catch (err) {
    console.error("stats:", err && err.message);
    res.status(500).json({ erreur: "La base n'a pas répondu : " + (err && err.message) });
  }
}
