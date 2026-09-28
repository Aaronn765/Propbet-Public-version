import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { randomUUID } from 'node:crypto';
import { Pool } from 'pg';
import {
  IdempotencyConflictError,
  InsufficientBalanceError,
  placeBet,
} from '../../src/infrastructure/postgres/place-bet.mjs';

const connectionString = process.env.DEMO_TEST_DATABASE_URL;

test('PostgreSQL serializes account debits and makes retries idempotent', {
  skip: !connectionString,
}, async () => {
  const pool = new Pool({ connectionString, max: 8 });
  const accountIds = [randomUUID(), randomUUID()];

  try {
    const schema = await readFile(new URL('../../db/schema.sql', import.meta.url), 'utf8');
    await pool.query(schema);
    await pool.query(
      'INSERT INTO demo_accounts (account_id, status, balance_cents) VALUES ' +
      '($1, $3, $4), ($2, $3, $4)',
      [accountIds[0], accountIds[1], 'active', 10_000],
    );

    const competing = await Promise.allSettled([
      placeBet(pool, {
        accountId: accountIds[0],
        idempotencyKey: 'request-a',
        stakeCents: 7_000,
      }),
      placeBet(pool, {
        accountId: accountIds[0],
        idempotencyKey: 'request-b',
        stakeCents: 7_000,
      }),
    ]);
    const accepted = competing.filter((result) => result.status === 'fulfilled');
    const rejected = competing.filter((result) => result.status === 'rejected');
    assert.equal(accepted.length, 1);
    assert.equal(rejected.length, 1);
    assert.ok(rejected[0].reason instanceof InsufficientBalanceError);

    const balanceAfterRace = await pool.query(
      'SELECT balance_cents FROM demo_accounts WHERE account_id = $1',
      [accountIds[0]],
    );
    assert.equal(Number(balanceAfterRace.rows[0].balance_cents), 3_000);

    const [original, retry] = await Promise.all([
      placeBet(pool, {
        accountId: accountIds[1],
        idempotencyKey: 'same-request',
        stakeCents: 2_000,
      }),
      placeBet(pool, {
        accountId: accountIds[1],
        idempotencyKey: 'same-request',
        stakeCents: 2_000,
      }),
    ]);
    assert.equal(original.betId, retry.betId);
    assert.equal([original.replayed, retry.replayed].filter(Boolean).length, 1);

    await assert.rejects(
      placeBet(pool, {
        accountId: accountIds[1],
        idempotencyKey: 'same-request',
        stakeCents: 3_000,
      }),
      IdempotencyConflictError,
    );

    const counts = await pool.query(
      'SELECT ' +
      '(SELECT count(*) FROM demo_bets WHERE account_id = $1)::int AS bets, ' +
      '(SELECT count(*) FROM demo_ledger_entries WHERE account_id = $1)::int AS entries',
      [accountIds[1]],
    );
    assert.equal(counts.rows[0].bets, 1);
    assert.equal(counts.rows[0].entries, 1);
  } finally {
    await pool.query(
      'DELETE FROM demo_accounts WHERE account_id = ANY($1::text[])',
      [accountIds],
    ).catch(() => {});
    await pool.end();
  }
});
