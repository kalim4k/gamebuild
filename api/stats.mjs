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
    const [resume, parJour, entonnoir, boutons, sources, pays, appareils, parHeure, paliers, objections, questions, video] =
      await Promise.all([

      sql`
        select
          count(*) filter (where type = 'vue')                                as vues,
          count(distinct visiteur)                                           as visiteurs,
          count(distinct session)                                            as sessions,
          count(*) filter (where type = 'clic')                              as clics,
          count(distinct session) filter (where type = 'clic')               as sessions_clic,
          count(distinct session) filter (where type = 'bulle')              as sessions_bulle,
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
        group by 1 order by 1`,

      /* Réponses vocales. « clics_apres » : la question a été suivie d'un
         clic sur un bouton d'achat, dans la même visite. Si la table
         n'existe pas encore, le reste du tableau de bord marche quand même. */
      Promise.resolve(sql`
        select q.objection,
               count(*)::int as questions,
               count(*) filter (where exists (
                 select 1 from evenements e
                 where e.session = q.session and e.type = 'clic' and e.vu_le > q.cree_le
               ))::int as clics_apres
        from questions q
        where q.cree_le > now() - make_interval(days => ${j})
        group by 1 order by 2 desc`).catch(() => []),

      Promise.resolve(sql`
        select cree_le, prenom, canal, objection, texte
        from questions
        where texte is not null and cree_le > now() - make_interval(days => ${j})
        order by cree_le desc limit 50`).catch(() => []),

      /* Vidéo de présentation : qui la lance, jusqu'où on la regarde, et
         qui clique sur un bouton d'achat après l'avoir lancée. */
      sql`
        select
          count(distinct v.session) filter (where v.libelle = 'lecture')                      as lectures,
          count(distinct v.session) filter (where v.libelle = 'palier' and v.valeur >= 25)    as p25,
          count(distinct v.session) filter (where v.libelle = 'palier' and v.valeur >= 50)    as p50,
          count(distinct v.session) filter (where v.libelle = 'palier' and v.valeur >= 75)    as p75,
          count(distinct v.session) filter (where v.libelle = 'palier' and v.valeur >= 100)   as p100,
          count(distinct v.session) filter (where v.libelle = 'lecture' and exists (
            select 1 from evenements c
            where c.session = v.session and c.type = 'clic' and c.vu_le > v.vu_le
          )) as clics_apres
        from evenements v
        where v.type = 'video' and v.vu_le > now() - make_interval(days => ${j})`
    ]);

    const r = resume[0] || {};
    const e = entonnoir[0] || {};
    const vd = video[0] || {};
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
        scroll_moyen: nb(r.scroll_moyen),
        sessions_bulle: nb(r.sessions_bulle),
        part_bulle: nb(r.sessions) ? +(nb(r.sessions_bulle) / nb(r.sessions) * 100).toFixed(1) : 0
      },
      video: {
        lectures: nb(vd.lectures),
        part: nb(r.sessions) ? +(nb(vd.lectures) / nb(r.sessions) * 100).toFixed(1) : 0,
        p25: nb(vd.p25), p50: nb(vd.p50), p75: nb(vd.p75), p100: nb(vd.p100),
        clics_apres: nb(vd.clics_apres)
      },
      objections: objections.map(l => ({ objection: l.objection, questions: nb(l.questions), clics_apres: nb(l.clics_apres) })),
      questions: questions.map(l => ({
        cree_le: l.cree_le, prenom: l.prenom, canal: l.canal, objection: l.objection, texte: l.texte
      })),
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
