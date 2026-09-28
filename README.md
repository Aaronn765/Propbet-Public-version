# PropBet / Oddelyx — Sports Betting Prop Firm Platform

[![CI](https://github.com/Aaronn765/Propbet-Public-version/actions/workflows/ci.yml/badge.svg)](https://github.com/Aaronn765/Propbet-Public-version/actions/workflows/ci.yml)

PropBet is a full-stack **sports betting prop firm platform** inspired by the evaluation model used by proprietary trading firms.

Users enter a virtual evaluation challenge, receive a virtual bankroll and place sports bets while respecting predefined rules such as stake limits, minimum odds, drawdown limits and performance objectives.

The platform manages the lifecycle of an evaluation account: challenge activation, bet validation, transactional bet execution, sports-data synchronization, settlement, account progression and risk monitoring.

**Author:** TOUVOLI BALLO STEVE AARON · Software Engineering, JUNIA ISEN Lille  
**Production product:** [Oddelyx](https://oddelyx.com)

[Version française](README.fr.md)

## Product concept

PropBet adds an evaluation layer on top of sports betting.

A user receives a virtual account governed by a configurable ruleset. Every sensitive operation is validated server-side. The system tracks the account balance, performance, drawdown, betting limits and challenge status, then updates those metrics when sports results are settled.

The production platform supports a broader product scope than this public repository, including the user dashboard, sports markets, account workflows, result synchronization, payments and operational tooling.

## Main features

| Area | What the platform handles |
| --- | --- |
| Evaluation accounts | Virtual bankroll, challenge phases and account lifecycle |
| Rule engine | Stake limits, odds constraints, drawdown and account eligibility |
| Bet execution | Server-side validation and atomic bet placement |
| Sports markets | Match data, odds and multi-sport betting flows |
| Settlement | Result synchronization and account updates |
| Risk management | Balance, High Water Mark, drawdown and challenge monitoring |
| Ledger | Traceable balance movements and settlement corrections |
| Reliability | PostgreSQL transactions, row locking and idempotency |
| Data pipeline | Automated collection, matching, caching and synchronization |
| Security | Server-side validation, password derivation, token hashing and authenticated integrations |

## My contribution

I worked on the platform end to end: product flows, account and betting logic, backend services, PostgreSQL persistence and migrations, sports-data processing, integration boundaries, tests and operational tooling.

The production architecture combines **Next.js, Node.js, PostgreSQL and Python**.

Critical operations are designed around transactional guarantees. A bet cannot simply be "written to the database": the backend must validate the account, enforce the active rules, protect the balance from concurrent requests, record the operation and preserve an auditable financial history.

## Architecture

~~~mermaid
flowchart LR
  U[User] --> W[Next.js Web App]
  W --> API[Backend API]
  API --> R[Rule Engine]
  API --> B[Bet Service]
  API --> A[Account & Risk Service]

  R --> DB[(PostgreSQL)]
  B --> DB
  A --> DB

  J[Python / Node scheduled jobs] --> API
  D[Sports data & odds providers] --> J
~~~

The production system also contains scheduled jobs that collect sports events, map odds and results, build caches and trigger settlement workflows.

## Engineering highlights

### Transactional bet placement

Bet placement must remain correct when several requests reach the server at almost the same time.

The public implementation uses a PostgreSQL transaction and `SELECT ... FOR UPDATE` to serialize operations on the same account. This prevents two concurrent bets from spending the same available balance.

### Idempotency

Network retries and double clicks must not create duplicate bets.

Critical requests therefore use idempotency keys. Replaying the same request returns the existing operation instead of creating a second debit.

### Ledger and settlement corrections

Account movements are represented by ledger entries instead of relying only on a mutable balance. Revised outcomes can be handled through compensating entries, preserving the history of what happened.

### Risk rules

The production platform tracks account state and risk constraints such as balance, objectives, drawdown thresholds and betting limits. These rules are evaluated server-side so the browser is never the source of truth.

### Automated sports-data pipeline

The private platform includes scheduled Python and Node.js jobs for event collection, odds mapping, data enrichment, cache generation, result synchronization and settlement.

## What this public repository contains

The complete production application remains private.

This repository contains an independently written, runnable implementation of representative engineering problems from the platform:

- atomic bet placement with balance checks and row locking;
- PostgreSQL concurrency control;
- idempotent critical requests;
- append-only ledger concepts and settlement adjustments;
- account/equity calculations;
- live multiplier curve mathematics;
- password key derivation and HMAC authentication patterns;
- unit and PostgreSQL integration tests.

Production credentials, customer information, payment-provider details, proprietary parameters, live datasets and deployment secrets are intentionally excluded.

## Run the project

Requires Node.js 22 or later.

~~~bash
npm install
npm test
~~~

Run the PostgreSQL integration tests:

~~~bash
docker compose -f compose.test.yaml up -d --wait
~~~

Then set:

~~~text
DEMO_TEST_DATABASE_URL=postgres://demo@127.0.0.1:55432/propbet_demo
~~~

and run:

~~~bash
npm run test:postgres
~~~

The CI workflow runs both the unit tests and the PostgreSQL concurrency tests automatically.

## Technical documentation

- [Architecture and boundaries](docs/architecture.md)
- [Transactions, concurrency and idempotency](docs/transactions-and-concurrency.md)
- [Ledger, equity and settlement corrections](docs/accounting-and-curves.md)
- [H24 curve mathematics](docs/h24-curve.md)
- [Security and cryptography](docs/security.md)
- [Testing strategy](docs/testing.md)

## Technology

**Application:** Next.js, React, Node.js  
**Database:** PostgreSQL  
**Data processing:** Python  
**Infrastructure:** Docker, Linux  
**Testing:** Node.js Test Runner, PostgreSQL integration tests  
**Architecture:** Domain services, repositories and transactional workflows

## Public scope

This repository is a technical public edition, not a deployable copy of the production service. The code is intentionally isolated from private infrastructure and production data while preserving enough implementation detail to demonstrate the underlying software-engineering decisions.
