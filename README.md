# Le monde de Marilin

Portfolio personnel de **Marilin BADJI** : une pièce-atelier au matin, explorable en 3D, avec une version 2D complète pour la lecture, l’accessibilité et les appareils sans WebGL.

Le contenu est centralisé dans un seul fichier : `src/data/profile.json`.

---

## Démarrer

```bash
npm install
npm run dev
```

| Commande | Rôle |
|---|---|
| `npm run dev` | Serveur local Vite |
| `npm run build` | Vérification TypeScript + build de production dans `dist/` |
| `npm run preview` | Prévisualisation du build |
| `npm run typecheck` | Vérification TypeScript seule |
| `npm run content:check` | Liste les champs de `profile.json` encore à compléter |
| `npm run check` | Typecheck + audit du contenu |

---

## Architecture

```
src/
  App.tsx                  routing 3D / 2D, scroll, clavier, annonces ARIA
  data/
    profile.json           source unique du contenu
    schema.ts              validation zod au démarrage
    selectors.ts           accès typés + détection des champs en brouillon
  experience/
    Scene.tsx              Canvas, qualité adaptative, état de chargement
    World.tsx              racine de la scène
    Room.tsx               la pièce et ses dix zones
    CameraRig.tsx          spline de caméra pilotée par le scroll
    anchors.ts             coordonnées des zones, partagées 2D / 3D
    chapters.ts            ordre et cadrages des chapitres
    Effects.tsx            bloom / vignette / grain selon le palier
  components/
    three/                 survol, clic, palette 3D
    ui/                    HUD, panneau, plan, intro, version 2D
  hooks/
    useReducedMotion.ts    respect de prefers-reduced-motion
    useFocusTrap.ts        piège de focus des dialogues
  lib/
    scroll.ts              progression de scroll partagée
    device.ts              détection WebGL, palier, route 2D
    routes.ts              chemins /classique et retour 3D
    audio.ts               ambiance synthétisée, désactivée par défaut
  store/useExperience.ts   état global (chapitre, focus, qualité, audio…)
public/
  photo/                   portrait à fournir
scripts/
  check-content.mjs        audit des contenus manquants
```

---

## Modifier le contenu

Tout se passe dans `src/data/profile.json` :

- `identity` : nom, rôle, origine, GitHub, e-mail, téléphone, LinkedIn ;
- `aboutChapters` : récit « Qui suis-je » ;
- `timeline`, `experiences`, `certifications`, `engagement` ;
- `skills`, `projects`, `languages`, `ambitions` ;
- `photo.src` : chemin du portrait (voir `public/photo/README.md`) ;
- `ui.chapterOrder` : ordre des dix zones.

Après modification :

```bash
npm run check
```

Le schéma zod provoque une erreur explicite au démarrage si un champ obligatoire manque. Les valeurs contenant « à compléter », « à préciser » ou « à confirmer » sont considérées comme des brouillons et masquées dans l’interface quand c’est possible.

### Champs encore à fournir

- e-mail, téléphone, LinkedIn ;
- portrait (`photo.src`) ;
- intitulé exact et année de la licence ;
- dates et missions du stage CAP EPAC ;
- missions de CAMAH, DREAM TECH et DGPER ;
- lieux des expériences ;
- démo et dépôt HOPITEL, démo E-Santé ;
- rôles détaillés de QR Flow, « Une journée sans informaticiens » et E-Santé ;
- niveaux de langue ;
- détails de l’engagement associatif.

---

## Navigation

- **Molette / tactile** : progression dans la pièce.
- **← / →** : chapitre précédent / suivant.
- **0–9** : accès direct aux zones 00 à 09.
- **Home / End** : première / dernière zone.
- **Échap** : fermer le plan ou un cadrage rapproché.
- **Plan** : accès direct à n’importe quelle zone, avec un lien vers la version 2D.
- **Lien d’évitement** : au premier Tab, « Aller au contenu » place le focus sur le panneau.
- Un clic sur un objet 3D ouvre le chapitre correspondant et cadre la caméra.
- Un scroll ferme automatiquement le cadrage rapproché.

---

## Version 2D

Accessible par :

- l’URL `/classique` (ou `?classique=1`) ;
- le bouton « Version 2D » dans le HUD et l’intro ;
- le bouton « Ouvrir la version 2D » en bas du plan (utile sur mobile, où le bouton du HUD est masqué) ;
- automatiquement si WebGL est indisponible.

La version 2D reprend le chapitre en cours et contient le même contenu, sans 3D ni animations. Le retour à la 3D ne rejoue pas l’introduction.

Les chemins sont calculés à partir de `BASE_URL` (`src/lib/routes.ts`), donc le site fonctionne aussi s’il est servi depuis un sous-dossier.

Le fichier `vercel.json` ajoute la réécriture nécessaire pour que `/classique` fonctionne après un rechargement sur Vercel. En local avec `vite preview`, utiliser `?classique=1`.

---

## Accessibilité

- interface entièrement HTML au-dessus de la scène, la 3D étant décorative ;
- lien d’évitement vers le panneau de contenu ;
- navigation clavier et focus visible ;
- piège de focus dans l’intro et le plan, restitution du focus à la fermeture ;
- annonce `aria-live` du changement de zone ;
- respect de `prefers-reduced-motion` (caméra, scroll, animations CSS) ;
- son désactivé par défaut, activé uniquement par un geste explicite ;
- version 2D complète pour les lecteurs d’écran.

Points restant à auditer : contraste réel sur les dix panneaux, parcours lecteur d’écran de bout en bout, et rendu sur trois appareils.

---

## Performance

- trois paliers `high / medium / low` selon les cœurs, la mémoire, le pointeur et la largeur d’écran ;
- DPR ajusté en continu selon les FPS mesurées ;
- pas de post-traitement ni de poussière animée en `low` ;
- scène 3D isolée dans un chunk chargé à la demande ;
- textures procédurales : aucun asset binaire à télécharger.

Ordre de grandeur du build : ~104 Ko gzip pour l’application, ~281 Ko gzip pour le chunk 3D.

---

## Déploiement

Le projet est 100 % statique.

```bash
npm run build
```

Sur Vercel : importer le dépôt, laisser la détection automatique (Vite), le fichier `vercel.json` gère `/classique`. Aucun serveur ni variable d’environnement nécessaire.

---

## Note sur le dossier de conception

`design/DOSSIER-ETAPE-1.md` décrit l’intention initiale « COURANT CONTINU » (monde sombre en circuit imprimé, six actes). L’implémentation a évolué vers « Le monde de Marilin » (pièce-atelier lumineuse, dix chapitres). Le dossier reste la trace de l’intention ; ce README décrit l’état réel du projet.
