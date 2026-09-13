# Game Build — page de vente

Site statique d'une seule page. Aucune dépendance à installer, aucun build à lancer.

```
GAME BUILD/
├── index.html      ← toute la page (HTML + CSS + JS)
├── media/          ← tes vidéos et images (voir media/LISEZ-MOI.txt)
├── vercel.json     ← en-têtes et cache
└── README.md
```

---

## 1. À faire avant de mettre en ligne

### Le lien de paiement (obligatoire)

Ouvre `index.html`, descends tout en bas jusqu'au `<script>`, et remplis cette ligne :

```js
var LIEN_PAIEMENT = "https://kgpqinxc.mychariow.shop/prd_xxxxxxxx";
```

Tant qu'elle est vide, tous les boutons affichent un rappel au lieu de rediriger. Une fois remplie,
les 5 boutons d'achat de la page pointent automatiquement vers ce lien, dans un nouvel onglet.

### Tes vidéos et tes images

Dépose-les dans `media/` avec les noms exacts listés dans
[media/LISEZ-MOI.txt](media/LISEZ-MOI.txt). Aucun code à modifier : la page
les détecte seule. Tant qu'un fichier manque, l'encart affiche son nom
attendu dans un cadre en pointillés — la page reste présentable.

### Le reste (recommandé)

| Quoi | Où |
| --- | --- |
| Alléger la bannière `media/hero.png` (1,68 Mo) | voir [media/LISEZ-MOI.txt](media/LISEZ-MOI.txt), section « LE CAS DE hero.png » |
| Les prénoms sous les trois témoignages | section `#temoignages`, remplace les six `<b>Prénom</b>` (trois cartes + leurs trois copies) |
| L'URL finale du site | balise `<link rel="canonical">` dans le `<head>` |
| Le numéro WhatsApp | `footer`, lien `wa.me/22897222373` |

---

## 2. Mettre en ligne sur Vercel

### Option A — glisser-déposer (le plus rapide, 2 minutes)

1. Va sur [vercel.com/new](https://vercel.com/new) et connecte-toi.
2. Choisis **Deploy** puis l'onglet de dépôt de fichiers.
3. Glisse le dossier `GAME BUILD` entier.
4. Vercel détecte un site statique tout seul. Clique **Deploy**.

Tu obtiens une URL du type `game-build-xxxx.vercel.app` en une trentaine de secondes.

### Option B — via GitHub (pour pouvoir modifier ensuite)

```bash
cd "C:\Users\SURFACE\GAME BUILD"
git init
git add .
git commit -m "Page de vente Game Build"
git branch -M main
git remote add origin https://github.com/TON-COMPTE/game-build.git
git push -u origin main
```

Puis sur [vercel.com/new](https://vercel.com/new), importe le dépôt. Chaque `git push` redéploie tout seul.

### Option C — en ligne de commande

```bash
npm i -g vercel
cd "C:\Users\SURFACE\GAME BUILD"
vercel            # déploiement de test
vercel --prod     # mise en production
```

**Réglages du projet** : Framework Preset = `Other`, Build Command = vide, Output Directory = vide,
Root Directory = `.`. Il n'y a rien à compiler.

---

## 3. Nom de domaine

Dans Vercel : **Settings → Domains → Add**. Ajoute ton domaine, puis chez ton registrar crée les
enregistrements que Vercel t'affiche (un `A` vers `76.76.21.21` pour le domaine nu, un `CNAME` vers
`cname.vercel-dns.com` pour le `www`). Le HTTPS est activé automatiquement.

---

## 4. Tester en local

Double-clique sur `index.html` — ça suffit. Pour un vrai serveur local :

```bash
npx serve .
```

---

## Notes techniques

- **Police** : SF Pro via la pile système sur iPhone et Mac, Inter (Google Fonts) partout ailleurs.
- **Thème** : clair uniquement, volontairement — apple.com ne bascule pas en thème sombre.
- **Accessibilité** : `prefers-reduced-motion`, `prefers-reduced-transparency` et `prefers-contrast`
  sont gérés ; la page reste entièrement lisible sans JavaScript.
- **Aperçu du jeu** : dessiné au `<canvas>`, aucune image à charger. Il se met en pause quand
  l'onglet passe en arrière-plan.
