---
type: theme
tags: [type/theme]
---
# Solutions techno

## Résumé de la situation
- Tailscale ne synchronise pas les fichiers : il relie les machines (*transporte les connexions*).
- Syncthing ne donne pas un accès SSH : il synchronise (*transporte les fichiers*).
- GitHub ne synchronise pas automatiquement : il versionne par `commits`.
- Cloudflare Tunnel ne synchronise rien : il publie temporairement un service web local.
- SSH ne synchronise pas les fichiers : il donne un accès terminal distant (*transporte les commandes*).
- Samba ne synchronise pas automatiquement : il partage un dossier en réseau local (*transporte les fichiers via SMB*).

## *Cloudlfared* aka Cloudfare *Quick Tunnel* 
1. installer Cloudlfared
```bash
wget https://github.../....deb
sudo dpkg -i cloudflared-linux-arm64.deb
```
2. lancer le serveur Python depuis le Rpi:
```bash
python3 -m http.server 8000 --bind 127.0.0.1
```
3. lancer le tunnel : Cloudflare répondra avec une URL random à utiliser par les clients
```bash
cloudflared tunnel --url http://localhost:8000
```

## Tailscale
Indisponible sur les PC école : catégorisé *Remote access* et bloqué!

Installe un VPN (réseau privé virtuel) entre clients reliés : plus lourd à l'installation, création de compte compliqué mais impressionnante.
```bash
tailscale.com/download 
```

Une fois les appareils connectés au même “tailnet”, chacun reçoit une IP stable en 100.x.y.z, et tu peux utiliser les services habituels : SSH, HTTP, serveur Python, Obsidian local, etc. Tailscale documente que chaque appareil reçoit une IP unique 100.x.y.z, utilisable même si les machines changent de réseau ou sont derrière un pare-feu!

## Syncthing
Syncthing synchronise des fichiers/dossiers entre plusieurs machines. Il ne donne pas une IP pour te connecter en SSH au RPi ; il copie/synchronise le contenu d’un dossier partagé entre appareils. Sa documentation décrit Syncthing comme un programme de *synchronisation continue de fichiers entre deux ordinateurs ou plus*.
```bash
apt.syncthing.net
```

## GitHub
Pour enseigner le versionnage. Nécessite Git installé sur chaque machine contributrice : OK pour PC école (installer pour le user courant, pas Admin).

## SSH
SSH (*Secure Shell*) donne un accès terminal chiffré à distance sur le Raspberry Pi. Il ne partage ni ne synchronise de fichiers, mais permet :
- d'exécuter des commandes à distance ;
- de transférer des fichiers via `scp` ou `sftp` ;
- de créer des tunnels (redirection de port).

Disponible nativement sur Linux et macOS ; sous Windows via PowerShell ou un client comme PuTTY. Permet d'administrer le RPi depuis un PC de la classe via le réseau local.
```bash
ssh utilisateur@adresse-ip-du-rpi
```

## Samba
Samba implémente le protocole SMB/CIFS pour partager des dossiers en réseau local, exactement comme un partage réseau Windows. Une fois configuré, le dossier du Raspberry Pi apparaît dans l'explorateur de fichiers Windows sans aucun logiciel supplémentaire côté client.

Utile pour accéder au vault Obsidian du RPi directement depuis un PC de la classe, en lecture ou en écriture.
```bash
sudo apt install samba
```
Configuration du partage dans `/etc/samba/smb.conf`, puis accès depuis Windows via `\\adresse-ip-du-rpi\nom-du-partage`.
