/* Ce que la page des spectateurs et l'espace animateur partagent :
   l'affichage d'une slide et d'un message de chat, sans jamais injecter
   de HTML venu de l'extérieur (tout passe par textContent). */

window.LiveCommun = (function () {
  var ANIMATEUR = "animateur";

  function el(tag, classe, texte) {
    var n = document.createElement(tag);
    if (classe) n.className = classe;
    if (texte != null) n.textContent = texte;
    return n;
  }

  /* Dessine la slide n°index dans la scène. */
  function rendSlide(scene, slides, index) {
    var s = slides[index];
    scene.textContent = "";
    if (!s) return;
    var d = el("div", "slide");
    if (s.image) {
      d.classList.add("avec-image");
      var img = el("img");
      img.src = s.image; img.alt = s.titre || "";
      d.appendChild(img);
      if (s.titre || s.texte) {
        var v = el("div", "voile");
        if (s.titre) v.appendChild(el("h2", null, s.titre));
        if (s.texte) v.appendChild(el("p", null, s.texte));
        d.appendChild(v);
      }
      scene.appendChild(d);
      return;
    }
    /* Une illustration (live/visuels.js) : le texte d'un côté, le dessin de
       l'autre, ou le dessin en grand sous le titre (disposition: "large").
       Le dessin vient du code du site, jamais d'un texte du chat. */
    if (s.centre) d.classList.add("centre");
    var t = d, dessin = s.visuel && window.LiveVisuels && window.LiveVisuels[s.visuel];
    if (dessin) {
      d.classList.add("avec-visuel");
      if (s.disposition === "large") d.classList.add("large");
      t = el("div", "texte");
      d.appendChild(t);
    }
    if (s.surtitre) t.appendChild(el("div", "surtitre", s.surtitre));
    if (s.grand) {
      t.appendChild(el("div", "grand", s.grand));
      if (s.legende) t.appendChild(el("div", "legende", s.legende));
    }
    if (s.titre) t.appendChild(el("h2", null, s.titre));
    if (s.texte) t.appendChild(el("p", null, s.texte));
    if (s.puces && s.puces.length) {
      var ul = el("ul");
      s.puces.forEach(function (p) { ul.appendChild(el("li", null, p)); });
      t.appendChild(ul);
    }
    if (dessin) {
      var v = el("div", "visuel");
      v.innerHTML = dessin();
      d.appendChild(v);
    }
    scene.appendChild(d);
  }

  /* Un message : { id, nom, texte, de, anim } */
  function rendMessage(m) {
    var p = el("div", "msg" + (m.anim ? " anim" : ""));
    p.dataset.id = m.id;
    p.appendChild(el("b", null, m.nom));
    p.appendChild(document.createTextNode(m.texte));
    return p;
  }

  /* Défile en bas seulement si on y était déjà (on ne coupe pas quelqu'un qui relit). */
  function ajouteEnBas(liste, noeud) {
    var enBas = liste.scrollHeight - liste.scrollTop - liste.clientHeight < 60;
    liste.appendChild(noeud);
    while (liste.children.length > 200) liste.removeChild(liste.firstChild);
    if (enBas) liste.scrollTop = liste.scrollHeight;
  }

  function idMessage() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  }

  function texteChat(v) {
    return typeof v === "string" ? v.replace(/[\u0000-\u001f\u007f]/g, " ").trim().slice(0, 200) : "";
  }

  var encode = function (o) { return new TextEncoder().encode(JSON.stringify(o)); };
  var decode = function (b) { try { return JSON.parse(new TextDecoder().decode(b)); } catch (e) { return null; } };

  return { ANIMATEUR: ANIMATEUR, el: el, rendSlide: rendSlide, rendMessage: rendMessage,
           ajouteEnBas: ajouteEnBas, idMessage: idMessage, texteChat: texteChat, encode: encode, decode: decode };
})();
