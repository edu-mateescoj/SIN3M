# 04 — Roadmap

## État au 3 septembre 2026

- **MVP0 validé sur un poste enseignant** avec Microsoft Edge lancé en `file://`.
- `showDirectoryPicker()` disponible.
- sélection de dossier fonctionnelle ;
- création/écrasement d'un fichier local fonctionnelle ;
- relecture du fichier fonctionnelle ;
- essais concluants dans un dossier situé sur `C:` et dans un dossier situé sur `J:`.
- **Reste à confirmer avec une identité élève** que les politiques et ACL du poste ne restreignent pas ces opérations.

Décision provisoire : poursuivre l'architecture **HTML/CSS/JS sans serveur local ni installation**.

## Phase A — préparation scientifique et pédagogique

### A1. Inspecter la structure réelle du corpus
À confirmer avant stabilisation :
- granularité des entrées ;
- dates exactes ou approximatives ;
- numéros de cahier/volume ;
- pagination/folio ;
- éventuels identifiants déjà existants ;
- format des transcriptions ;
- présence de corrections, ratures, notes marginales ou lacunes.

### A2. Construire le guide d'annotation v0.1
- définitions de `valence`, `intimacy`, `spatialContext`, `socialSphere` ;
- premiers affects ;
- règles pour les personnes/lieux ;
- règles pour les relations ;
- exemples et contre-exemples sur données fictives.

### A3. Calibration inter-annotateurs
- même petit jeu d'entrées pour plusieurs élèves ;
- comparaison des annotations ;
- discussion des divergences ;
- révision du guide et du schéma.

## Phase B — architecture de données

### B1. Manifestes
Définir :
- `corpus-manifest.json` ;
- `entries.jsonl` ou arborescence équivalente ;
- référentiels d'entités ;
- version du corpus et hashes.

### B2. Workspace
Définir :
- `annotations.jsonl` ;
- `relations.jsonl` ;
- `entities.jsonl` si enrichissement élève ;
- `tags.json` ;
- `project.json`.

### B3. Export
Définir une whitelist stricte des champs autorisés dans une remise.

## Phase C — MVP technique

### C0. Test poste scolaire — **validé enseignant / à confirmer élève**
Un HTML minimal teste :
1. disponibilité de `showDirectoryPicker` ;
2. sélection d'un dossier ;
3. lecture d'un fichier fictif ;
4. création/modification d'un fichier dans le workspace ;
5. persistance de la permission selon Edge ;
6. comportement sans Internet.

Choix actuel :
- **C0-A** accès direct au filesystem retenu provisoirement ;
- **C0-B** import/export par téléchargement conservé comme fallback si une politique élève bloque l'écriture.

### C1. Lecteur — **en cours**
- chargement d'un corpus JSON local fictif ;
- liste des journaux/cahiers/entrées ;
- affichage texte ;
- navigation chronologique ;
- recherche locale (itération suivante).

### C2. Sélection et annotation — **en cours**
- sélection DOM ;
- conversion robuste en offsets dans le texte normalisé ;
- aperçu du passage uniquement à l'écran ;
- formulaire configurable ;
- sauvegarde stand-off sans recopier le passage ;
- restauration du surlignage (itération suivante).

### C3. Hypertexte
- tags ;
- entités ;
- relations ;
- annotation d'entrée entière ;
- annotations éventuellement discontinues.

## Phase D — exploration

- filtres combinés ;
- chronologie ;
- concordance tags/personnes ;
- graphe ;
- statistiques descriptives ;
- export Markdown lisible.

Toute analyse automatique doit rester locale.

## Phase E — enseignant et Moodle

### E1. Import des remises
- validation contre le schéma ;
- vérification de la version du corpus ;
- détection d'erreurs de provenance ;
- réhydratation locale des passages.

### E2. Compilation Moodle
Produire un site statique en lecture seule qui peut montrer :
- productions et commentaires des élèves ;
- tags ;
- graphes ;
- chronologie ;
- références documentaires ;

mais **pas le texte privé** sauf décision institutionnelle explicite contraire.

## Phase F — interopérabilité

Après stabilisation seulement :
- export W3C Web Annotation JSON-LD ;
- mapping TEI ;
- documentation du schéma ;
- import/export éventuel avec des outils DH.

## Décisions reportées volontairement

- taxonomie complète des affects ;
- définition définitive intime/extime ;
- granularité des lieux ;
- autorité des protagonistes (enseignant seul ou enrichissement élève) ;
- vocabulaire final des relations ;
- bibliothèque de graphe ;
- `.md` comme format primaire ou seulement comme export humain ;
- packaging final pour les PC scolaires.
