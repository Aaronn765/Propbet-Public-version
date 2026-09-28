# Ledger and account curve

The original service keeps account metrics alongside ledger entries. The public example makes the accounting model explicit using synthetic values.

## Balance from the ledger

Let the starting balance be B0 and each ledger movement be a signed integer number of cents, ai. After entry n:

~~~text
B(n) = B0 + Σ ai, for i = 1..n
~~~

A stake is a negative movement. A payout or correction can be positive or negative. Each movement stores the resulting balance so an audit can compare the running projection with a recomputation from the ledger.

## High-water mark and drawdown

For an account curve with balance B(n), the high-water mark and drawdown are:

~~~text
H(n) = max(H(n - 1), B(n))
D(n) = H(n) - B(n)
drawdown_percent(n) = 100 × D(n) / H(n), when H(n) > 0
~~~

The code in <code>src/domain/equity-curve.mjs</code> applies these formulas to a synthetic ledger. It does not encode any private challenge thresholds or program rules.

## Correcting a prior settlement

If the previously credited payout is Pold and the corrected payout is Pnew, the compensating movement is:

~~~text
adjustment = Pnew - Pold
~~~

For example, changing a credited payout from 8,400 cents to 2,100 cents produces a new movement of -6,300 cents. The historical 8,400-cent entry is retained. Production policy must also decide how a negative correction interacts with later account activity; that policy is intentionally outside this small example.
