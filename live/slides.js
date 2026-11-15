/* Les slides du live.

   Ce fichier est public (comme tout le site) : n'y mets rien de secret,
   pas même dans les notes.

   Chaque slide peut avoir :
     surtitre     petite ligne bleue au-dessus du titre
     titre        le titre
     texte        un paragraphe
     puces        une liste de lignes
     grand        un très gros chiffre ou mot (avec « legende » dessous)
     image        une image plein cadre, par exemple "/media/jeu-1.jpg"
     visuel       une illustration dessinée en code, par son nom dans live/visuels.js
                  (trio, lien, galerie, materiel, methode, inspiration, conversation,
                  boucle, revenir, fideles, partage, circuit, ecransPub, calcul,
                  gains, seulAvec, offre, bonus, rejoindre, questions)
     disposition  "large" : l'illustration en grand sous le titre (sinon, à côté)
     offre        true : le bouton « Rejoindre le groupe » apparaît chez les spectateurs
     notes        ce que tu veux dire : visible seulement dans ton espace animateur

   Une rediffusion rejoue les slides par leur numéro : si tu changes l'ordre
   des slides, les anciennes rediffusions ne tombent plus sur les bonnes. */

window.LIVE = {
  titre: "Live Game Build",
  animateur: "Game Build",
  lienOffre: "https://kgpqinxc.mychariow.shop/prd_iiq2laak/checkout",
  lienChaine: "/chaine",

  slides: [
    /* ── 1. Accueil ── */
    {
      surtitre: "Live Game Build",
      titre: "Crée ton propre jeu avec l'IA, depuis ton téléphone.",
      texte: "Écris ton pays dans le chat pendant que tout le monde arrive.",
      visuel: "trio",
      notes: "Accueille les gens qui arrivent, par leur prénom quand tu le vois dans le chat. Demande-leur d'écrire leur pays. Attends une minute que la salle se remplisse.\n\nCes trois jeux sont faits avec l'IA : ce soir, je vous montre comment."
    },

    /* ── 2. Programme ── */
    {
      surtitre: "Ce soir",
      titre: "Ce que tu vas voir",
      puces: [
        "Ce qu'est un petit jeu en ligne",
        "Comment je le crée avec l'IA, sans code",
        "Ce qui fait revenir les joueurs",
        "Comment il rapporte de l'argent",
        "Par où commencer, dès ce soir"
      ],
      notes: "Dis qu'il y aura un moment pour les questions à la fin, mais qu'ils peuvent écrire à tout moment : tu mets les bonnes questions en avant."
    },

    /* ── 3. Un jeu = un lien ── */
    {
      surtitre: "Le jeu",
      titre: "Un petit jeu qui s'ouvre avec un simple lien.",
      texte: "Pas d'application à télécharger : on touche le lien, et on joue.",
      visuel: "lien",
      notes: "C'est le lien qu'on envoie sur WhatsApp, Telegram, Facebook. La personne touche, le jeu s'ouvre dans son navigateur. Rien à installer, ça marche sur Android comme sur iPhone."
    },

    /* ── 4. Les jeux ── */
    {
      surtitre: "En vrai",
      titre: "Mes jeux, et ceux de mes élèves.",
      visuel: "galerie",
      disposition: "large",
      notes: "Présente-les un par un : une course, une défense de château, Remialde Coin, et deux jeux d'élèves. Tous faits avec l'IA, sans une ligne de code écrite à la main."
    },

    /* ── 5. Ce qu'il faut ── */
    {
      surtitre: "Ce qu'il te faut",
      titre: "Un téléphone, et c'est tout.",
      texte: "Pas besoin d'ordinateur, ni de savoir coder.",
      visuel: "materiel",
      notes: "Réponds tout de suite aux deux objections : « je n'ai pas d'ordinateur » et « je ne sais pas coder ». L'application Claude et un compte Google suffisent. Demande dans le chat : qui a déjà l'application Claude ?"
    },

    /* ── 6. La méthode ── */
    {
      surtitre: "La méthode",
      titre: "6 étapes, de l'idée à tes premiers joueurs.",
      visuel: "methode",
      disposition: "large",
      notes: "Donne la vue d'ensemble, sans entrer dans le détail : on prend chaque étape juste après."
    },

    /* ── 7. Étape 1 ── */
    {
      surtitre: "Étape 1",
      titre: "Pars d'un jeu qui marche déjà.",
      texte: "Tu gardes l'idée. Tu changes le nom, l'univers et les images.",
      visuel: "inspiration",
      notes: "Va sur le Play Store, regarde les jeux simples les plus téléchargés. Si des millions de gens y jouent, l'idée plaît. Insiste : on s'inspire, on ne copie pas. Ni le nom, ni les personnages, ni les images. Exemple : Mangue Rush, un vendeur de mangues qui saute de toit en toit."
    },

    /* ── 8. Étape 2 ── */
    {
      surtitre: "Étape 2",
      titre: "Tu le décris. L'IA fabrique le jeu.",
      texte: "En français, comme à un ami. Elle écrit tout le code à ta place.",
      visuel: "conversation",
      notes: "Raconte ta première création. Montre qu'un message de trois lignes suffit pour avoir une première version jouable. Le plus important : bien décrire le jeu."
    },

    /* ── 9. Étape 3 ── */
    {
      surtitre: "Étape 3",
      titre: "Tu testes, tu demandes, elle corrige.",
      texte: "Quelques allers-retours, et ton jeu est prêt.",
      visuel: "boucle",
      notes: "Tu joues, tu notes ce qui ne va pas, tu le dis simplement : « le personnage saute trop haut », « ajoute un bouton pour rejouer ». C'est là que la plupart des gens bloquent seuls : ils ne savent pas quoi demander."
    },

    /* ── 10. Étape 4 ── */
    {
      surtitre: "Étape 4",
      titre: "Ce qui fait revenir les joueurs.",
      texte: "Un jeu qu'on rejoue chaque jour, c'est un jeu qui rapporte.",
      visuel: "revenir",
      notes: "Un record à battre, un cadeau chaque jour, des missions, un bouton pour défier un ami. Chaque ajout se demande à l'IA en un message."
    },

    /* ── 11. Le graphe des joueurs fidèles ── */
    {
      surtitre: "Le vrai secret",
      titre: "200 joueurs fidèles font plus de parties que 5 000 de passage.",
      visuel: "fideles",
      disposition: "large",
      notes: "Fais le calcul à voix haute : 5 000 personnes qui jouent une fois, c'est 5 000 parties. 200 personnes qui font 10 parties par jour pendant un mois, c'est 60 000 parties. Et chaque partie, c'est de la pub vue."
    },

    /* ── 12. Étape 5 ── */
    {
      surtitre: "Étape 5",
      titre: "Ton jeu en ligne, avec un lien à toi.",
      texte: "Tu le partages partout où sont tes futurs joueurs.",
      visuel: "partage",
      notes: "Si on te demande comment le mettre en ligne : avec Jouable, 3 000 F une seule fois, et tu publies autant de jeux que tu veux. Je montre tout dans le groupe."
    },

    /* ── 13. Étape 6 : la pub ── */
    {
      surtitre: "Étape 6",
      titre: "Chaque partie affiche de la publicité.",
      texte: "La régie te paie selon le nombre de pubs vues dans ton jeu.",
      visuel: "circuit",
      notes: "La régie, c'est l'entreprise qui fournit les pubs et qui te paie : j'utilise Adsterra. L'inscription est gratuite, et je montre tout dans le groupe."
    },

    /* ── 14. Les bons moments ── */
    {
      surtitre: "Les bons moments",
      titre: "La pub arrive quand le joueur fait une pause.",
      texte: "En fin de partie, ou en échange de pièces. Jamais au milieu du jeu.",
      visuel: "ecransPub",
      notes: "Un joueur agacé ne revient pas. On place la pub quand il a perdu, ou quand il choisit lui-même de regarder une pub pour gagner des pièces. Règle d'or : on ne clique jamais soi-même sur ses pubs."
    },

    /* ── 15. Le calcul ── */
    {
      surtitre: "L'ordre de grandeur",
      titre: "500 à 1 500 F pour 1 000 parties.",
      texte: "Un repère, pas une promesse : ça dépend du pays des joueurs et des formats de pub.",
      visuel: "calcul",
      disposition: "large",
      notes: "Ne promets aucun montant. Explique les deux leviers : plus de joueurs, et plus de parties par joueur (l'étape 4). Demande dans le chat : combien tu voudrais gagner par jour ? Fais le calcul à l'envers avec la personne."
    },

    /* ── 16. Les gains des élèves ── */
    {
      surtitre: "Les gains",
      titre: "Ce que ça rapporte à mes élèves.",
      texte: "Leurs captures. Les montants sont les leurs, pas une moyenne.",
      visuel: "gains",
      disposition: "large",
      notes: "Ce sont des captures que des élèves m'ont envoyées. Sois honnête : les gains dépendent du nombre de joueurs, et un jeu que peu de gens voient rapporte peu."
    },

    /* ── 17. Seul ou accompagné ── */
    {
      surtitre: "Le plus dur",
      titre: "Seul, on bloque. Et on abandonne.",
      texte: "Ce n'est pas l'IA qui manque. C'est quelqu'un qui te montre le chemin.",
      visuel: "seulAvec",
      notes: "Raconte un blocage classique : une erreur qu'on ne comprend pas, un jeu qui ne s'affiche pas. Seul, on y passe des jours. Avec une vidéo et une réponse, c'est réglé en quelques minutes."
    },

    /* ── 18. L'offre ── */
    {
      surtitre: "L'accompagnement",
      titre: "Crée ton jeu avec moi, au lieu de chercher seul.",
      texte: "Le bouton « Rejoindre le groupe » est juste sous la slide.",
      visuel: "offre",
      offre: true,
      notes: "Le bouton vient d'apparaître chez tout le monde : dis-le. Détaille : les vidéos pas à pas, de la création à la mise en ligne ; tes réponses dans le groupe WhatsApp ; le pack Game Build (2 guides et une vidéo) ; les nouvelles vidéos sans rien payer de plus. 4 500 F, une seule fois. Si on te demande : Jouable coûte 3 000 F à part, une seule fois."
    },

    /* ── 19. Les 2 bonus ── */
    {
      surtitre: "Pour les 30 premiers",
      titre: "2 bonus offerts, en plus du groupe.",
      texte: "Le guide pas à pas et les visuels de ton jeu. Quand les 30 places sont parties, ils ne sont plus offerts.",
      visuel: "bonus",
      offre: true,
      notes: "Avant le live, regarde sur /rejoindre combien de places avec bonus il reste, et annonce le vrai chiffre. Bonus 1 : le guide de 36 pages, avec les messages à copier. Bonus 2 : tu décris ton jeu, et tu reçois son icône, son fond, son personnage, l'objet et l'obstacle. Tout s'affiche sur la page qui s'ouvre après le paiement."
    },

    /* ── 20. Comment rejoindre ── */
    {
      surtitre: "Rejoindre",
      titre: "3 étapes, et tu es dans le groupe.",
      visuel: "rejoindre",
      offre: true,
      notes: "Explique lentement. Demande à ceux qui ont payé de l'écrire dans le chat. Rappelle : demander à rejoindre le groupe avec le même numéro que celui du paiement, j'accepte à la main."
    },

    /* ── 21. Questions ── */
    {
      surtitre: "Questions",
      titre: "Pose ta question dans le chat.",
      texte: "Je réponds à tout le monde, une question après l'autre.",
      visuel: "questions",
      offre: true,
      notes: "Mets en avant les questions une par une avec le bouton « Mettre en avant ». Après chaque réponse sur le prix ou le temps, rappelle le bouton sous la slide."
    },

    /* ── 22. Merci ── */
    {
      surtitre: "Merci",
      titre: "Ton jeu commence ici.",
      texte: "Le bouton pour rejoindre le groupe reste affiché. À très vite dans le groupe.",
      visuel: "trio",
      offre: true,
      notes: "Remercie, rappelle le bouton et les places avec bonus qui restent, puis termine le live."
    }
  ]
};
