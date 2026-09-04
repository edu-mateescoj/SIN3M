# Dépendances locales

Ce dossier ne doit contenir que des dépendances publiques de l'application, jamais le corpus privé.

Exécuter `../setup-vendor.ps1` pour obtenir :

```text
vendor/
├── pdfjs/
│   ├── pdf.mjs
│   └── pdf.worker.mjs
├── mammoth/
│   └── mammoth.browser.min.js
└── vendor-lock.json
```

Versions verrouillées au 4 septembre 2026 :
- pdfjs-dist 6.3.289
- mammoth 1.12.2

Les fichiers téléchargés ne sont pas nécessaires dans Git pour conserver une branche légère ; ils doivent être présents dans le déploiement offline final.
