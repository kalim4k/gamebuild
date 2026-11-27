/* La bibliothèque des membres (/membres) : une carte par vidéo, rangées
   dans les sections de FORMATION.bibliotheque (formation/contenu.js).
   Une adresse qui n'existe plus dans contenu.js est simplement ignorée. */
(function () {
  "use strict";

  var F = window.FORMATION || { videos: [], bibliotheque: [] };
  var racine = document.getElementById("biblio");
  if (!racine) return;

  var parAdresse = {};
  F.videos.forEach(function (v) { parAdresse[v.adresse] = v; });

  function el(tag, classe, texte) {
    var e = document.createElement(tag);
    if (classe) e.className = classe;
    if (texte != null) e.textContent = texte;
    return e;
  }

  /* Sans miniature, on reprend la vignette YouTube. */
  function image(v) {
    if (v.miniature) return v.miniature;
    var m = String(v.youtube || "").match(/(?:youtu\.be\/|[?&]v=|\/embed\/|\/shorts\/|\/live\/)([\w-]{11})/);
    return m ? "https://i.ytimg.com/vi/" + m[1] + "/hqdefault.jpg" : "";
  }

  (F.bibliotheque || []).forEach(function (section, s) {
    var videos = section.adresses.map(function (a) { return parAdresse[a]; }).filter(Boolean);
    if (!videos.length) return;

    var bloc = el("section", "biblio-section");
    var idTitre = "biblio-titre-" + s;
    bloc.setAttribute("aria-labelledby", idTitre);
    var h = el("h2", null, section.titre);
    h.id = idTitre;
    bloc.appendChild(h);
    bloc.appendChild(el("p", "biblio-nombre", videos.length + (videos.length > 1 ? " vidéos" : " vidéo")));

    var liste = el("ul", "biblio-grille");
    videos.forEach(function (v) {
      var li = el("li");
      var a = el("a", "biblio-carte");
      a.href = v.adresse;

      var cadre = el("span", "biblio-image");
      var src = image(v);
      if (src) {
        var img = el("img");
        img.src = src; img.alt = ""; img.loading = "lazy"; img.decoding = "async";
        img.width = 640; img.height = 360;
        cadre.appendChild(img);
      }
      if (v.duree) cadre.appendChild(el("span", "lecteur-duree", v.duree));
      a.appendChild(cadre);

      var corps = el("span", "biblio-corps");
      corps.appendChild(el("b", null, v.titre));
      if (v.resume) corps.appendChild(el("span", null, v.resume));
      a.appendChild(corps);

      li.appendChild(a);
      liste.appendChild(li);
    });
    bloc.appendChild(liste);
    racine.appendChild(bloc);
  });
})();
