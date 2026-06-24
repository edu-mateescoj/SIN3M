---
type: commande
commande: scp
etymologie: "secure copy"
niveau: debutant
tags:
  - type/commande
  - theme/ssh
  - theme/fichiers
  - theme/transfert
---

# scp

## Sens du nom

`scp` : **secure copy**.

## Rôle

Cette commande copie des fichiers à travers SSH.

## Syntaxe générale

```bash
scp [options] [arguments]
```

## Exemples du projet

```bash
scp fichier.txt pi@192.168.1.10:/home/pi/
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
