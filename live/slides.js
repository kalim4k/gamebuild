/* Les slides du live. BROUILLON : à relire et à corriger avant le premier live.

   Ce fichier est public (comme tout le site) : n'y mets rien de secret,
   pas même dans les notes.

   Chaque slide peut avoir :
     surtitre   petite ligne bleue au-dessus du titre
     titre      le titre
     texte      un paragraphe
     puces      une liste de lignes
     grand      un très gros chiffre ou mot (avec « legende » dessous)
     image      une image plein cadre, par exemple "/live/images/jeu-1.jpg"
     offre      true : le bouton « Rejoindre le groupe » apparaît chez les spectateurs
     notes      ce que tu veux dire : visible seulement dans ton espace animateur */

window.LIVE = {
  titre: "Live Game Build",
  animateur: "Game Build",
  lienOffre: "https://kgpqinxc.mychariow.shop/prd_iiq2laak/checkout",
  lienChaine: "/chaine",

  slides: [
    {
      surtitre: "Live Game Build",
      titre: "Crée ton propre jeu avec l'IA, juste avec ton téléphone.",
      texte: "Pose tes questions dans le chat pendant tout le live.",
      notes: "Accueille les gens qui arrivent. Demande-leur d'écrire leur pays dans le chat. Attends une minute que la salle se remplisse."
    },
    {
      surtitre: "Ce soir",
      titre: "Ce que tu vas voir",
      puces: [
        "Ce qu'est un petit jeu en ligne",
        "Comment je le crée avec l'IA",
        "Comment il rapporte de l'argent",
        "Comment trouver des joueurs",
        "Par où commencer"
      ],
      notes: "Annonce qu'il y aura un moment pour les questions à la fin, mais qu'ils peuvent écrire à tout moment."
    },
    {
      surtitre: "Le jeu",
      titre: "Un petit jeu qui s'ouvre avec un simple lien.",
      texte: "Pas besoin d'application à télécharger : on touche le lien et on joue, dans le navigateur ou sur Telegram.",
      notes: "Montre un de tes jeux. Explique que c'est le lien qu'on partage sur WhatsApp, Telegram et les réseaux."
    },
    {
      surtitre: "La création",
      titre: "Tu écris ce que tu veux. L'IA fabrique le jeu.",
      puces: [
        "Tu décris ton jeu en français",
        "L'IA écrit tout le code à ta place",
        "Tu testes, tu demandes des changements",
        "Tout se fait depuis ton téléphone"
      ],
      notes: "Raconte ta première création. Insiste : pas d'ordinateur, pas de code."
    },
    {
      surtitre: "Le revenu",
      titre: "Chaque partie affiche de la publicité.",
      texte: "La régie publicitaire te paie selon le nombre de pubs vues. Plus il y a de parties jouées, plus le jeu rapporte.",
      notes: "Cite Adsterra. Ne promets aucun montant."
    },
    {
      surtitre: "L'ordre de grandeur",
      grand: "500 à 1 500 F",
      legende: "pour 1 000 parties jouées",
      texte: "Selon le pays des joueurs et la régie. C'est un repère, pas une promesse.",
      notes: "Fais le calcul en direct : 200 joueurs qui font 10 parties par jour, c'est 2 000 parties par jour."
    },
    {
      surtitre: "Le vrai défi",
      titre: "Ce qui compte, ce sont les joueurs qui reviennent.",
      puces: [
        "Des parties courtes qu'on rejoue",
        "Un meilleur score à battre",
        "Une récompense chaque jour",
        "Un bouton pour défier ses amis"
      ],
      notes: "Explique que 200 joueurs fidèles rapportent plus que 5 000 joueurs qui ne reviennent jamais."
    },
    {
      surtitre: "Ce qu'il te faut",
      titre: "Un téléphone, et c'est tout.",
      puces: [
        "Un téléphone Android ou un iPhone",
        "L'application Claude",
        "Un compte Google"
      ],
      notes: "Réponds aux objections : pas besoin d'ordinateur, pas besoin de savoir coder."
    },
    {
      surtitre: "L'accompagnement",
      titre: "Crée ton jeu avec moi, au lieu de chercher seul.",
      puces: [
        "Mes vidéos pas à pas, de la création à la mise en ligne",
        "Mes réponses quand tu bloques, dans le groupe WhatsApp",
        "Le pack Game Build : 2 guides et une vidéo",
        "Les nouvelles vidéos, sans rien payer de plus"
      ],
      offre: true,
      notes: "Le bouton « Rejoindre le groupe » vient d'apparaître chez tout le monde. Dis-le. Si on te demande : Jouable coûte 3 000 F à part, une seule fois."
    },
    {
      surtitre: "Questions",
      titre: "Pose ta question dans le chat.",
      texte: "Je réponds à tout le monde, une question après l'autre.",
      offre: true,
      notes: "Mets en avant les questions une par une avec le bouton « Mettre en avant »."
    },
    {
      surtitre: "Merci",
      titre: "Ton jeu commence ici.",
      texte: "Le bouton pour rejoindre le groupe reste affiché. À très vite dans le groupe.",
      offre: true,
      notes: "Remercie, rappelle le bouton, puis termine le live."
    }
  ]
};
