/* Le nombre de membres du groupe, lu sur Chariow, et les places des bonus.
   Partagé par /api/places (la page /rejoindre) et /api/bonus (la page après
   achat). Le « _ » devant le nom : Vercel n'en fait pas une adresse.

   La clé CHARIOW_API_KEY n'a besoin que du droit products.read. */

export const PRODUIT = "prd_iiq2laak";
export const VENTES_AU_LANCEMENT = 171;  /* les ventes de l'ancien pack, avant le groupe */

/* L'ouverture en cours, à partir de OUVERTURE_DEPART membres, jusqu'à
   OUVERTURE_FIN. Les places restantes sont le STOCK RESTANT du produit sur
   Chariow : quand tu changes le stock sur Chariow, la page suit (en une
   minute au plus). OUVERTURE_PLACES ne sert que si Chariow n'a pas de stock
   (quantité illimitée). Quand le stock tombe à 0 ou que la date passe,
   /rejoindre et le diagnostic se ferment tout seuls.
   Réouverture du 22/11/2026 : 3 500 F, à partir de 188 membres, jusqu'au
   mardi 24/11 à 23 h 59, heure de Lomé (UTC).
   OUVERTURE_PLACES à null : pas d'ouverture limitée (ni compteur ni fermeture). */
export const OUVERTURE_PLACES = 50;
export const OUVERTURE_DEPART = 188;
export const OUVERTURE_FIN = "2026-11-24T23:59:00Z";

/* Les bonus vont aux membres qui arrivent après BONUS_DEPART.
   BONUS_SUIT_OUVERTURE : chaque place de l'ouverture a ses bonus (leur nombre
   suit le stock Chariow) ; sinon, seulement les BONUS_PLACES premiers.
   1re vague : 30 places à partir de 157 (15/11/2026). 2e vague : toutes les
   places de la réouverture (22/11/2026). BONUS_DEBUT : le début de la vague
   en cours, pour ne compter que ses séries de visuels. */
export const BONUS_SUIT_OUVERTURE = true;
export const BONUS_PLACES = 50;
export const BONUS_DEPART = 188;
export const BONUS_DEBUT = "2026-11-22T00:00:00Z";

/* La date limite est-elle passée ? (sans Chariow : sert aussi au diagnostic de l'IA) */
export function ouvertureTerminee(maintenant = Date.now()) {
  return OUVERTURE_PLACES != null && !!OUVERTURE_FIN && maintenant >= Date.parse(OUVERTURE_FIN);
}

/* { places, prises, restantes, fin, terminee } de l'ouverture en cours, ou null sans limite.
   stock : le stock restant sur Chariow (null si la quantité est illimitée).
   places = prises depuis l'ouverture + stock restant : ajouter du stock sur
   Chariow ajoute des places. */
export function ouvertureDe(membres, stock = null) {
  if (OUVERTURE_PLACES == null) return null;
  const prises = Math.max(0, membres - OUVERTURE_DEPART);
  const restantes = Number.isFinite(stock) ? Math.max(0, stock) : Math.max(0, OUVERTURE_PLACES - prises);
  const places = Number.isFinite(stock) ? prises + restantes : OUVERTURE_PLACES;
  return { places, prises: Math.min(prises, places), restantes, fin: OUVERTURE_FIN || null, terminee: ouvertureTerminee() };
}

/* { prix, membres, stock } ou null si Chariow ne répond pas.
   stock : la quantité restante du produit, ou null si elle est illimitée. */
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
  const reste = data && data.quantity && data.quantity.remaining ? data.quantity.remaining.value : null;
  return { prix, membres: Math.max(0, vendus - VENTES_AU_LANCEMENT), stock: Number.isFinite(reste) ? reste : null };
}

/* Les places des bonus. p : ce que renvoie lisProduit (membres et stock).
   prises peut dépasser places : c'est ce qui ferme les bonus. */
export function bonusDe(p) {
  const prises = Math.max(0, p.membres - BONUS_DEPART);
  const o = BONUS_SUIT_OUVERTURE ? ouvertureDe(p.membres, p.stock) : null;
  const places = o ? o.places : BONUS_PLACES;
  return { places, prises, restantes: Math.max(0, places - prises) };
}
