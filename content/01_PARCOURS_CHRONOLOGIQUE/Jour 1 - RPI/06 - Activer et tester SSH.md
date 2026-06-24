---
type: procedure
ordre: 6
tags: [type/procedure, theme/ssh, niveau/intermediaire]
---
# 06 - Activer et tester SSH

## Commandes sur le Raspberry Pi

```bash
sudo systemctl enable --now ssh
systemctl status ssh
ssh localhost
```

## Test depuis un autre ordinateur du même réseau

```bash
ssh utilisateur@ADRESSE_IP_DU_RPI
```

## Commandes liées

- [[02_COMMANDES/systemctl]]
- [[02_COMMANDES/ssh]]
- [[02_COMMANDES/ip]]

## À retenir

SSH permet d'ouvrir une session distante sécurisée sur le Raspberry Pi.
