# COURANT CONTINU — Dossier de conception (étape 1)

> **Note d’état — octobre 2026.** Ce document décrit l’intention initiale « COURANT CONTINU » : un monde sombre en circuit imprimé, six actes. L’implémentation a évolué vers « Le monde de Marilin » : une pièce-atelier lumineuse, dix chapitres. Le présent dossier reste la trace de l’intention de départ ; l’état réel, l’architecture et les commandes sont documentés dans `README.md`.

Portfolio 3D immersif de **Marilin BADJI** — ingénieur en devenir, informatique & systèmes électriques.
Document de travail, aucune ligne de code n'est écrite avant validation.

---

## 1. Direction artistique

### Concept : « COURANT CONTINU »
Un même signal traverse deux mondes : l'électricité et le logiciel. Le visiteur suit un courant qui part d'un poste électrique (les origines, Bohicon, l'électrotechnique) et se transforme progressivement en flux de données à travers une architecture logicielle. Le décor n'est donc pas un « espace futuriste » générique : c'est **une carte de circuit imprimé à l'échelle d'un paysage**, dont les pistes deviennent des routes, les composants des lieux, et les ports des rubriques.

Double lecture assumée :
- **matériel** : cuivre, bakélite, soudures, transformateurs, céramique ;
- **logiciel** : nœuds, paquets, API, flux lumineux froids.

Titre d'ouverture possible : *« De l'électrotechnique au logiciel — un même courant. »* (formulation de conception, à valider, pas un fait biographique supplémentaire).

### Palette
| Rôle | Valeur | Usage |
|---|---|---|
| Fond obsidienne | `#05070B` → `#0B1016` | substrat, vide, profondeur |
| Cuivre | `#C97B4A` / `#E8A87C` | traces, matériel, chaleur, passé |
| Signal | `#4ED8C0` / `#63E6BE` | données, logiciel, présent, interactions |
| Ivoire | `#EDEAE3` | texte principal |
| Acier | `#7C8794` | métadonnées, labels mono |

Répartition ~70 % sombre / 20 % cuivre / 10 % signal. Interdits volontaires : violet-néon, dégradés arc-en-ciel, verre « glassmorphism » générique.

### Typographie
- **Titres** : Space Grotesk (600/500), cadrage serré, interlettrage négatif — technique mais élégant.
- **Texte** : Inter (400/500), 16–18 px, colonnes courtes.
- **Labels / HUD / données** : JetBrains Mono (400), petites capitales, chiffres tabulaires.
- Accent éditorial possible : italique serif (Instrument Serif) sur une seule phrase de transition par chapitre — à valider.

### Matériaux 3D
Substrat FR-4 matte presque noir · cuivre anisotrope légèrement patiné · verre dépoli (panneaux 2D) · aluminium brossé (outils, châssis) · résine émissive (points de connexion) · poussière en suspension.

### Lumière
Éclairage *low-key* : une source chaude basse (≈ 2700 K) qui rase les surfaces, un contre-jour froid (≈ 6000 K) qui détache les silhouettes, halo volumétrique très léger, bloom à seuil haut, grain 3 %, aberration chromatique imperceptible. Pas d'ombres dynamiques sur mobile : occlusion pré-calculée.

### Animation
Mouvements lents, mécaniques, jamais élastiques : easings `power2/3`, durées 600–1200 ms, micro-inertie. Le signal lumineux est le seul élément réellement rapide — il donne le rythme. Aucun rebond « cartoon ».

### Ambiance sonore (optionnelle, désactivée par défaut)
Bourdonnement 50 Hz filtré, clics de relais, ticks d'interface, souffle de ventilation ; volume bas, fondu par chapitre, bouton visible, respect de `prefers-reduced-motion` et de la politique d'autoplay.

---

## 2. Parcours utilisateur

| Acte | Scène | Rôle narratif | Sortie |
|---|---|---|---|
| 0 | **Le Seuil** | Écran noir, une impulsion. Le nom s'écrit comme un tracé d'oscilloscope. Le chargement est présenté comme un test de mise sous tension (les ressources se chargent réellement). | « Mettre sous tension » |
| 1 | **La Source** | Le poste électrique d'origine : pylônes, transformateur, ligne qui s'éclaire. Chronologie 2016 → INSTI en jalons lumineux. | Voyage le long de la ligne |
| 2 | **L'Atelier** | Établi / banc de test : oscilloscope, terminal, baie réseau, table AutoCAD. Chaque outil = un groupe de compétences. | Le courant quitte l'atelier |
| 3 | **Les Modules** | Deux modules posés sur la carte : HOPITEL (santé) et QR Flow (lecture). On entre dans le module pour voir le détail du projet. | Retour à la carte |
| 4 | **Le Terrain** | Baie de brassage : un câble par expérience, à brancher. Passé professionnel et engagement associatif. | Le signal remonte |
| 5 | **Le Signal** | L'antenne / l'émetteur : contact, GitHub, ambitions. Le signal quitte le cadre. | Fin ouverte |

Le parcours est linéaire par défaut (scroll), mais **non bloquant** : chaque chapitre est accessible directement depuis le plan.

---

## 3. Univers 3D et navigation

- **L'environnement EST le menu** : une seule scène continue, six zones. Aucun menu flottant classique ; un index discret en mono (00–05) + un plan schématique (vue du dessus du circuit) appelable à tout moment.
- **Objets = données** : chaque objet 3D porte un `id` qui pointe vers une entrée de `profile.json`. Règle stricte : **aucun objet purement décoratif**. Tout élément a une fonction de navigation ou de narration, un label au survol et une entrée de contenu.
- **Caméra** : spline Catmull-Rom suivant les pistes de cuivre, regard amorti, FOV constant, *dolly* léger par chapitre. Pas de vol libre (risque de désorientation) ; rotation limitée (± 8°) dans un nœud pour la parallaxe.
- **Interactions** : molette/tactile = progression ; survol = trace qui s'allume + label ; clic = focalisation / entrée dans un module ; clavier = `←/→`, `1–6`, `Échap`, `Tab` ; clic sur le plan = téléportation.
- **Transitions** : la caméra plonge dans une piste de cuivre ; la lumière du signal remplit l'écran ; le chapitre suivant s'ouvre. 700–1100 ms. En mode réduit : fondu enchaîné statique.
- **Profondeur et particules** : poussière de soudure, paquets lumineux circulant dans les pistes (instanciés), brume légère par plan. Densité divisée par 3 sur mobile.
- **2D intégré** : le texte reste du texte. Titres, panneaux de projet et formulaire sont des couches DOM ancrées aux objets (lisibles, sélectionnables, accessibles aux lecteurs d'écran), posées sur des plaques de verre dépoli 3D. Aucun texte 3D volumétrique (coût, flou, accessibilité).

---

## 4. Architecture technique

**Stack** : Vite · React + TypeScript · React Three Fiber · drei · `@react-three/postprocessing` · three-stdlib · zustand (état d'expérience) · framer-motion (couches 2D) · zod (validation du contenu) · `maath`/`three` pour les easings. Aucun serveur : déploiement statique Vercel.

```
src/
  main.tsx, App.tsx
  data/
    profile.json          ← tout le contenu, source unique de vérité
    schema.ts             ← validation zod du JSON
    selectors.ts          ← accès typés (chapitres, projets, timeline…)
  experience/
    Scene.tsx             ← <Canvas>, qualité, chargement
    CameraRig.tsx         ← spline, focus, transitions
    ChapterManager.tsx    ← chapitre actif, prefetch du suivant
    Effects.tsx           ← bloom / grain / vignette (selon palier)
    Quality.tsx           ← détection appareil + PerformanceMonitor
  scenes/
    Threshold.tsx  Source.tsx  Workshop.tsx
    Modules.tsx    Field.tsx   Signal.tsx
  components/
    three/  Trace.tsx  Portal.tsx  Milestone.tsx  ToolRig.tsx  ProjectModule.tsx  Particles.tsx
    ui/     Hud.tsx  ChapterIndex.tsx  Panel.tsx  SchematicMap.tsx  Loader.tsx  AudioToggle.tsx  ClassicFallback.tsx
  hooks/    useDeviceTier  useReducedMotion  useChapter  useKeyboardNav  useProgressiveLoad
  store/    useExperience.ts
  styles/   tokens.css  global.css
public/
  models/ (glb draco)  textures/ (ktx2, webp)  audio/ (ogg)
```

Principes : scènes isolées et remplaçables, aucun contenu en dur dans le JSX, un seul store pour chapitre/qualité/audio/focus, composants 3D sans logique métier.

---

## 5. Performance, mobilité, accessibilité

- **Paliers** `high / medium / low` : détectés (mémoire, cœurs, GPU, largeur d'écran) puis corrigés en direct par un `PerformanceMonitor` (DPR 0,8 → 2).
- **Budgets** : JS initial < 200 Ko gzip hors three ; bundle 3D différé ; modèles < 3 Mo au total ; textures KTX2 ; 60 fps desktop / 30 fps mobile visés.
- **Chargement progressif** : le Seuil n'attend que son propre contenu ; le chapitre suivant est préchargé pendant la lecture du chapitre courant ; *suspense* par scène.
- **Optimisations** : géométries procédurales réutilisées, `InstancedMesh` pour particules et jalons, aucun shadow map sur `low`, éclairage semi-cuit, post-processing coupé en `low`, pas de `useFrame` inutile, `frameloop="demand"` hors interactions.
- **Version 2D** : route `/classique` (même contenu, HTML/CSS, lecteur d'écran prioritaire, SEO) ; bascule automatique si WebGL absent, appareil très faible, `prefers-reduced-data`, ou choix explicite de l'utilisateur. Parité de contenu garantie.
- **Accessibilité** : navigation clavier complète et focus visible, `aria-live` sur le changement de chapitre, bouton « passer l'introduction », `prefers-reduced-motion` = pas de travelling (fondu + images fixes), son off par défaut, contraste HUD ≥ 4,5:1, aucune information uniquement portée par la 3D.

---

## 6. Structure de données

`src/data/profile.json` : identité, présentation, `timeline[]`, `experiences[]`, `skills{dev[], systems[]}`, `projects[]` (avec `slug`, `stack[]`, `role`, `demo`, `repo`), `certifications[]`, `engagement[]`, `languages[]`, `ambitions[]`, `contact{}`, plus un bloc `ui` (labels, ordre des chapitres). Chaque objet 3D référence un `id` de ce fichier. Les champs manquants portent la valeur `"À COMPLÉTER"` et sont signalés visuellement comme tels en développement.

Champs à compléter : intitulé et année exacts de la licence · dates et missions du stage CAP EPAC · missions précises des autres stages · lien de démo HOPITEL · autres dépôts GitHub à mettre en avant · niveaux de langue · e-mail · téléphone · LinkedIn · destination du formulaire de contact · crédits photos/documents éventuels.

---

## 7. Plan de réalisation

| Étape | Livrable | Priorité |
|---|---|---|
| 0 · Socle | Projet Vite/TS/R3F, `profile.json` + schéma zod, tokens de design, HUD, paliers de qualité, route 2D vide | Bloquant |
| 1 · Seuil & caméra | Intro, rig caméra, pipeline scroll/clavier, transitions | Haute |
| 2 · La Source | Chronologie 3D, jalons, contenu académique | Haute |
| 3 · Atelier & Modules | Compétences, HOPITEL, QR Flow avec panneaux 2D | Haute |
| 4 · Terrain & Signal | Expériences, engagement, contact (mailto en attendant un endpoint) | Moyenne |
| 5 · Finition | Son, particules, post-processing, micro-interactions | Moyenne |
| 6 · Livraison | Passe performance 3 appareils, audit a11y, 2D complète, déploiement Vercel, guide de mise à jour du contenu | Haute |

Chaque étape est livrée jouable en local, avec un commit dédié et une note de ce qui reste ouvert.
