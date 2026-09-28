# Propbet Public version

Étude de cas technique issue d’une plateforme privée de suivi sportif développée dans le cadre d’ODX Technologies. Ce dépôt est un exemple autonome, réécrit pour présenter certains choix d’architecture et rendre quelques mécanismes exécutables sans publier l’application privée.

**Auteur :** TOUVOLI BALLO STEVE AARON · Génie logiciel, JUNIA ISEN Lille

[English version](README.md)

## Ce que fait la plateforme

Le produit d’origine réunit la gestion du cycle de vie des comptes et des règles de risque, la prise de paris, leur règlement, des flux de paiement, la synchronisation des résultats et des expériences live à multiplicateur. Le backend s’appuie sur des services métier et des dépôts PostgreSQL ; l’application web et son API utilisent Next.js, avec des tâches Python pour le traitement de données.


## Mon rôle et la stack

Mon travail sur le projet a couvert l’ingénierie de bout en bout : parcours métier et comptes, logique serveur, persistance et migrations PostgreSQL, frontières d’intégration, tests et outils d’exploitation. Le code privé associe Next.js et Node.js pour le web et l’API, PostgreSQL pour l’état transactionnel et Python pour des tâches de traitement de données. Le dépôt public réimplémente quelques mécanismes représentatifs ; il ne prétend pas reproduire tout le produit.

Un recruteur technique peut examiner l’atomicité entre contrôle du solde et débit, la sûreté des répétitions de requêtes, la conservation de l’historique lors d’une correction et l’interpolation live sans donner au navigateur autorité sur le résultat.
Cette version publique se concentre sur quelques problèmes techniques représentatifs :

- Prise de pari atomique avec vérification du solde, verrou de ligne et idempotence.
- Écritures comptables append-only et écritures compensatoires après correction d’un résultat.
- Courbe exponentielle par segments et fonction inverse qui retrouve le temps associé à un multiplicateur.
- Dérivation de mots de passe et authentification de messages HMAC, expliquées sans identifiants ni protocole propre à un fournisseur.

## Architecture, en bref

~~~mermaid
flowchart LR
  C[Navigateur] --> W[Pages et API Next.js]
  W --> D[Services métier]
  D --> R[Dépôts PostgreSQL]
  R --> P[(PostgreSQL)]
  J[Tâches planifiées] --> D
  X[Fournisseurs externes] <--> A[Adaptateurs d'intégration]
  A <--> D
~~~

La plateforme réelle comporte d’autres parcours. Ce diagramme reste logique : il ne révèle ni coordonnées d’hébergement, ni points d’accès de production, ni identité de fournisseur, ni détails opérationnels.

## Lancer les exemples

Node.js 22 ou plus récent est requis.

~~~sh
npm install
npm test
~~~

La démonstration de courbe est une page statique. Depuis la racine du dépôt, lance <code>python -m http.server 8000</code>, puis visite <code>http://localhost:8000/examples/curve-demo.html</code>. Les valeurs d’ancrage sont fictives.

Le test PostgreSQL de concurrence est facultatif et vise uniquement la base locale jetable définie dans <code>compose.test.yaml</code> :

~~~sh
docker compose -f compose.test.yaml up -d --wait
~~~

PowerShell :

~~~powershell
$env:DEMO_TEST_DATABASE_URL = 'postgres://demo@127.0.0.1:55432/propbet_demo'
npm run test:postgres
Remove-Item Env:DEMO_TEST_DATABASE_URL
docker compose -f compose.test.yaml down
~~~

Lis les [notes de test](docs/testing.md) avant de choisir une base. Sans variable d’environnement, le test d’intégration est ignoré.

## Documentation technique

- [Architecture et frontières](docs/architecture.md)
- [Transactions, concurrence et idempotence](docs/transactions-and-concurrency.md)
- [Ledger, courbe de solde et corrections](docs/accounting-and-curves.md)
- [Interpolation de la courbe H24](docs/h24-curve.md)
- [Sécurité et cryptographie](docs/security.md)
- [Stratégie de vérification](docs/testing.md)

## Périmètre de sécurité

L’application privée utilise <code>scrypt</code> pour dériver les mots de passe, des empreintes SHA-256 pour certains jetons et des signatures HMAC pour authentifier des intégrations. Ces mécanismes n’ont pas le même rôle : la dérivation et l’empreinte sont unidirectionnelles ; HMAC authentifie un message ; aucun de ces mécanismes ne chiffre des champs.

Ce dépôt ne contient que des exemples génériques. Il exclut les formats de signature privés, les paramètres de production de la courbe live, les secrets, les données de comptes ou de paiements, les données sportives live, les modèles entraînés, les points d’accès propres aux fournisseurs et les coordonnées d’hébergement. Aucune affirmation n’est faite sur le chiffrement au repos de la base.

## Origine du dépôt

Le code présenté ici n’est pas copié de l’historique de l’application privée et ne constitue pas une version déployable du service. C’est un exemple isolé et testé, écrit pour expliquer quelques problèmes d’ingénierie et leurs solutions. Les règles métier et intégrations propres à la production restent privées.
