/* Les illustrations des slides du live, dessinées en code (SVG).

   Style épuré : fond blanc, dessins au trait, peu de mots, deux couleurs
   d'accent au plus (le bleu, et le vert pour l'argent). Pas de cadres,
   pas de pastilles, pas d'animation.

   Une slide les appelle par leur nom : visuel: "lien", par exemple.
   Le texte de ces dessins est écrit ici, dans le code du site : aucun
   texte venu du chat ou de l'extérieur n'y entre jamais.

   Chaque dessin a un viewBox fixe et s'adapte à la place qu'on lui
   donne. Les dessins larges ont aussi une version pour téléphone
   (classes v-ordi et v-tel, voir live.css). Les identifiants (dégradés,
   découpes) sont uniques à chaque dessin, parce que le studio affiche
   toutes les slides en même temps. */

window.LiveVisuels = (function () {
  "use strict";

  var C = {
    encre: "#1d1d1f", gris: "#86868b", trait: "#d2d2d7", fond: "#f5f5f7",
    bleu: "#0071e3", vert: "#248a3d", rouge: "#d70015", orange: "#f56300", or: "#f5b400"
  };
  var NB = " ";
  var compte = 0;
  function uid() { compte += 1; return "lv" + compte + "x"; }

  function svg(vb, label, defs, corps, classe) {
    return '<svg viewBox="' + vb + '" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="' + label + '"' +
      (classe ? ' class="' + classe + '"' : "") + ">" + (defs ? "<defs>" + defs + "</defs>" : "") + corps + "</svg>";
  }
  function texte(x, y, t, taille, couleur, opts) {
    opts = opts || {};
    return '<text x="' + x + '" y="' + y + '" font-size="' + taille + '" fill="' + couleur + '"' +
      (opts.gras ? ' font-weight="' + (opts.gras === true ? 600 : opts.gras) + '"' : "") +
      (opts.ancre ? ' text-anchor="' + opts.ancre + '"' : "") + ">" + t + "</text>";
  }
  function ligne(x1, y1, x2, y2, couleur, epaisseur) {
    return '<path d="M' + x1 + " " + y1 + " L" + x2 + " " + y2 + '" stroke="' + (couleur || C.trait) + '" stroke-width="' + (epaisseur || 2) + '" stroke-linecap="round"/>';
  }
  /* Une flèche fine de (x1,y1) à (x2,y2) */
  function fleche(x1, y1, x2, y2, couleur, epaisseur) {
    var a = Math.atan2(y2 - y1, x2 - x1), t = 9 + (epaisseur || 2) * 1.5;
    var p1 = (x2 - t * Math.cos(a - 0.5)) + " " + (y2 - t * Math.sin(a - 0.5));
    var p2 = (x2 - t * Math.cos(a + 0.5)) + " " + (y2 - t * Math.sin(a + 0.5));
    return ligne(x1, y1, x2, y2, couleur, epaisseur) +
      '<path d="M' + p1 + " L" + x2 + " " + y2 + " L" + p2 + '" fill="none" stroke="' + couleur + '" stroke-width="' + (epaisseur || 2) + '" stroke-linecap="round" stroke-linejoin="round"/>';
  }

  /* Un téléphone avec une capture d'écran dedans */
  function telephone(u, k, x, y, w, h, image) {
    var r = w * 0.17, b = w * 0.04, cx = x + w / 2, id = u + "t" + k;
    return "<g>" +
      '<clipPath id="' + id + '"><rect x="' + (x + b) + '" y="' + (y + b) + '" width="' + (w - 2 * b) + '" height="' + (h - 2 * b) + '" rx="' + (r - b) + '"/></clipPath>' +
      '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" rx="' + r + '" fill="#1d1d1f"/>' +
      '<image href="' + image + '" x="' + (x + b) + '" y="' + (y + b) + '" width="' + (w - 2 * b) + '" height="' + (h - 2 * b) + '" preserveAspectRatio="xMidYMid slice" clip-path="url(#' + id + ')"/>' +
      '<rect x="' + (cx - w * 0.14) + '" y="' + (y + b + w * 0.035) + '" width="' + (w * 0.28) + '" height="' + (w * 0.07) + '" rx="' + (w * 0.035) + '" fill="#000"/>' +
      "</g>";
  }

  /* Icônes au trait, centrées sur (x, y), environ 64 de haut */
  var I = {
    telephone: function (x, y, c) {
      return '<rect x="' + (x - 20) + '" y="' + (y - 32) + '" width="40" height="64" rx="9" fill="none" stroke="' + c + '" stroke-width="3"/>' +
        ligne(x - 6, y + 24, x + 6, y + 24, c, 3);
    },
    bulle: function (x, y, c) {
      return '<path d="M' + (x - 30) + " " + (y - 24) + " h60 a8 8 0 0 1 8 8 v32 a8 8 0 0 1 -8 8 h-38 l-14 12 v-12 h-8 a8 8 0 0 1 -8 -8 v-32 a8 8 0 0 1 8 -8 z" +
        '" fill="none" stroke="' + c + '" stroke-width="3" stroke-linejoin="round"/>' +
        texte(x, y + 9, "IA", 22, c, { ancre: "middle", gras: 700 });
    },
    personne: function (x, y, c) {
      return '<circle cx="' + x + '" cy="' + (y - 14) + '" r="13" fill="none" stroke="' + c + '" stroke-width="3"/>' +
        '<path d="M' + (x - 26) + " " + (y + 30) + " a26 22 0 0 1 52 0" + '" fill="none" stroke="' + c + '" stroke-width="3" stroke-linecap="round"/>';
    },
    trophee: function (x, y, c) {
      return '<path d="M' + (x - 20) + " " + (y - 28) + " h40 v14 a20 20 0 0 1 -40 0 z" + '" fill="none" stroke="' + c + '" stroke-width="3" stroke-linejoin="round"/>' +
        '<path d="M' + (x - 20) + " " + (y - 22) + " h-10 a10 10 0 0 0 12 16 M" + (x + 20) + " " + (y - 22) + " h10 a10 10 0 0 1 -12 16" + '" fill="none" stroke="' + c + '" stroke-width="3"/>' +
        ligne(x, y + 6, x, y + 18, c, 3) + ligne(x - 14, y + 22, x + 14, y + 22, c, 3);
    },
    cadeau: function (x, y, c) {
      return '<rect x="' + (x - 24) + '" y="' + (y - 10) + '" width="48" height="34" rx="4" fill="none" stroke="' + c + '" stroke-width="3"/>' +
        '<rect x="' + (x - 28) + '" y="' + (y - 22) + '" width="56" height="12" rx="3" fill="none" stroke="' + c + '" stroke-width="3"/>' +
        ligne(x, y - 22, x, y + 24, c, 3) +
        '<path d="M' + x + " " + (y - 22) + " c-6 -14 -24 -12 -18 -2 c3 4 12 2 18 2 c6 0 15 2 18 -2 c6 -10 -12 -12 -18 2" + '" fill="none" stroke="' + c + '" stroke-width="3" stroke-linejoin="round"/>';
    },
    cible: function (x, y, c) {
      return '<circle cx="' + x + '" cy="' + y + '" r="28" fill="none" stroke="' + c + '" stroke-width="3"/>' +
        '<circle cx="' + x + '" cy="' + y + '" r="16" fill="none" stroke="' + c + '" stroke-width="3"/>' +
        '<circle cx="' + x + '" cy="' + y + '" r="5" fill="' + c + '"/>';
    },
    amis: function (x, y, c) {
      return '<circle cx="' + (x - 12) + '" cy="' + (y - 14) + '" r="11" fill="none" stroke="' + c + '" stroke-width="3"/>' +
        '<path d="M' + (x - 34) + " " + (y + 26) + " a22 20 0 0 1 44 0" + '" fill="none" stroke="' + c + '" stroke-width="3" stroke-linecap="round"/>' +
        '<circle cx="' + (x + 16) + '" cy="' + (y - 10) + '" r="9" fill="none" stroke="' + c + '" stroke-width="3"/>' +
        '<path d="M' + (x + 14) + " " + (y + 8) + " a18 16 0 0 1 22 18" + '" fill="none" stroke="' + c + '" stroke-width="3" stroke-linecap="round"/>';
    },
    megaphone: function (x, y, c) {
      return '<path d="M' + (x - 26) + " " + (y - 10) + " h12 l30 -18 v56 l-30 -18 h-12 z" + '" fill="none" stroke="' + c + '" stroke-width="3" stroke-linejoin="round"/>' +
        '<path d="M' + (x - 18) + " " + (y + 10) + " l6 20 h10 l-5 -20" + '" fill="none" stroke="' + c + '" stroke-width="3" stroke-linejoin="round"/>' +
        '<path d="M' + (x + 24) + " " + (y - 8) + " a14 14 0 0 1 0 20" + '" fill="none" stroke="' + c + '" stroke-width="3" stroke-linecap="round"/>';
    },
    reseau: function (x, y, c) {
      var pts = [[0, -26], [-26, 16], [26, 16]], s = "";
      pts.forEach(function (p) { s += ligne(x, y, x + p[0], y + p[1], c, 3); });
      s += '<circle cx="' + x + '" cy="' + y + '" r="8" fill="' + c + '"/>';
      pts.forEach(function (p) { s += '<circle cx="' + (x + p[0]) + '" cy="' + (y + p[1]) + '" r="8" fill="#fff" stroke="' + c + '" stroke-width="3"/>'; });
      return s;
    },
    manette: function (x, y, c) {
      return '<rect x="' + (x - 18) + '" y="' + (y - 30) + '" width="36" height="60" rx="8" fill="none" stroke="' + c + '" stroke-width="3"/>' +
        '<path d="M' + (x - 5) + " " + (y - 8) + " l12 8 l-12 8 z" + '" fill="' + c + '"/>';
    }
  };

  var V = {};

  /* ── Un téléphone, un jeu ─────────────────────────────── */
  V.telephone = function () {
    var u = uid();
    return svg("0 0 520 400", "Un jeu fait avec l'IA, sur un téléphone", "",
      telephone(u, 1, 174, 6, 172, 388, "/media/remialde-coin.jpg"));
  };

  /* ── Un lien ouvre le jeu ──────────────────────────────── */
  V.lien = function () {
    var u = uid();
    var maillon = '<path d="M60 194 a14 14 0 0 1 0 -20 l10 -10 a14 14 0 0 1 20 20 l-4 4 M76 186 a14 14 0 0 1 0 20 l-10 10 a14 14 0 0 1 -20 -20 l4 -4" ' +
      'fill="none" stroke="' + C.bleu + '" stroke-width="4" stroke-linecap="round"/>';
    return svg("0 0 520 400", "Un lien qui ouvre le jeu", "",
      maillon + texte(110, 202, "Le lien", 32, C.encre, { gras: 600 }) +
      fleche(232, 190, 300, 190, C.gris, 2.5) +
      telephone(u, 1, 330, 8, 176, 384, "/media/eleve-2.jpg"));
  };

  /* ── Les jeux ──────────────────────────────────────────── */
  V.galerie = function () {
    var u = uid(), s = "", t = "", ut = uid();
    ["/media/jeu-2.jpg", "/media/jeu-3.jpg", "/media/remialde-coin.jpg", "/media/eleve-2.jpg", "/media/eleve-3.jpg"].forEach(function (img, i) {
      s += telephone(u, i, 20 + i * 196, 10, 172, 372, img);
    });
    ["/media/jeu-2.jpg", "/media/remialde-coin.jpg", "/media/eleve-3.jpg"].forEach(function (img, i) {
      t += telephone(ut, i, 2 + i * 176, 6, 164, 356, img);
    });
    return svg("0 0 1000 392", "Cinq jeux faits avec l'IA", "", s, "v-ordi") +
      svg("0 0 520 368", "Trois jeux faits avec l'IA", "", t, "v-tel");
  };

  /* ── Ce qu'il faut ─────────────────────────────────────── */
  V.materiel = function () {
    var items = [[I.telephone, "Ton", "téléphone"], [I.bulle, "L'appli", "Claude"], [I.personne, "Un compte", "Google"]];
    var s = "";
    items.forEach(function (it, i) {
      var x = 90 + i * 170;
      s += it[0](x, 90, C.encre) +
        texte(x, 190, it[1], 26, C.encre, { ancre: "middle", gras: 600 }) +
        texte(x, 224, it[2], 26, C.encre, { ancre: "middle", gras: 600 });
    });
    return svg("0 0 520 250", "Un téléphone, l'application Claude et un compte Google", "", s);
  };

  /* ── La méthode en 6 étapes ────────────────────────────── */
  var ETAPES = [["Choisir", "ton jeu"], ["Le décrire", "à l'IA"], ["Tester,", "corriger"], ["Faire", "revenir"], ["Le mettre", "en ligne"], ["La pub,", "les joueurs"]];
  V.methode = function () {
    var label = "Les 6 étapes : choisir ton jeu, le décrire à l'IA, tester et corriger, faire revenir les joueurs, le mettre en ligne, la pub et les joueurs";
    var s = ligne(90, 96, 910, 96, C.trait, 2), t = "";
    ETAPES.forEach(function (e, i) {
      var x = 90 + i * 164;
      s += texte(x, 66, String(i + 1), 44, C.bleu, { ancre: "middle", gras: 700 }) +
        '<circle cx="' + x + '" cy="96" r="7" fill="' + C.bleu + '"/>' +
        texte(x, 150, e[0], 28, C.encre, { ancre: "middle", gras: 600 }) +
        texte(x, 184, e[1], 28, C.encre, { ancre: "middle", gras: 600 });
      var cx = i < 3 ? 30 : 290, cy = 64 + (i % 3) * 120;
      t += texte(cx, cy + 16, String(i + 1), 48, C.bleu, { gras: 700 }) +
        texte(cx + 48, cy - 2, e[0], 27, C.encre, { gras: 600 }) +
        texte(cx + 48, cy + 30, e[1], 27, C.encre, { gras: 600 });
    });
    return svg("0 0 1000 200", label, "", s, "v-ordi") + svg("0 0 520 350", label, "", t, "v-tel");
  };

  /* ── Étape 1 : partir d'un jeu qui marche ─────────────── */
  V.inspiration = function () {
    var u = uid();
    var defs = '<linearGradient id="' + u + 'o" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ffcf6b"/><stop offset="1" stop-color="#ff7a2f"/></linearGradient>';
    return svg("0 0 520 300", "Tu gardes l'idée d'un jeu qui marche et tu crées ton propre jeu", defs,
      '<rect x="30" y="30" width="160" height="160" rx="38" fill="' + C.fond + '"/>' +
      '<rect x="66" y="132" width="88" height="10" rx="5" fill="' + C.trait + '"/>' +
      '<circle cx="110" cy="104" r="18" fill="' + C.gris + '"/>' +
      texte(110, 240, "Un jeu", 26, C.encre, { ancre: "middle", gras: 600 }) +
      texte(110, 274, "qui marche", 26, C.encre, { ancre: "middle", gras: 600 }) +
      texte(260, 96, "l'idée", 22, C.gris, { ancre: "middle" }) +
      fleche(214, 110, 306, 110, C.gris, 2.5) +
      '<rect x="330" y="30" width="160" height="160" rx="38" fill="url(#' + u + 'o)"/>' +
      '<image href="/media/bonus-visuel.webp" x="340" y="40" width="140" height="140"/>' +
      texte(410, 240, "Ton jeu", 26, C.encre, { ancre: "middle", gras: 600 }) +
      texte(410, 274, "à toi", 26, C.encre, { ancre: "middle", gras: 600 }));
  };

  /* ── Étape 2 : la conversation avec l'IA ───────────────── */
  V.conversation = function () {
    var u = uid();
    var defs = '<linearGradient id="' + u + 'o" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ffcf6b"/><stop offset="1" stop-color="#ff7a2f"/></linearGradient>' +
      '<clipPath id="' + u + 'c"><rect x="40" y="246" width="96" height="96" rx="22"/></clipPath>';
    return svg("0 0 520 370", "Tu décris ton jeu à l'IA, elle te répond avec le jeu", defs,
      '<rect x="140" y="10" width="370" height="128" rx="28" fill="' + C.bleu + '"/>' +
      texte(168, 58, "Fais-moi un jeu" + NB + ": un vendeur", 25, "#fff") +
      texte(168, 92, "de mangues qui saute de toit", 25, "#fff") +
      texte(168, 126, "en toit.", 25, "#fff") +
      '<rect x="10" y="176" width="330" height="184" rx="28" fill="' + C.fond + '"/>' +
      texte(40, 222, "Voici ton jeu.", 25, C.encre) +
      '<rect x="40" y="246" width="96" height="96" rx="22" fill="url(#' + u + 'o)"/>' +
      '<image href="/media/bonus-visuel.webp" x="44" y="250" width="88" height="88" clip-path="url(#' + u + 'c)"/>' +
      texte(156, 286, "Mangue Rush", 25, C.encre, { gras: 700 }) +
      texte(156, 322, "Jouer", 23, C.bleu, { gras: 600 }) +
      '<path d="M222 306 l12 8 l-12 8 z" fill="' + C.bleu + '"/>');
  };

  /* ── Étape 3 : tester, demander, corriger ──────────────── */
  V.boucle = function () {
    var cx = 260, cy = 200, r = 130;
    function point(deg) { var a = deg * Math.PI / 180; return [cx + r * Math.cos(a), cy + r * Math.sin(a)]; }
    function mot(deg, t, dy) {
      var p = point(deg);
      return '<rect x="' + (p[0] - 92) + '" y="' + (p[1] - 26) + '" width="184" height="52" fill="#fff"/>' +
        texte(p[0], p[1] + 10 + (dy || 0), t, 30, C.encre, { ancre: "middle", gras: 600 });
    }
    function pointe(deg) {
      var p = point(deg), a = (deg + 90) * Math.PI / 180, t = 12;
      var p1 = (p[0] - t * Math.cos(a - 0.5)) + " " + (p[1] - t * Math.sin(a - 0.5));
      var p2 = (p[0] - t * Math.cos(a + 0.5)) + " " + (p[1] - t * Math.sin(a + 0.5));
      return '<path d="M' + p1 + " L" + p[0] + " " + p[1] + " L" + p2 + '" fill="none" stroke="' + C.bleu + '" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>';
    }
    return svg("0 0 520 400", "Une boucle : tu testes, tu demandes, l'IA corrige", "",
      '<circle cx="' + cx + '" cy="' + cy + '" r="' + r + '" fill="none" stroke="' + C.trait + '" stroke-width="2.5"/>' +
      pointe(-30) + pointe(90) + pointe(210) +
      mot(-90, "Tu testes") + mot(30, "Tu demandes") + mot(150, "L'IA corrige"));
  };

  /* ── Étape 4 : ce qui fait revenir ─────────────────────── */
  V.revenir = function () {
    var items = [[I.trophee, "Un record"], [I.cadeau, "Un cadeau par jour"], [I.cible, "Des missions"], [I.amis, "Défier un ami"]];
    var s = "";
    items.forEach(function (it, i) {
      var x = i % 2 ? 390 : 130, y = i < 2 ? 70 : 240;
      s += it[0](x, y, C.bleu) + texte(x, y + 76, it[1], 26, C.encre, { ancre: "middle", gras: 600 });
    });
    return svg("0 0 520 340", "Un record à battre, un cadeau chaque jour, des missions, défier un ami", "", s);
  };

  /* ── 200 joueurs fidèles contre 5 000 de passage ───────── */
  V.fideles = function () {
    var label = "Exemple sur un mois : 5 000 joueurs qui jouent une fois font 5 000 parties ; 200 joueurs qui font 10 parties par jour font 60 000 parties";
    return svg("0 0 1000 300", label, "",
      texte(0, 66, "5" + NB + "000 joueurs, une fois", 28, C.encre, { gras: 600 }) +
      '<rect x="430" y="40" width="48" height="36" rx="8" fill="' + C.trait + '"/>' +
      texte(494, 68, "5" + NB + "000 parties", 26, C.gris) +
      texte(0, 168, "200 joueurs, 10 parties", 28, C.encre, { gras: 600 }) +
      texte(0, 202, "par jour pendant 30 jours", 24, C.gris) +
      '<rect x="430" y="142" width="570" height="44" rx="10" fill="' + C.bleu + '"/>' +
      texte(980, 173, "60" + NB + "000 parties", 26, "#fff", { gras: 700, ancre: "end" }) +
      texte(0, 286, "Exemple de calcul sur un mois.", 21, C.gris), "v-ordi") +
    svg("0 0 520 330", label, "",
      texte(0, 34, "5" + NB + "000 joueurs, une fois", 27, C.encre, { gras: 600 }) +
      '<rect x="0" y="56" width="44" height="40" rx="8" fill="' + C.trait + '"/>' +
      texte(58, 86, "5" + NB + "000 parties", 25, C.gris) +
      texte(0, 160, "200 joueurs, 10 parties par jour", 27, C.encre, { gras: 600 }) +
      texte(0, 192, "pendant 30 jours", 23, C.gris) +
      '<rect x="0" y="212" width="520" height="50" rx="10" fill="' + C.bleu + '"/>' +
      texte(500, 246, "60" + NB + "000 parties", 26, "#fff", { gras: 700, ancre: "end" }) +
      texte(0, 316, "Exemple de calcul sur un mois.", 21, C.gris), "v-tel");
  };

  /* ── Le modèle économique : annonceur, régie, éditeur ──── */
  V.acteurs = function () {
    var label = "L'annonceur paie la régie, la régie te paie. Tes joueurs voient les pubs, la régie le compte pour l'annonceur.";
    var noms = [[I.megaphone, "L'annonceur", "Une marque qui", "veut être vue"], [I.reseau, "La régie", "L'intermédiaire,", "comme Adsterra"], [I.manette, "Toi, l'éditeur", "Ton jeu", "et tes joueurs"]];
    var s = "";
    noms.forEach(function (n, i) {
      var x = 150 + i * 350;
      s += '<circle cx="' + x + '" cy="112" r="62" fill="' + C.fond + '"/>' + n[0](x, 112, C.encre) +
        texte(x, 228, n[1], 30, C.encre, { ancre: "middle", gras: 700 }) +
        texte(x, 264, n[2], 23, C.gris, { ancre: "middle" }) +
        texte(x, 294, n[3], 23, C.gris, { ancre: "middle" });
    });
    [[230, 420], [580, 770]].forEach(function (a) {
      s += fleche(a[0], 92, a[1], 92, C.vert, 3) + texte((a[0] + a[1]) / 2, 76, "argent", 22, C.vert, { ancre: "middle", gras: 600 }) +
        fleche(a[1], 134, a[0], 134, C.bleu, 3) + texte((a[0] + a[1]) / 2, 166, "pubs vues", 22, C.bleu, { ancre: "middle", gras: 600 });
    });
    /* Sur téléphone : les trois acteurs l'un sous l'autre */
    var t = "";
    noms.forEach(function (n, i) {
      var y = 48 + i * 132;
      t += '<circle cx="64" cy="' + y + '" r="46" fill="' + C.fond + '"/>' + n[0](64, y, C.encre) +
        texte(140, y - 6, n[1], 29, C.encre, { gras: 700 }) +
        texte(140, y + 26, n[2] + " " + n[3], 22, C.gris);
    });
    [[94, 134], [226, 266]].forEach(function (a) {
      t += fleche(50, a[0] + 4, 50, a[1] - 4, C.vert, 3) + fleche(78, a[1] - 4, 78, a[0] + 4, C.bleu, 3);
    });
    t += '<rect x="0" y="396" width="26" height="4" rx="2" fill="' + C.vert + '"/>' + texte(36, 405, "argent", 21, C.vert, { gras: 600 }) +
      '<rect x="140" y="396" width="26" height="4" rx="2" fill="' + C.bleu + '"/>' + texte(176, 405, "pubs vues", 21, C.bleu, { gras: 600 });
    return svg("0 0 1000 304", label, "", s, "v-ordi") + svg("0 0 520 414", label, "", t, "v-tel");
  };

  /* ── Les pubs aux bons moments ─────────────────────────── */
  V.ecransPub = function () {
    var u = uid();
    var defs = '<linearGradient id="' + u + 'a" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1b2257"/><stop offset="1" stop-color="#3d1d63"/></linearGradient>' +
      '<linearGradient id="' + u + 'b" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0d3b2c"/><stop offset="1" stop-color="#123d5c"/></linearGradient>';
    function ecran(x, fond) {
      return '<rect x="' + x + '" y="10" width="200" height="380" rx="34" fill="#1d1d1f"/>' +
        '<rect x="' + (x + 8) + '" y="18" width="184" height="364" rx="27" fill="url(#' + u + fond + ')"/>' +
        '<rect x="' + (x + 72) + '" y="26" width="56" height="14" rx="7" fill="#000"/>';
    }
    return svg("0 0 520 400", "La pub en fin de partie, et une pub regardée contre des pièces", defs,
      ecran(40, "a") +
      texte(140, 86, "Partie terminée", 20, "#f5f5f7", { ancre: "middle", gras: 600 }) +
      texte(140, 150, "42", 60, "#fff", { ancre: "middle", gras: 800 }) +
      '<rect x="70" y="190" width="140" height="100" rx="12" fill="#fff"/>' +
      texte(140, 247, "Pub", 24, C.gris, { ancre: "middle", gras: 700 }) +
      '<rect x="84" y="318" width="112" height="40" rx="20" fill="' + C.bleu + '"/>' +
      texte(140, 344, "Rejouer", 18, "#fff", { ancre: "middle", gras: 600 }) +
      ecran(280, "b") +
      '<rect x="304" y="120" width="152" height="200" rx="20" fill="#fff"/>' +
      '<circle cx="380" cy="170" r="24" fill="' + C.or + '"/>' +
      texte(380, 230, "+50 pièces", 22, C.encre, { ancre: "middle", gras: 700 }) +
      '<rect x="320" y="258" width="120" height="38" rx="19" fill="' + C.vert + '"/>' +
      texte(380, 283, "Voir la pub", 17, "#fff", { ancre: "middle", gras: 600 }));
  };

  /* ── Le calcul : parties par jour et revenu ────────────── */
  V.calcul = function () {
    var cas = [
      ["50 joueurs × 4 parties", "200 parties par jour", "100 à 300 F"],
      ["300 joueurs × 5 parties", "1" + NB + "500 parties par jour", "750 à 2" + NB + "250 F"],
      ["2" + NB + "000 joueurs × 5 parties", "10" + NB + "000 parties par jour", "5" + NB + "000 à 15" + NB + "000 F"]
    ];
    var label = "Repère : 200 parties par jour font 100 à 300 F, 1 500 parties font 750 à 2 250 F, 10 000 parties font 5 000 à 15 000 F par jour";
    var s = "", t = "";
    cas.forEach(function (c, i) {
      var y = 46 + i * 92;
      if (i) s += ligne(0, y - 50, 1000, y - 50, "#e8e8ed", 1.5);
      s += texte(0, y, c[0], 28, C.encre, { gras: 600 }) + texte(0, y + 32, c[1], 22, C.gris) +
        texte(1000, y + 14, c[2] + " par jour", 30, C.vert, { gras: 700, ancre: "end" });
      var yt = 34 + i * 116;
      if (i) t += ligne(0, yt - 40, 520, yt - 40, "#e8e8ed", 1.5);
      t += texte(0, yt, c[0], 25, C.encre, { gras: 600 }) + texte(0, yt + 28, c[1], 21, C.gris) +
        texte(0, yt + 66, c[2] + " par jour", 29, C.vert, { gras: 700 });
    });
    return svg("0 0 1000 266", label, "", s, "v-ordi") + svg("0 0 520 340", label, "", t, "v-tel");
  };

  /* ── Les gains des élèves : des captures ───────────────── */
  V.gains = function () {
    var u = uid(), s = "", t = "";
    ["/media/revenu-1.jpg", "/media/revenu-2.jpg", "/media/revenu-3.jpg"].forEach(function (img, i) {
      var x = 45 + i * 320, id = u + "c" + i;
      s += '<clipPath id="' + id + '"><rect x="' + x + '" y="8" width="270" height="380" rx="22"/></clipPath>' +
        '<image href="' + img + '" x="' + x + '" y="-62" width="270" height="630" preserveAspectRatio="none" clip-path="url(#' + id + ')"/>' +
        '<rect x="' + x + '" y="8" width="270" height="380" rx="22" fill="none" stroke="' + C.trait + '" stroke-width="1.5"/>';
    });
    ["/media/revenu-2.jpg", "/media/revenu-3.jpg"].forEach(function (img, i) {
      var x = 4 + i * 266, id = u + "d" + i;
      t += '<clipPath id="' + id + '"><rect x="' + x + '" y="4" width="246" height="360" rx="20"/></clipPath>' +
        '<image href="' + img + '" x="' + x + '" y="-58" width="246" height="574" preserveAspectRatio="none" clip-path="url(#' + id + ')"/>' +
        '<rect x="' + x + '" y="4" width="246" height="360" rx="20" fill="none" stroke="' + C.trait + '" stroke-width="1.5"/>';
    });
    return svg("0 0 1000 396", "Trois captures des revenus de pub de mes élèves", "", s, "v-ordi") +
      svg("0 0 520 368", "Deux captures des revenus de pub de mes élèves", "", t, "v-tel");
  };

  /* ── TikTok : une vidéo de partie avec un défi ─────────── */
  V.tiktok = function () {
    var u = uid(), x = 174, y = 6, w = 172, h = 388;
    function coeur(cx, cy) {
      return '<path d="M' + cx + " " + (cy + 10) + " c-14 -10 -18 -16 -18 -22 a9 9 0 0 1 18 -4 a9 9 0 0 1 18 4 c0 6 -4 12 -18 22 z" + '" fill="#fff"/>';
    }
    return svg("0 0 520 400", "Une vidéo de ton jeu avec un défi écrit à l'écran", "",
      telephone(u, 1, x, y, w, h, "/media/eleve-3.jpg") +
      '<rect x="' + (x + 18) + '" y="' + (y + 70) + '" width="' + (w - 36) + '" height="62" rx="12" fill="rgba(0,0,0,.6)"/>' +
      texte(x + w / 2, y + 96, "Personne ne", 17, "#fff", { ancre: "middle", gras: 700 }) +
      texte(x + w / 2, y + 120, "dépasse 50 points", 17, "#fff", { ancre: "middle", gras: 700 }) +
      coeur(x + w - 26, y + 236) +
      '<circle cx="' + (x + w - 26) + '" cy="' + (y + 280) + '" r="11" fill="#fff"/>' +
      '<path d="M' + (x + w - 36) + " " + (y + 318) + " l20 -8 l-6 18 z" + '" fill="#fff"/>' +
      texte(x + 16, y + h - 44, "Ton jeu, lien en bio", 13, "#fff", { gras: 700 }) +
      texte(x + 16, y + h - 24, "#défi #jeu", 12, "#fff") +
      fleche(140, 110, 186, 110, C.gris, 2.5) +
      texte(126, 100, "Le défi", 24, C.encre, { ancre: "end", gras: 600 }) +
      texte(126, 128, "à l'écran", 24, C.encre, { ancre: "end", gras: 600 }) +
      fleche(386, 362, 340, 362, C.gris, 2.5) +
      texte(396, 354, "Le lien", 24, C.encre, { gras: 600 }) +
      texte(396, 382, "dans ta bio", 24, C.encre, { gras: 600 }));
  };

  /* ── Partout où sont les joueurs ───────────────────────── */
  V.partage = function () {
    var cx = 260, cy = 190;
    var mots = [["TikTok", -90], ["Statut WhatsApp", -30], ["Groupes WhatsApp", 30], ["Facebook", 90], ["Tes proches", 150], ["Telegram", 210]];
    var s = "";
    mots.forEach(function (m) {
      var a = m[1] * Math.PI / 180, px = cx + 158 * Math.cos(a), py = cy + 140 * Math.sin(a);
      s += ligne(cx + 80 * Math.cos(a), cy + 46 * Math.sin(a), cx + 132 * Math.cos(a), cy + 104 * Math.sin(a), C.trait, 2) +
        texte(px, py + 9, m[0], 26, C.encre, { ancre: "middle", gras: m[0] === "TikTok" ? 700 : 500 });
    });
    return svg("0 0 520 380", "Ton lien sur TikTok, en statut WhatsApp, dans les groupes WhatsApp, sur Facebook, à tes proches et sur Telegram", "",
      s + texte(cx, cy + 11, "Ton lien", 32, C.bleu, { ancre: "middle", gras: 700 }));
  };

  /* ── Seul ou accompagné ────────────────────────────────── */
  V.seulAvec = function () {
    function colonne(x, titre, couleur, items) {
      var s = texte(x, 44, titre, 32, couleur, { gras: 700 });
      items.forEach(function (it, i) { s += texte(x, 112 + i * 62, it, 26, C.encre); });
      return s;
    }
    return svg("0 0 520 300", "Seul : une erreur te bloque, tu cherches seul, tu abandonnes. Avec moi : une vidéo par étape, je te réponds, ton jeu sort.", "",
      colonne(10, "Seul", C.rouge, ["Une erreur bloque", "Tu cherches seul", "Tu abandonnes"]) +
      ligne(262, 14, 262, 286, C.trait, 2) +
      colonne(290, "Avec moi", C.vert, ["Une vidéo par étape", "Je te réponds", "Ton jeu sort"]));
  };

  /* ── Les 2 bonus ───────────────────────────────────────── */
  V.bonus = function () {
    var u = uid();
    var defs = '<linearGradient id="' + u + 'o" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ffcf6b"/><stop offset="1" stop-color="#ff7a2f"/></linearGradient>';
    return svg("0 0 520 330", "Bonus 1 : le guide pas à pas de 36 pages. Bonus 2 : les visuels de ton jeu.", defs,
      '<rect x="10" y="10" width="230" height="210" rx="28" fill="' + C.fond + '"/>' +
      '<image href="/media/bonus-guide.webp" x="67" y="24" width="116" height="164"/>' +
      texte(10, 262, "Le guide", 27, C.encre, { gras: 700 }) + texte(10, 294, "36 pages pas à pas", 22, C.gris) +
      '<rect x="280" y="10" width="230" height="210" rx="28" fill="url(#' + u + 'o)"/>' +
      '<image href="/media/bonus-visuel.webp" x="305" y="20" width="180" height="180"/>' +
      texte(280, 262, "Tes visuels", 27, C.encre, { gras: 700 }) + texte(280, 294, "5 images de ton jeu", 22, C.gris));
  };

  /* ── Rejoindre en 3 étapes ─────────────────────────────── */
  V.rejoindre = function () {
    var etapes = [["Appuie sur «" + NB + "Rejoindre le groupe" + NB + "»", "Le bouton est sous la slide"], ["Paie par Mobile Money", "Sur la page de paiement"], ["Une page s'ouvre", "Le lien du groupe et tes bonus"]];
    var s = "";
    etapes.forEach(function (e, i) {
      var y = 50 + i * 120;
      if (i) s += ligne(70, y - 58, 520, y - 58, "#e8e8ed", 1.5);
      s += texte(10, y + 20, String(i + 1), 52, C.bleu, { gras: 700 }) +
        texte(70, y, e[0], 26, C.encre, { gras: 600 }) + texte(70, y + 34, e[1], 22, C.gris);
    });
    return svg("0 0 520 340", "Appuie sur Rejoindre le groupe, paie par Mobile Money, puis ouvre le groupe et tes bonus", "", s);
  };

  return V;
})();
