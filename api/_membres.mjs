/* Le nombre de membres du groupe, lu sur Chariow, et les places des bonus.
   Partagé par /api/places (la page /rejoindre) et /api/bonus (la page après
   achat). Le « _ » devant le nom : Vercel n'en fait pas une adresse.

   La clé CHARIOW_API_KEY n'a besoin que du droit products.read. */

export const PRODUIT = "prd_iiq2laak";
export const VENTES_AU_LANCEMENT = 171;  /* les ventes de l'ancien pack, avant le groupe */

/* Les bonus vont aux BONUS_PLACES membres qui arrivent après BONUS_DEPART.
   BONUS_DEPART : le nombre de membres le jour où les bonus ont ouvert (157 le 15/11/2026).
   Pour une nouvelle vague de bonus, mets ici le nombre de membres du jour. */
export const BONUS_PLACES = 30;
export const BONUS_DEPART = 157;

/* { prix, membres } ou null si Chariow ne répond pas. */
export async function lisProduit() {
  const cle = process.env.CHARIOW_API_KEY;
  if (!cle) return null;
  const rep = await fetch("https://api.chariow.com/v1/products/" + PRODUIT, {
    headers: { Authorization: "Bearer " + cle, Accept: "application/json" },
    signal: AbortSignal.timeout(5000)
  });
  if (!rep.ok) { console.error("membres: Chariow a répondu", rep.status); return null; }
  const { data } = await rep.json();
  const prix = data && data.pricing && data.pricing.current_price && data.pricing.current_price.value;
  /* sales_count disparaît si le compteur est masqué sur la boutique. */
  const vendus = data && data.sales_count ? data.sales_count.value : data && data.quantity ? data.quantity.sold.value : null;
  if (!Number.isFinite(prix) || !Number.isFinite(vendus)) return null;
  return { prix, membres: Math.max(0, vendus - VENTES_AU_LANCEMENT) };
}

/* prises peut dépasser BONUS_PLACES : c'est ce qui ferme les bonus. */
export function bonusDe(membres) {
  const prises = Math.max(0, membres - BONUS_DEPART);
  return { places: BONUS_PLACES, prises, restantes: Math.max(0, BONUS_PLACES - prises) };
}
