---
type: commande
commande: ssh-copy-id
etymologie: "copy SSH identity"
niveau: debutant
tags:
  - type/commande
  - theme/ssh
  - theme/securite
  - theme/cles
---

# ssh-copy-id

## Sens du nom

`ssh-copy-id` : **copy SSH identity**.

## Rôle

Cette commande copie une clé publique vers une machine distante.

## Syntaxe générale

```bash
ssh-copy-id [options] [arguments]
```

## Exemples du projet

```bash
ssh-copy-id pi@192.168.1.10
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
