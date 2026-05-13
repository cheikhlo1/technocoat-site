# Instructions pour Codex — Projet Technocoat

## Contexte général

Ce projet est une application web de gestion de production industrielle pour Technocoat.

L’objectif est de créer une application claire, professionnelle, fonctionnelle et évolutive permettant de gérer :
- les clients ;
- les commandes ;
- les affaires / OF ;
- les références pièces ;
- les gammes ;
- les étapes de production ;
- les tâches opérateurs ;
- les temps prévus et réels ;
- les stocks ;
- les mouvements de stock ;
- la qualité ;
- les contrôles équipements ;
- la logistique ;
- les observations / retours d’expérience ;
- les indicateurs de pilotage.

Le projet doit être développé progressivement, étape par étape.

## 1) Technologies autorisées

Utiliser uniquement :
- HTML ;
- CSS ;
- JavaScript pur.

Aucune technologie serveur pour le moment.

## 2) Technologies interdites

Ne pas utiliser :
- React ;
- Vue ;
- Angular ;
- Bootstrap ;
- backend ;
- base de données externe.

## 3) Fichiers principaux

Les fichiers principaux restent :
- `index.html`
- `style.css`
- `script.js`

Ils ne doivent pas être supprimés.

## 4) Liberté contrôlée d’organisation

Il est autorisé de créer des fichiers supplémentaires si cela améliore l’organisation, par exemple :
- fichiers dans `pages/` ;
- fichiers dans `data/` ;
- fichiers dans `utils/` ;
- fichiers dans `components/`.

À condition que :
- le projet reste en HTML/CSS/JavaScript pur ;
- la navigation continue de fonctionner ;
- les fichiers principaux ne soient pas supprimés ;
- les fonctions existantes ne soient pas cassées.

## 5) Organisation recommandée

Utiliser une organisation claire :
- `data/` pour les données fictives et services de données ;
- `pages/` pour les pages de l’application ;
- `utils/` pour les fonctions communes ;
- `components/` pour les composants réutilisables si nécessaire.

Exemples de composants réutilisables :
- carte KPI ;
- badge de statut ;
- badge de priorité ;
- carte OF ;
- bloc détail affaire ;
- formulaire simple ;
- tableau responsive ;
- message vide propre ;
- bouton d’action ;
- navigation interne ;
- graphique simple ;
- anneau de performance ;
- barre comparative ;
- mini courbe.

## 6) Règle importante sur les données

Les pages ne doivent jamais manipuler directement les données brutes.

Toutes les pages doivent passer par les fonctions de `data/databaseService.js`.

Exemples :
- `getTable(tableName)`
- `addRecord(tableName, record)`
- `updateRecord(tableName, id, updatedRecord)`
- `deleteRecord(tableName, id)`
- `filterRecords(tableName, filters)`
- `exportTableToCSV(tableName, filteredData)`

Règles complémentaires :
- ne pas manipuler directement `localStorage` dans les pages si une fonction existe déjà ;
- ne pas supprimer les données utilisateur ;
- ne pas réinitialiser les données sans action claire de l’utilisateur ;
- les données fictives peuvent être enrichies progressivement ;
- les modifications doivent rester après actualisation.

## 7) Standardisation graphique globale

L’application doit avoir une identité graphique cohérente sur toutes les pages.

À standardiser :
- police ;
- tailles de titres ;
- cartes ;
- boutons ;
- tableaux ;
- formulaires ;
- badges ;
- couleurs ;
- espacements ;
- arrondis ;
- ombres ;
- comportements responsive ;
- KPI ;
- graphiques ;
- états vides ;
- messages d’erreur.

Éviter que chaque page ait son propre style isolé.
Utiliser des classes CSS communes dès que possible.

## 8) Responsive design obligatoire

Chaque modification doit respecter le responsive design.

Le site doit être utilisable sur :
- ordinateur ;
- tablette ;
- téléphone ;
- téléphone en rotation paysage.

Règles :
- aucun scroll horizontal global ;
- scroll horizontal autorisé uniquement dans les tableaux larges ou carrousels de cartes ;
- les cartes doivent s’adapter à l’écran ;
- les formulaires doivent rester utilisables ;
- les tableaux doivent rester dans leur conteneur ;
- la sidebar doit être rétractable sur petits écrans ;
- le bouton hamburger doit ouvrir et fermer le menu ;
- les graphiques doivent s’adapter à la largeur disponible ;
- les KPI doivent rester lisibles sur mobile.

## 9) Navigation stable

La navigation doit rester robuste.

Règles :
- une erreur dans une page ne doit pas bloquer toute l’application ;
- si une page échoue, afficher un message d’erreur clair dans le contenu principal ;
- la sidebar/menu doit rester utilisable ;
- `script.js` doit garder un registre clair des pages ;
- les fonctions de rendu doivent avoir des noms cohérents.

Exemples de noms attendus :
- `renderManagerPage`
- `renderDatabasePage`
- `renderProductionPage`
- `renderMethodesPage`
- `renderPreparationPage`
- `renderAccrochePage`
- `renderPeinturePage`
- `renderDecrochePage`
- `renderQualitePage`
- `renderLogistiquePage`
- `renderStockPage`
- `renderSettingsPage`

## 10) KPI et graphiques

Les KPI et graphiques doivent être standardisés dans toute l’application.

Technologies autorisées pour les graphiques :
- HTML ;
- CSS ;
- JavaScript pur ;
- SVG inline ;
- Canvas uniquement si nécessaire.

Technologies à éviter pour l’instant :
- bibliothèques graphiques externes ;
- Chart.js ;
- D3.js ;
- Recharts ;
- dépendances CDN.

Objectif :
Créer des graphiques simples, lisibles, professionnels et légers sans alourdir le projet.

Éléments graphiques recommandés :
- cartes KPI ;
- barres de progression ;
- barres comparatives ;
- anneaux de performance ;
- mini courbes d’évolution ;
- histogrammes simples ;
- jauges simples ;
- badges de statut ;
- blocs d’alerte ;
- indicateurs de tendance.

Organisation recommandée :
Créer si nécessaire :
- `components/charts.js`
- ou `utils/charts.js`

Exemples de fonctions réutilisables :
- `renderKpiCard()`
- `renderProgressBar()`
- `renderComparisonBars()`
- `renderDonutChart()`
- `renderMiniBarChart()`
- `renderTrendLine()`
- `renderStatusBadge()`
- `renderAlertCard()`

Règles de design des graphiques :
- même style sur toutes les pages ;
- couleurs sobres et professionnelles ;
- bleu foncé pour les données principales ;
- vert pour conforme / terminé ;
- orange pour attention / en cours ;
- rouge pour bloqué / non conforme ;
- gris pour neutre / non renseigné ;
- pas d’émojis ;
- pas d’éléments décoratifs inutiles ;
- titre clair ;
- valeur principale visible ;
- unité affichée si nécessaire ;
- message vide propre si la donnée est absente.

Responsive des graphiques :
- desktop : plusieurs graphiques alignés ;
- tablette : 2 colonnes si possible ;
- mobile : 1 colonne ou graphiques compacts ;
- téléphone paysage : graphiques compacts ;
- aucun scroll horizontal global.

Interdiction :
Ne pas créer un graphique qui dépend d’une donnée absente sans prévoir :
- une valeur par défaut ;
- ou un message vide propre.

## 11) Travail progressif

Faire les changements par petites briques.

Avant de modifier une page complexe :
- ne pas refaire toute l’application ;
- ne pas modifier plusieurs grosses pages à la fois ;
- préserver ce qui fonctionne ;
- corriger les bugs avant d’ajouter de nouvelles fonctions.

## 12) Liberté contrôlée de refactorisation

Codex est autorisé à refactoriser si cela améliore la stabilité ou évite les répétitions.

Autorisé :
- créer une fonction commune ;
- déplacer une logique répétée dans `utils/` ou `components/` ;
- harmoniser des noms de fonctions ;
- simplifier une page qui bloque ;
- corriger l’ordre de chargement des scripts ;
- factoriser les cartes, KPI, badges, tableaux, formulaires et graphiques ;
- créer une base graphique commune pour les KPI et graphiques ;
- créer des composants réutilisables pour les pages opérateurs, logistique, qualité et manager.

Interdit :
- supprimer une page existante ;
- casser la navigation ;
- supprimer `databaseService.js` ;
- supprimer les données existantes ;
- réécrire tout le projet sans nécessité ;
- ajouter un framework ;
- ajouter un backend ;
- ajouter une bibliothèque externe sans demande explicite.

## 13) Design métier

L’application est destinée à un atelier de production industrielle.

Le design doit être :
- professionnel ;
- clair ;
- sobre ;
- lisible en atelier ;
- adapté à un usage opérateur ;
- adapté à un usage manager ;
- sans emoji ;
- sans éléments décoratifs inutiles.

Les boutons doivent être simples et explicites :
- Enregistrer
- Modifier
- Supprimer
- Détail
- Retour
- Valider
- Bloquer
- Signaler anomalie
- Marquer prêt
- Expédié
- Clôturer

## 14) Gestion des erreurs

Ajouter des protections quand nécessaire :
- vérifier qu’un tableau existe avant `map/filter/reduce` ;
- utiliser `[]` par défaut si une donnée est absente ;
- vérifier qu’une fonction existe avant de l’appeler ;
- afficher un message vide propre si aucune donnée n’existe ;
- utiliser `console.error` pour les erreurs techniques ;
- éviter qu’un composant graphique fasse planter une page.

## 15) Messages vides

Quand il n’y a pas de donnée, afficher un message propre.

Exemples :
- Aucune donnée disponible pour le moment.
- Aucun signalement ouvert.
- Aucune réception en attente.
- Aucun lot à conditionner.
- Aucune anomalie détectée.
- Aucun contrôle à réaliser.
- Aucun graphique disponible pour le moment.

Ne pas afficher de faux tableaux vides ou de fausses données si ce n’est pas nécessaire.

## 16) Architecture applicative actuelle

Utiliser une structure modulaire claire :

- `index.html`
- `style.css`
- `script.js`
- `data/database.js`
- `data/databaseService.js`
- `pages/database.js`
- `pages/manager.js`
- `pages/production.js`
- `pages/methodes.js`
- `pages/preparation.js`
- `pages/accroche.js`
- `pages/peinture.js`
- `pages/decroche.js`
- `pages/qualite.js`
- `pages/logistique.js`
- `pages/stock.js`
- `pages/settings.js`

Cette architecture est la base actuelle, avec extension possible via `utils/` et `components/`.

## 17) Tables de données attendues

La base interne doit contenir les tables suivantes :

1. clients
2. commandes
3. affaires
4. referencesPieces
5. gammes
6. etapesGamme
7. taches
8. personnel
9. stocks
10. mouvementsStock
11. qualitePieces
12. controlesEquipements
13. logistique
14. observations

## 18) Logique métier

L’application couvre la production depuis la réception des pièces jusqu’à la mise à disposition des produits finis.

Logique générale :

Client → Commande → Affaire / OF → Références pièces → Gamme → Étapes de production → Tâches opérateurs → Temps réel → Observations → Indicateurs

Un OF peut contenir plusieurs références pièces.

Dans les pages manager, utiliser le mot “Affaire” plutôt que “OF”.
Le mot “OF” peut être utilisé dans les pages opérationnelles.

## 19) Navigation principale

La barre latérale doit contenir :

1. Manager
2. Base de données
3. Production / Affaires
4. Responsable méthode
5. Préparation
6. Accroche
7. Peinture
8. Décroche
9. Qualité
10. Logistique
11. Stock
12. Paramètres / Utilisateurs

La page ouverte par défaut doit être : Base de données.

## 20) Page Base de données

La page Base de données est prioritaire.

Elle doit permettre de gérer les tables :
- Clients
- Commandes
- Affaires / OF
- Références pièces
- Gammes
- Étapes de gamme
- Tâches
- Personnel
- Stocks
- Mouvements stock
- Qualité pièces
- Contrôles équipements
- Logistique
- Observations / REX

Pour chaque table, prévoir :
- affichage ;
- recherche ;
- filtres ;
- ajout ;
- modification ;
- suppression ;
- export CSV ;
- sauvegarde localStorage.

## 21) Export

Prévoir des exports CSV compatibles Excel.

Les exports doivent pouvoir tenir compte des filtres :
- date de début ;
- date de fin ;
- client ;
- statut ;
- activité ;
- priorité ;
- affaire / OF ;
- référence.

## 22) Validation après chaque modification

À la fin de chaque intervention, Codex doit résumer :
- les fichiers modifiés ;
- les fonctions ajoutées ou modifiées ;
- les éléments supprimés ;
- la méthode de vérification ;
- les éventuelles limites restantes.

## 23) Contraintes permanentes

Ne jamais :
- ajouter de données confidentielles ;
- ajouter d’emoji ;
- laisser des marqueurs Git conflictuel (`<<<<<<<`, `=======`, `>>>>>>>`) ;
- casser les pages existantes ;
- casser le responsive ;
- créer un scroll horizontal global ;
- supprimer les fonctionnalités déjà validées ;
- casser la sauvegarde localStorage ;
- casser `databaseService.js`.
