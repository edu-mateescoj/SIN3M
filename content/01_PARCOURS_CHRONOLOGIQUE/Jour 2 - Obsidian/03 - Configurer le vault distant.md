---
type: procedure
ordre: 9
tags: [type/procedure, theme/obsidian, theme/git]
---
# 09 - Configurer le vault distant

## Cloner le vault

```bash
git clone git@github.com:COMPTE/NOM-DU-DEPOT.git
cd NOM-DU-DEPOT
```

## Synchroniser

```bash
git pull
git status
git add .
git commit -m "Mise à jour du vault"
git push
```

## Commandes liées

- [[02_COMMANDES/git]]
- [[02_COMMANDES/cd]]
