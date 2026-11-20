# Aléa — StorMe

Application web mobile (PWA) pour saisir sur le terrain des relevés de dangers naturels
(chute de pierre, effondrement, glissement spontané, avalanche, crue) et produire le
formulaire **StorMe** de l'État de Fribourg en PDF, encore modifiable.

*Mobile Web-App (PWA) zur Erfassung von Naturgefahren-Ereignissen im Feld und zum Export
des StorMe-Formulars des Staates Freiburg als bearbeitbares PDF.*

## Fonctionnalités / Funktionen

- Assistant en 8 étapes / Assistent in 8 Schritten
- Position sur la carte nationale swisstopo, coordonnées MN95 (LV95), GPS, commune automatique
- Photos (appareil ou galerie), 12 maximum, enregistrées sur l'appareil (IndexedDB)
- Export PDF : formulaire officiel prérempli + carte topo et photos en annexe
- Interface **français / Deutsch** (sélecteur FR · DE, mémorisé ; langue du navigateur par défaut)
- Installable sur l'écran d'accueil, utilisable hors ligne (hors fond de carte)

> Le formulaire PDF officiel (`public/formulaire-storme.pdf`) est en français : les champs
> sont remplis avec le texte saisi, quelle que soit la langue de l'interface. Les annexes
> du PDF (carte, photos) suivent la langue choisie.

## Développement

```bash
npm install
npm run dev        # http://localhost:8080
npm run build
npm run typecheck
```

Les textes sont dans `src/lib/i18n.ts` (dictionnaires `fr` et `de`).
