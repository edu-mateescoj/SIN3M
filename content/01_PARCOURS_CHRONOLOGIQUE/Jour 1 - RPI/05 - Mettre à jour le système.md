---
type: procedure
ordre: 5
tags: [type/procedure, theme/linux, theme/administration]
---
# 05 - Mettre à jour le système

## Commandes

```bash
sudo apt update
apt list --upgradable
sudo apt full-upgrade -y
sudo apt autoremove -y
sudo apt clean
sudo reboot
```

## Commandes liées

- [[02_COMMANDES/sudo]]
- [[02_COMMANDES/apt]]
- [[02_COMMANDES/reboot]]

## Résultat attendu

Le système redémarre sans erreur et les paquets sont à jour.
