/* ══════════════════════════════════════════════════════════
   FORMATION GRATUITE — le contenu
   C'est le SEUL fichier à modifier pour changer un titre, un
   lien de vidéo ou un prompt. Les pages se construisent toutes
   seules à partir d'ici.

   adresse : l'adresse de la page de la vidéo.
   cache   : true = la vidéo n'apparaît ni dans le sommaire ni dans
             « vidéo précédente / suivante » : on n'y accède que par
             son adresse (elle n'est pas non plus proposée à Google).
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
  sousTitre: "Trois vidéos pour créer avec l'IA et en tirer de l'argent. Regarde-les dans l'ordre, ou va directement à celle qui t'intéresse.",

  videos: [
    {
      adresse: "/gamebuild",
      cache: true,
      titre: "Crée ton jeu avec Claude et gagne de l'argent avec la pub",
      duree: "12 min",
      youtube: "https://youtu.be/2ZkIOQSL2Jk",
      resume: "Tu envoies un prompt à Claude, il fabrique ton jeu, tu le mets en ligne sur ton blog Blogger. Ensuite tu y ajoutes la publicité Adsterra et tu retires tes gains.",
      prompts: []
    },
    {
      adresse: "/formation/influenceur-ia",
      titre: "Crée ton influenceur IA bizarre et fais-le percer sur TikTok",
      duree: "9 min",
      youtube: "https://youtu.be/QGUQmvaGzGM",
      resume: "Avec Claude, tu crées le personnage de ton influenceur. Tu reprends une vidéo qui a déjà percé en lui donnant son visage, puis tu découvres deux façons de le monétiser.",
      prompts: [
        {
          titre: "Le prompt à envoyer à Claude",
          texte: `Lis le skill de cette page et applique-le pour créer mon influenceur IA bizarre. Commence directement par le questionnaire : https://influbizarreviral.vercel.app/`
        }
      ]
    },
    {
      adresse: "/formation/dessins-animes-ia",
      titre: "Des dessins animés IA sur TikTok, comme Télétoon",
      duree: "8 min",
      youtube: "https://youtu.be/fAISLfSDOKU",
      resume: "La méthode du compte Télétoon et ses 115 000 abonnés : créer les personnages, écrire les prompts d'animation avec Claude, publier, puis passer à la monétisation TikTok.",
      prompts: [
        {
          titre: "Le prompt à envoyer à Claude",
          texte: `Utilise ce skill pour m'aider à créer ma vidéo : https://animatoon.vercel.app/skill.md`
        }
      ]
    },
    {
      adresse: "/formation/influenceuse-ia",
      titre: "Ton influenceuse IA qui vend ses contenus sur Momolink",
      duree: "20 min",
      youtube: "https://youtu.be/ht3LHiLuqTs",
      resume: "Garder le même visage d'une image à l'autre, rendre les vidéos virales avec les bons sons, puis vendre des contenus exclusifs sur Momolink.",
      prompts: [
        {
          titre: "Le prompt à envoyer à Claude",
          texte: `Utilise ce skill d'influenceuse IA. Voici ses pages (commence par la première) :
https://influenceuseia.vercel.app/skill.html
https://influenceuseia.vercel.app/etape-profil.html
https://influenceuseia.vercel.app/etape-style.html
https://influenceuseia.vercel.app/etape-image.html
https://influenceuseia.vercel.app/etape-video.html`
        }
      ]
    }
  ]
};
