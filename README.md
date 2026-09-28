# PropBet Public version

An engineering case study derived from a private sports-trading platform built within ODX Technologies. This repository is a small, independently written reference implementation: it explains selected design problems and makes the safe parts executable without publishing the private application.

**Author:** TOUVOLI BALLO STEVE AARON · Software engineering, JUNIA ISEN Lille

[Version française](README.fr.md)

## What the platform does

The original product combines account lifecycle and risk rules, bet placement, settlement, payment flows, event-result synchronization, and live multiplier experiences. The backend is organized around domain services and PostgreSQL repositories; the web application and API use Next.js, with supporting Python jobs for data processing.


## My role and stack

My work on the project covered end-to-end engineering: product and account workflows, server-side domain logic, PostgreSQL persistence and migrations, integration boundaries, and test/operations tooling. The private codebase combines Next.js and Node.js for the web/API layer, PostgreSQL for transactional state, and Python for supporting data jobs. The public repository is a deliberate reimplementation of a few representative mechanisms, not a claim that this small sample is the whole product.

A technical reviewer can inspect how the balance check and debit share one database transaction, how retries are made safe, how revised outcomes preserve an audit trail, and how the live curve is interpolated without giving the browser authority over the result.
This public edition focuses on the engineering decisions behind a few critical paths:

- Atomic bet placement with balance checks, row locking, and idempotency.
- Append-only ledger entries and compensating entries for revised outcomes.
- A piecewise exponential curve with a matching inverse-time function.
- Password key derivation and HMAC request authentication, explained without credentials or provider-specific protocols.

## Architecture at a glance

~~~mermaid
flowchart LR
  C[Browser] --> W[Next.js pages and API]
  W --> D[Domain services]
  D --> R[PostgreSQL repositories]
  R --> P[(PostgreSQL)]
  J[Scheduled data jobs] --> D
  X[External providers] <--> A[Integration adapters]
  A <--> D
~~~

The production platform contains more flows than this public sample. The diagram is deliberately logical: it omits deployment coordinates, production endpoints, provider identities, and operational topology.

## Try the public examples

Requires Node.js 22 or later.

~~~sh
npm install
npm test
~~~

The curve example is a static page. From the repository root, run <code>python -m http.server 8000</code> and visit <code>http://localhost:8000/examples/curve-demo.html</code>. Its anchor values are synthetic.

The PostgreSQL concurrency test is opt-in and only targets the disposable local database defined in <code>compose.test.yaml</code>:

~~~sh
docker compose -f compose.test.yaml up -d --wait
~~~

PowerShell:

~~~powershell
$env:DEMO_TEST_DATABASE_URL = 'postgres://demo@127.0.0.1:55432/propbet_demo'
npm run test:postgres
Remove-Item Env:DEMO_TEST_DATABASE_URL
docker compose -f compose.test.yaml down
~~~

See [test notes](docs/testing.md) before pointing the test at a database. The integration test is skipped when the variable is absent.

## Technical notes

- [Architecture and boundaries](docs/architecture.md)
- [Transactions, concurrency, and idempotency](docs/transactions-and-concurrency.md)
- [Ledger, equity, and settlement correction formulas](docs/accounting-and-curves.md)
- [H24 curve interpolation](docs/h24-curve.md)
- [Security and cryptography](docs/security.md)
- [Verification strategy](docs/testing.md)

## Security scope

The private application uses <code>scrypt</code> for password derivation, SHA-256 digests for selected tokens, and HMAC signatures for authenticated integrations. Those mechanisms have different purposes: password derivation and token hashing are one-way operations; HMAC authenticates a message; none of them is field encryption.

This repository contains generic examples only. It does not contain private signing formats, production parameters for the live curve, production secrets, user or payment records, live event data, trained models, provider-specific endpoints, or deployment coordinates. No claim is made here about database-at-rest encryption.

## Provenance

The code in this repository is not copied from the private application's history and is not a deployable edition of that service. It is an isolated, tested teaching slice written to demonstrate the architecture and reasoning behind selected engineering problems. Production-specific business rules and integrations remain private.
