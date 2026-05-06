# Instructions pour Codex — Projet Technocoat

## Contexte du projet
Ce projet est une application web de gestion de production industrielle pour Technocoat.

L’objectif est de créer une maquette dynamique, professionnelle et progressive permettant de gérer :
- les OF
- les commandes
- les références pièces
- les tâches opérateurs
- les étapes de production
- les stocks
- les observations opérateurs
- les indicateurs de production

Le projet doit rester simple pour le moment et fonctionner uniquement en local ou via GitHub Pages.

---

## Technologies autorisées
- HTML
- CSS
- JavaScript pur

---

## Technologies interdites
Ne jamais utiliser :
- React
- Vue
- Angular
- Bootstrap
- Tailwind
- Node.js
- Express
- PHP
- Backend
- Base de données externe
- Framework JavaScript
- Librairie externe inutile

---

## Fichiers principaux
Les fichiers principaux du projet sont :
- `index.html`
- `style.css`
- `script.js`

Ne pas changer le nom de ces fichiers.

---

## Règles générales
- Ne pas supprimer les sections existantes.
- Ne pas casser la barre latérale existante.
- Ne pas casser la navigation existante.
- Ne pas refaire toute l’application sans demande explicite.
- Faire des modifications progressives.
- Modifier uniquement ce qui est demandé.
- Garder une interface professionnelle, claire, moderne et responsive.
- Utiliser des couleurs sobres adaptées à une application industrielle.
- Ne jamais ajouter de données confidentielles.
- Utiliser uniquement des données fictives.
- Garder un code lisible et bien structuré.
- Ajouter des commentaires simples si nécessaire.

---

## Logique métier principale
L’application est organisée autour des OF.

Structure logique :
Client → Commande → OF → Références pièces → Gammes de fabrication → Étapes de production → Tâches opérateurs → Temps réel → Indicateurs

Un OF peut contenir plusieurs références pièces.

Chaque référence peut avoir :
- une désignation
- une quantité
- une gamme
- des étapes de production
- des temps prévus
- des temps réels
- des consommables
- un statut
- des observations opérateur
- des anomalies éventuelles

---

## Pages principales
La barre latérale doit contenir les pages suivantes :
- Manager
- Responsable méthode
- Préparation
- Accroche
- Peinture
- Décroche
- Qualité
- Logistique
- Stock
- Paramètres / Utilisateurs

---

## Rôles futurs
Prévoir une logique de rôles, sans créer de vraie authentification pour le moment.

Rôles prévus :
- Manager
- Responsable méthode
- Préparation
- Accroche
- Peinture
- Décroche
- Qualité
- Logistique
- Opérateur

Chaque rôle aura plus tard des droits différents.

Pour le moment, utiliser seulement des données fictives et une simulation visuelle.

---

## Pages opérateurs
Les pages opérateurs comme Préparation, Accroche, Peinture, Décroche doivent être très lisibles.

Elles doivent permettre à l’opérateur de voir :
- ses tâches du jour
- le client
- le numéro OF
- le numéro de commande
- la référence pièce
- la désignation pièce
- la quantité
- la priorité
- la localisation actuelle
- l’étape à réaliser
- la prochaine étape
- les consommables nécessaires
- l’outillage nécessaire
- le temps prévu
- le statut

Elles doivent aussi permettre à l’opérateur de renseigner :
- heure de début
- heure de fin
- temps réel passé
- quantité réalisée
- quantité bloquée
- statut final
- observation / retour d’expérience
- anomalie éventuelle

---

## Observations opérateurs / REX
Prévoir une partie “Observation / Retour d’expérience opérateur”.

Cette partie doit permettre de saisir :
- type d’observation
- niveau d’importance
- commentaire libre
- OF concerné
- référence concernée

Types d’observation possibles :
- Anomalie
- Amélioration
- Information
- Retard
- Manque consommable
- Outillage
- Qualité

---

## Stock
Créer une page Stock centrale.

Mais afficher aussi des blocs stock locaux dans les pages concernées.

Exemples :
- Préparation : bouchons, adhésifs, masquage, gants, chiffons
- Accroche : crochets, balancelles, outillages
- Peinture : poudre, solvants, consommables peinture
- Qualité : équipements de contrôle
- Logistique : stock global, commandes, livraisons

---

## Indicateurs
Les indicateurs globaux doivent être dans la page Manager.

Chaque page métier doit aussi avoir ses propres indicateurs locaux :
- OF en attente
- OF en cours
- OF terminés
- tâches terminées
- retards
- temps prévu vs temps réel
- anomalies
- alertes stock
- charge opérateur

---

## Design attendu
L’interface doit être :
- professionnelle
- moderne
- claire
- adaptée à un atelier
- facile à comprendre pour des non-informaticiens
- responsive

Style recommandé :
- barre latérale fixe
- cartes avec bords arrondis
- tableaux lisibles
- badges de statut
- alertes visuelles
- boutons grands et lisibles
- couleurs sobres : bleu foncé, gris clair, blanc
- touches orange pour urgence
- vert pour terminé
- rouge pour blocage ou alerte critique

---

## Travail avec Codex et GitHub
Le projet est modifié avec Codex puis vérifié avec GitHub.

Codex doit donc :
- avancer étape par étape
- éviter les modifications massives non demandées
- garder le rendu vérifiable après chaque modification
- résumer chaque modification à la fin
- indiquer les fichiers modifiés
- indiquer rapidement comment vérifier le résultat
