# Recette — Corpus Builder

Tous les premiers essais doivent utiliser des données fictives.

## 0. Préparation

Sur la branche :

```bash
git switch corpus-builder
git pull
```

Installer une fois les dépendances :

```powershell
cd journal-lab\corpus-builder
powershell -ExecutionPolicy Bypass -File .\setup-vendor.ps1
```

Puis lancer localement avec Live Server ou :

```powershell
python -m http.server 8000
```

Ouvrir ensuite l'URL locale correspondant au dossier.

Déconnecter Internet si l'on souhaite vérifier le fonctionnement offline.

## 1. Test sans dépendance — TXT

Importer :

```text
examples/corpus-builder-transcription-fictive.txt
```

Résultat attendu :
- source listée comme `TRANSCRIPTION-001` ;
- SHA-256 calculé ;
- extraction en plusieurs blocs ;
- aucun appel réseau.

Cliquer sur « Proposer les entrées par dates ».

Résultat attendu :
- 3 entrées ;
- dates ISO proposées : 1934-03-12, 1934-03-19, 1934-04-02 ;
- possibilité de modifier chaque texte ;
- possibilité de scinder/fusionner.

## 2. Test PDF

Créer localement un PDF à partir du fichier fictif ou prendre un PDF de test sans donnée sensible.

Importer le PDF puis « Extraire les transcriptions ».

Résultat attendu :
- PDF.js détecté ;
- nombre de pages enregistré ;
- un bloc par page ;
- scripting PDF désactivé dans le code ;
- texte visible dans l'éditeur de bloc ;
- pages de provenance conservées lors de la segmentation.

Points à contrôler manuellement :
- ordre des lignes ;
- espaces ;
- césures ;
- en-têtes/pieds de page.

Le Builder permet de corriger la copie extraite avant segmentation.

## 3. Test DOCX

Créer un DOCX fictif avec les mêmes trois entrées.

Résultat attendu :
- Mammoth détecté ;
- texte extrait sans injection du HTML du DOCX ;
- blocs correspondant approximativement aux paragraphes ;
- segmentation par dates fonctionnelle.

## 4. Test images

Importer une ou plusieurs images JPEG/PNG/WebP.

Résultat attendu :
- asset `IMAGE-xxx` ;
- hash calculé ;
- aperçu local ;
- aucune extraction OCR ;
- possibilité d'ajouter l'ID de l'image dans « Assets liés » d'une entrée.

## 5. Test correction

Modifier un bloc extrait puis appliquer la correction.

Résultat attendu :
- source originale inchangée ;
- bloc marqué « modifié » ;
- transformation `manual-block-edit` enregistrée dans le rapport ;
- segmentation utilisant la copie corrigée.

## 6. Test scission/fusion

Dans une entrée :
- placer le curseur au milieu ;
- « Scinder au curseur » ;
- fusionner ensuite les deux parties.

Résultat attendu :
- IDs renumérotés ;
- pages/assets conservés de façon conservative ;
- opérations présentes dans `build-report.json`.

## 7. Validation

Lancer les contrôles.

Bloquants attendus :
- corpusId vide ;
- documentId vide ;
- aucune transcription ;
- aucune entrée ;
- entrée vide ;
- ID d'entrée dupliqué.

Avertissements possibles :
- hash non calculé ;
- plusieurs transcriptions ;
- date non ISO ;
- asset inconnu ;
- bloc corrigé manuellement.

## 8. Export

Télécharger :
- `corpus.json` ;
- `build-report.json`.

Vérifier que :
- le texte canonique est présent dans `corpus.json` ;
- les fichiers binaires PDF/DOCX/images ne sont pas encodés dedans ;
- `build-report.json` contient métadonnées, hashes et transformations mais pas les binaires ;
- aucune donnée élève n'est présente.

## 9. Reprise de chantier

Cliquer « Sauvegarder le chantier », fermer/recharger la page puis « Reprendre un chantier ».

Résultat attendu :
- blocs et entrées restaurés ;
- textes corrigés restaurés ;
- les binaires source ne sont volontairement pas incorporés au chantier ;
- pour réextraire un PDF/DOCX, il faut le sélectionner de nouveau.

## 10. Test offline

Après installation des dépendances :
1. couper Wi-Fi/Ethernet ;
2. recharger l'application depuis localhost ;
3. refaire TXT, PDF et DOCX ;
4. vérifier DevTools > Network.

Aucune requête vers Internet ne doit apparaître.


## 11. Régression — correction après segmentation

1. Extraire un DOCX/TXT.
2. Construire une segmentation.
3. Revenir à Extraction et modifier un bloc.
4. Cliquer « Appliquer la correction ».

Résultat attendu :
- la correction reste dans le bloc ;
- la segmentation existante est marquée obsolète ;
- Validation signale une erreur bloquante ;
- l'export du corpus est refusé tant que la segmentation n'a pas été reconstruite ;
- « Commencer / reconstruire la segmentation manuelle » ou la détection par dates repart du texte corrigé.

## 12. Régression — lignes séparatrices

Avec des lignes telles que :

```text
____________________________
----------------------------
============================
```

cliquer « Supprimer les lignes séparatrices ».

Résultat attendu :
- seules les lignes entièrement constituées de séparateurs sont supprimées ;
- les phrases contenant des tirets/underscores ne sont pas touchées ;
- la source originale reste inchangée ;
- une segmentation antérieure est marquée obsolète.

## 13. Régression — PDF sans couche texte

Importer un PDF rasterisé sans texte sélectionnable.

Résultat attendu :
- le PDF est ouvert et son nombre de pages peut être connu ;
- le diagnostic indique qu'aucune couche texte exploitable n'a été extraite ;
- l'application ne présente pas silencieusement « 0 bloc » comme un succès ;
- le Builder recommande DOCX ou une future étape OCR locale.

## 14. Noms d'exports

Dans l'étape Export, modifier :
- le nom du corpus ;
- le nom du rapport ;
- le nom de sauvegarde de chantier.

Résultat attendu :
- l'extension `.json` est ajoutée si elle manque ;
- les noms choisis sont utilisés ;
- ils sont conservés dans la sauvegarde de chantier.
