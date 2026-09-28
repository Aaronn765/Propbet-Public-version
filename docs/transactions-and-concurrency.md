# Transactions, concurrency, and idempotency

## The race to prevent

Suppose an account has 100 units available and two requests each try to reserve 70 units. If both read the balance before either writes, both can pass a naive balance check. The account ends up overspent or the ledger no longer matches the account projection.

## Transaction boundary

The reference command in <code>src/infrastructure/postgres/place-bet.mjs</code> uses one checked-out PostgreSQL client:

1. Begin a transaction.
2. Lock the account row with <code>SELECT ... FOR UPDATE</code>.
3. Look up the account-scoped idempotency key.
4. Validate account status and the current balance.
5. Insert the bet, update the balance projection, and append a ledger movement with a signed amount.
6. Commit; on any error, roll back.

Locking the account row serializes balance-changing requests for that account. It does not block unrelated accounts. The composite unique constraint on account and idempotency key remains a database-level invariant if a future path misses the application check.

## Retry behavior

A retry with the same key and the same stake returns the already-created bet. Reusing that key with a different stake is rejected as an idempotency conflict. A client retry therefore cannot create a second debit or silently change the original command.

The private application also uses transaction-scoped advisory locks for selected domain operations. This sample focuses on a row lock plus a unique constraint because they make the account-level invariant easy to inspect and test.

## Settlement corrections

External results can be revised after a bet has been settled. A correction is modeled as a new ledger movement for the difference between the corrected credit and the previously applied credit. The earlier entry remains available for audit. See [accounting formulas](accounting-and-curves.md).

The SQL example uses integer cents. It avoids binary floating-point arithmetic for balances; display formatting belongs at the presentation boundary.

For node-postgres, all statements within one transaction must use the same checked-out client. See the [node-postgres transaction guide](https://node-postgres.com/features/transactions).
