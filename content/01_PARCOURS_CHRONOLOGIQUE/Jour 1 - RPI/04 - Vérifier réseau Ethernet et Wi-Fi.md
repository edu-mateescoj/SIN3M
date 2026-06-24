---
type: procedure
ordre: 4
tags: [type/procedure, theme/reseau, niveau/debutant]
---
# 04 - Vérifier réseau Ethernet et Wi-Fi

## Commandes

```bash
ip -br addr
ping -c 4 8.8.8.8
ping -c 4 raspberrypi.com
```

## Commandes liées

- [[02_COMMANDES/ip]]
- [[02_COMMANDES/ping]]

## Interprétation

- Si `ping 8.8.8.8` fonctionne, la connectivité IP fonctionne.
- Si `ping raspberrypi.com` fonctionne, le DNS fonctionne aussi.
- Une adresse `127.x.x.x` est locale et ne prouve pas l'accès au réseau.
