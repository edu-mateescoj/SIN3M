---
type: commande
commande: journalctl
etymologie: "journal control"
niveau: debutant
tags:
  - type/commande
  - theme/linux
  - theme/diagnostic
  - theme/services
---

# journalctl

## Sens du nom

`journalctl` : **journal control**.

## Rôle

Cette commande consulte les journaux de systemd.

## Syntaxe générale

```bash
journalctl [options] [arguments]
```

## Exemples du projet

```bash
journalctl -xe
journalctl -u ssh
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
