/* Le nombre de membres du groupe, lu sur Chariow, et les places des bonus.
   Partagé par /api/places (la page /rejoindre) et /api/bonus (la page après
   achat). Le « _ » devant le nom : Vercel n'en fait pas une adresse.

   La clé CHARIOW_API_KEY n'a besoin que du droit products.read. */

export const PRODUIT = "prd_iiq2laak";
export const VENTES_AU_LANCEMENT = 171;  /* les ventes de l'ancien pack, avant le groupe */

/* L'ouverture en cours : OUVERTURE_PLACES places à partir de OUVERTURE_DEPART
   membres, jusqu'à OUVERTURE_FIN. Quand les places sont prises ou la date
   passée, /rejoindre et le diagnostic se ferment tout seuls.
   Réouverture du 22/11/2026 : 50 places à 3 500 F, à partir de 188 membres,
   jusqu'au mardi 24/11 à 23 h 59, heure de Lomé (UTC).
   OUVERTURE_PLACES à null : pas de limite (pas de compteur ni de fermeture). */
export const OUVERTURE_PLACES = 50;
export const OUVERTURE_DEPART = 188;
export const OUVERTURE_FIN = "2026-11-24T23:59:00Z";

/* Les bonus vont aux BONUS_PLACES membres qui arrivent après BONUS_DEPART.
   BONUS_DEPART : le nombre de membres le jour où les bonus ont ouvert.
   1re vague : 30 places à partir de 157 (15/11/2026). 2e vague : les 50 places
   de la réouverture (22/11/2026). BONUS_DEBUT : le début de la vague en cours,
   pour ne compter que ses séries de visuels. */
export const BONUS_PLACES = 50;
export const BONUS_DEPART = 188;
export const BONUS_DEBUT = "2026-11-22T00:00:00Z";

/* La date limite est-elle passée ? (sans Chariow : sert aussi au diagnostic de l'IA) */
export function ouvertureTerminee(maintenant = Date.now()) {
  return OUVERTURE_PLACES != null && !!OUVERTURE_FIN && maintenant >= Date.parse(OUVERTURE_FIN);
}

/* { places, prises, restantes, fin, terminee } de l'ouverture en cours, ou null sans limite. */
export function ouvertureDe(membres) {
  if (OUVERTURE_PLACES == null) return null;
  const prises = Math.max(0, membres - OUVERTURE_DEPART);
  return {
    places: OUVERTURE_PLACES, prises: Math.min(prises, OUVERTURE_PLACES), restantes: Math.max(0, OUVERTURE_PLACES - prises),
    fin: OUVERTURE_FIN || null, terminee: ouvertureTerminee()
  };
}

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
