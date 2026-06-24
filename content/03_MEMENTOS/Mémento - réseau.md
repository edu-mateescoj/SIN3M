---
type: memento
tags: [type/memento, theme/reseau]
---
# Mémento - réseau

## Voir les interfaces réseau

```bash
ip -br addr
ip route
```

## Tester Internet

```bash
ping -c 4 8.8.8.8
ping -c 4 raspberrypi.com
```

## Interprétation

- IP privée typique école : souvent `10.x.x.x`.
- `127.0.0.1` ou `127.0.1.1` : adresse locale, pas une vraie adresse réseau externe.
- Si `8.8.8.8` répond mais pas `raspberrypi.com`, le problème vient probablement du DNS.
