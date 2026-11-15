/* Les slides du live.

   Ce fichier est public (comme tout le site) : n'y mets rien de secret,
   pas même dans les notes.

   Chaque slide peut avoir :
     surtitre     petite ligne bleue au-dessus du titre
     titre        le titre
     texte        un paragraphe
     puces        une liste de lignes
     grand        un très gros chiffre ou mot (avec « legende » dessous)
     centre       true : tout est centré (slides d'une seule phrase, gros chiffres)
     image        une image plein cadre, par exemple "/media/jeu-1.jpg"
     visuel       une illustration dessinée en code, par son nom dans live/visuels.js
                  (telephone, lien, galerie, materiel, methode, inspiration,
                  conversation, boucle, revenir, fideles, acteurs, ecransPub,
                  calcul, gains, tiktok, partage, seulAvec, bonus, rejoindre)
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
    /* ───────── Ouverture ───────── */
    {
      surtitre: "Live Game Build",
      titre: "Crée ton jeu avec l'IA, depuis ton téléphone.",
      texte: "Écris ton pays dans le chat.",
      visuel: "telephone",
      notes: "Accueille les gens qui arrivent, par leur prénom quand tu le vois dans le chat. Demande-leur d'écrire leur pays. Attends une minute que la salle se remplisse."
    },
    {
      surtitre: "Ce soir",
      titre: "Ce que tu vas voir",
      puces: [
        "Ce qu'est un petit jeu en ligne",
        "Le créer avec l'IA, sans code",
        "Comment il rapporte de l'argent",
        "Faire venir des joueurs avec TikTok",
        "Par où commencer"
      ],
      notes: "Dis qu'ils peuvent écrire leurs questions à tout moment : tu mets les bonnes en avant, et il y a un moment pour les questions à la fin."
    },
    {
      surtitre: "Le jeu",
      titre: "Un jeu, c'est un lien.",
      texte: "Rien à installer : on touche le lien, on joue.",
      visuel: "lien",
      notes: "C'est le lien qu'on envoie sur WhatsApp, Telegram, Facebook, ou qu'on met dans sa bio TikTok. Ça marche sur Android comme sur iPhone, dans le navigateur."
    },
    {
      surtitre: "En vrai",
      titre: "Mes jeux, et ceux de mes élèves.",
      visuel: "galerie",
      disposition: "large",
      notes: "Présente-les un par un : une course, une défense de château, Remialde Coin, et des jeux d'élèves. Tous faits avec l'IA, sans une ligne de code écrite à la main."
    },
    {
      surtitre: "Ce qu'il te faut",
      titre: "Un téléphone suffit.",
      texte: "Pas d'ordinateur. Pas de code.",
      visuel: "materiel",
      notes: "Réponds tout de suite aux deux objections : « je n'ai pas d'ordinateur » et « je ne sais pas coder ». Demande dans le chat : qui a déjà l'application Claude ?"
    },

    /* ───────── Créer le jeu ───────── */
    {
      surtitre: "La méthode",
      titre: "6 étapes, de l'idée à tes premiers joueurs.",
      visuel: "methode",
      disposition: "large",
      notes: "Donne la vue d'ensemble, sans entrer dans le détail : on prend chaque étape juste après."
    },
    {
      surtitre: "Étape 1",
      titre: "Pars d'un jeu qui marche déjà.",
      texte: "Garde l'idée. Change le nom, l'univers, les images.",
      visuel: "inspiration",
      notes: "Va sur le Play Store, regarde les jeux simples les plus téléchargés : si des millions de gens y jouent, l'idée plaît. On s'inspire, on ne copie pas : ni le nom, ni les personnages, ni les images. Exemple : Mangue Rush, un vendeur de mangues qui saute de toit en toit."
    },
    {
      surtitre: "Étape 2",
      titre: "Décris-le. L'IA le fabrique.",
      texte: "En français, comme à un ami.",
      visuel: "conversation",
      notes: "Raconte ta première création. Un message de trois lignes suffit pour avoir une première version jouable. L'IA écrit tout le code. Le plus important : bien décrire le jeu."
    },
    {
      surtitre: "Étape 3",
      titre: "Teste. Demande. Elle corrige.",
      texte: "Quelques allers-retours, et ton jeu est prêt.",
      visuel: "boucle",
      notes: "Tu joues, tu notes ce qui ne va pas, tu le dis simplement : « le personnage saute trop haut », « ajoute un bouton pour rejouer ». C'est là que la plupart des gens bloquent seuls : ils ne savent pas quoi demander."
    },
    {
      surtitre: "Étape 4",
      titre: "Donne envie de revenir.",
      visuel: "revenir",
      notes: "Un record à battre, un cadeau chaque jour, des missions, un bouton pour défier un ami. Chaque ajout se demande à l'IA en un message."
    },
    {
      surtitre: "Pourquoi c'est important",
      titre: "200 joueurs fidèles font plus de parties que 5 000 de passage.",
      visuel: "fideles",
      disposition: "large",
      notes: "Fais le calcul à voix haute : 5 000 personnes qui jouent une fois, c'est 5 000 parties. 200 personnes qui font 10 parties par jour pendant un mois, c'est 60 000 parties. Et chaque partie, ce sont des pubs vues : on va voir pourquoi ça compte."
    },
    {
      surtitre: "Étape 5",
      titre: "Mets ton jeu en ligne.",
      texte: "Il a son propre lien, à partager partout.",
      centre: true,
      notes: "Si on te demande comment le mettre en ligne : avec Jouable, 3 000 F une seule fois, et tu publies autant de jeux que tu veux. Je montre tout dans le groupe."
    },

    /* ───────── Le modèle économique ───────── */
    {
      surtitre: "Étape 6",
      titre: "Comment un jeu gratuit rapporte de l'argent ?",
      centre: true,
      notes: "Pose la question au chat avant de répondre : « D'après vous, qui paie ? » Laisse quelques réponses arriver."
    },
    {
      surtitre: "Le circuit",
      titre: "Trois acteurs : l'annonceur, la régie, et toi.",
      visuel: "acteurs",
      disposition: "large",
      notes: "L'argent va de gauche à droite : l'annonceur paie la régie, la régie te paie. Les pubs vues vont dans l'autre sens : tes joueurs les regardent, la régie le compte, l'annonceur obtient ce qu'il a payé. C'est le même modèle que la télé ou YouTube."
    },
    {
      surtitre: "L'annonceur",
      titre: "Il paie pour être vu.",
      texte: "Une appli, un jeu, une boutique en ligne : il veut que des milliers de gens voient sa pub. Il paie pour ça.",
      notes: "Donne des exemples que tout le monde connaît : les applis de paris, les autres jeux, les boutiques. Ils ont un budget pub, et ils cherchent des endroits où des gens regardent leur écran."
    },
    {
      surtitre: "La régie",
      titre: "Elle fait le lien.",
      texte: "Elle réunit des milliers d'annonceurs et des milliers de sites et de jeux. Elle place les pubs, garde sa part, et verse le reste aux éditeurs.",
      notes: "Un annonceur ne peut pas appeler chaque petit jeu un par un : la régie le fait pour lui. Moi, j'utilise Adsterra. L'inscription est gratuite, tu colles leurs codes de pub dans ton jeu, et elle te paie selon les pubs vues."
    },
    {
      surtitre: "L'éditeur, c'est toi",
      titre: "Ton jeu, c'est de l'attention.",
      texte: "Chaque pub vue dans ton jeu te rapporte. Place-la quand le joueur fait une pause.",
      visuel: "ecransPub",
      notes: "L'éditeur, c'est celui qui possède l'espace où la pub s'affiche : un site, une appli, ton jeu. On place la pub en fin de partie, ou quand le joueur choisit de regarder une pub pour gagner des pièces. Jamais au milieu du jeu : un joueur agacé ne revient pas. Règle d'or : on ne clique jamais soi-même sur ses pubs."
    },
    {
      surtitre: "Comment on compte",
      grand: "CPM",
      legende: "le prix de 1 000 pubs vues",
      texte: "C'est ce que paie l'annonceur. Il change surtout selon le pays de tes joueurs.",
      centre: true,
      notes: "CPM, c'est le coût pour mille affichages. Un joueur en Europe vaut plus qu'un joueur en Afrique de l'Ouest, parce que les annonceurs y paient plus cher. Le format de pub compte aussi."
    },
    {
      surtitre: "L'ordre de grandeur",
      titre: "500 à 1 500 F pour 1 000 parties.",
      texte: "Un repère, pas une promesse.",
      visuel: "calcul",
      disposition: "large",
      notes: "Ne promets aucun montant. Deux leviers : plus de joueurs, et plus de parties par joueur (l'étape 4). Demande dans le chat : combien tu voudrais gagner par jour ? Fais le calcul à l'envers avec la personne."
    },
    {
      surtitre: "Les gains",
      titre: "Ce que ça rapporte à mes élèves.",
      texte: "Leurs captures. Les montants sont les leurs, pas une moyenne.",
      visuel: "gains",
      disposition: "large",
      notes: "Ce sont des captures que des élèves m'ont envoyées. Sois honnête : les gains dépendent du nombre de joueurs, et un jeu que peu de gens voient rapporte peu."
    },

    /* ───────── Faire venir les joueurs ───────── */
    {
      surtitre: "Faire venir les joueurs",
      titre: "Pas de joueurs, pas de pubs vues.",
      texte: "Le meilleur endroit pour les trouver : TikTok.",
      centre: true,
      notes: "Fais le lien avec ce qu'on vient de voir : toute la pub repose sur les joueurs. Et les joueurs, aujourd'hui, ils sont sur TikTok."
    },
    {
      surtitre: "TikTok",
      titre: "Une vidéo peut faire exploser ton jeu.",
      texte: "15 secondes de partie, un défi écrit à l'écran, le lien dans ta bio.",
      visuel: "tiktok",
      notes: "Le format qui marche : on filme une partie, on écrit un défi (« Personne ne dépasse 50 points »), les gens veulent prouver qu'ils peuvent, ils cliquent sur le lien. Une vidéo qui part en vrille peut amener des milliers de joueurs en une journée. Reste honnête : on ne sait jamais quelle vidéo va exploser, c'est pour ça qu'on en publie beaucoup."
    },
    {
      surtitre: "La tendance",
      titre: "Crée ton jeu autour d'une tendance.",
      texte: "Un son, un défi, un sujet dont tout le monde parle : les gens le cherchent déjà. Ton jeu arrive au bon moment.",
      notes: "Regarde ce qui tourne en ce moment sur TikTok : un son, un défi, une blague, un sujet du pays. Fais un petit jeu sur ce thème en une soirée avec l'IA, et publie les vidéos tant que la tendance est chaude. Attention : on s'inspire de l'idée, sans utiliser de marque ni de personnage protégé."
    },
    {
      surtitre: "La pub TikTok",
      titre: "Ou accélère avec la pub.",
      texte: "Un petit budget pour tester, et des joueurs dès le premier jour. Tu gardes la vidéo qui marche le mieux.",
      notes: "Prends une vidéo qui a bien marché en organique et pousse-la avec un petit budget. Commence petit, regarde combien de joueurs arrivent, puis décide. Selon les pays, l'option pour promouvoir une vidéo n'est pas toujours disponible : je montre tout dans le groupe."
    },
    {
      grand: "1 vidéo",
      legende: "par jour, au minimum",
      texte: "La régularité fait plus que la chance.",
      centre: true,
      notes: "Plus tu publies, plus tu as de chances qu'une vidéo parte. Une par jour, c'est le minimum. Ceux qui réussissent en publient deux ou trois."
    },
    {
      surtitre: "Et aussi",
      titre: "Partout où sont tes futurs joueurs.",
      visuel: "partage",
      notes: "Tes proches d'abord : famille, amis, collègues, ce sont tes premiers testeurs et ils partagent. Les groupes WhatsApp et Telegram, avec l'accord de l'administrateur. Jamais de messages en masse."
    },

    /* ───────── L'accompagnement ───────── */
    {
      surtitre: "Le plus dur",
      titre: "Seul, on bloque. Et on abandonne.",
      visuel: "seulAvec",
      notes: "Raconte un blocage classique : une erreur qu'on ne comprend pas, un jeu qui ne s'affiche pas, une pub qui ne s'affiche pas. Seul, on y passe des jours. Avec une vidéo et une réponse, c'est réglé en quelques minutes."
    },
    {
      surtitre: "L'accompagnement",
      titre: "Crée ton jeu avec moi.",
      puces: [
        "Mes vidéos pas à pas, de l'idée aux premiers joueurs",
        "Mes réponses quand tu bloques, dans le groupe",
        "Le pack Game Build : 2 guides et une vidéo",
        "Les nouvelles vidéos, sans rien payer de plus"
      ],
      offre: true,
      notes: "Le bouton « Rejoindre le groupe » vient d'apparaître chez tout le monde : dis-le. Si on te demande : Jouable coûte 3 000 F à part, une seule fois."
    },
    {
      grand: "4 500 F",
      legende: "une seule fois",
      texte: "Le bouton « Rejoindre le groupe » est juste sous la slide.",
      centre: true,
      offre: true,
      notes: "Annonce le prix calmement, puis tais-toi deux secondes. Rappelle que c'est une seule fois, pas un abonnement."
    },
    {
      surtitre: "Pour les 30 premiers",
      titre: "2 bonus en plus.",
      texte: "Quand les 30 places sont parties, ils ne sont plus offerts.",
      visuel: "bonus",
      offre: true,
      notes: "Avant le live, regarde sur /rejoindre combien de places avec bonus il reste, et annonce le vrai chiffre. Bonus 1 : le guide de 36 pages, avec les messages à copier. Bonus 2 : tu décris ton jeu, et tu reçois son icône, son fond, son personnage, l'objet et l'obstacle. Tout s'affiche sur la page qui s'ouvre après le paiement."
    },
    {
      surtitre: "Rejoindre",
      titre: "3 étapes, et tu es dans le groupe.",
      visuel: "rejoindre",
      offre: true,
      notes: "Explique lentement. Demande à ceux qui ont payé de l'écrire dans le chat. Rappelle : demander à rejoindre le groupe avec le même numéro que celui du paiement, j'accepte à la main."
    },
    {
      surtitre: "Questions",
      titre: "Pose ta question dans le chat.",
      centre: true,
      offre: true,
      notes: "Mets en avant les questions une par une avec le bouton « Mettre en avant ». Après chaque réponse sur le prix ou le temps, rappelle le bouton sous la slide."
    },
    {
      surtitre: "Merci",
      titre: "Ton jeu commence ici.",
      texte: "Le bouton pour rejoindre le groupe reste affiché.",
      visuel: "telephone",
      offre: true,
      notes: "Remercie, rappelle le bouton et les places avec bonus qui restent, puis termine le live."
    }
  ]
};
