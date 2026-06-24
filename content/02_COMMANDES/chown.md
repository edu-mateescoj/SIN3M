---
type: commande
commande: chown
etymologie: "change owner"
niveau: debutant
tags:
  - type/commande
  - theme/linux
  - theme/droits
  - theme/fichiers
---

# chown

## Sens du nom

`chown` : **change owner**.

## Rôle

Cette commande modifie le propriétaire d’un fichier ou dossier.

## Syntaxe générale

```bash
chown [options] [arguments]
```

## Exemples du projet

```bash
sudo chown pi:pi fichier.txt
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
