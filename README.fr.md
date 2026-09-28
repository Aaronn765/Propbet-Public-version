# PropBet / Oddelyx — Prop firm de paris sportifs

[![CI](https://github.com/Aaronn765/Propbet-Public-version/actions/workflows/ci.yml/badge.svg)](https://github.com/Aaronn765/Propbet-Public-version/actions/workflows/ci.yml)

PropBet est une plateforme full-stack de **prop firm appliquée aux paris sportifs**, inspirée du modèle d’évaluation utilisé par les prop firms de trading.

L’utilisateur participe à un challenge virtuel, reçoit un capital virtuel et place des paris tout en respectant des règles précises : limites de mise, cote minimale, drawdown et objectifs de performance.

La plateforme gère le cycle de vie complet d’un compte d’évaluation : activation du challenge, validation des paris, exécution transactionnelle, synchronisation des données sportives, règlement des résultats, progression du compte et contrôle du risque.

**Auteur :** TOUVOLI BALLO STEVE AARON · Génie logiciel, JUNIA ISEN Lille  
**Produit en production :** [Oddelyx](https://oddelyx.com)

[English version](README.md)

## Concept du produit

PropBet ajoute une logique d’évaluation aux paris sportifs.

Chaque utilisateur dispose d’un compte virtuel soumis à un ensemble de règles configurables. Les opérations sensibles sont contrôlées côté serveur. Le système suit le solde, la performance, le drawdown, les limites de mise et le statut du challenge, puis met ces informations à jour lors du règlement des événements sportifs.

La plateforme de production va plus loin que ce dépôt public : dashboard utilisateur, marchés sportifs, gestion des comptes, synchronisation des résultats, paiements et outils d’exploitation.

## Fonctionnalités principales

| Domaine | Ce que gère la plateforme |
| --- | --- |
| Comptes d’évaluation | Capital virtuel, phases de challenge et cycle de vie du compte |
| Moteur de règles | Limites de mise, contraintes de cote, drawdown et éligibilité |
| Exécution des paris | Validation serveur et placement atomique |
| Marchés sportifs | Matchs, cotes et parcours multi-sports |
| Settlement | Synchronisation des résultats et mise à jour des comptes |
| Gestion du risque | Solde, High Water Mark, drawdown et progression |
| Ledger | Historique traçable des mouvements et corrections |
| Fiabilité | Transactions PostgreSQL, verrouillage de lignes et idempotence |
| Pipeline de données | Collecte, mapping, cache et synchronisation automatisés |
| Sécurité | Validation serveur, dérivation de mots de passe et HMAC |

## Ma contribution

J’ai travaillé sur le produit de bout en bout : parcours métier, logique des comptes et des paris, services backend, persistance et migrations PostgreSQL, traitement des données sportives, intégrations, tests et outils d’exploitation.

L’architecture de production combine **Next.js, Node.js, PostgreSQL et Python**.

Les opérations critiques reposent sur des garanties transactionnelles. Placer un pari ne consiste pas simplement à ajouter une ligne en base : le backend doit vérifier le compte, appliquer les règles actives, protéger le solde contre les requêtes concurrentes, enregistrer l’opération et conserver un historique financier vérifiable.

## Architecture

~~~mermaid
flowchart LR
  U[Utilisateur] --> W[Application Next.js]
  W --> API[API Backend]
  API --> R[Moteur de règles]
  API --> B[Service de paris]
  API --> A[Compte & risque]

  R --> DB[(PostgreSQL)]
  B --> DB
  A --> DB

  J[Tâches Python / Node] --> API
  D[Données sportives & cotes] --> J
~~~

Le système de production comporte également des tâches planifiées qui collectent les événements sportifs, rapprochent les cotes et résultats, construisent les caches et déclenchent les règlements.

## Points techniques importants

### Placement transactionnel des paris

Le placement d’un pari doit rester correct lorsque plusieurs requêtes arrivent presque en même temps.

L’implémentation publique utilise une transaction PostgreSQL et `SELECT ... FOR UPDATE` afin de sérialiser les opérations sur un même compte. Deux paris concurrents ne peuvent donc pas dépenser le même solde disponible.

### Idempotence

Un retry réseau ou un double clic ne doit pas créer deux paris.

Les opérations critiques utilisent donc des clés d’idempotence. La répétition d’une même requête renvoie l’opération existante plutôt que de créer un second débit.

### Ledger et corrections

Les mouvements du compte sont représentés par des écritures de ledger plutôt que par un simple solde mutable. Une correction de résultat peut ainsi être représentée par une écriture compensatoire sans effacer l’historique.

### Gestion du risque

La plateforme suit notamment le solde, les objectifs, les seuils de drawdown et les limites de mise. Ces règles sont évaluées côté serveur : le navigateur n’est jamais la source de vérité.

### Pipeline sportif automatisé

La plateforme privée contient des tâches Python et Node.js pour la collecte des événements, le mapping des cotes, l’enrichissement des données, la construction des caches, la synchronisation des résultats et le settlement.

## Ce que contient ce dépôt public

L’application complète de production reste privée.

Ce dépôt contient une implémentation autonome et exécutable de plusieurs problèmes techniques représentatifs :

- placement atomique avec contrôle du solde et verrouillage de ligne ;
- gestion de la concurrence PostgreSQL ;
- idempotence des opérations critiques ;
- concepts de ledger et corrections de settlement ;
- calculs de compte et de courbe d’equity ;
- mathématiques de la courbe live ;
- dérivation de mots de passe et authentification HMAC ;
- tests unitaires et tests d’intégration PostgreSQL.

Les identifiants de production, données clients, détails des fournisseurs de paiement, paramètres propriétaires, données live et secrets de déploiement sont volontairement exclus.

## Lancer le projet

Node.js 22 ou plus récent est requis.

~~~bash
npm install
npm test
~~~

Pour les tests PostgreSQL :

~~~bash
docker compose -f compose.test.yaml up -d --wait
~~~

Configurer ensuite :

~~~text
DEMO_TEST_DATABASE_URL=postgres://demo@127.0.0.1:55432/propbet_demo
~~~

puis lancer :

~~~bash
npm run test:postgres
~~~

La CI exécute automatiquement les tests unitaires ainsi que les tests de concurrence PostgreSQL.

## Documentation technique

- [Architecture et frontières](docs/architecture.md)
- [Transactions, concurrence et idempotence](docs/transactions-and-concurrency.md)
- [Ledger, equity et corrections](docs/accounting-and-curves.md)
- [Mathématiques de la courbe H24](docs/h24-curve.md)
- [Sécurité et cryptographie](docs/security.md)
- [Stratégie de test](docs/testing.md)

## Technologies

**Application :** Next.js, React, Node.js  
**Base de données :** PostgreSQL  
**Traitement de données :** Python  
**Infrastructure :** Docker, Linux  
**Tests :** Node.js Test Runner, tests d’intégration PostgreSQL  
**Architecture :** services métier, repositories et workflows transactionnels

## Périmètre public

Ce dépôt est une édition technique publique et non une copie déployable du service de production. Le code est volontairement isolé de l’infrastructure privée et des données de production, tout en conservant assez de détails pour montrer les choix d’architecture et de génie logiciel.
