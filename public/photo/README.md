# Photo de portrait

Dépose ici le portrait de Marilin, par exemple `portrait.jpg`.

Puis renseigne le chemin dans `src/data/profile.json` :

```json
"photo": {
  "src": "/photo/portrait.jpg",
  "placeholder": "Photo à fournir",
  "note": "Portrait de Marilin BADJI."
}
```

Recommandations :

- format portrait, ratio 4/5 ou 3/4 ;
- largeur minimale 800 px ;
- JPEG/WebP compressé, idéalement moins de 300 Ko ;
- visage centré : l'image est affichée en `object-fit: cover` dans la 2D et plaquée sur le mur dans la scène 3D.

Tant que `src` est vide, un portrait graphique « MB » est généré automatiquement.
