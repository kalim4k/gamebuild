# Game Build — page de vente

Site statique d'une seule page. Aucune dépendance à installer, aucun build à lancer.

```
GAME BUILD/
├── index.html         ← la page de vente (HTML + CSS + JS)
├── admin.html         ← l'espace admin, servi sur /admin
├── api/
│   ├── track.mjs      ← reçoit les événements et les range dans Neon
│   ├── stats.mjs      ← renvoie les statistiques à l'espace admin
│   ├── vocal.mjs      ← reçoit une question, choisit le vocal à jouer
│   ├── salut.mjs      ← « Salut Kossi… » dans ta voix, généré une fois puis resservi
│   └── _vocaux.mjs    ← outils partagés (filtre des prénoms, tri, ElevenLabs)
├── scripts/
│   └── init-db.mjs    ← crée la table (une seule fois)
├── media/             ← tes vidéos et images (voir media/LISEZ-MOI.txt)
│   └── vocaux/        ← tes réponses vocales + objections.json (voir son LISEZ-MOI.txt)
├── vercel.json        ← en-têtes et cache
├── .env.example       ← modèle des variables ; .env.local n'est jamais versionné
└── README.md
```

---

## 1. À faire avant de mettre en ligne

### Le lien de paiement — en place ✅

En bas de `index.html`, dans le `<script>` :

```js
var LIEN_PAIEMENT = "https://kgpqinxc.mychariow.shop/prd_iiq2laak/checkout";
```

Les 5 boutons d'achat de la page pointent tous dessus, dans un nouvel onglet. Si tu vides cette
ligne, ils affichent un rappel au lieu de rediriger vers une page morte.

Le prix affiché sur Chariow doit correspondre aux **6 900 F CFA** de la page : sinon le visiteur
voit un montant à l'arrivée sur le paiement, et il abandonne.

### L'offre de lancement et son compte à rebours

Réglages en haut de `index.html`, dans le premier `<script>` du `<head>` :

```js
var ACTIVE = true;   // false = plus d'offre, la page revient à 6 900 F
var H_MIN  = 9.5;    // 9 h 30 — temps le plus court qu'un visiteur peut voir
var H_MAX  = 12.9;   // 12 h 54 — le plus long
```

**Comment ça marche.** Le compte à rebours part à la **première visite** de chaque
personne et vit dans son navigateur. Ce n'est donc pas une date limite commune : quelqu'un
qui arrive demain aura lui aussi son propre décompte. Quelqu'un qui vide son navigateur
repart à zéro.

Le temps de départ est **tiré au hasard** entre `H_MIN` et `H_MAX`, à la seconde près.
C'est volontaire : un chrono qui affiche 23:59:5x à chaque arrivée se trahit tout seul,
alors que 11:07:43 ressemble à une échéance déjà entamée. Garde la fourchette sous les
13 heures, sinon l'effet disparaît.

**L'offre ne s'arrête jamais toute seule.** Quand le compte à rebours d'un visiteur est
épuisé, il en reçoit un nouveau au chargement suivant — le prix, lui, reste à 1 990 F.

**Pour fermer l'offre**, un seul geste : `ACTIVE = false`. La page bascule alors
**entièrement** au prix normal — le bandeau disparaît, le compte à rebours aussi, et les
six prix repassent à 6 900 F. Il n'y a rien d'autre à modifier.

**Le prix Chariow doit suivre.** La page annonce 1 990 F ; ton produit est réglé à 6 900 F.
Tant que tu ne changes pas le prix promotionnel dans Chariow, l'acheteur voit 1 990 F sur
la page et 6 900 F au paiement — il abandonne.

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

## 1 bis. Les statistiques et l'espace admin

L'espace admin est sur **`/admin`**. Il montre les visiteurs, les pages vues, le taux
de clic sur les boutons d'achat, où les gens s'arrêtent dans la page, quel bouton
travaille, d'où ils viennent, à quelle heure, sur quel appareil et depuis quel pays.

### Les trois variables à régler sur Vercel

**Settings → Environment Variables**, pour les trois environnements (Production,
Preview, Development) :

| Variable | À quoi ça sert |
| --- | --- |
| `DATABASE_URL` | la chaîne de connexion Neon (onglet **Connect** du tableau de bord Neon) |
| `ADMIN_MOT_DE_PASSE` | le mot de passe de `/admin` — mets-en un long |
| `HASH_SEL` | une chaîne au hasard, pour le calcul des visiteurs uniques |

Un modèle est dans [.env.example](.env.example). Pour travailler en local, recopie-le en
`.env.local` : ce fichier n'est **jamais** versionné, parce que le dépôt est public.
**Ne mets jamais la chaîne Neon dans un fichier suivi par git.**

### Créer la table (une seule fois)

```bash
npm install
npm run init-db
```

Sans danger : tout est en `IF NOT EXISTS`, rien n'est jamais supprimé. C'est déjà fait,
la table `evenements` existe.

### Ce qui est mesuré

| Événement | Quand |
| --- | --- |
| `vue` | à l'ouverture de la page |
| `scroll` | aux paliers 25 %, 50 %, 75 % et 90 % de la page |
| `clic` | au clic sur un bouton d'achat, avec son emplacement |
| `sortie` | au départ, avec la durée de la visite en secondes |

### Vie privée

**Aucune adresse IP n'est enregistrée.** Le compteur de visiteurs uniques repose sur
une empreinte à sens unique (SHA-256 de l'IP + navigateur + `HASH_SEL`), qu'on ne peut
pas remonter vers une personne, et qui n'est pas déposée sur son appareil. L'identifiant
de visite vit dans l'onglet et disparaît à sa fermeture : ce n'est pas un mouchard
persistant. C'est volontairement plus sobre qu'un outil de mesure du marché — et ça
t'évite d'avoir à demander un consentement pour cette mesure-là.

### Les réponses vocales, dans la même base

Les questions posées dans la bulle vocale sont rangées dans la table `questions` :
le **prénom** tapé par le visiteur et le **texte** de sa question, s'il l'a écrite ou
dictée. Rien d'autre. Les saluts générés dans ta voix sont dans la table `saluts`.

### À savoir

Les mesures n'arrivent **que depuis le site déployé sur Vercel**, parce que la page
appelle une fonction serveur. Ouvrir `index.html` par double-clic n'enregistre rien,
et l'espace admin affichera zéro.

---

## 1 ter. Les réponses vocales

Une bulle ronde avec ta photo, en bas à droite. Le visiteur choisit une question parmi
les objections prévues — ou écrit, ou dicte la sienne — donne son prénom, et reçoit un
message vocal façon WhatsApp : « Salut Kossi, j'espère que tu vas bien » (ou « que vous
allez bien » quand ton vocal vouvoie), **généré dans ta voix clonée**, suivi de **ton
vocal enregistré** pour cette objection.

**Tout se règle dans [media/vocaux/](media/vocaux/)** — les fichiers à déposer, les
règles d'enregistrement, comment ajouter une objection ou une version : voir
[media/vocaux/LISEZ-MOI.txt](media/vocaux/LISEZ-MOI.txt).

**Elle est invisible tant que `"actif"` vaut `false`** dans `objections.json`. Pour la
voir sans la montrer : ajoute `?vocal=test` à l'adresse de ta page.

### Les variables à ajouter sur Vercel

| Variable | Obligatoire ? | À quoi ça sert |
| --- | --- | --- |
| `ELEVENLABS_API_KEY` | pour le salut et les questions dictées | ta clé ElevenLabs |
| `ELEVENLABS_VOICE_ID` | pour le salut | l'identifiant de ta voix clonée |
| `ANTHROPIC_API_KEY` | non | trier les questions écrites avec Claude plutôt qu'aux mots-clés |
| `ELEVENLABS_MODELE` | non | `eleven_multilingual_v2` par défaut, choisi à l'oreille face à `eleven_v4` |
| `SALUT_MAX_JOUR` | non | nouveaux prénoms générés par jour, 300 par défaut |

Sans ElevenLabs, la bulle fonctionne quand même : ton vocal est joué sans le salut, et
seules les questions écrites sont acceptées. Comme pour Neon : **ne colle jamais ces clés
dans un fichier versionné ni dans une conversation** — directement dans Vercel et dans
`.env.local`.

### Ce qui protège ta voix

- Le visiteur ne choisit **jamais** les mots que dit ta voix : il ne fournit qu'un prénom.
  Lettres seulement, un mot, 20 signes au plus, insultes refusées — sinon, salut sans
  prénom.
- Chaque prénom n'est généré **qu'une fois**, puis resservi depuis Neon.
- Au plus 300 nouveaux prénoms par jour : une attaque coûterait au pire un dollar.
- Au plus 12 questions par heure et par visiteur ; au-delà, renvoi vers WhatsApp.

### Si tu changes de voix ou de modèle

Rien à faire : chaque salut est rangé avec l'empreinte de la voix et du modèle qui l'ont
produit. Change `ELEVENLABS_VOICE_ID` ou `ELEVENLABS_MODELE`, et les saluts se régénèrent
d'eux-mêmes à la demande suivante.

**Eleven v4 et les voix anciennes :** une voix clonée créée avant la sortie de v4
(28 septembre 2026) doit être réentraînée avec v4 pour bien sonner, d'après ElevenLabs.

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
