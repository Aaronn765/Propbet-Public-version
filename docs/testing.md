# Verification strategy

The private codebase has separate unit, HTTP integration, browser-automation, and Python test suites. This public repository contains a focused subset rewritten around synthetic data.

## Unit tests

~~~sh
npm test
~~~

Unit tests cover exact curve anchors, forward/inverse consistency, equity and drawdown calculations, settlement correction deltas, password derivation, and HMAC validation.

## PostgreSQL concurrency test

The integration suite verifies two invariants against PostgreSQL:

- Concurrent requests cannot spend more than the locked account balance.
- A retry using the same idempotency key cannot create a second bet or ledger debit.

Run it only against the isolated container from <code>compose.test.yaml</code>. That container binds to loopback, stores its data in temporary storage, and uses trust authentication only for this disposable local instance. Do not change the test URL to a shared, staging, or production database.

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

The test inserts uniquely generated sample accounts and removes those accounts afterward. It creates only the three demo tables in the selected database. The suite is skipped if <code>DEMO_TEST_DATABASE_URL</code> is unset.
