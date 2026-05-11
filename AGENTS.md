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

## Technologies autorisées

Utiliser uniquement :
- HTML ;
- CSS ;
- JavaScript pur.

Aucune technologie serveur pour le moment.

## Technologies interdites

Ne pas utiliser :
- React ;
- Vue ;
- Angular ;
- Bootstrap ;
- Tailwind ;
- Node.js ;
- Express ;
- PHP ;
- backend ;
- base de données externe ;
- framework JavaScript ;
- librairie externe non demandée.

## Objectif technique actuel

Créer une application fonctionnelle côté navigateur.

Les données doivent être :
- centralisées ;
- consultables ;
- ajoutables ;
- modifiables ;
- supprimables ;
- filtrables ;
- exportables en CSV compatible Excel ;
- sauvegardées avec localStorage.

Plus tard, le projet pourra évoluer vers une vraie base de données serveur sans refaire toute l’interface.

## Architecture obligatoire

Utiliser une structure modulaire claire :

- index.html
- style.css
- script.js
- data/database.js
- data/databaseService.js
- pages/database.js
- pages/manager.js
- pages/production.js
- pages/methodes.js
- pages/preparation.js
- pages/accroche.js
- pages/peinture.js
- pages/decroche.js
- pages/qualite.js
- pages/logistique.js
- pages/stock.js
- pages/settings.js

Rôle des fichiers :
- index.html : structure générale de l’application.
- style.css : style global de l’application.
- script.js : navigation générale, initialisation et fonctions communes.
- data/database.js : données fictives initiales.
- data/databaseService.js : fonctions de gestion des données.
- pages/*.js : rendu et logique de chaque page.

## Règle importante sur les données

Les pages ne doivent jamais manipuler directement les données brutes.

Toutes les pages doivent passer par les fonctions de data/databaseService.js.

Exemples :
- getTable(tableName)
- addRecord(tableName, record)
- updateRecord(tableName, id, updatedRecord)
- deleteRecord(tableName, id)
- filterRecords(tableName, filters)
- exportTableToCSV(tableName, filteredData)

Cette règle est importante pour pouvoir remplacer plus tard localStorage par une vraie base de données serveur.

## Tables de données attendues

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

## Logique métier

L’application couvre la production depuis la réception des pièces jusqu’à la mise à disposition des produits finis.

La logique générale est :

Client → Commande → Affaire / OF → Références pièces → Gamme → Étapes de production → Tâches opérateurs → Temps réel → Observations → Indicateurs

Un OF peut contenir plusieurs références pièces.

Dans les pages manager, utiliser le mot “Affaire” plutôt que “OF”.
Le mot “OF” peut être utilisé dans les pages opérationnelles.

## Pages principales

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

## Page Base de données

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

## Export

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

## Design attendu

L’interface doit être :
- professionnelle ;
- industrielle ;
- moderne ;
- claire ;
- responsive ;
- utilisable par des non-informaticiens.

S’inspirer de l’univers visuel du site Groupe Optitec / Technocoat :
https://www.peinture-industrielle.fr/

Style recherché :
- bleu nuit ;
- bleu industriel ;
- blanc ;
- gris clair ;
- touches orange / jaune pour attention ;
- vert pour validé ;
- rouge pour critique ;
- cartes avec bords arrondis ;
- tableaux propres ;
- boutons sobres ;
- interface premium et sérieuse.

Ne pas utiliser d’émojis.
Utiliser plutôt du texte, des pictogrammes sobres en CSS ou des icônes professionnelles simples si nécessaire.

## Rôles futurs

Prévoir une logique de rôles sans vraie authentification pour le moment :

- Manager ;
- Responsable méthode ;
- Préparation ;
- Accroche ;
- Peinture ;
- Décroche ;
- Qualité ;
- Logistique ;
- Administrateur.

Chaque rôle aura plus tard des droits différents.

## Règles de travail

- Faire des modifications progressives.
- Ne pas refaire toute l’application sans demande explicite.
- Ne pas supprimer une section existante utile sans raison.
- Ne pas casser la navigation.
- Ne pas ajouter de données confidentielles.
- Utiliser uniquement des données fictives.
- Résumer chaque modification à la fin.
- Indiquer les fichiers modifiés.
- Garder un code lisible, organisé et commenté simplement si nécessaire.
- Supprimer tout marqueur de conflit Git :
  - <<<<<<<
  - =======
  - >>>>>>>
