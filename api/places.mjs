/* Les places du groupe d'accompagnement, et celles des bonus, pour la page /rejoindre.

   Le site est statique : cette fonction lit le prix et le nombre de
   ventes sur Chariow avec CHARIOW_API_KEY (voir _membres.mjs). Vercel
   garde la réponse 60 secondes : une rafale de visites ne devient pas
   une rafale d'appels à Chariow.

   Sans clé, ou si Chariow ne répond pas, la fonction renvoie 503 et la
   page n'affiche aucun nombre : jamais un chiffre inventé.

   Deux façons de compter :
   - une ouverture limitée (OUVERTURE_PLACES dans _membres.mjs) : la page
     affiche les places restantes, puis se ferme quand elles sont prises ;
   - des paliers de prix (OUVERTURE_PLACES à null) : à chaque palier,
     change SEUIL et PRIX_SUIVANT ; SEUIL à null, aucun compte à rebours.
   Dans les deux cas, PRIX_ACTUEL est le prix en cours : tant que Chariow
   affiche un autre prix, la page ne montre aucun compteur.
   Les places des bonus se règlent dans _membres.mjs. */

import { lisProduit, bonusDe, ouvertureDe } from "./_membres.mjs";

const PRIX_ACTUEL = 3500;          /* réouverture du 22/11/2026 : 50 places à 3 500 F, jusqu'au mardi 24/11 */
const SEUIL = null;                /* paliers seulement : le nombre de membres qui déclenche la hausse */
const PRIX_SUIVANT = null;         /* paliers passés : 1 990 F jusqu'à 50 membres, 2 500 F jusqu'à 100, 3 500 F jusqu'à 150, puis 4 500 F */

export default async function handler(req, res) {
  if (req.method !== "GET") { res.status(405).json({ erreur: "GET seulement" }); return; }

  const indisponible = () => {
    res.setHeader("Cache-Control", "no-store");
    res.status(503).json({ erreur: "Places indisponibles." });
  };

  try {
    const p = await lisProduit();
    if (!p) { indisponible(); return; }
    const { prix, membres, stock } = p;
    const bonPrix = prix === PRIX_ACTUEL;
    /* Prix de Chariow différent du prix en cours (pas encore changé, ou déjà monté) : pas de compteur. */
    const ouverture = bonPrix ? ouvertureDe(membres, stock) : null;
    const restantes = ouverture ? ouverture.restantes
      : SEUIL == null || !bonPrix ? null : Math.max(0, SEUIL - membres);
    const b = bonusDe(p);

    res.setHeader("Cache-Control", "public, s-maxage=60, stale-while-revalidate=120");
    res.status(200).json({
      prix, prixSuivant: ouverture ? null : PRIX_SUIVANT, seuil: ouverture ? null : SEUIL, membres, restantes,
      ouverture,
      bonus: { places: b.places, prises: Math.min(b.prises, b.places), restantes: b.restantes }
    });
  } catch (e) {
    console.error("places:", e && e.message);
    indisponible();
  }
}
