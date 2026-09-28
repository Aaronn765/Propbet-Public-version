import { assertNonNegativeCents, assertSafeCents } from './money.mjs';

export function buildEquityCurve(initialBalanceCents, ledgerEntries) {
  assertNonNegativeCents(initialBalanceCents, 'initialBalanceCents');
  if (!Array.isArray(ledgerEntries)) {
    throw new TypeError('ledgerEntries must be an array');
  }

  const orderedEntries = ledgerEntries.map((entry, index) => {
    if (!entry || typeof entry.at !== 'string' || !Number.isFinite(Date.parse(entry.at))) {
      throw new TypeError('Each ledger entry must have a valid ISO date');
    }
    assertSafeCents(entry.amountCents, 'entry.amountCents');
    if (entry.amountCents === 0) {
      throw new RangeError('Ledger movements cannot be zero');
    }
    return { entry, index, timestamp: Date.parse(entry.at) };
  }).sort((left, right) => left.timestamp - right.timestamp || left.index - right.index);

  let balanceCents = initialBalanceCents;
  let highWaterMarkCents = initialBalanceCents;
  const points = [{
    at: null,
    balanceCents,
    highWaterMarkCents,
    drawdownCents: 0,
    drawdownPercent: 0,
  }];

  for (const { entry } of orderedEntries) {
    balanceCents += entry.amountCents;
    assertSafeCents(balanceCents, 'balanceCents');
    if (balanceCents < 0) {
      throw new RangeError('This demonstration does not allow a negative balance');
    }
    highWaterMarkCents = Math.max(highWaterMarkCents, balanceCents);
    const drawdownCents = highWaterMarkCents - balanceCents;
    points.push({
      at: new Date(entry.at).toISOString(),
      balanceCents,
      highWaterMarkCents,
      drawdownCents,
      drawdownPercent: highWaterMarkCents === 0
        ? 0
        : (drawdownCents / highWaterMarkCents) * 100,
    });
  }

  return points;
}
