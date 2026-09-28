# Architecture boundaries

## Observed in the private project

The repository separates HTTP entry points, domain services, data repositories, and PostgreSQL schema changes. The bet placement path goes through a domain service, which applies business rules before writing the bet, account state, and ledger entry. Result synchronization has separate logic for initial settlement, reopening, and correction. A dedicated transaction helper centralizes commit, rollback, account row locking, and transaction-scoped advisory locking.

The wider system also includes user and admin workflows, payment adapters, sports-event ingestion, background jobs, and a live multiplier experience. This public repository does not mirror those modules or integrations.

## Public reference shape

~~~text
src/
  domain/                 Pure calculations and validation
  infrastructure/postgres/ Transaction-aware SQL command
  security/               Small generic cryptographic examples
db/                       Isolated demo schema
tests/unit/               Formula, ledger, and security tests
tests/integration/        Optional real PostgreSQL concurrency test
examples/                 Browser-only synthetic curve visualization
~~~

The example transaction is intentionally narrow: it demonstrates the critical write boundary without reproducing the application’s account rules, provider adapters, API routes, or operational jobs.

## Why separate these layers

- Domain calculations can be tested without a database or network.
- The SQL command receives a pool, acquires one client, and keeps every statement in the transaction on that same client.
- PostgreSQL constraints backstop application checks, especially for idempotency.
- Event corrections append a compensating ledger movement rather than erasing the previous accounting record.
- The browser curve is an illustration; server state remains authoritative for any live action.
