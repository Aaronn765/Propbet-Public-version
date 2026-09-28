import test from 'node:test';
import assert from 'node:assert/strict';
import {
  DEMO_CURVE_ANCHORS,
  elapsedAtMultiplier,
  multiplierAtElapsedMs,
} from '../../src/domain/h24-curve.mjs';

test('forward interpolation passes through every synthetic anchor', () => {
  for (const point of DEMO_CURVE_ANCHORS) {
    assert.equal(multiplierAtElapsedMs(point.elapsedMs), point.multiplier);
  }
});

test('the middle of a segment is geometric, not arithmetic', () => {
  const actual = multiplierAtElapsedMs(5_000);
  assert.ok(Math.abs(actual - Math.sqrt(1.6)) < 1e-12);
  assert.notEqual(actual, 1.3);
});

test('forward and inverse functions agree inside the curve domain', () => {
  const multiplier = multiplierAtElapsedMs(22_000);
  assert.ok(Math.abs(elapsedAtMultiplier(multiplier) - 22_000) < 1e-8);
});

test('inputs clamp to the first and final anchors', () => {
  assert.equal(multiplierAtElapsedMs(-10), 1);
  assert.equal(multiplierAtElapsedMs(90_000), 12);
  assert.equal(elapsedAtMultiplier(0.5), 0);
  assert.equal(elapsedAtMultiplier(99), 60_000);
});

test('invalid anchor sets and inverse targets are rejected', () => {
  assert.throws(
    () => multiplierAtElapsedMs(1, [{ elapsedMs: 0, multiplier: 2 }]),
    /At least two curve anchors/,
  );
  assert.throws(() => elapsedAtMultiplier(Number.NaN), /must be finite/);
});
