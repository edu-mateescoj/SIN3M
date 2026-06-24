---
type: procedure
ordre: 3
tags: [type/procedure, theme/diagnostic, theme/alimentation]
---
# 03 - Vérifier écran clavier souris alimentation

## Commandes

```bash
lsusb
vcgencmd get_throttled
vcgencmd measure_temp
```

## Commandes liées

- [[02_COMMANDES/lsusb]]
- [[02_COMMANDES/vcgencmd]]

## Interprétation

- `throttled=0x0` : aucune alerte de sous-tension ou de limitation détectée depuis le démarrage.
- Toute autre valeur doit être notée et vérifiée.

## Trace élève

- Clavier détecté : oui / non
- Souris détectée : oui / non
- Sous-tension détectée : oui / non
- Température observée :
