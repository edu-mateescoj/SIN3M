# JournalLab

**Sous-projet expérimental — branche `journal-lab` uniquement.**

JournalLab est une application locale d'annotation et d'hypertextualisation de journaux privés/non publiés destinée à un usage scolaire. Le corpus reste strictement **offline**, en **lecture seule**, et ne doit jamais être commité, synchronisé, envoyé à Moodle, à un cloud ou à un service d'IA.

L'élève travaille sur une couche séparée d'annotations : sélection de passages, métadonnées, tags, entités, commentaires et relations. L'application restitue visuellement le passage sélectionné depuis le corpus local, mais l'export de remise ne doit pas reproduire le texte-source.

## Architecture

```text
CORPUS PRIVE LOCAL (lecture seule)
        |
        | identifiants stables + positions de caractères
        v
APPLICATION LOCALE HTML/CSS/JS
        |
        +--> annotations structurées
        +--> tags extensibles
        +--> personnes / lieux / événements
        +--> relations typées
        +--> commentaires élèves
        |
        v
WORKSPACE ELEVE LOCAL (écriture)
        |
        v
EXPORT DE REMISE SANS CORPUS
```

Le modèle suit le principe de **stand-off annotation** : le texte-source n'est pas modifié ; les annotations pointent vers lui. Pour les textes statiques à diffusion restreinte, le W3C recommande notamment `TextPositionSelector`, qui stocke les positions de début/fin sans recopier la citation.

## Principes non négociables

1. **Zéro corpus dans Git/GitHub.** Aucun texte réel ni extrait de journal dans ce dépôt, y compris dans les exemples et tests.
2. **Zéro dépendance réseau à l'exécution.** Pas de CDN, API distante, analytics, télémétrie ou police distante.
3. **Corpus immuable.** Lecture seule au niveau applicatif et, si possible, au niveau des permissions Windows.
4. **Données élève séparées.** Le workspace contient uniquement ce que l'élève produit et les références au corpus.
5. **Remise nettoyée.** L'export destiné à l'application scolaire/Moodle ne contient pas les passages du corpus.
6. **Formats ouverts.** JSON/JSONL et Markdown pour les données ; HTML/CSS/JS pour l'interface.
7. **Taxonomie hybride.** Champs structurés comparables + tags et relations extensibles.
8. **Traçabilité.** Provenance, cible, auteur de l'annotation, date et éventuellement degré de certitude sont conservés.
9. **Interopérabilité future.** Modèle compatible conceptuellement avec W3C Web Annotation et exportable ultérieurement vers TEI/XML.

## Arborescence

```text
journal-lab/
├── README.md
├── docs/
│   ├── 01-cahier-des-charges.md
│   ├── 02-modele-annotation.md
│   ├── 03-securite-confidentialite.md
│   └── 04-roadmap.md
├── schema/
│   └── annotation.schema.json
├── examples/
│   └── annotation-fictive.json
└── app/
    └── (prototype après validation du modèle)
```

## Références de conception

- W3C Web Annotation Data Model : https://www.w3.org/TR/annotation-model/
- CATMA — annotation littéraire, tagsets et stand-off markup : https://catma.de/how-to/tutorials/manual-annotation/
- CATMA — annotations JSON-LD et `TextPositionSelector` : https://catma.de/documentation/access-your-project-data/git-access/
- TEI P5 — personnes, lieux, événements, relations et responsabilité : https://www.tei-c.org/release/doc/tei-p5-doc/en/html/
- William Godwin's Diary — exemple de journal encodé en TEI : https://godwindiary-test.warwick.ac.uk/tech.html

## Étapes

1. fixer le modèle de données et les vocabulaires ;
2. définir la frontière corpus/workspace/remise ;
3. tester l'accès fichier/dossier sur un vrai compte élève Edge ;
4. coder le lecteur local et la sélection de passages ;
5. coder le formulaire d'annotation ;
6. ajouter filtres, chronologie, entités, relations et graphe ;
7. construire l'export de remise sans corpus ;
8. construire le visualiseur/compilateur enseignant pour Moodle.
