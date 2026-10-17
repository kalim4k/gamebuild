/* ══════════════════════════════════════════════════════════
   FORMATION GRATUITE — construit les pages à partir de contenu.js
   <body data-page="liste">        → le sommaire
   <body data-page="video" data-n="2"> → la vidéo n° 2
   Le lecteur YouTube n'est chargé qu'au clic : la page reste
   légère, et rien ne passe par la bande passante de Vercel.
   ══════════════════════════════════════════════════════════ */
(function () {
  "use strict";

  var F = window.FORMATION || { videos: [] };
  var app = document.getElementById("app");
  var page = document.body.getAttribute("data-page");

  function el(tag, classe, texte) {
    var e = document.createElement(tag);
    if (classe) e.className = classe;
    if (texte != null) e.textContent = texte;
    return e;
  }

  /* youtu.be/ID, watch?v=ID, /embed/ID, /shorts/ID, /live/ID — ou l'ID seul. */
  function idYoutube(lien) {
    lien = String(lien || "").trim();
    if (/^[\w-]{11}$/.test(lien)) return lien;
    var m = lien.match(/(?:youtu\.be\/|[?&]v=|\/embed\/|\/shorts\/|\/live\/)([\w-]{11})/);
    return m ? m[1] : "";
  }
  function vignette(id) { return "https://i.ytimg.com/vi/" + id + "/hqdefault.jpg"; }

  var ICONE_LECTURE = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5.14v13.72a1 1 0 0 0 1.5.86l11-6.86a1 1 0 0 0 0-1.72l-11-6.86A1 1 0 0 0 8 5.14z"/></svg>';
  var ICONE_COPIE = '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V6a2 2 0 0 1 2-2h9"/></svg>';
  var ICONE_OK = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m5 12.5 4.5 4.5L19 7.5"/></svg>';

  /* ---------- Copier un prompt (avec repli pour les vieux navigateurs) ---------- */
  function copie(texte) {
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(texte).then(function () { return true; }, function () { return repli(texte); });
    }
    return Promise.resolve(repli(texte));
  }
  function repli(texte) {
    var t = document.createElement("textarea");
    t.value = texte; t.setAttribute("readonly", "");
    t.style.position = "fixed"; t.style.opacity = "0";
    document.body.appendChild(t); t.select();
    var ok = false;
    try { ok = document.execCommand("copy"); } catch (e) {}
    document.body.removeChild(t);
    return ok;
  }

  /* ---------- Le lecteur : vignette d'abord, YouTube au clic ---------- */
  function lecteur(v) {
    var boite = el("div", "lecteur");
    var id = idYoutube(v.youtube);
    if (!id) {
      var vide = el("div", "lecteur-vide");
      vide.appendChild(el("b", null, "Vidéo bientôt disponible"));
      vide.appendChild(el("span", null, "Reviens un peu plus tard."));
      boite.appendChild(vide);
      return boite;
    }
    var bouton = el("button", "lecteur-bouton");
    bouton.type = "button";
    bouton.setAttribute("aria-label", "Lancer la vidéo : " + v.titre);
    var img = el("img"); img.src = vignette(id); img.alt = ""; img.decoding = "async";
    var rond = el("span", "lecteur-rond"); rond.innerHTML = ICONE_LECTURE;
    bouton.appendChild(img); bouton.appendChild(rond);
    if (v.duree) bouton.appendChild(el("span", "lecteur-duree", v.duree));
    bouton.addEventListener("click", function () {
      var f = document.createElement("iframe");
      f.src = "https://www.youtube-nocookie.com/embed/" + id + "?autoplay=1&rel=0&playsinline=1";
      f.title = v.titre;
      f.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";
      f.allowFullscreen = true;
      f.referrerPolicy = "strict-origin-when-cross-origin";
      boite.replaceChild(f, bouton);
    });
    boite.appendChild(bouton);
    return boite;
  }

  function blocPrompt(p, i) {
    var carte = el("article", "prompt");
    carte.appendChild(el("h3", null, p.titre || ("Prompt " + (i + 1))));
    var texte = String(p.texte || "").trim();
    carte.appendChild(el("pre", "prompt-texte", texte));
    var actions = el("div", "prompt-actions");
    var b = el("button", "btn");
    b.type = "button";
    function etat(copie) {
      b.innerHTML = (copie ? ICONE_OK : ICONE_COPIE) + "<span></span>";
      b.lastChild.textContent = copie ? "Copié" : "Copier le prompt";
      b.classList.toggle("copie", copie);
    }
    etat(false);
    b.addEventListener("click", function () {
      copie(texte).then(function (ok) {
        if (!ok) { window.prompt("Copie ce prompt :", texte); return; }
        etat(true);
        setTimeout(function () { etat(false); }, 2200);
      });
    });
    var claude = el("a", "lien-claude", "Ouvrir Claude");
    claude.href = "https://claude.ai/new";
    claude.target = "_blank"; claude.rel = "noopener";
    actions.appendChild(b); actions.appendChild(claude);
    carte.appendChild(actions);
    return carte;
  }

  /* ---------- Page d'une vidéo ---------- */
  function pageVideo(n) {
    var v = F.videos[n - 1];
    if (!v) { location.replace("/formation"); return; }
    var total = F.videos.length;
    document.title = v.titre + " — " + (F.titre || "Formation");

    var entete = el("header", "entete");
    entete.appendChild(el("p", "surtitre", "Vidéo " + n + " sur " + total + (v.duree ? " · " + v.duree : "")));
    entete.appendChild(el("h1", null, v.titre));
    if (v.resume) entete.appendChild(el("p", "chapo", v.resume));
    app.appendChild(entete);
    app.appendChild(lecteur(v));

    var liste = (v.prompts || []).filter(function (p) { return p && String(p.texte || "").trim(); });
    if (liste.length) {
      var sec = el("section", "prompts");
      sec.appendChild(el("h2", null, liste.length > 1 ? "Les prompts de la vidéo" : "Le prompt de la vidéo"));
      sec.appendChild(el("p", "prompts-aide", "Copie-le, colle-le dans Claude et envoie. Tu peux changer les mots pour l'adapter à ton idée."));
      liste.forEach(function (p, i) { sec.appendChild(blocPrompt(p, i)); });
      app.appendChild(sec);
    }

    var suite = el("nav", "suite");
    suite.setAttribute("aria-label", "Autres vidéos");
    if (n > 1) suite.appendChild(lienVoisin(n - 1, "Vidéo précédente", "precedente"));
    if (n < total) suite.appendChild(lienVoisin(n + 1, "Vidéo suivante", "suivante"));
    app.appendChild(suite);
  }
  function lienVoisin(n, libelle, classe) {
    var a = el("a", classe);
    a.href = "/formation/" + n;
    a.appendChild(el("small", null, libelle));
    a.appendChild(el("span", null, F.videos[n - 1].titre));
    return a;
  }

  /* ---------- Sommaire ---------- */
  function pageListe() {
    var entete = el("header", "entete");
    entete.appendChild(el("p", "surtitre", F.videos.length + " vidéos · gratuit"));
    entete.appendChild(el("h1", null, F.titre || "Formation"));
    if (F.sousTitre) entete.appendChild(el("p", "chapo", F.sousTitre));
    app.appendChild(entete);

    var ul = el("ul", "liste");
    F.videos.forEach(function (v, i) {
      var li = el("li");
      var a = el("a", "carte");
      a.href = "/formation/" + (i + 1);
      var image = el("div", "carte-image");
      var id = idYoutube(v.youtube);
      if (id) { var img = el("img"); img.src = vignette(id); img.alt = ""; img.loading = "lazy"; img.decoding = "async"; image.appendChild(img); }
      else image.appendChild(el("span", "carte-num", String(i + 1)));
      if (v.duree) image.appendChild(el("span", "lecteur-duree", v.duree));
      var corps = el("div", "carte-corps");
      corps.appendChild(el("small", null, "Vidéo " + (i + 1)));
      corps.appendChild(el("h2", null, v.titre));
      if (v.resume) corps.appendChild(el("p", null, v.resume));
      a.appendChild(image); a.appendChild(corps);
      li.appendChild(a); ul.appendChild(li);
    });
    app.appendChild(ul);
  }

  if (page === "video") pageVideo(parseInt(document.body.getAttribute("data-n"), 10));
  else pageListe();
})();
