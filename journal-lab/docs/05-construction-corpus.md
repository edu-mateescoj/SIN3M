# 05 — Construction du corpus local

## 1. Principe général

JournalLab ne doit pas considérer le PDF, le DOCX ou les images comme la représentation canonique directement annotée par les élèves.

Le workflow retenu est :

```text
SOURCE PRIVÉE
PDF de transcription / DOCX / images
        │
        ▼
Corpus Builder — local enseignant
        │
        ├── extraction
        ├── contrôle humain
        ├── segmentation en entrées
        ├── métadonnées documentaires
        └── normalisation figée
        │
        ▼
CORPUS CANONIQUE VERSIONNÉ
corpus.json + assets locaux optionnels
        │
        ▼
JournalLab élève
        │
        └── annotations stand-off par offsets
```

Le corpus canonique est figé avant annotation. Une ré-extraction ultérieure d'un PDF ou d'un DOCX peut produire des espaces, sauts de ligne ou ordres de lecture différents ; les offsets existants deviendraient alors faux.

Toute modification du texte canonique doit donc produire une nouvelle version du corpus.

## 2. Formats source

### 2.1 PDF de transcription — cible principale

Cas attendu : PDF contenant une vraie couche texte, et non uniquement des images de pages.

Traitement envisagé :
- lecture locale du fichier comme `ArrayBuffer` ;
- PDF.js embarqué localement dans JournalLab ;
- extraction page par page avec `getTextContent()` ;
- conservation du numéro de page d'origine ;
- reconstruction d'un texte de travail ;
- contrôle manuel avant validation ;
- segmentation en entrées de journal.

Le Corpus Builder ne doit pas utiliser un CDN.

Sécurité PDF :
- version de PDF.js explicitement verrouillée ;
- dépendance mise à jour lors des correctifs de sécurité ;
- `enableScripting: false` ;
- CSP restrictive ;
- aucune action PDF ou JavaScript embarqué exécutée ;
- pour l'extraction textuelle seule, éviter le viewer générique si inutile.

### 2.2 Word

Format visé : `.docx`.

Le vieux format binaire `.doc` ne sera pas une cible de parsing navigateur dans le premier temps. Il devra être converti hors ligne en `.docx` ou PDF avec Word ou LibreOffice.

Pour `.docx`, solution envisagée :
- Mammoth.js embarqué localement ;
- lecture du `File` sous forme d'`ArrayBuffer` ;
- extraction en texte/paragraphes ;
- ne jamais injecter directement dans le DOM du HTML produit depuis le document ;
- si les styles Word deviennent utiles pour repérer les dates/titres, convertir dans un DOM détaché puis ne conserver que la structure explicitement autorisée.

Pour un premier import, `extractRawText()` est le chemin le plus simple et le plus sûr, mais il perd une partie de l'information structurelle des styles.

### 2.3 Images

Les images sont des **assets documentaires**, pas du texte canonique.

Premiers formats prévus :
- JPEG ;
- PNG ;
- WebP.

Formats archivistiques éventuellement acceptés mais non forcément prévisualisables nativement :
- TIFF/TIF.

Aucun OCR n'est requis pour le corpus actuel puisque la transcription existe déjà.

Une phase ultérieure pourra ajouter :
- affichage de fac-similés ;
- association d'une image à une entrée ou une page ;
- annotation de régions d'image ;
- OCR local optionnel, séparé du texte canonique.

## 3. Canonicalisation du texte

Le Corpus Builder doit produire un texte stable.

Règles initiales :
- Unicode conservé en UTF-8 ;
- fins de ligne normalisées en `\n` ;
- espaces insécables normalisés seulement si nécessaire ;
- aucune correction orthographique automatique ;
- aucune réécriture stylistique ;
- pas de suppression silencieuse de caractères ;
- toute transformation documentée ;
- texte final validé visuellement par l'enseignant.

Le texte canonique d'une entrée reçoit un hash SHA-256. Le corpus complet reçoit aussi une version et un hash logique.

## 4. Segmentation

Le PDF de transcription peut ne pas exposer explicitement les limites d'entrées.

Le Corpus Builder devra proposer plusieurs gestes :
1. vue page par page ;
2. tentative de détection automatique de dates ou titres ;
3. création manuelle d'une frontière d'entrée ;
4. fusion de blocs ;
5. scission de blocs ;
6. correction du texte extrait ;
7. validation de l'entrée.

La détection automatique ne doit être qu'une aide. La structure finale est décidée par l'enseignant.

## 5. Métadonnées d'une entrée

Champs prévus :

- `entryId` : identifiant stable ;
- `date` : ISO lorsque connue ;
- `datePrecision` : `exact`, `approximate`, `range`, `unknown` ;
- `sourceLabel` : libellé lisible ;
- `sourceUnitId` : cahier/volume ;
- `pageRefs` : pages PDF ou pages de transcription ;
- `text` : texte canonique ;
- `textHash` : SHA-256 du texte canonique ;
- `assetRefs` : liens optionnels vers PDF/images.

Le numéro de page appartient à la provenance ; il ne doit pas être déduit plus tard depuis l'offset.

## 6. Assets

Un asset décrit le fichier source, sans l'intégrer nécessairement dans `corpus.json`.

Exemple :

```json
{
  "assetId": "TRANSCRIPTION-PDF-01",
  "kind": "transcription",
  "mediaType": "application/pdf",
  "fileName": "transcription.pdf",
  "sha256": "…"
}
```

Pour une image :

```json
{
  "assetId": "FACSIMILE-0042",
  "kind": "facsimile",
  "mediaType": "image/jpeg",
  "fileName": "images/page-0042.jpg",
  "sha256": "…"
}
```

Les assets privés restent dans le dossier local du corpus et ne sont jamais placés dans une remise élève.

## 7. Arborescence cible

```text
corpus-local/
├── corpus.json
├── assets/
│   ├── transcription.pdf
│   └── images/
│       ├── page-0001.jpg
│       └── ...
└── provenance/
    └── build-report.json
```

Dans un scénario où il est préférable de ne pas distribuer le PDF de transcription lui-même aux élèves, seul `corpus.json` et les assets explicitement autorisés seront copiés sur les postes élèves.

## 8. Compatibilité navigateur

La sélection de fichiers doit reposer d'abord sur `<input type="file">`, beaucoup plus universel que `showOpenFilePicker()`.

Pour sélectionner un dossier d'assets, `webkitdirectory` peut être utilisé en amélioration progressive sur les navigateurs récents.

Le Corpus Builder doit rester utilisable hors ligne.

## 9. Confidentialité

Le Corpus Builder manipule les sources les plus sensibles du projet.

Règles :
- aucun réseau nécessaire ;
- aucune dépendance distante ;
- aucun CDN ;
- aucune télémétrie ;
- aucun LLM ;
- aucun document source dans Git ;
- aucun texte privé dans les journaux de debug ;
- les aperçus d'images utilisent des Object URLs temporaires ;
- les exports enseignant restent sur le système local ;
- le rapport de build stocke des hashes et métadonnées techniques, pas des extraits superflus.

## 10. MVP Corpus Builder

### CB0 — import
- choisir PDF, DOCX, TXT/MD ou images ;
- détecter type, taille et hash ;
- prévisualiser les images ;
- identifier les fichiers non pris en charge.

### CB1 — extraction
- PDF texte avec PDF.js local ;
- DOCX avec Mammoth local ;
- TXT/MD natifs ;
- images comme assets.

### CB2 — segmentation
- vue page/bloc ;
- détecteur configurable de dates ;
- couper/fusionner ;
- éditer le texte canonique ;
- métadonnées.

### CB3 — validation
- liste des entrées ;
- contrôle des IDs ;
- contrôle des pages ;
- hashes ;
- avertissements ;
- verrouillage d'une version.

### CB4 — export
- `corpus.json` ;
- `build-report.json` ;
- dossier `assets/` facultatif ;
- test automatique vérifiant que le corpus produit est accepté par JournalLab MVP2.

## 11. Décision importante

Le **PDF/Word est une source de construction**.

Le **JSON est le corpus canonique annotable**.

Les **images/PDF sont des assets de provenance ou de consultation**.

Cette séparation permet de changer ultérieurement de lecteur, de navigateur ou d'interface sans rendre les annotations dépendantes d'un moteur particulier d'extraction PDF/DOCX.
