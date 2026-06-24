---
type: commande
commande: vcgencmd
etymologie: "VideoCore general command"
niveau: debutant
tags:
  - type/commande
  - theme/raspberrypi
  - theme/diagnostic
  - theme/alimentation
  - theme/temperature
---

# vcgencmd

## Sens du nom

`vcgencmd` : **VideoCore general command**.

## Rôle

Cette commande interroge des informations spécifiques au Raspberry Pi.

## Syntaxe générale

```bash
vcgencmd [options] [arguments]
```

## Exemples du projet

```bash
vcgencmd get_throttled
vcgencmd measure_temp
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
