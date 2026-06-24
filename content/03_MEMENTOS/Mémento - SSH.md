---
type: memento
tags: [type/memento, theme/ssh]
---
# Mémento - SSH

## Activer SSH sur le Raspberry Pi

```bash
sudo systemctl enable --now ssh
systemctl status ssh
```

## Se connecter au Raspberry Pi

```bash
ssh utilisateur@adresse-ip
```

## Créer une clé SSH

```bash
ssh-keygen -t ed25519 -C "rpi-eleve"
```

## Tester GitHub en SSH

```bash
ssh -T git@github.com
```

## Commandes liées

[[02_COMMANDES/ssh|ssh]], [[02_COMMANDES/ssh-keygen|ssh-keygen]], [[02_COMMANDES/ssh-copy-id|ssh-copy-id]], [[02_COMMANDES/systemctl|systemctl]]
