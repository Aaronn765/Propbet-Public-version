import test from 'node:test';
import assert from 'node:assert/strict';
import { buildEquityCurve } from '../../src/domain/equity-curve.mjs';
import { calculateSettlementAdjustment } from '../../src/domain/settlement-adjustment.mjs';

test('ledger movements build a balance and high-water curve in time order', () => {
  const points = buildEquityCurve(10_000, [
    { at: '2026-01-03T00:00:00.000Z', amountCents: -2_000 },
    { at: '2026-01-02T00:00:00.000Z', amountCents: 1_000 },
  ]);

  assert.deepEqual(points.map((point) => point.balanceCents), [10_000, 11_000, 9_000]);
  assert.deepEqual(points.map((point) => point.highWaterMarkCents), [10_000, 11_000, 11_000]);
  assert.deepEqual(points.map((point) => point.drawdownCents), [0, 0, 2_000]);
  assert.equal(points.at(-1).drawdownPercent, 2_000 / 11_000 * 100);
});

test('negative balances and zero ledger movements are rejected', () => {
  assert.throws(
    () => buildEquityCurve(500, [{ at: '2026-01-01T00:00:00Z', amountCents: -501 }]),
    /does not allow a negative balance/,
  );
  assert.throws(
    () => buildEquityCurve(500, [{ at: '2026-01-01T00:00:00Z', amountCents: 0 }]),
    /cannot be zero/,
  );
});

test('settlement corrections append only the difference', () => {
  assert.equal(calculateSettlementAdjustment(8_400, 2_100), -6_300);
  assert.equal(calculateSettlementAdjustment(2_100, 8_400), 6_300);
  assert.equal(calculateSettlementAdjustment(2_100, 2_100), 0);
});
