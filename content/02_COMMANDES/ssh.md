---
type: commande
commande: ssh
etymologie: "secure shell"
niveau: debutant
tags:
  - type/commande
  - theme/ssh
  - theme/reseau
  - theme/securite
---

# ssh

## Sens du nom

`ssh` : **secure shell**.

## Rôle

Cette commande ouvre une session distante sécurisée.

## Syntaxe générale

```bash
ssh [options] [arguments]
```

## Exemples du projet

```bash
ssh pi@192.168.1.10
ssh -T git@github.com
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
