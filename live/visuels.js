/* Les illustrations des slides du live, dessinées en code (SVG).

   Une slide les appelle par leur nom : visuel: "lien", par exemple.
   Le texte de ces dessins est écrit ici, dans le code du site : aucun
   texte venu du chat ou de l'extérieur n'y entre jamais.

   Chaque dessin a un viewBox fixe et s'adapte à la place qu'on lui
   donne : à droite du texte sur ordinateur, sous le texte sur téléphone.
   Les identifiants (dégradés, découpes) sont uniques à chaque dessin,
   parce que le studio affiche toutes les slides en même temps. */

window.LiveVisuels = (function () {
  "use strict";

  /* Les couleurs, pour une slide claire (fond blanc). */
  var C = {
    bleu: "#0071e3", violet: "#8e44ec", orange: "#f56300", vert: "#34c759",
    rouge: "#ff3b30", or: "#f5b400", encre: "#1d1d1f", gris: "#6e6e73",
    gris3: "#86868b", carte: "#f5f5f7", carte2: "#e8e8ed", trait: "#d2d2d7",
    vertTexte: "#248a3d", rougeTexte: "#d70015"
  };
  var NB = " ";
  var compte = 0;
  function uid() { compte += 1; return "lv" + compte + "x"; }

  /* classe : "v-ordi" ou "v-tel" quand un dessin a deux versions, une large
     pour l'ordinateur et une plus haute pour le téléphone (voir live.css). */
  function svg(vb, label, defs, corps, classe) {
    return '<svg viewBox="' + vb + '" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="' + label + '"' +
      (classe ? ' class="' + classe + '"' : "") + ">" +
      (defs ? "<defs>" + defs + "</defs>" : "") + corps + "</svg>";
  }
  function degrade(id, a, b) {
    return '<linearGradient id="' + id + '" x1="0" y1="0" x2="1" y2="1">' +
      '<stop offset="0" stop-color="' + a + '"/><stop offset="1" stop-color="' + b + '"/></linearGradient>';
  }
  function texte(x, y, t, taille, couleur, opts) {
    opts = opts || {};
    return '<text x="' + x + '" y="' + y + '" font-size="' + taille + '" fill="' + couleur + '"' +
      (opts.gras ? ' font-weight="' + (opts.gras === true ? 600 : opts.gras) + '"' : "") +
      (opts.ancre ? ' text-anchor="' + opts.ancre + '"' : "") +
      (opts.style ? ' style="' + opts.style + '"' : "") + ">" + t + "</text>";
  }
  function monte(contenu) { return "<g>" + contenu + "</g>"; }

  /* Un téléphone avec une capture d'écran dedans */
  function telephone(u, k, x, y, w, h, image, rot) {
    var r = w * 0.17, b = w * 0.045, cx = x + w / 2, cy = y + h / 2, id = u + "t" + k;
    return '<g' + (rot ? ' transform="rotate(' + rot + " " + cx + " " + cy + ')"' : "") + ">" +
      '<clipPath id="' + id + '"><rect x="' + (x + b) + '" y="' + (y + b) + '" width="' + (w - 2 * b) + '" height="' + (h - 2 * b) + '" rx="' + (r - b) + '"/></clipPath>' +
      '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" rx="' + r + '" fill="#0d0d0f" stroke="#48484a" stroke-width="' + (w * 0.016) + '"/>' +
      (image
        ? '<image href="' + image + '" x="' + (x + b) + '" y="' + (y + b) + '" width="' + (w - 2 * b) + '" height="' + (h - 2 * b) + '" preserveAspectRatio="xMidYMid slice" clip-path="url(#' + id + ')"/>'
        : "") +
      '<rect x="' + (cx - w * 0.15) + '" y="' + (y + b + w * 0.035) + '" width="' + (w * 0.3) + '" height="' + (w * 0.075) + '" rx="' + (w * 0.0375) + '" fill="#000"/>' +
      "</g>";
  }

  /* Petites icônes, centrées sur (x, y) */
  function coche(x, y, r) {
    return '<circle cx="' + x + '" cy="' + y + '" r="' + r + '" fill="' + C.vert + '"/>' +
      '<path d="M' + (x - r * 0.45) + " " + y + " l" + (r * 0.32) + " " + (r * 0.32) + " l" + (r * 0.6) + " " + (-r * 0.62) +
      '" fill="none" stroke="#fff" stroke-width="' + (r * 0.24) + '" stroke-linecap="round" stroke-linejoin="round"/>';
  }
  function croix(x, y, r) {
    var d = r * 0.36;
    return '<circle cx="' + x + '" cy="' + y + '" r="' + r + '" fill="rgba(255,69,58,.18)"/>' +
      '<path d="M' + (x - d) + " " + (y - d) + " L" + (x + d) + " " + (y + d) + " M" + (x + d) + " " + (y - d) + " L" + (x - d) + " " + (y + d) +
      '" stroke="' + C.rouge + '" stroke-width="' + (r * 0.2) + '" stroke-linecap="round"/>';
  }
  function fleche(x, y, angle, couleur, taille) {
    var t = taille || 14;
    return '<path d="M' + (-t * 0.8) + " " + (-t * 0.75) + " L" + t * 0.7 + " 0 L" + (-t * 0.8) + " " + t * 0.75 +
      ' Z" fill="' + couleur + '" transform="translate(' + x + " " + y + ") rotate(" + angle + ')"/>';
  }

  var V = {};

  /* ── Trois jeux sur trois téléphones ───────────────────── */
  V.trio = function () {
    var u = uid();
    var defs = '<radialGradient id="' + u + 'h" cx="50%" cy="55%" r="50%">' +
      '<stop offset="0" stop-color="' + C.bleu + '" stop-opacity=".16"/>' +
      '<stop offset=".6" stop-color="' + C.violet + '" stop-opacity=".06"/>' +
      '<stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>';
    return svg("0 0 520 400", "Trois jeux faits avec l'IA, sur des téléphones", defs,
      '<ellipse cx="260" cy="215" rx="255" ry="190" fill="url(#' + u + 'h)"/>' +
      monte(telephone(u, 1, 52, 62, 148, 306, "/media/jeu-3.jpg", -9), 0.15) +
      monte(telephone(u, 2, 320, 62, 148, 306, "/media/eleve-3.jpg", 9), 0.25) +
      monte(telephone(u, 3, 180, 30, 160, 336, "/media/remialde-coin.jpg", 0), 0));
  };

  /* ── Un lien dans une discussion ouvre le jeu ──────────── */
  V.lien = function () {
    var u = uid();
    return svg("0 0 520 400", "Un lien envoyé dans une discussion ouvre le jeu, sans rien installer", "",
      monte(
        '<path d="M48 50 L18 42 L40 76 Z" fill="#d9fdd3"/>' +
        '<rect x="24" y="50" width="276" height="168" rx="24" fill="#d9fdd3"/>' +
        texte(50, 100, "Viens battre mon", 28, "#111b21") +
        texte(50, 136, "record" + NB + "!", 28, "#111b21") +
        texte(50, 186, "Joue ici", 28, "#0a7cbd", { gras: true }) +
        '<rect x="50" y="193" width="112" height="3" rx="1.5" fill="#0a7cbd"/>' +
        '<circle cx="150" cy="180" r="26" fill="#0a7cbd" fill-opacity=".16"/>' +
        '<circle cx="150" cy="180" r="10" fill="#0a7cbd" fill-opacity=".55"/>', 0) +
      '<path d="M308 170 H340" stroke="' + C.gris + '" stroke-width="5" stroke-linecap="round"/>' +
      fleche(346, 170, 0, C.gris, 13) +
      monte(telephone(u, 1, 358, 24, 148, 318, "/media/eleve-2.jpg", 0), 0.35) +
      monte(
        '<rect x="24" y="252" width="276" height="58" rx="29" fill="' + C.carte + '" stroke="' + C.trait + '" stroke-width="2"/>' +
        croix(58, 281, 17) + texte(88, 290, "Rien à installer", 25, C.encre, { gras: 500 }) +
        '<rect x="24" y="324" width="276" height="58" rx="29" fill="' + C.carte + '" stroke="' + C.trait + '" stroke-width="2"/>' +
        coche(58, 353, 17) + texte(88, 362, "Android et iPhone", 25, C.encre, { gras: 500 }), 0.6));
  };

  /* ── Cinq jeux ─────────────────────────────────────────── */
  V.galerie = function () {
    var u = uid(), jeux = ["/media/jeu-2.jpg", "/media/jeu-3.jpg", "/media/remialde-coin.jpg", "/media/eleve-2.jpg", "/media/eleve-3.jpg"];
    var s = "";
    jeux.forEach(function (img, i) { s += monte(telephone(u, i, 20 + i * 196, 10, 172, 372, img, 0), i * 0.08); });
    var t = "", ut = uid();
    ["/media/jeu-2.jpg", "/media/remialde-coin.jpg", "/media/eleve-3.jpg"].forEach(function (img, i) {
      t += monte(telephone(ut, i, 2 + i * 176, 6, 164, 356, img, 0), i * 0.08);
    });
    return svg("0 0 1000 392", "Cinq jeux faits avec l'IA", "", s, "v-ordi") +
      svg("0 0 520 368", "Trois jeux faits avec l'IA", "", t, "v-tel");
  };

  /* ── Ce qu'il faut : un téléphone, Claude, un compte Google ── */
  V.materiel = function () {
    var u = uid();
    var defs = degrade(u + "o", "#ffb340", "#ff6b2c");
    function tuile(x, icone, l1, l2, d) {
      return monte('<rect x="' + x + '" y="8" width="160" height="206" rx="24" fill="' + C.carte + '"/>' + icone +
        texte(x + 80, 160, l1, 24, C.encre, { ancre: "middle", gras: 500 }) +
        texte(x + 80, 191, l2, 24, C.encre, { ancre: "middle", gras: 500 }), d);
    }
    var tel = '<rect x="68" y="42" width="44" height="76" rx="10" fill="none" stroke="' + C.bleu + '" stroke-width="5"/>' +
      '<rect x="82" y="106" width="16" height="4" rx="2" fill="' + C.bleu + '"/>';
    var ia = '<rect x="226" y="46" width="68" height="68" rx="18" fill="url(#' + u + 'o)"/>' +
      texte(260, 92, "IA", 30, "#fff", { ancre: "middle", gras: 700 });
    var compteG = '<circle cx="430" cy="66" r="16" fill="none" stroke="' + C.vert + '" stroke-width="5"/>' +
      '<path d="M400 118 a30 26 0 0 1 60 0" fill="none" stroke="' + C.vert + '" stroke-width="5" stroke-linecap="round"/>';
    function pilule(x, y, w, icone, t, d) {
      return monte('<rect x="' + x + '" y="' + y + '" width="' + w + '" height="56" rx="28" fill="' + C.carte + '" stroke="' + C.trait + '" stroke-width="2"/>' +
        icone + texte(x + 56, y + 37, t, 24, C.encre, { gras: 500 }), d);
    }
    return svg("0 0 520 400", "Un téléphone, l'application Claude et un compte Google suffisent", defs,
      tuile(10, tel, "Ton", "téléphone", 0) +
      tuile(180, ia, "L'appli", "Claude", 0.1) +
      tuile(350, compteG, "Un compte", "Google", 0.2) +
      pilule(10, 250, 245, croix(40, 278, 15), "Pas d'ordinateur", 0.35) +
      pilule(265, 250, 245, croix(295, 278, 15), "Pas de code", 0.45) +
      pilule(10, 326, 500, coche(40, 354, 15), "Tout se fait depuis ton téléphone", 0.55));
  };

  /* ── La méthode en 6 étapes ────────────────────────────── */
  V.methode = function () {
    var u = uid();
    var defs = degrade(u + "g", C.bleu, C.violet) +
      '<linearGradient id="' + u + 'l" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="' + C.bleu + '"/><stop offset="1" stop-color="' + C.violet + '"/></linearGradient>';
    var etapes = [["Choisir", "ton jeu"], ["Le décrire", "à l'IA"], ["Tester,", "corriger"], ["Faire", "revenir"], ["Le mettre", "en ligne"], ["La pub,", "les joueurs"]];
    var s = '<rect x="90" y="88" width="820" height="8" rx="4" fill="' + C.trait + '"/>' +
      '<rect x="90" y="88" width="820" height="8" rx="4" fill="url(#' + u + 'l)"/>';
    etapes.forEach(function (e, i) {
      var x = 90 + i * 164;
      s += monte('<circle cx="' + x + '" cy="92" r="44" fill="url(#' + u + 'g)"/>' +
        texte(x, 106, String(i + 1), 40, "#fff", { ancre: "middle", gras: 700 }) +
        texte(x, 186, e[0], 29, C.encre, { ancre: "middle", gras: 600 }) +
        texte(x, 222, e[1], 29, C.encre, { ancre: "middle", gras: 600 }), 0.1 + i * 0.12);
    });
    var label = "Les 6 étapes : choisir ton jeu, le décrire à l'IA, tester et corriger, faire revenir les joueurs, le mettre en ligne, la pub et les joueurs";
    /* Sur téléphone : deux colonnes de trois étapes */
    var ut = uid(), t = "";
    etapes.forEach(function (e, i) {
      var cx = i < 3 ? 46 : 300, cy = 56 + (i % 3) * 128;
      t += monte('<circle cx="' + cx + '" cy="' + cy + '" r="38" fill="url(#' + ut + 'g)"/>' +
        texte(cx, cy + 12, String(i + 1), 34, "#fff", { ancre: "middle", gras: 700 }) +
        texte(cx + 54, cy - 6, e[0], 27, C.encre, { gras: 600 }) +
        texte(cx + 54, cy + 27, e[1], 27, C.encre, { gras: 600 }), 0.1 + i * 0.1);
    });
    return svg("0 0 1000 240", label, defs, s, "v-ordi") +
      svg("0 0 520 360", label, degrade(ut + "g", C.bleu, C.violet), t, "v-tel");
  };

  /* ── Étape 1 : partir d'un jeu qui marche ─────────────── */
  V.inspiration = function () {
    var u = uid();
    var defs = degrade(u + "v", C.violet, C.bleu) + degrade(u + "o", "#ffcf6b", "#ff7a2f");
    var etoiles = "";
    for (var i = 0; i < 5; i++) {
      var x = 168 + i * 30, y = 136;
      etoiles += '<path d="M' + x + " " + (y - 12) + " L" + (x + 3.6) + " " + (y - 3.7) + " L" + (x + 12) + " " + (y - 3.7) + " L" + (x + 5.2) + " " + (y + 2) +
        " L" + (x + 7.6) + " " + (y + 11) + " L" + x + " " + (y + 5.5) + " L" + (x - 7.6) + " " + (y + 11) + " L" + (x - 5.2) + " " + (y + 2) +
        " L" + (x - 12) + " " + (y - 3.7) + " L" + (x - 3.6) + " " + (y - 3.7) + ' Z" fill="' + C.or + '"/>';
    }
    return svg("0 0 520 400", "Tu pars d'un jeu qui marche, tu gardes l'idée et tu crées ton propre jeu", defs,
      monte('<rect x="10" y="12" width="340" height="158" rx="24" fill="' + C.carte + '"/>' +
        '<rect x="30" y="34" width="112" height="112" rx="26" fill="url(#' + u + 'v)"/>' +
        '<rect x="50" y="116" width="72" height="11" rx="5.5" fill="#fff" fill-opacity=".9"/>' +
        '<circle cx="86" cy="94" r="16" fill="' + C.or + '"/>' +
        texte(160, 74, "Un jeu qui", 28, C.encre, { gras: 700 }) +
        texte(160, 108, "marche déjà", 28, C.encre, { gras: 700 }) + etoiles, 0) +
      monte('<path d="M100 178 V262 Q100 300 138 300 H178" fill="none" stroke="' + C.orange + '" stroke-width="5" stroke-linecap="round" stroke-dasharray="2 12"/>' +
        fleche(186, 300, 0, C.orange, 13) +
        texte(126, 226, "Tu gardes l'idée", 25, C.orange, { gras: 700 }), 0.3) +
      monte('<rect x="196" y="236" width="314" height="156" rx="24" fill="' + C.carte + '" stroke="' + C.orange + '" stroke-width="2.5"/>' +
        '<rect x="214" y="256" width="116" height="116" rx="26" fill="url(#' + u + 'o)"/>' +
        '<image href="/media/bonus-visuel.webp" x="218" y="260" width="108" height="108"/>' +
        texte(348, 300, "Ton jeu,", 27, C.encre, { gras: 700 }) +
        texte(348, 334, "ton univers", 27, C.encre, { gras: 700 }), 0.55));
  };

  /* ── Étape 2 : la conversation avec l'IA ───────────────── */
  V.conversation = function () {
    var u = uid();
    var defs = degrade(u + "o", "#ffcf6b", "#ff7a2f");
    return svg("0 0 520 400", "Tu décris ton jeu à l'IA, elle te répond avec le jeu prêt à jouer", defs,
      '<rect x="6" y="6" width="508" height="388" rx="28" fill="#f5f5f7" stroke="' + C.carte2 + '" stroke-width="2"/>' +
      monte('<rect x="168" y="28" width="326" height="134" rx="24" fill="#0a84ff"/>' +
        texte(190, 74, "Fais-moi un jeu" + NB + ": un", 24, "#fff") +
        texte(190, 106, "vendeur de mangues saute", 24, "#fff") +
        texte(190, 138, "de toit en toit.", 24, "#fff"), 0.15) +
      monte('<rect x="24" y="184" width="332" height="194" rx="24" fill="#fff" stroke="' + C.carte2 + '" stroke-width="2"/>' +
        texte(46, 224, "Voici ton jeu.", 25, C.encre, { gras: 600 }) +
        '<rect x="44" y="244" width="292" height="116" rx="18" fill="url(#' + u + 'o)"/>' +
        '<image href="/media/bonus-visuel.webp" x="50" y="250" width="104" height="104"/>' +
        texte(166, 288, "Mangue Rush", 25, "#3a1500", { gras: 700 }) +
        '<rect x="166" y="306" width="122" height="40" rx="20" fill="#1d1d1f"/>' +
        '<path d="M186 316 L202 326 L186 336 Z" fill="#fff"/>' +
        texte(212, 333, "Jouer", 20, "#fff", { gras: 600 }), 0.9));
  };

  /* ── Étape 3 : tester, demander, corriger ──────────────── */
  V.boucle = function () {
    var u = uid();
    var defs = degrade(u + "g", C.bleu, C.violet);
    function noeud(cx, cy, t, couleur, d) {
      return monte('<rect x="' + (cx - 102) + '" y="' + (cy - 31) + '" width="204" height="62" rx="31" fill="' + C.carte + '" stroke="' + couleur + '" stroke-width="3"/>' +
        texte(cx, cy + 9, t, 26, C.encre, { ancre: "middle", gras: 600 }), d);
    }
    return svg("0 0 520 400", "Une boucle : tu testes, tu demandes, l'IA corrige", defs,
      '<circle cx="260" cy="205" r="135" fill="none" stroke="url(#' + u + 'g)" stroke-width="6" stroke-dasharray="14 12"/>' +
      fleche(377, 137.5, 60, C.bleu, 16) + fleche(260, 340, 180, C.violet, 16) + fleche(143, 137.5, 300, C.violet, 16) +
      texte(260, 190, "Quelques", 25, C.gris, { ancre: "middle" }) +
      texte(260, 222, "allers-retours", 25, C.gris, { ancre: "middle" }) +
      noeud(260, 70, "Tu testes", C.bleu, 0) +
      noeud(377, 272, "Tu demandes", C.orange, 0.2) +
      noeud(143, 272, "L'IA corrige", C.vert, 0.4));
  };

  /* ── Étape 4 : ce qui fait revenir ─────────────────────── */
  V.revenir = function () {
    function tuile(x, y, icone, l1, l2, d) {
      return monte('<rect x="' + x + '" y="' + y + '" width="245" height="186" rx="24" fill="' + C.carte + '"/>' + icone +
        texte(x + 24, y + 128, l1, 27, C.encre, { gras: 700 }) +
        texte(x + 24, y + 162, l2, 23, C.gris), d);
    }
    var trophee = '<path d="M50 46 h44 v18 a22 22 0 0 1 -44 0 z" fill="' + C.or + '"/>' +
      '<path d="M50 52 h-10 a11 11 0 0 0 12 18 M94 52 h10 a11 11 0 0 1 -12 18" fill="none" stroke="' + C.or + '" stroke-width="5"/>' +
      '<rect x="68" y="84" width="8" height="10" fill="' + C.or + '"/><rect x="56" y="93" width="32" height="8" rx="3" fill="' + C.or + '"/>';
    var cadeau = '<rect x="309" y="58" width="50" height="38" rx="5" fill="' + C.orange + '"/>' +
      '<rect x="304" y="46" width="60" height="16" rx="5" fill="#ffb340"/>' +
      '<rect x="330" y="46" width="8" height="50" fill="#c45f00"/>' +
      '<ellipse cx="324" cy="40" rx="11" ry="7" fill="none" stroke="#ffb340" stroke-width="5"/>' +
      '<ellipse cx="344" cy="40" rx="11" ry="7" fill="none" stroke="#ffb340" stroke-width="5"/>';
    var cible = '<circle cx="72" cy="268" r="30" fill="none" stroke="' + C.vert + '" stroke-width="6"/>' +
      '<circle cx="72" cy="268" r="17" fill="none" stroke="' + C.vert + '" stroke-width="6"/>' +
      '<circle cx="72" cy="268" r="6" fill="' + C.vert + '"/>';
    var amis = '<circle cx="320" cy="256" r="12" fill="' + C.bleu + '"/>' +
      '<path d="M298 298 a22 20 0 0 1 44 0 z" fill="' + C.bleu + '"/>' +
      '<circle cx="350" cy="262" r="10" fill="#7cc0ff"/>' +
      '<path d="M334 298 a17 16 0 0 1 34 0 z" fill="#7cc0ff"/>';
    return svg("0 0 520 400", "Un record à battre, un cadeau chaque jour, des missions, défier un ami", "",
      tuile(10, 10, trophee, "Un record", "à battre", 0) +
      tuile(265, 10, cadeau, "Un cadeau", "chaque jour", 0.12) +
      tuile(10, 206, cible, "Des missions", "à réussir", 0.24) +
      tuile(265, 206, amis, "Défier", "un ami", 0.36));
  };

  /* ── 200 joueurs fidèles contre 5 000 de passage ───────── */
  V.fideles = function () {
    var u = uid();
    var defs = '<linearGradient id="' + u + 'v" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="' + C.vert + '"/><stop offset="1" stop-color="' + C.bleu + '"/></linearGradient>';
    return svg("0 0 1000 330", "Exemple sur un mois : 5 000 joueurs qui jouent une fois font 5 000 parties ; 200 joueurs qui font 10 parties par jour font 60 000 parties", defs,
      texte(0, 78, "5" + NB + "000 joueurs", 32, C.encre, { gras: 700 }) +
      texte(0, 112, "1 partie chacun", 24, C.gris) +
      '<rect x="330" y="62" width="50" height="50" rx="12" fill="' + C.gris3 + '"/>' +
      texte(398, 98, "5" + NB + "000 parties", 28, C.gris, { gras: 600 }) +
      texte(0, 200, "200 joueurs", 32, C.encre, { gras: 700 }) +
      texte(0, 234, "10 parties par jour,", 24, C.gris) +
      texte(0, 264, "pendant 30 jours", 24, C.gris) +
      '<rect x="330" y="190" width="640" height="56" rx="14" fill="url(#' + u + 'v)"/>' +
      monte(texte(948, 229, "60" + NB + "000 parties", 30, "#fff", { gras: 700, ancre: "end" }), 1.1) +
      texte(0, 322, "Exemple de calcul sur un mois.", 22, C.gris3), "v-ordi") +
    /* Sur téléphone : les deux barres l'une sous l'autre, en pleine largeur */
    svg("0 0 520 360", "Exemple sur un mois : 5 000 parties contre 60 000 parties", defs.replace(u + "v", u + "w"),
      texte(0, 34, "5" + NB + "000 joueurs", 30, C.encre, { gras: 700 }) +
      texte(0, 64, "1 partie chacun", 22, C.gris) +
      '<rect x="0" y="80" width="44" height="46" rx="12" fill="' + C.gris3 + '"/>' +
      texte(58, 112, "5" + NB + "000 parties", 26, C.gris, { gras: 600 }) +
      texte(0, 186, "200 joueurs", 30, C.encre, { gras: 700 }) +
      texte(0, 216, "10 parties par jour, pendant 30 jours", 22, C.gris) +
      '<rect x="0" y="234" width="520" height="56" rx="14" fill="url(#' + u + 'w)"/>' +
      monte(texte(500, 271, "60" + NB + "000 parties", 28, "#fff", { gras: 700, ancre: "end" }), 1.1) +
      texte(0, 340, "Exemple de calcul sur un mois.", 21, C.gris3), "v-tel");
  };

  /* ── Étape 5 : le lien partagé partout ─────────────────── */
  V.partage = function () {
    var u = uid();
    var defs = degrade(u + "g", C.bleu, C.violet);
    var puces = [
      ["Statut WhatsApp", 10, 30, 240], ["Groupes WhatsApp", 266, 30, 244],
      ["Telegram", 10, 175, 136], ["Facebook", 374, 175, 136], ["Ta famille, tes amis", 120, 320, 280]
    ];
    var traits = "", s = "";
    puces.forEach(function (p, i) {
      var cx = p[1] + p[3] / 2, cy = p[2] + 27;
      traits += '<path d="M260 202 L' + cx + " " + cy + '" stroke="' + C.trait + '" stroke-width="3" stroke-dasharray="8 8"/>';
      s += monte('<rect x="' + p[1] + '" y="' + p[2] + '" width="' + p[3] + '" height="54" rx="27" fill="' + C.carte + '" stroke="' + C.trait + '" stroke-width="2"/>' +
        texte(cx, cy + 8, p[0], 23, C.encre, { ancre: "middle", gras: 500 }), 0.15 + i * 0.1);
    });
    return svg("0 0 520 400", "Ton lien partagé en statut WhatsApp, dans les groupes, sur Telegram, sur Facebook et à tes proches", defs,
      traits + s +
      monte('<rect x="165" y="170" width="190" height="64" rx="32" fill="url(#' + u + 'g)"/>' +
        texte(260, 211, "Ton lien", 27, "#fff", { ancre: "middle", gras: 700 }), 0));
  };

  /* ── Étape 6 : comment la pub paie ─────────────────────── */
  V.circuit = function () {
    function ligne(y, icone, t, d) {
      return monte('<rect x="10" y="' + y + '" width="500" height="96" rx="26" fill="' + C.carte + '"/>' + icone +
        texte(116, y + 58, t, 27, C.encre, { gras: 600 }), d);
    }
    var manette = '<circle cx="66" cy="58" r="34" fill="rgba(41,151,255,.18)"/>' +
      '<rect x="42" y="45" width="48" height="28" rx="14" fill="' + C.bleu + '"/>' +
      '<rect x="51" y="56" width="12" height="4" rx="2" fill="#fff"/><rect x="55" y="52" width="4" height="12" rx="2" fill="#fff"/>' +
      '<circle cx="76" cy="55" r="3" fill="#fff"/><circle cx="82" cy="62" r="3" fill="#fff"/>';
    var ecran = '<circle cx="66" cy="200" r="34" fill="rgba(255,159,10,.18)"/>' +
      '<rect x="44" y="184" width="44" height="32" rx="6" fill="' + C.orange + '"/>' +
      texte(66, 206, "PUB", 14, "#1d1d1f", { ancre: "middle", gras: 800 });
    var pieces = '<circle cx="66" cy="342" r="34" fill="rgba(48,209,88,.18)"/>' +
      '<ellipse cx="66" cy="354" rx="18" ry="7" fill="' + C.vert + '"/><ellipse cx="66" cy="346" rx="18" ry="7" fill="#5ee07f"/>' +
      '<ellipse cx="66" cy="338" rx="18" ry="7" fill="' + C.vert + '"/><ellipse cx="66" cy="330" rx="18" ry="7" fill="#5ee07f"/>';
    function bas(y) { return '<path d="M66 ' + y + " V" + (y + 26) + '" stroke="' + C.gris3 + '" stroke-width="4" stroke-linecap="round"/>' + fleche(66, y + 32, 90, C.gris3, 10); }
    return svg("0 0 520 400", "Le joueur lance une partie, une pub s'affiche, la régie te paie", "",
      ligne(10, manette, "Le joueur lance une partie", 0) + bas(110) +
      ligne(152, ecran, "Une pub s'affiche", 0.25) + bas(252) +
      ligne(294, pieces, "La régie te paie", 0.5));
  };

  /* ── Les pubs aux bons moments ─────────────────────────── */
  V.ecransPub = function () {
    var u = uid();
    var defs = '<linearGradient id="' + u + 'a" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1b2257"/><stop offset="1" stop-color="#3d1d63"/></linearGradient>' +
      '<linearGradient id="' + u + 'b" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0d3b2c"/><stop offset="1" stop-color="#123d5c"/></linearGradient>';
    function ecran(x, fond) {
      return '<rect x="' + x + '" y="10" width="200" height="380" rx="34" fill="#0d0d0f" stroke="#48484a" stroke-width="3"/>' +
        '<rect x="' + (x + 9) + '" y="19" width="182" height="362" rx="26" fill="url(#' + u + fond + ')"/>' +
        '<rect x="' + (x + 70) + '" y="27" width="60" height="15" rx="7.5" fill="#000"/>';
    }
    return svg("0 0 520 400", "Deux écrans : la pub en fin de partie, et une pub regardée contre des pièces", defs,
      monte(ecran(40, "a") +
        texte(140, 82, "Partie terminée", 21, "#f5f5f7", { ancre: "middle", gras: 600 }) +
        texte(140, 146, "42", 62, "#fff", { ancre: "middle", gras: 800 }) +
        texte(140, 174, "points", 18, "#a1a1a6", { ancre: "middle" }) +
        '<rect x="68" y="196" width="144" height="104" rx="12" fill="#f5f5f7"/>' +
        '<rect x="76" y="204" width="42" height="20" rx="5" fill="' + C.or + '"/>' +
        texte(97, 219, "Pub", 14, "#1d1d1f", { ancre: "middle", gras: 800 }) +
        '<rect x="86" y="240" width="108" height="11" rx="5.5" fill="#c7c7cc"/><rect x="86" y="262" width="74" height="11" rx="5.5" fill="#c7c7cc"/>' +
        '<rect x="80" y="320" width="120" height="42" rx="21" fill="' + C.bleu + '"/>' +
        texte(140, 347, "Rejouer", 19, "#fff", { ancre: "middle", gras: 600 }), 0) +
      monte(ecran(280, "b") +
        texte(380, 70, "120 pièces", 17, "#a1a1a6", { ancre: "middle" }) +
        '<rect x="302" y="112" width="156" height="210" rx="18" fill="#fff"/>' +
        '<circle cx="380" cy="160" r="26" fill="' + C.or + '"/><circle cx="380" cy="160" r="17" fill="none" stroke="#b8860b" stroke-width="3"/>' +
        texte(380, 222, "+50", 30, C.or, { ancre: "middle", gras: 800 }) +
        texte(380, 248, "pièces", 18, C.gris, { ancre: "middle" }) +
        '<rect x="318" y="268" width="124" height="38" rx="19" fill="' + C.vert + '"/>' +
        texte(380, 293, "Voir la pub", 17, "#002b0f", { ancre: "middle", gras: 700 }), 0.3));
  };

  /* ── Le calcul : parties par jour et revenu ────────────── */
  V.calcul = function () {
    var u = uid();
    var defs = '<linearGradient id="' + u + 'b" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="' + C.bleu + '"/><stop offset="1" stop-color="' + C.violet + '"/></linearGradient>';
    var lignes = [
      ["50 joueurs", "× 4 parties par jour", 200, "200 parties par jour", "100 à 300 F"],
      ["300 joueurs", "× 5 parties par jour", 1500, "1" + NB + "500 parties par jour", "750 à 2" + NB + "250 F"],
      ["2" + NB + "000 joueurs", "× 5 parties par jour", 10000, "10" + NB + "000 parties par jour", "5" + NB + "000 à 15" + NB + "000 F"]
    ];
    var s = texte(0, 26, "Si tu as…", 22, C.gris3) + texte(360, 26, "Ça fait…", 22, C.gris3) +
      texte(1000, 26, "Soit environ…", 22, C.gris3, { ancre: "end" });
    lignes.forEach(function (l, i) {
      var y = 50 + i * 94;
      s += '<rect x="0" y="' + (y - 4) + '" width="1000" height="1.5" fill="' + C.carte2 + '"/>';
      s += monte(texte(0, y + 38, l[0], 30, C.encre, { gras: 700 }) + texte(0, y + 70, l[1], 22, C.gris) +
        texte(360, y + 38, l[3], 26, C.encre) +
        '<rect x="360" y="' + (y + 54) + '" width="300" height="14" rx="7" fill="' + C.carte2 + '"/>' +
        '<rect x="360" y="' + (y + 54) + '" width="' + Math.max(12, 300 * l[2] / 10000) + '" height="14" rx="7" fill="url(#' + u + 'b)"/>' +
        texte(1000, y + 44, l[4], 32, C.orange, { gras: 700, ancre: "end" }) +
        texte(1000, y + 72, "par jour", 20, C.gris, { ancre: "end" }), 0.1 + i * 0.15);
    });
    var label = "Repère : 200 parties par jour font 100 à 300 F, 1 500 parties font 750 à 2 250 F, 10 000 parties font 5 000 à 15 000 F";
    /* Sur téléphone : chaque cas sur trois lignes */
    var t = "";
    lignes.forEach(function (l, i) {
      var y = i * 124;
      if (i) t += '<rect x="0" y="' + (y - 10) + '" width="520" height="1.5" fill="' + C.carte2 + '"/>';
      t += monte('<text x="0" y="' + (y + 26) + '" font-size="23" fill="' + C.gris + '">' +
          '<tspan font-weight="700" fill="' + C.encre + '">' + l[0] + "</tspan> " + l[1] + "</text>" +
        '<rect x="0" y="' + (y + 40) + '" width="270" height="14" rx="7" fill="' + C.carte2 + '"/>' +
        '<rect x="0" y="' + (y + 40) + '" width="' + Math.max(12, 270 * l[2] / 10000) + '" height="14" rx="7" fill="url(#' + u + 'b)"/>' +
        texte(284, y + 53, l[3].replace(" par jour", " / jour"), 19, C.gris) +
        '<text x="0" y="' + (y + 96) + '" font-size="32" font-weight="700" fill="' + C.orange + '">' + l[4] +
          '<tspan font-size="20" font-weight="400" fill="' + C.gris + '"> par jour</tspan></text>', 0.1 + i * 0.15);
    });
    return svg("0 0 1000 330", label, defs, s, "v-ordi") + svg("0 0 520 352", label, defs.replace(u + "b", u + "c"), t.split(u + "b)").join(u + "c)"), "v-tel");
  };

  /* ── Les gains des élèves : trois captures ─────────────── */
  V.gains = function () {
    var u = uid(), s = "";
    ["/media/revenu-1.jpg", "/media/revenu-2.jpg", "/media/revenu-3.jpg"].forEach(function (img, i) {
      var x = 45 + i * 320, id = u + "c" + i;
      s += monte('<clipPath id="' + id + '"><rect x="' + x + '" y="8" width="270" height="380" rx="22"/></clipPath>' +
        '<image href="' + img + '" x="' + x + '" y="-62" width="270" height="630" preserveAspectRatio="none" clip-path="url(#' + id + ')"/>' +
        '<rect x="' + x + '" y="8" width="270" height="380" rx="22" fill="none" stroke="' + C.trait + '" stroke-width="2"/>', i * 0.12);
    });
    /* Sur téléphone : deux captures, plus grandes */
    var t = "";
    ["/media/revenu-2.jpg", "/media/revenu-3.jpg"].forEach(function (img, i) {
      var x = 4 + i * 266, id = u + "d" + i;
      t += monte('<clipPath id="' + id + '"><rect x="' + x + '" y="4" width="246" height="360" rx="20"/></clipPath>' +
        '<image href="' + img + '" x="' + x + '" y="-58" width="246" height="574" preserveAspectRatio="none" clip-path="url(#' + id + ')"/>' +
        '<rect x="' + x + '" y="4" width="246" height="360" rx="20" fill="none" stroke="' + C.trait + '" stroke-width="2"/>', i * 0.12);
    });
    return svg("0 0 1000 396", "Trois captures des revenus de pub de mes élèves", "", s, "v-ordi") +
      svg("0 0 520 368", "Deux captures des revenus de pub de mes élèves", "", t, "v-tel");
  };

  /* ── Seul ou accompagné ────────────────────────────────── */
  V.seulAvec = function () {
    function colonne(x, titre, couleur, items, icone, d) {
      var s = '<rect x="' + x + '" y="10" width="245" height="380" rx="24" fill="' + C.carte + '"' +
        (icone === coche ? ' stroke="' + C.vert + '" stroke-width="2.5"' : "") + "/>" +
        texte(x + 26, 62, titre, 30, couleur, { gras: 700 });
      items.forEach(function (it, i) {
        var y = 124 + i * 92;
        s += icone(x + 38, y - 8, 15) + texte(x + 64, y, it[0], 22, C.encre, { gras: 500 });
        if (it[1]) s += texte(x + 64, y + 29, it[1], 22, C.encre, { gras: 500 });
      });
      return monte(s, d);
    }
    return svg("0 0 520 400", "Seul, une erreur te bloque et tu abandonnes. Avec moi, une vidéo pour chaque étape, des réponses, et ton jeu sort.", "",
      colonne(10, "Seul", C.rougeTexte, [["Une erreur", "te bloque"], ["Tu ne sais pas", "quoi demander"], ["Tu abandonnes", ""]], croix, 0) +
      colonne(265, "Avec moi", C.vertTexte, [["Une vidéo pour", "chaque étape"], ["Je réponds quand", "tu bloques"], ["Ton jeu sort", ""]], coche, 0.3));
  };

  /* ── L'offre ───────────────────────────────────────────── */
  V.offre = function () {
    var u = uid();
    var defs = degrade(u + "g", C.bleu, C.violet);
    var items = ["Les vidéos pas à pas", "Mes réponses quand tu bloques", "Le pack Game Build", "Les nouvelles vidéos"];
    var s = '<rect x="10" y="6" width="500" height="388" rx="28" fill="' + C.carte + '" stroke="url(#' + u + 'g)" stroke-width="2.5"/>' +
      texte(40, 58, "Le groupe d'accompagnement", 24, C.bleu, { gras: 700 });
    items.forEach(function (t, i) {
      var y = 110 + i * 44;
      s += monte(coche(54, y - 8, 13) + texte(80, y, t, 24, C.encre), 0.1 + i * 0.1);
    });
    s += '<rect x="40" y="276" width="440" height="1.5" fill="' + C.trait + '"/>' +
      texte(40, 356, "4" + NB + "500" + NB + "F", 68, "url(#" + u + "g)", { gras: 800 }) +
      texte(480, 350, "une seule fois", 24, C.gris, { ancre: "end" });
    return svg("0 0 520 400", "Le groupe d'accompagnement : les vidéos pas à pas, mes réponses, le pack Game Build, les nouvelles vidéos, pour 4 500 F une seule fois", defs, s);
  };

  /* ── Les 2 bonus ───────────────────────────────────────── */
  V.bonus = function () {
    var u = uid();
    var defs = '<radialGradient id="' + u + 'b" cx="30%" cy="20%" r="90%"><stop offset="0" stop-color="#2a5bd7"/><stop offset=".6" stop-color="#0b1d4d"/><stop offset="1" stop-color="#050b1f"/></radialGradient>' +
      degrade(u + "o", "#ffd27a", "#f56a2b");
    function carte(x, fond, image, l1, l2, l3, sous, d) {
      return monte('<rect x="' + x + '" y="62" width="242" height="332" rx="24" fill="' + C.carte + '"/>' +
        '<rect x="' + (x + 12) + '" y="74" width="218" height="172" rx="16" fill="url(#' + u + fond + ')"/>' + image +
        texte(x + 22, 284, l1, 18, C.orange, { gras: 700, style: "letter-spacing:1px" }) +
        texte(x + 22, 316, l2, 26, C.encre, { gras: 700 }) +
        texte(x + 22, 348, l3, 26, C.encre, { gras: 700 }) +
        texte(x + 22, 378, sous, 19, C.gris), d);
    }
    return svg("0 0 520 400", "Bonus 1 : le guide pas à pas de 36 pages. Bonus 2 : les visuels de ton jeu. Réservés aux 30 premiers.", defs,
      monte('<rect x="120" y="4" width="280" height="44" rx="22" fill="rgba(255,159,10,.15)" stroke="' + C.orange + '" stroke-width="2"/>' +
        texte(260, 33, "Réservé aux 30 premiers", 21, C.orange, { ancre: "middle", gras: 700 }), 0) +
      carte(10, "b", '<image href="/media/bonus-guide.webp" x="78" y="84" width="106" height="150"/>', "BONUS 1", "Le guide", "pas à pas", "36 pages", 0.15) +
      carte(268, "o", '<image href="/media/bonus-visuel.webp" x="309" y="80" width="160" height="160"/>', "BONUS 2", "Les visuels", "de ton jeu", "5 images pour toi", 0.3));
  };

  /* ── Rejoindre en 3 étapes ─────────────────────────────── */
  V.rejoindre = function () {
    var u = uid();
    var defs = degrade(u + "g", C.bleu, C.violet);
    function ligne(y, n, t, suite, d) {
      return monte('<rect x="10" y="' + y + '" width="500" height="112" rx="26" fill="' + C.carte + '"/>' +
        '<circle cx="62" cy="' + (y + 56) + '" r="30" fill="url(#' + u + 'g)"/>' +
        texte(62, y + 67, n, 30, "#fff", { ancre: "middle", gras: 700 }) +
        texte(112, y + 46, t, 26, C.encre, { gras: 700 }) + suite, d);
    }
    return svg("0 0 520 400", "Appuie sur Rejoindre le groupe, paie par Mobile Money, puis ouvre le groupe et tes bonus", defs,
      ligne(6, "1", "Appuie sur le bouton",
        '<rect x="112" y="62" width="222" height="36" rx="18" fill="#0071e3"/>' + texte(223, 86, "Rejoindre le groupe", 18, "#fff", { ancre: "middle", gras: 600 }), 0) +
      ligne(144, "2", "Paie par Mobile Money", texte(112, 224, "Sur la page de paiement", 21, C.gris), 0.2) +
      ligne(282, "3", "Une page s'ouvre", texte(112, 362, "Le lien du groupe et tes bonus", 21, C.gris), 0.4));
  };

  /* ── Les questions dans le chat ────────────────────────── */
  V.questions = function () {
    function avatar(x, y, couleur) {
      return '<circle cx="' + x + '" cy="' + y + '" r="22" fill="' + couleur + '"/>' +
        '<circle cx="' + x + '" cy="' + (y - 5) + '" r="7" fill="#fff" fill-opacity=".85"/>' +
        '<path d="M' + (x - 12) + " " + (y + 14) + " a12 10 0 0 1 24 0 z" + '" fill="#fff" fill-opacity=".85"/>';
    }
    function bulle(y, w, t, couleur, enAvant, d) {
      return monte(avatar(36, y + 32, couleur) +
        '<rect x="72" y="' + y + '" width="' + w + '" height="64" rx="22" fill="' + C.carte2 + '"' + (enAvant ? ' stroke="' + C.bleu + '" stroke-width="3"' : "") + "/>" +
        texte(96, y + 41, t, 23, C.encre), d);
    }
    return svg("0 0 520 400", "Des questions posées dans le chat", "",
      bulle(16, 300, "Il faut un ordinateur" + NB + "?", C.bleu, false, 0) +
      monte(texte(72, 120, "Mise en avant", 17, C.bleu, { gras: 700 }), 0.3) +
      bulle(130, 312, "Ça marche sur iPhone" + NB + "?", C.orange, true, 0.25) +
      bulle(230, 420, "Combien de temps pour un jeu" + NB + "?", C.vert, false, 0.5) +
      '<rect x="10" y="328" width="500" height="58" rx="29" fill="none" stroke="' + C.trait + '" stroke-width="2"/>' +
      texte(38, 364, "Écris ta question…", 21, C.gris3) +
      '<circle cx="478" cy="357" r="21" fill="' + C.bleu + '"/>' +
      '<path d="M478 367 V348 M470 355 L478 347 L486 355" fill="none" stroke="#fff" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>');
  };

  return V;
})();
