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
    },

    /* ══════════════ Les vidéos de la chaîne WhatsApp ══════════════
       Une série à part (serie: "chaine") : cachées du sommaire de la
       formation, numérotées et reliées entre elles (1 sur 4…), avec un
       appel à l'action sous chaque vidéo (appel). Pages dans video/.
       appel.bouton : le bouton bleu ; appel.secondaire : le lien en
       dessous. Le diagnostic garde la vidéo d'origine dans « src ». */
    {
      adresse: "/video/presentation",
      cache: true, serie: "chaine",
      titre: "Comment ton jeu peut te rapporter de l'argent",
      duree: "5 min",
      youtube: "https://youtu.be/5u0nUVpzADY",
      resume: "La présentation : comment on crée un jeu avec l'IA depuis son téléphone, et comment la publicité affichée dans le jeu le fait payer.",
      prompts: [],
      appel: {
        titre: "Et toi, c'est fait pour toi ?",
        texte: "Réponds à 10 questions. En 2 minutes, je te dis franchement si ce business te correspond, avec 3 idées de jeux choisies pour toi.",
        bouton: { texte: "Faire mon diagnostic gratuit", lien: "/diagnostic?src=video-presentation" },
        secondaire: { texte: "Retourner à la chaîne", lien: "https://www.whatsapp.com/channel/0029Vb8XIsmFnSzD0G0r5a2G" }
      }
    },
    {
      adresse: "/video/adsense-adsterra",
      cache: true, serie: "chaine",
      titre: "Comment Adsterra et Google AdSense te paient",
      duree: "11 min",
      youtube: "https://www.youtube.com/watch?v=w9IMvoareuI",
      resume: "Comment la publicité affichée dans ton jeu te rapporte de l'argent, la différence entre Adsterra et Google AdSense, et comment créer tes deux comptes.",
      prompts: [],
      appel: {
        titre: "Il te reste le jeu qui affiche la pub",
        texte: "Fais le diagnostic gratuit : en 2 minutes, je te dis si ce business est fait pour toi, et quel jeu tu pourrais créer.",
        bouton: { texte: "Faire mon diagnostic gratuit", lien: "/diagnostic?src=video-adsense" },
        secondaire: { texte: "Retourner à la chaîne", lien: "https://www.whatsapp.com/channel/0029Vb8XIsmFnSzD0G0r5a2G" }
      }
    },
    {
      adresse: "/video/creer-ton-jeu",
      cache: true, serie: "chaine",
      titre: "Crée ton jeu avec Claude et mets-le en ligne sur Jouable",
      duree: "11 min",
      youtube: "https://www.youtube.com/watch?v=QmQGbcJgCzY",
      resume: "Tu crées ton jeu avec l'application Claude, tu le mets en ligne sur Jouable, puis tu ajoutes la publicité Adsterra pour qu'il commence à te rapporter.",
      prompts: [],
      appel: {
        titre: "Tu veux le faire avec moi ?",
        texte: "Dans l'accompagnement, je crée mes jeux devant toi, étape par étape, et je réponds quand tu bloques. Fais d'abord le diagnostic : il te dit si c'est fait pour toi.",
        bouton: { texte: "Faire mon diagnostic gratuit", lien: "/diagnostic?src=video-creer" },
        secondaire: { texte: "Retourner à la chaîne", lien: "https://www.whatsapp.com/channel/0029Vb8XIsmFnSzD0G0r5a2G" }
      }
    },
    {
      adresse: "/video/accompagnement",
      cache: true, serie: "chaine",
      titre: "À voir avant de rejoindre le groupe d'accompagnement",
      duree: "",
      youtube: "",
      resume: "Ce que tu reçois dans le groupe WhatsApp d'accompagnement, et comment savoir s'il est fait pour toi.",
      prompts: [],
      appel: {
        titre: "Le test, avant de rejoindre",
        texte: "Réponds à 10 questions. En 2 minutes, je te dis franchement si l'accompagnement est fait pour toi. Si c'est le cas, tu peux le rejoindre juste après.",
        bouton: { texte: "Faire le test de qualification", lien: "/diagnostic?src=video-accompagnement" },
        secondaire: { texte: "Retourner à la chaîne", lien: "https://www.whatsapp.com/channel/0029Vb8XIsmFnSzD0G0r5a2G" }
      }
    }
  ]
};
