---
type: commande
commande: chmod
etymologie: "change mode"
niveau: debutant
tags:
  - type/commande
  - theme/linux
  - theme/droits
  - theme/fichiers
---

# chmod

## Sens du nom

`chmod` : **change mode**.

## Rôle

Cette commande modifie les permissions d’un fichier ou dossier.

## Syntaxe générale

```bash
chmod [options] [arguments]
```

## Exemples du projet

```bash
chmod u+x script.sh
chmod 700 ~/.ssh
```

## À retenir

- Lire attentivement la commande avant d'appuyer sur Entrée.
- Une option commence souvent par `-` ou `--`.
- Les commandes qui modifient le système demandent souvent [[sudo]].

## Erreurs fréquentes

- faute de frappe ;
- mauvais dossier courant ;
- droits insuffisants ;
- connexion réseau absente, si la commande dépend d'Internet.

## Voir aussi

- [[03_MEMENTOS/Mémento - commandes par ordre alphabétique]]
- [[03_MEMENTOS/Mémento - commandes par thème]]
