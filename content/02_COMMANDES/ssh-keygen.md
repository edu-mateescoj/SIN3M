---
type: commande
commande: ssh-keygen
etymologie: "SSH key generator"
niveau: debutant
tags:
  - type/commande
  - theme/ssh
  - theme/securite
  - theme/cles
---

# ssh-keygen

## Sens du nom

`ssh-keygen` : **SSH key generator**.

## Rôle

Cette commande crée une paire de clés SSH.

## Syntaxe générale

```bash
ssh-keygen [options] [arguments]
```

## Exemples du projet

```bash
ssh-keygen -t ed25519 -C "rpi-eleve"
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
