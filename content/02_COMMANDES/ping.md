---
type: commande
commande: ping
etymologie: "Packet Internet Groper"
niveau: debutant
tags:
  - type/commande
  - theme/reseau
  - theme/diagnostic
---

# ping

## Sens du nom

`ping` : **Packet Internet Groper**.

## Rôle

Cette commande teste l’accessibilité d’une machine sur le réseau.

## Syntaxe générale

```bash
ping [options] [arguments]
```

## Exemples du projet

```bash
ping -c 4 8.8.8.8
ping -c 4 raspberrypi.com
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
