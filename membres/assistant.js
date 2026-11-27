/* L'assistant des membres : la discussion avec /api/assistant.
   La réponse arrive au fil de l'eau. Elle se termine par les passages à
   regarder, [voir:id m:ss], que la page transforme en liens vers la vidéo
   au bon moment. L'id est celui de la miniature de la vidéo dans
   formation/contenu.js (/membres/miniatures/<id>.webp).
   La conversation est gardée le temps de l'onglet (sessionStorage). */
(function () {
  "use strict";

  var CLE = "gb-assistant";
  var MAX = 800;
  var VOIR = /\[voir:\s*([a-z0-9-]+)\s+(\d{1,3}):(\d{2})\s*\]/gi;

  var fil = document.getElementById("fil");
  var accueil = document.getElementById("accueil");
  var form = document.getElementById("saisie");
  var champ = document.getElementById("question");
  var bouton = document.getElementById("envoyer");

  var videos = {};
  ((window.FORMATION && window.FORMATION.videos) || []).forEach(function (v) {
    var m = String(v.miniature || "").match(/\/([a-z0-9-]+)\.webp$/);
    var y = String(v.youtube || "").match(/(?:youtu\.be\/|[?&]v=|\/embed\/|\/shorts\/|\/live\/)([\w-]{11})/);
    if (m) videos[m[1]] = { titre: v.titre, adresse: v.adresse, miniature: v.miniature, youtube: y ? y[1] : "" };
  });

  var messages = [];
  try { messages = JSON.parse(sessionStorage.getItem(CLE) || "[]") || []; } catch (e) { messages = []; }
  function sauve() { try { sessionStorage.setItem(CLE, JSON.stringify(messages.slice(-20))); } catch (e) {} }

  function el(tag, classe, texte) {
    var e = document.createElement(tag);
    if (classe) e.className = classe;
    if (texte != null) e.textContent = texte;
    return e;
  }

  /* ---------- Mise en forme : paragraphes, listes, gras ---------- */
  function enLigne(parent, texte) {
    String(texte).split(/(\*\*[^*]+\*\*)/).forEach(function (bout) {
      if (/^\*\*[^*]+\*\*$/.test(bout)) parent.appendChild(el("b", null, bout.slice(2, -2)));
      else if (bout) parent.appendChild(document.createTextNode(bout));
    });
  }
  function miseEnForme(cible, texte) {
    cible.replaceChildren();
    var liste = null, typeListe = "";
    String(texte).split(/\n/).forEach(function (ligne) {
      var l = ligne.trim();
      var num = l.match(/^(\d+)[.)]\s+(.*)$/), puce = l.match(/^[-•*]\s+(.*)$/);
      if (num || puce) {
        var t = num ? "ol" : "ul";
        if (!liste || typeListe !== t) { liste = el(t); typeListe = t; cible.appendChild(liste); }
        var li = el("li"); enLigne(li, num ? num[2] : puce[1]); liste.appendChild(li);
        return;
      }
      liste = null;
      if (!l) return;
      var p = el("p"); enLigne(p, l); cible.appendChild(p);
    });
  }

  /* Le texte sans les passages, et les passages à part. */
  function separe(texte, fini) {
    var passages = [], vus = {};
    var propre = String(texte).replace(VOIR, function (tout, id, m, s) {
      var cle = id + "@" + m + ":" + s;
      if (!vus[cle] && videos[id.toLowerCase()]) { vus[cle] = 1; passages.push({ id: id.toLowerCase(), m: +m, s: +s }); }
      return "";
    });
    if (!fini) propre = propre.replace(/\[[^\]\n]{0,40}$/, "");   /* un passage pas encore fini d'arriver */
    return { texte: propre.replace(/\n{3,}/g, "\n\n").trim(), passages: passages.slice(0, 3) };
  }

  function lienPassage(p) {
    var v = videos[p.id];
    var secondes = p.m * 60 + p.s;
    var a = el("a", "passage");
    a.href = v.youtube ? "https://youtu.be/" + v.youtube + "?t=" + secondes : v.adresse;
    a.target = "_blank"; a.rel = "noopener";
    if (v.miniature) { var img = el("img"); img.src = v.miniature; img.alt = ""; img.width = 96; img.height = 54; a.appendChild(img); }
    var t = el("span", "passage-texte");
    t.appendChild(el("small", null, "Regarder à " + p.m + ":" + (p.s < 10 ? "0" : "") + p.s));
    t.appendChild(el("b", null, v.titre));
    a.appendChild(t);
    return a;
  }

  /* ---------- Les bulles ---------- */
  function bulleMembre(texte) {
    var li = el("li", "msg msg-membre");
    li.appendChild(el("div", "bulle", texte));
    fil.appendChild(li);
    return li;
  }
  function bulleAssistant() {
    var li = el("li", "msg msg-assistant");
    var bulle = el("div", "bulle");
    var corps = el("div", "corps");
    var attente = el("p", "attente");
    attente.innerHTML = '<span></span><span></span><span></span>';
    attente.setAttribute("aria-label", "L'assistant écrit");
    corps.appendChild(attente);
    var passages = el("div", "passages");
    bulle.appendChild(corps); bulle.appendChild(passages);
    li.appendChild(bulle);
    fil.appendChild(li);
    return {
      li: li,
      montre: function (texte, fini) {
        var r = separe(texte, fini);
        if (r.texte) miseEnForme(corps, r.texte);
        passages.replaceChildren();
        if (fini && r.passages.length) {
          passages.appendChild(el("p", "passages-titre", r.passages.length > 1 ? "Les passages à regarder" : "Le passage à regarder"));
          r.passages.forEach(function (p) { passages.appendChild(lienPassage(p)); });
        }
      },
      erreur: function (texte) { li.classList.add("msg-erreur"); corps.replaceChildren(el("p", null, texte)); }
    };
  }

  function enBas() { window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" }); }

  function nouvelleConversation() {
    messages = []; sauve();
    fil.replaceChildren();
    accueil.hidden = false;
    champ.focus();
  }
  function boutonRecommencer() {
    var ancien = document.getElementById("recommencer");
    if (ancien) ancien.remove();
    if (!messages.length) return;
    var b = el("button", "btn-lien recommencer", "Nouvelle conversation");
    b.type = "button"; b.id = "recommencer";
    b.addEventListener("click", nouvelleConversation);
    fil.after(b);
  }

  /* ---------- Envoyer ---------- */
  var ERREURS = {
    "limite": "Tu as posé beaucoup de questions aujourd'hui. Reviens demain, ou pose ta question dans le groupe WhatsApp.",
    "limite-site": "L'assistant a répondu à beaucoup de questions aujourd'hui. Reviens demain, ou pose ta question dans le groupe WhatsApp.",
    "trop-long": "Ta question est trop longue : 800 caractères au plus.",
    "occupe": "L'assistant est très demandé en ce moment. Réessaie dans une minute."
  };
  var occupe = false;

  function envoie(question) {
    question = String(question || "").trim();
    if (!question || occupe) return;
    if (question.length > MAX) { alert(ERREURS["trop-long"]); return; }
    occupe = true; bouton.disabled = true;
    accueil.hidden = true;
    var ancien = document.getElementById("recommencer"); if (ancien) ancien.remove();

    var historique = messages.slice(-6);
    bulleMembre(question);
    var b = bulleAssistant();
    champ.value = ""; ajuste();
    enBas();

    var texte = "";
    function echec(code) {
      b.erreur(ERREURS[code] || "L'assistant n'a pas pu répondre. Réessaie dans un instant.");
      champ.value = question; ajuste();
    }
    fetch("/api/assistant", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question: question, historique: historique })
    }).then(function (r) {
      var type = r.headers.get("Content-Type") || "";
      if (!r.ok || type.indexOf("application/json") === 0) {
        return r.json().catch(function () { return {}; }).then(function (j) { echec(j && j.erreur); });
      }
      var lecteur = r.body && r.body.getReader ? r.body.getReader() : null;
      var dec = new TextDecoder();
      function fin() {
        if (/\[erreur\]\s*$/.test(texte)) { texte = texte.replace(/\s*\[erreur\]\s*$/, ""); if (!texte) { echec(); return; } }
        b.montre(texte, true);
        messages.push({ role: "user", texte: question }, { role: "assistant", texte: texte });
        sauve();
      }
      if (!lecteur) return r.text().then(function (t) { texte = t; fin(); });
      function lis() {
        return lecteur.read().then(function (x) {
          if (x.done) { texte += dec.decode(); fin(); return; }
          texte += dec.decode(x.value, { stream: true });
          b.montre(texte, false);
          enBas();
          return lis();
        });
      }
      return lis();
    }).catch(function () { echec(); })
      .then(function () {
        occupe = false; bouton.disabled = false;
        boutonRecommencer();
        enBas();
      });
  }

  /* ---------- La zone de saisie ---------- */
  function ajuste() {
    champ.style.height = "auto";
    champ.style.height = Math.min(champ.scrollHeight, 160) + "px";
  }
  champ.addEventListener("input", ajuste);
  champ.addEventListener("keydown", function (e) {
    if (e.key === "Enter" && !e.shiftKey && !e.isComposing) { e.preventDefault(); envoie(champ.value); }
  });
  form.addEventListener("submit", function (e) { e.preventDefault(); envoie(champ.value); });
  document.querySelectorAll("#exemples button").forEach(function (b) {
    b.addEventListener("click", function () { envoie(b.textContent); });
  });

  /* ---------- La conversation de l'onglet, s'il y en a une ---------- */
  if (messages.length) {
    accueil.hidden = true;
    messages.forEach(function (m) {
      if (m.role === "user") bulleMembre(m.texte);
      else bulleAssistant().montre(m.texte, true);
    });
    boutonRecommencer();
  }
})();
