/* Le bouton « Rejoindre le groupe » de la page de bienvenue (après le
   paiement Chariow) passe par ici, puis part vers le groupe WhatsApp.

   Le lien d'invitation est dans la variable LIEN_GROUPE, sur Vercel, et
   nulle part dans le code : le dépôt GitHub est public, et ce lien est
   l'accès payant. Le groupe doit garder l'approbation des membres :
   c'est elle qui protège vraiment l'accès.

   Sans lien valable, on revient sur la page de bienvenue, qui affiche
   alors le numéro à contacter. */

const PAGE_BIENVENUE = "/bienvenue-r8m4t";

export default function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("X-Robots-Tag", "noindex, nofollow");
  const lien = String(process.env.LIEN_GROUPE || "").trim();
  const valable = /^https:\/\/chat\.whatsapp\.com\/[A-Za-z0-9]{10,}/.test(lien);
  res.statusCode = 302;
  res.setHeader("Location", valable ? lien : PAGE_BIENVENUE + "?groupe=indisponible");
  res.end();
}
