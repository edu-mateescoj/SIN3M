# 03 — Sécurité et confidentialité

## Objectif

Garantir que le corpus privé/non publié reste local et qu'aucune fonctionnalité normale de JournalLab ne nécessite ni ne provoque sa transmission vers Internet.

## Frontières de données

### Corpus
- local ;
- lecture seule ;
- non versionné dans Git ;
- non inclus dans les remises ;
- non inclus dans les exports Moodle ;
- non copié dans les journaux applicatifs.

### Workspace élève
Peut contenir :
- identifiants de documents/entrées ;
- positions de caractères ;
- tags ;
- catégories ;
- commentaires rédigés par l'élève ;
- relations ;
- identifiants d'entités.

Ne doit pas contenir par défaut :
- copies persistantes des passages ;
- HTML généré incorporant le corpus ;
- captures d'écran du corpus ;
- index de recherche incluant le texte-source dans la remise.

### Remise scolaire
Contient uniquement les données produites par l'élève et les références nécessaires à leur réhydratation sur le poste enseignant possédant le corpus maître.

## Principe de sélection sans citation persistée

Pour un corpus statique, l'annotation stocke :

```json
{
  "documentId": "DOC01",
  "entryId": "E0017",
  "start": 126,
  "end": 294
}
```

L'interface peut afficher le passage au moment de l'annotation, mais l'export nettoyé ne conserve pas la chaîne sélectionnée.

Un hash de l'entrée/source peut être utilisé pour détecter un décalage de version sans révéler le texte.

## Réseau

À l'exécution :
- aucune URL distante ;
- aucune dépendance CDN ;
- aucune télémétrie ;
- aucun analytics ;
- aucun WebSocket distant ;
- aucune requête `fetch()` vers Internet ;
- aucune police distante ;
- aucun iframe externe.

Prévoir une Content Security Policy restrictive lorsque le mode d'exécution retenu le permet, notamment `connect-src 'none'`.

## Dépendances JavaScript

Si des bibliothèques sont utilisées :
- version figée ;
- copie locale dans `vendor/` ;
- licence documentée ;
- checksum possible ;
- aucune dépendance chargée dynamiquement depuis Internet.

## File System Access API

Le scénario privilégié consiste à laisser l'utilisateur choisir explicitement le dossier local autorisé. Les navigateurs Chromium peuvent fournir des handles de lecture/écriture, mais une politique d'entreprise Edge peut interdire ces permissions.

D'où le MVP 0 obligatoire sur un vrai compte élève.

### Mode principal
- sélection explicite d'un dossier ;
- lecture du corpus local ;
- écriture du workspace ;
- sauvegarde directe des JSON/JSONL.

### Mode de secours
Si l'écriture directe est bloquée :
- import explicite du projet ;
- édition en mémoire ;
- export par téléchargement d'un fichier/ZIP ;
- réouverture à la séance suivante.

## Dossier local

Éviter tout chemin synchronisé automatiquement (OneDrive, Google Drive, Dropbox, etc.).

Préférer un emplacement explicitement local fourni par l'école, par exemple :

```text
C:\JournalLab\
```

sous réserve des politiques réelles des PC scolaires.

## Permissions Windows

Architecture recommandée :

```text
C:\JournalLab\corpus\      lecture seule
C:\JournalLab\workspace\  lecture/écriture élève
C:\JournalLab\app\        lecture seule
```

Lorsque possible, renforcer cela par ACL Windows et pas seulement par l'interface.

## Fuites indirectes à éviter

- historique de copier-coller synchronisé Windows ;
- captures automatiques/outil cloud ;
- sauvegardes de navigateur ;
- répertoires temporaires exportés ;
- journaux de debug contenant `selection.toString()` ;
- génération d'un graphe/index incorporant les phrases du corpus ;
- export HTML autonome contenant le corpus ;
- copier-coller manuel du corpus dans les commentaires élève.

L'interface devra signaler clairement qu'un commentaire élève ne doit pas reproduire de longs passages du texte-source.

## Tests d'étanchéité

Avant déploiement :

1. débrancher le WAN ;
2. vider le cache navigateur ;
3. ouvrir l'application ;
4. annoter, sauvegarder, filtrer, utiliser le graphe ;
5. vérifier qu'aucune fonction ne dépend du réseau ;
6. inspecter l'onglet Network des DevTools ;
7. générer une remise ;
8. rechercher automatiquement dans la remise des chaînes issues d'un corpus fictif secret ;
9. refuser l'export si une citation source a été persistée par erreur.

## Règle de dépôt GitHub

Ce dépôt public ne doit contenir que :
- code ;
- documentation ;
- schémas ;
- données synthétiques inventées.

Jamais :
- corpus réel ;
- extrait réel ;
- nom réel sensible si la confidentialité l'interdit ;
- remise réelle d'élève.
