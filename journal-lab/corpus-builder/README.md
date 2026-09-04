# JournalLab Corpus Builder

Outil enseignant local pour construire le corpus canonique utilisé par JournalLab à partir de sources privées.

## Branche

Ce développement vit sur la branche `corpus-builder`, dérivée de `journal-lab`.

Aucun merge vers `journal-lab`, `quartz` ou `main` n'est prévu sans décision explicite.

## Formats

### Sources textuelles
- PDF avec couche texte : extraction locale avec PDF.js.
- DOCX : extraction locale avec Mammoth.js.
- TXT / MD : lecture native du navigateur.

### Assets
- JPEG / PNG / WebP : prévisualisation et référencement.
- TIFF/TIF : catalogage comme asset, sans prévisualisation garantie.

Aucun OCR automatique.

## Confidentialité

- aucune API distante à l'exécution ;
- aucun CDN à l'exécution ;
- aucune télémétrie ;
- aucune source privée dans Git ;
- les dépendances PDF.js et Mammoth sont téléchargées une fois, puis servies localement ;
- PDF.js est appelé avec `enableScripting:false` ;
- les documents importés ne sont jamais injectés comme HTML de confiance ;
- le texte canonique est produit localement et exporté par téléchargement.

## Installation des dépendances locales

Depuis PowerShell, une fois connecté à Internet :

```powershell
cd journal-lab\corpus-builder
powershell -ExecutionPolicy Bypass -File .\setup-vendor.ps1
```

Le script installe localement :

- PDF.js 6.3.289 ;
- Mammoth 1.12.2.

Il écrit aussi `vendor/vendor-lock.json` avec les SHA-256 réellement obtenus.

Le dossier `vendor/` peut ensuite être copié avec l'application sur une machine totalement hors ligne.

## Lancement

Pour PDF.js, utiliser une origine locale HTTP, pas `file://`.

Par exemple avec VS Code Live Server, ou :

```powershell
python -m http.server 8000
```

puis ouvrir :

```text
http://127.0.0.1:8000/
```

Le serveur local ne publie rien sur Internet : il sert uniquement les fichiers du poste.

TXT/MD/images peuvent être importés même si PDF.js ou Mammoth ne sont pas installés.

## Workflow

1. Renseigner l'identité du corpus.
2. Ajouter une transcription PDF, DOCX, TXT ou MD.
3. Ajouter éventuellement des images.
4. Extraire localement.
5. Contrôler le texte extrait.
6. Lancer une proposition de segmentation par dates ou créer une entrée unique.
7. Corriger, scinder, fusionner et documenter les entrées.
8. Valider les avertissements.
9. Exporter `corpus.json`.
10. Exporter `build-report.json`.

## Règle structurante

Le PDF/DOCX est une **source de construction**.

Le fichier `corpus.json` est la **version canonique annotable**.

Une modification ultérieure du texte canonique implique une nouvelle version de corpus, car les annotations JournalLab utilisent des offsets de caractères.
