# 02 — Modèle d'annotation initial

## 1. Principe

Le corpus est immuable. Une annotation ne contient pas nécessairement la citation : elle pointe vers un segment du corpus par identifiants stables et positions de caractères.

Structure conceptuelle :

```text
Corpus > Journal > Cahier/volume > Entrée > Segment annoté
                                      |
                                      +--> métadonnées
                                      +--> catégories structurées
                                      +--> tags libres
                                      +--> entités
                                      +--> commentaire élève
                                      +--> relations
```

Ce choix reprend le principe de **stand-off annotation** utilisé dans les humanités numériques et compatible avec le modèle W3C Web Annotation.

## 2. Provenance minimale d'une annotation

Champs proposés :

- `annotationId` : identifiant unique de l'annotation ;
- `corpusId` : version du corpus ;
- `documentId` : journal/document ;
- `sourceUnitId` : cahier, volume ou autre unité documentaire ;
- `entryId` : entrée du journal ;
- `start` : offset de début dans l'entrée normalisée ;
- `end` : offset de fin exclusif ;
- `sourceHash` : hash optionnel de l'entrée pour détecter un changement de corpus ;
- `createdAt` / `updatedAt` ;
- `annotatorId` : identifiant pseudonyme/local de l'élève.

Le choix exact de `sourceUnitId` dépendra des informations réellement disponibles dans le corpus (numéro de cahier, folio, page, transcription, etc.).

## 3. Métadonnées documentaires

À distinguer de l'interprétation de l'élève :

- date de l'entrée (`entryDate`) ;
- précision de la date (`exact`, `approximate`, `range`, `unknown`) ;
- cahier/volume/source ;
- pagination/folio éventuels ;
- auteur du journal ;
- ordre documentaire si nécessaire.

Ces valeurs devraient idéalement être fournies par le corpus et non ressaisies librement à chaque annotation.

## 4. Dimensions structurées de l'analyse

Les dimensions ci-dessous constituent une première hypothèse. Elles doivent rester configurables dans un fichier de schéma afin de pouvoir évoluer sans réécrire l'application.

### 4.1 Contexte spatial

`spatialContext` (contrôlé, éventuellement multi-valeur) :

- `home` — maison/domicile ;
- `school` — école/études ;
- `work` — travail ;
- `public` — espace public ;
- `travel` — déplacement/voyage ;
- `other` ;
- `unknown`.

Les lieux nommés précis relèvent plutôt des **entités lieux** que de ce champ.

### 4.2 Sphère relationnelle/sociale

`socialSphere` (multi-valeur) :

- `family` ;
- `friends` ;
- `school` ;
- `work` ;
- `romantic` ;
- `public` ;
- `solitary` ;
- `other` ;
- `unknown`.

Cette dimension est séparée du lieu : une scène familiale peut se dérouler ailleurs qu'à la maison.

### 4.3 Tonalité / valence

Proposition initiale prudente :

`valence` :

- `positive` ;
- `negative` ;
- `neutral` ;
- `mixed` ;
- `uncertain`.

Éviter de confondre cette valence globale avec des émotions précises.

### 4.4 Intime / extime

`intimacy` :

- `intimate` ;
- `extimate` ;
- `mixed` ;
- `uncertain`.

Cette catégorie étant interprétative, prévoir éventuellement :

- un commentaire justificatif ;
- un `confidence` (`high`, `medium`, `low`) ;
- une définition explicite dans le guide d'annotation.

### 4.5 Affectivité / émotions

Ne pas figer trop tôt une ontologie exhaustive. Prévoir une dimension multi-valeur configurable :

`affects`: `["joy", "fear", "anger", ...]`

avec possibilité de :

- vocabulaire contrôlé enseignant ;
- ajout de termes libres ;
- distinction future entre émotion explicitement nommée et émotion inférée.

### 4.6 Certitude

Pour toute catégorisation fortement interprétative :

`confidence`: `high | medium | low | unknown`

ou, plus tard, une certitude par propriété plutôt qu'une seule certitude pour toute l'annotation.

## 5. Tags libres

`tags` est une liste extensible de chaînes.

Principes :

- autocomplétion sur les tags déjà utilisés ;
- création libre permise ;
- conservation du libellé original de l'élève ;
- possibilité future de normaliser/fusionner des tags sans effacer le terme original.

Exemple futur :

```json
{
  "raw": "isolement",
  "canonical": "solitude"
}
```

## 6. Entités

Les entités permettent de relier plusieurs formes linguistiques à une même réalité.

Types initiaux :

- `person` ;
- `place` ;
- `organization` ;
- `event` (à évaluer après inspection du corpus).

Exemple personne :

```json
{
  "id": "P0017",
  "type": "person",
  "label": "la mère",
  "aliases": ["maman", "ma mère"]
}
```

Le référentiel peut être préparé par l'enseignant et/ou enrichi par les élèves selon le protocole choisi.

## 7. Relations hypertextuelles

Une relation relie deux cibles qui peuvent être :

- annotations ;
- entrées complètes ;
- entités ;
- tags/concepts (ultérieurement).

Vocabulaire initial proposé :

- `same_person` ;
- `same_place` ;
- `same_theme` ;
- `echo` ;
- `continuation` ;
- `contrast` ;
- `contradiction` ;
- `reversal` ;
- `cause` ;
- `consequence` ;
- `comparison` ;
- `custom`.

Une relation possède éventuellement :

- une direction ;
- un commentaire ;
- un degré de certitude ;
- un libellé libre pour `custom`.

Un `reversal` devrait normalement pouvoir porter une dimension chronologique : le graphe ne doit pas perdre l'ordre temporel des entrées.

## 8. Annotations discontinues

CATMA permet des annotations couvrant plusieurs segments non contigus. Ce besoin peut apparaître lorsqu'un élève veut annoter ensemble deux portions séparées d'une même entrée.

Le modèle doit donc anticiper :

```json
"targets": [
  {"entryId":"E001", "start":10, "end":40},
  {"entryId":"E001", "start":93, "end":111}
]
```

Même si le MVP ne l'implémente pas immédiatement.

## 9. Annotation d'une entrée entière

Pour relier ou qualifier une entrée complète, ne pas inventer un faux segment de texte. Autoriser une cible de portée `entry` :

```json
{
  "scope": "entry",
  "entryId": "E0017"
}
```

et une cible `segment` pour les passages précis.

## 10. Séparer données et interprétation

Le modèle doit distinguer :

### données de source
- date ;
- cahier ;
- entrée ;
- position ;
- pagination ;

### annotation structurée
- valence ;
- contexte spatial ;
- sphère sociale ;
- intimité ;
- affects ;

### interprétation ouverte
- tags ;
- commentaire ;
- relations ;

Cette distinction permettra ensuite d'analyser les productions sans traiter toutes les informations comme des tags équivalents.

## 11. Question méthodologique à traiter avant stabilisation

Avant de figer la liste des valeurs :

1. examiner la structure réelle du corpus ;
2. choisir quelques entrées communes ;
3. faire annoter indépendamment le même échantillon ;
4. comparer les désaccords ;
5. produire un guide d'annotation avec exemples limites ;
6. seulement ensuite stabiliser les champs obligatoires.

Cette phase est essentielle pour `valence`, `intimacy`, affects et certaines relations interprétatives.
