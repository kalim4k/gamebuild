/* Les places du groupe d'accompagnement, pour la page /rejoindre.

   Le site est statique : cette fonction lit le prix et le nombre de
   ventes sur Chariow avec CHARIOW_API_KEY, une clé qui n'a besoin que du
   droit products.read. Vercel garde la réponse 60 secondes : une rafale
   de visites ne devient pas une rafale d'appels à Chariow.

   Sans clé, ou si Chariow ne répond pas, la fonction renvoie 503 et la
   page n'affiche aucun nombre : jamais un chiffre inventé.

   À chaque palier de prix, change PRIX_ACTUEL, SEUIL et PRIX_SUIVANT. */

const PRODUIT = "prd_iiq2laak";
const VENTES_AU_LANCEMENT = 171;   /* les ventes de l'ancien pack, avant le groupe */
const PRIX_ACTUEL = 3500;          /* le prix du palier en cours : sans lui sur Chariow, pas de compte à rebours */
const SEUIL = 150;                 /* le nombre de membres qui déclenche la hausse */
const PRIX_SUIVANT = 4500;         /* 1 990 F jusqu'à 50 membres, 2 500 F jusqu'à 100, 3 500 F jusqu'à 150, puis 4 500 F */

export default async function handler(req, res) {
  if (req.method !== "GET") { res.status(405).json({ erreur: "GET seulement" }); return; }

  const indisponible = () => {
    res.setHeader("Cache-Control", "no-store");
    res.status(503).json({ erreur: "Places indisponibles." });
  };

  const cle = process.env.CHARIOW_API_KEY;
  if (!cle) { indisponible(); return; }

  try {
    const rep = await fetch("https://api.chariow.com/v1/products/" + PRODUIT, {
      headers: { Authorization: "Bearer " + cle, Accept: "application/json" },
      signal: AbortSignal.timeout(5000)
    });
    if (!rep.ok) { console.error("places: Chariow a répondu", rep.status); indisponible(); return; }

    const { data } = await rep.json();
    const prix = data && data.pricing && data.pricing.current_price && data.pricing.current_price.value;
    /* sales_count disparaît si le compteur est masqué sur la boutique. */
    const vendus = data && data.sales_count ? data.sales_count.value : data && data.quantity ? data.quantity.sold.value : null;
    if (!Number.isFinite(prix) || !Number.isFinite(vendus)) { indisponible(); return; }

    const membres = Math.max(0, vendus - VENTES_AU_LANCEMENT);
    /* Prix de Chariow différent du palier en cours (pas encore changé, ou déjà monté) : pas de compte à rebours. */
    const restantes = prix !== PRIX_ACTUEL ? null : Math.max(0, SEUIL - membres);

    res.setHeader("Cache-Control", "public, s-maxage=60, stale-while-revalidate=120");
    res.status(200).json({ prix, prixSuivant: PRIX_SUIVANT, seuil: SEUIL, membres, restantes });
  } catch (e) {
    console.error("places:", e && e.message);
    indisponible();
  }
}
