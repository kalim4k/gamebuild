/* ══════════════════════════════════════════════════════════
   FORMATION GRATUITE — le contenu
   C'est le SEUL fichier à modifier pour changer un titre, un
   lien de vidéo ou un prompt. Les pages se construisent toutes
   seules à partir d'ici.

   youtube : le lien de la vidéo, sous n'importe quelle forme
             (youtu.be/…, youtube.com/watch?v=…, /shorts/…).
             Vide = « Vidéo bientôt disponible ».
   prompts : les prompts affichés sous la vidéo, dans l'ordre.
             [] = pas de prompt sous cette vidéo.
             Chaque texte s'écrit entre deux accents graves ` … ` :
             retours à la ligne et guillemets sont gardés tels quels.

   Les vidéos ne sont JAMAIS hébergées sur Vercel : elles sont
   lues depuis YouTube, qui paie la bande passante.
   ══════════════════════════════════════════════════════════ */

window.FORMATION = {
  titre: "Formation gratuite",
  sousTitre: "Quatre vidéos pour créer avec l'IA et en tirer de l'argent. Regarde-les dans l'ordre, ou va directement à celle qui t'intéresse.",

  videos: [
    {
      titre: "Crée ton jeu avec Claude et gagne de l'argent avec la pub",
      duree: "12 min",
      youtube: "",
      resume: "Tu envoies un prompt à Claude, il fabrique ton jeu, tu le mets en ligne sur ton blog Blogger. Ensuite tu y ajoutes la publicité Adsterra et tu retires tes gains.",
      prompts: [
        {
          titre: "Le prompt du jeu",
          texte: `Crée-moi un jeu HTML5 à mettre sur mon blog Blogger. J'aurai juste à copier le code et à le remplacer dans le code du thème Blogger, ou à importer le fichier XML.`
        }
      ]
    },
    {
      titre: "Crée ton influenceur IA et fais-le percer sur TikTok",
      duree: "9 min",
      youtube: "",
      resume: "Avec Claude, tu crées le personnage de ton influenceur. Tu reprends une vidéo qui a déjà percé en lui donnant son visage, puis tu découvres deux façons de le monétiser.",
      prompts: []
    },
    {
      titre: "Des dessins animés IA sur TikTok, comme Télétoon",
      duree: "8 min",
      youtube: "",
      resume: "La méthode du compte Télétoon et ses 115 000 abonnés : créer les personnages, écrire les prompts d'animation avec Claude, publier, puis passer à la monétisation TikTok.",
      prompts: []
    },
    {
      titre: "Ton influenceuse IA qui vend ses contenus sur Momolink",
      duree: "20 min",
      youtube: "",
      resume: "Garder le même visage d'une image à l'autre, rendre les vidéos virales avec les bons sons, puis vendre des contenus exclusifs sur Momolink.",
      prompts: []
    }
  ]
};
