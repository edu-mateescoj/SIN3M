---
type: procedure
statut: brouillon
tags:
  - GitHub
  - projet/writerdeck
---

# 1. Cloner le dépôt GitHub existant dans VS Code

Dans VS Code (Ctrl+Shift+P)
```powershell
Git: Clone
```

# 2. Copier le Vault dans le dépôt (d'abord, ensuite supprimer l'ancien)

Sous Windows PowerShell, depuis le dossier du dépôt :
```powershell
mkdir docs <par exemple>
Copy-Item "C:\chemin\vers\MonVaultObsidian" ".\docs\MonVaultObsidian" -Recurse
```

# 3. Dans Obsidian : ouvrir le dossier
l efaire apparitre comme Vault

# 4. Ajouter un .gitignore (à *commit* pour partager les règles d'exclusion)
À la racine du dépôt GitHub, créer ou compléter la liste d'éviction pour:
- .../workspace.json
- .../workspaces.json
- poubelle: /.trash/
- fichiers système: .DS_store et Thums.db
- réglages locaux à garder en local: .vscode/

# 5. Utilisation collaborative

VS Code suit ce modèle : changements --> stage --> commit --> sync/push vers le serveur distant

En terminal, l’équivalent est :
```bash
git status
git add docs/MonVaultObsidian .gitignore
git commit -m "Ajout du vault Obsidian"
git push
```
Pour une collaboration fluide :
- **Avant de modifier : *git pull***
- Après modification : **commit** + **push**
- Éviter que deux personnes modifient la même note en même temps
- Utiliser des branches pour les grosses modifs

# 6. Pré-rendu du MkDown

toggle entre fichier éditable et rendu: Ctrl+Shift+V

Vue split côte-à-côte, faire successivement:
Ctrl+k
v