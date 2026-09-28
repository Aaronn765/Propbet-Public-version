-- Standalone demonstration schema. Use only in a disposable database.
CREATE TABLE IF NOT EXISTS demo_accounts (
  account_id TEXT PRIMARY KEY,
  status TEXT NOT NULL CHECK (status IN ('active', 'suspended')),
  balance_cents BIGINT NOT NULL CHECK (balance_cents >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS demo_bets (
  bet_id UUID PRIMARY KEY,
  account_id TEXT NOT NULL REFERENCES demo_accounts(account_id) ON DELETE CASCADE,
  idempotency_key TEXT NOT NULL,
  stake_cents BIGINT NOT NULL CHECK (stake_cents > 0),
  status TEXT NOT NULL CHECK (status IN ('accepted', 'settled', 'voided')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (account_id, idempotency_key)
);

CREATE TABLE IF NOT EXISTS demo_ledger_entries (
  entry_id UUID PRIMARY KEY,
  account_id TEXT NOT NULL REFERENCES demo_accounts(account_id) ON DELETE CASCADE,
  bet_id UUID NOT NULL REFERENCES demo_bets(bet_id) ON DELETE CASCADE,
  entry_type TEXT NOT NULL CHECK (entry_type IN ('stake_debit', 'payout_credit', 'settlement_adjustment')),
  amount_cents BIGINT NOT NULL CHECK (amount_cents <> 0),
  balance_after_cents BIGINT NOT NULL CHECK (balance_after_cents >= 0),
  idempotency_key TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
