# 01 — Cahier des charges initial

## Finalité

JournalLab doit permettre à des élèves d'explorer et d'annoter un corpus de journaux privés/non publiés sans que le contenu du corpus ne quitte jamais le poste de travail ou l'environnement local autorisé.

L'objectif n'est pas de publier le corpus, mais de produire une **couche d'analyse hypertextuelle** : annotations de passages, catégories, tags, entités, relations et commentaires.

## Utilisateurs

### Élève
- ouvre un projet local ;
- consulte un journal en lecture seule ;
- sélectionne un passage ;
- complète des champs structurés ;
- ajoute des tags libres ;
- associe des personnes, lieux ou événements ;
- crée des relations entre annotations/entrées/entités ;
- explore son travail par filtres, chronologie et graphe ;
- sauvegarde localement ;
- génère une remise sans corpus.

### Enseignant
- prépare le corpus et son manifeste ;
- définit/ajuste le schéma d'annotation ;
- distribue l'application et le corpus hors ligne ;
- importe les remises ;
- réassocie les références au corpus maître local ;
- produit éventuellement un rendu HTML statique pour Moodle, sans reproduire le corpus privé.

## Contraintes fortes

### Confidentialité
- corpus interdit dans GitHub, Moodle, cloud, LLM et services externes ;
- aucun appel réseau pendant l'utilisation ;
- aucune ressource chargée depuis un CDN ;
- aucune télémétrie ;
- aucune citation du corpus dans l'export de remise par défaut.

### Déploiement scolaire
- PC Windows gérés par l'école ;
- droits d'écriture limités mais présence d'un espace local autorisé ;
- pas de droits administrateur requis ;
- navigateur Edge/Chrome récent privilégié ;
- mode de secours prévu si la File System Access API est bloquée par la politique d'entreprise.

### Pérennité
- formats documentés et lisibles sans l'application ;
- modèle de données versionné ;
- aucune base propriétaire obligatoire ;
- possibilité d'export ultérieur W3C Web Annotation / TEI.

## Geste élève cible

1. l'élève sélectionne un passage dans le texte affiché ;
2. il clique sur **Annoter** ;
3. le passage est montré dans le panneau d'annotation mais la donnée persistée repose d'abord sur sa cible (document/entrée/positions) ;
4. il complète les champs structurés ;
5. il ajoute les tags et relations souhaités ;
6. l'annotation apparaît dans les filtres, la chronologie et le graphe.

Le copier-coller manuel peut rester possible pour le confort de lecture, mais ne doit pas devenir le mécanisme de provenance.

## Fonctions MVP

### MVP 0 — compatibilité poste scolaire
- choisir un dossier local ;
- lire un fichier test ;
- créer/modifier un fichier test ;
- vérifier le fonctionnement offline ;
- vérifier les politiques Edge.

### MVP 1 — annotation
- charger un manifeste de corpus fictif ;
- afficher une entrée ;
- sélectionner un segment ;
- créer une annotation structurée ;
- sauvegarder en JSONL ;
- rouvrir le projet et restituer l'annotation.

### MVP 2 — hypertexte
- tags libres avec autocomplétion ;
- entités personnes/lieux ;
- relations typées ;
- filtres ;
- chronologie ;
- graphe ;
- export de remise sans corpus.

## Hors périmètre initial

- OCR ;
- reconnaissance automatique d'entités ;
- LLM / analyse générative ;
- publication Internet ;
- collaboration temps réel ;
- authentification distante ;
- base SQL serveur.
