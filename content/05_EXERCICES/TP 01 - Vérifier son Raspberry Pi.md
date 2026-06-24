---
type: exercice
tags: [type/exercice, theme/diagnostic]
---
# TP 01 - Vérifier son Raspberry Pi

## Mission

Identifier le modèle, la RAM, l'alimentation, les périphériques USB et le réseau.

## Commandes autorisées

```bash
cat /proc/device-tree/model
free -h
vcgencmd get_throttled
ip -br addr
lsusb
ping -c 4 raspberrypi.com
```

## Livrable

Compléter la fiche de diagnostic final.
