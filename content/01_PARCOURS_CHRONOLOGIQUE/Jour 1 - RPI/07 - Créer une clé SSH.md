---
type: procedure
ordre: 7
tags: [type/procedure, theme/ssh, theme/securite]
---
# 07 - Créer une clé SSH

## Commande

```bash
ssh-keygen -t ed25519 -C "rpi-eleve"
```

Afficher la clé publique :

```bash
cat ~/.ssh/id_ed25519.pub
```

## Commandes liées

- [[02_COMMANDES/ssh-keygen]]
- [[02_COMMANDES/cat]]

## Règle de sécurité

La clé privée ne doit jamais être copiée, publiée, déposée sur GitHub ou envoyée par message.
