/* ══════════════════════════════════════════════════════════
   VIDÉOS DES MEMBRES — les deux formulaires de /membres/promotion
   (le lien du jeu, le lien direct), envoyés à /api/membres.
   Le prénom et le numéro sont gardés sur le téléphone pour
   préremplir le formulaire suivant.
   ══════════════════════════════════════════════════════════ */
(function () {
  "use strict";

  var CLE = "gb-membre";
  var formes = Array.prototype.slice.call(document.querySelectorAll("form.envoi"));
  if (!formes.length) return;

  function lis() { try { return JSON.parse(localStorage.getItem(CLE) || "{}") || {}; } catch (e) { return {}; } }
  function garde(o) { try { localStorage.setItem(CLE, JSON.stringify(o)); } catch (e) {} }

  /* ---------- Préremplir, et recopier d'un formulaire à l'autre ---------- */
  var connu = lis();
  formes.forEach(function (f) {
    ["prenom", "whatsapp"].forEach(function (nom) {
      var champ = f.elements[nom];
      if (connu[nom] && !champ.value) champ.value = connu[nom];
      champ.addEventListener("input", function () {
        formes.forEach(function (autre) {
          if (autre === f) return;
          var c = autre.elements[nom];
          if (!c.value || c.dataset.recopie === "1") { c.value = champ.value; c.dataset.recopie = "1"; }
        });
        champ.dataset.recopie = "";
      });
    });
  });

  /* ---------- Vérifications (les mêmes que sur le serveur) ---------- */
  function chiffres(v) { return String(v || "").replace(/\D/g, ""); }
  function lienValide(v) {
    var s = String(v || "").trim();
    if (!s || /\s/.test(s)) return null;
    if (!/^https?:\/\//i.test(s)) s = "https://" + s;
    try {
      var u = new URL(s);
      return /^https?:$/.test(u.protocol) && u.hostname.indexOf(".") > 0 ? u : null;
    } catch (e) { return null; }
  }

  function marque(f, nom, oui) {
    var c = nom === "regie" ? f.querySelector(".regies") : f.elements[nom];
    if (!c) return;
    if (oui) c.setAttribute("aria-invalid", "true"); else c.removeAttribute("aria-invalid");
  }
  function erreur(f, message, nom) {
    var p = f.querySelector(".erreur");
    p.textContent = message;
    p.hidden = false;
    if (nom) {
      marque(f, nom, true);
      var c = nom === "regie" ? f.querySelector(".regies input") : f.elements[nom];
      if (c && c.focus) c.focus();
    }
  }
  function efface(f) {
    f.querySelector(".erreur").hidden = true;
    ["prenom", "whatsapp", "nom_jeu", "lien", "regie"].forEach(function (n) { marque(f, n, false); });
  }

  function verifie(f) {
    var e = f.elements, sorte = f.getAttribute("data-sorte");
    if (!e.prenom.value.trim()) return ["Écris ton prénom.", "prenom"];
    var n = chiffres(e.whatsapp.value).length;
    if (n < 8 || n > 15) return ["Vérifie ton numéro WhatsApp, avec l'indicatif du pays.", "whatsapp"];
    if (sorte === "jeu" && !e.nom_jeu.value.trim()) return ["Écris le nom de ton jeu.", "nom_jeu"];
    if (sorte === "lien-direct" && !f.querySelector("input[name=regie]:checked")) return ["Choisis ta régie : Adsterra ou Monetag.", "regie"];
    var u = lienValide(e.lien.value);
    if (!u) return ["Colle un lien complet, qui commence par https://", "lien"];
    if (sorte === "lien-direct" && /(^|\.)jouable\.app$/i.test(u.hostname)) {
      return ["Ici, c'est ton lien direct Adsterra ou Monetag. Le lien de ton jeu va dans le formulaire « Le lien de ton jeu ».", "lien"];
    }
    return null;
  }

  /* ---------- Envoi ---------- */
  formes.forEach(function (f) {
    var carte = f.parentNode;
    var recu = carte.querySelector(".recu");
    var bouton = f.querySelector("button[type=submit]");
    var texteBouton = bouton.textContent;

    f.addEventListener("input", function (ev) {
      var nom = ev.target.name;
      if (nom) marque(f, nom, false);
    });

    f.addEventListener("submit", function (ev) {
      ev.preventDefault();
      efface(f);
      var pb = verifie(f);
      if (pb) { erreur(f, pb[0], pb[1]); return; }

      var e = f.elements, sorte = f.getAttribute("data-sorte");
      var regie = f.querySelector("input[name=regie]:checked");
      var corps = {
        sorte: sorte,
        prenom: e.prenom.value.trim(),
        whatsapp: e.whatsapp.value.trim(),
        lien: e.lien.value.trim(),
        site: e.site.value
      };
      if (sorte === "jeu") { corps.nom_jeu = e.nom_jeu.value.trim(); corps.phrase = e.phrase.value.trim(); }
      else corps.regie = regie ? regie.value : "";

      bouton.disabled = true;
      bouton.textContent = "Envoi…";
      fetch("/api/membres", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(corps)
      })
        .then(function (r) {
          return r.json().catch(function () { return {}; }).then(function (j) {
            if (!r.ok || !j.ok) { var x = new Error(j.erreur || "L'envoi n'est pas passé. Réessaie dans un instant."); x.champ = j.champ; throw x; }
            return j;
          });
        })
        .then(function () {
          garde({ prenom: corps.prenom, whatsapp: corps.whatsapp });
          recu.querySelector(".recu-texte").textContent = sorte === "jeu"
            ? "« " + corps.nom_jeu + " » est dans la liste, " + corps.prenom + ". Si je le choisis, il passera sur ma chaîne WhatsApp."
            : "Merci, " + corps.prenom + ". Tu peux le changer quand tu veux : un nouvel envoi remplace celui-ci.";
          f.hidden = true;
          recu.hidden = false;
          recu.focus();
        })
        .catch(function (err) {
          erreur(f, err.message || "L'envoi n'est pas passé. Vérifie ta connexion, puis réessaie.", err.champ);
        })
        .then(function () {
          bouton.disabled = false;
          bouton.textContent = texteBouton;
        });
    });

    recu.querySelector("[data-encore]").addEventListener("click", function () {
      var garder = { prenom: f.elements.prenom.value, whatsapp: f.elements.whatsapp.value };
      f.reset();
      f.elements.prenom.value = garder.prenom;
      f.elements.whatsapp.value = garder.whatsapp;
      recu.hidden = true;
      f.hidden = false;
      var premier = f.getAttribute("data-sorte") === "jeu" ? f.elements.nom_jeu : f.elements.lien;
      premier.focus();
    });
  });
})();
