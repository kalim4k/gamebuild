/* Le nombre de membres du groupe, lu sur Chariow, et les places des bonus.
   Partagé par /api/places (la page /rejoindre) et /api/bonus (la page après
   achat). Le « _ » devant le nom : Vercel n'en fait pas une adresse.

   La clé CHARIOW_API_KEY n'a besoin que du droit products.read. */

export const PRODUIT = "prd_iiq2laak";
export const VENTES_AU_LANCEMENT = 171;  /* les ventes de l'ancien pack, avant le groupe */

/* L'ouverture en cours, à partir de OUVERTURE_DEPART membres, jusqu'à
   OUVERTURE_FIN. Le nombre de places vient de la QUANTITÉ du produit sur
   Chariow (stock total, ventes comprises) : places = quantité − ventes au
   moment de l'ouverture. Changer la quantité sur Chariow change le nombre de
   places (en une minute au plus). Seules les ventes réussies font baisser
   les places restantes : on n'utilise pas le « restant » de Chariow, qui
   bouge aussi avec les paiements en cours. OUVERTURE_PLACES ne sert que si
   Chariow n'a pas de quantité (illimitée). Quand il ne reste plus de place
   ou que la date passe : si OUVERTURE_APRES est un prix, le groupe reste
   ouvert et passe à ce prix (palier) ; s'il est null, /rejoindre et le
   diagnostic se ferment.
   Réouverture du 22/11/2026 : 3 500 F, à partir de 188 membres, jusqu'au
   mardi 24/11 à 23 h 59, heure de Lomé (UTC). 50 places vendues le 23/11 ;
   50 de plus le même jour, puis 4 500 F (palier), le groupe reste ouvert.
   OUVERTURE_PRIX : le prix de l'ouverture ; tant que Chariow affiche un autre
   prix, aucun compteur ne s'affiche (c'est le cas une fois passé au palier).
   OUVERTURE_PLACES à null : pas d'ouverture limitée (ni compteur ni fermeture). */
export const OUVERTURE_PLACES = 100;
export const OUVERTURE_DEPART = 188;
export const OUVERTURE_FIN = "2026-11-24T23:59:00Z";
export const OUVERTURE_PRIX = 3500;
export const OUVERTURE_APRES = 4500;

/* Les bonus vont aux membres qui arrivent après BONUS_DEPART.
   BONUS_SUIT_OUVERTURE : chaque place de l'ouverture a ses bonus (leur nombre
   suit la quantité Chariow) ; sinon, seulement les BONUS_PLACES premiers.
   1re vague : 30 places à partir de 157 (15/11/2026). 2e vague : les places à
   3 500 F de la réouverture (22 et 23/11/2026), soit les 100 premiers après
   188 ; pas de bonus au palier de 4 500 F. BONUS_DEBUT : le début de la vague
   en cours, pour ne compter que ses séries de visuels. */
export const BONUS_SUIT_OUVERTURE = false;
export const BONUS_PLACES = 100;
export const BONUS_DEPART = 188;
export const BONUS_DEBUT = "2026-11-22T00:00:00Z";

/* La date limite est-elle passée ? (sans Chariow : sert aussi au diagnostic de l'IA) */
export function ouvertureTerminee(maintenant = Date.now()) {
  return OUVERTURE_PLACES != null && !!OUVERTURE_FIN && maintenant >= Date.parse(OUVERTURE_FIN);
}

/* Le groupe se ferme-t-il à la fin de l'ouverture ? Non s'il passe à un palier de prix. */
export const FERME_A_LA_FIN = OUVERTURE_APRES == null;

/* { places, prises, restantes, fin, terminee, apres } de l'ouverture en cours, ou null sans limite.
   quantite : la quantité totale du produit sur Chariow (null si illimitée).
   apres : le prix qui suit l'ouverture (null : le groupe ferme). */
export function ouvertureDe(membres, quantite = null) {
  if (OUVERTURE_PLACES == null) return null;
  const prises = Math.max(0, membres - OUVERTURE_DEPART);
  const places = Number.isFinite(quantite) ? Math.max(0, quantite - VENTES_AU_LANCEMENT - OUVERTURE_DEPART) : OUVERTURE_PLACES;
  return { places, prises: Math.min(prises, places), restantes: Math.max(0, places - prises), fin: OUVERTURE_FIN || null,
    terminee: ouvertureTerminee(), apres: OUVERTURE_APRES };
}

/* { prix, membres, quantite } ou null si Chariow ne répond pas.
   quantite : la quantité totale du produit (ventes comprises), ou null si illimitée. */
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
  const q = data && data.quantity ? data.quantity.value : null;
  return { prix, membres: Math.max(0, vendus - VENTES_AU_LANCEMENT), quantite: Number.isFinite(q) ? q : null };
}

/* Les places des bonus. p : ce que renvoie lisProduit (membres et quantité).
   prises peut dépasser places : c'est ce qui ferme les bonus. */
export function bonusDe(p) {
  const prises = Math.max(0, p.membres - BONUS_DEPART);
  const o = BONUS_SUIT_OUVERTURE ? ouvertureDe(p.membres, p.quantite) : null;
  const places = o ? o.places : BONUS_PLACES;
  return { places, prises, restantes: Math.max(0, places - prises) };
}
