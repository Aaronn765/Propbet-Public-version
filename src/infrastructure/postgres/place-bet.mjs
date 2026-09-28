import { randomUUID } from 'node:crypto';
import { assertPositiveCents } from '../../domain/money.mjs';

export class AccountNotFoundError extends Error {
  constructor() {
    super('Account does not exist');
    this.name = 'AccountNotFoundError';
  }
}

export class AccountUnavailableError extends Error {
  constructor() {
    super('Account is not active');
    this.name = 'AccountUnavailableError';
  }
}

export class InsufficientBalanceError extends Error {
  constructor() {
    super('Stake exceeds the available balance');
    this.name = 'InsufficientBalanceError';
  }
}

export class IdempotencyConflictError extends Error {
  constructor() {
    super('Idempotency key was already used with a different stake');
    this.name = 'IdempotencyConflictError';
  }
}

function validateCommand({ accountId, idempotencyKey, stakeCents }) {
  if (typeof accountId !== 'string' || accountId.trim() === '') {
    throw new TypeError('accountId is required');
  }
  if (typeof idempotencyKey !== 'string'
    || idempotencyKey.length < 1 || idempotencyKey.length > 160) {
    throw new TypeError('idempotencyKey must contain 1 to 160 characters');
  }
  assertPositiveCents(stakeCents, 'stakeCents');
}

export async function placeBet(pool, command) {
  validateCommand(command);
  const { accountId, idempotencyKey, stakeCents } = command;
  const client = await pool.connect();
  let transactionOpen = false;

  try {
    await client.query('BEGIN');
    transactionOpen = true;

    const accountResult = await client.query(
      'SELECT account_id, status, balance_cents ' +
      'FROM demo_accounts WHERE account_id = $1 FOR UPDATE',
      [accountId],
    );
    const account = accountResult.rows[0];
    if (!account) throw new AccountNotFoundError();
    if (account.status !== 'active') throw new AccountUnavailableError();

    const existingResult = await client.query(
      'SELECT bet_id, stake_cents, status FROM demo_bets ' +
      'WHERE account_id = $1 AND idempotency_key = $2',
      [accountId, idempotencyKey],
    );
    const existing = existingResult.rows[0];

    if (existing) {
      if (Number(existing.stake_cents) !== stakeCents) {
        throw new IdempotencyConflictError();
      }
      await client.query('COMMIT');
      transactionOpen = false;
      return {
        betId: existing.bet_id,
        stakeCents,
        status: existing.status,
        replayed: true,
      };
    }

    const balanceCents = Number(account.balance_cents);
    if (!Number.isSafeInteger(balanceCents) || balanceCents < stakeCents) {
      throw new InsufficientBalanceError();
    }

    const betId = randomUUID();
    const entryId = randomUUID();
    const balanceAfterCents = balanceCents - stakeCents;

    await client.query(
      'INSERT INTO demo_bets ' +
      '(bet_id, account_id, idempotency_key, stake_cents, status) ' +
      'VALUES ($1, $2, $3, $4, $5)',
      [betId, accountId, idempotencyKey, stakeCents, 'accepted'],
    );
    await client.query(
      'UPDATE demo_accounts SET balance_cents = $2 WHERE account_id = $1',
      [accountId, balanceAfterCents],
    );
    await client.query(
      'INSERT INTO demo_ledger_entries ' +
      '(entry_id, account_id, bet_id, entry_type, amount_cents, ' +
      'balance_after_cents, idempotency_key) ' +
      'VALUES ($1, $2, $3, $4, $5, $6, $7)',
      [
        entryId,
        accountId,
        betId,
        'stake_debit',
        -stakeCents,
        balanceAfterCents,
        accountId + ':' + idempotencyKey + ':stake',
      ],
    );

    await client.query('COMMIT');
    transactionOpen = false;
    return { betId, stakeCents, status: 'accepted', replayed: false };
  } catch (error) {
    if (transactionOpen) {
      try {
        await client.query('ROLLBACK');
      } catch {
        // Preserve the original command failure.
      }
    }
    throw error;
  } finally {
    client.release();
  }
}
