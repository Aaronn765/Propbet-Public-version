// These invented anchors are only for the public demonstration.
export const DEMO_CURVE_ANCHORS = Object.freeze([
  Object.freeze({ elapsedMs: 0, multiplier: 1 }),
  Object.freeze({ elapsedMs: 10_000, multiplier: 1.6 }),
  Object.freeze({ elapsedMs: 30_000, multiplier: 4 }),
  Object.freeze({ elapsedMs: 60_000, multiplier: 12 }),
]);

function validateAnchors(anchors) {
  if (!Array.isArray(anchors) || anchors.length < 2) {
    throw new TypeError('At least two curve anchors are required');
  }

  for (let index = 0; index < anchors.length; index += 1) {
    const point = anchors[index];
    if (!Number.isFinite(point?.elapsedMs) || point.elapsedMs < 0
      || !Number.isFinite(point?.multiplier) || point.multiplier <= 0) {
      throw new TypeError('Curve anchors must contain finite, positive values');
    }
    if (index > 0) {
      const previous = anchors[index - 1];
      if (point.elapsedMs <= previous.elapsedMs || point.multiplier <= previous.multiplier) {
        throw new RangeError('Curve anchors must increase in both time and multiplier');
      }
    }
  }
}

export function multiplierAtElapsedMs(elapsedMs, anchors = DEMO_CURVE_ANCHORS) {
  validateAnchors(anchors);
  const elapsedValue = Number(elapsedMs);
  const elapsed = Number.isFinite(elapsedValue) ? Math.max(0, elapsedValue) : 0;
  const first = anchors[0];
  if (elapsed <= first.elapsedMs) return first.multiplier;

  for (let index = 0; index < anchors.length - 1; index += 1) {
    const left = anchors[index];
    const right = anchors[index + 1];
    if (elapsed === right.elapsedMs) return right.multiplier;
    if (elapsed < right.elapsedMs) {
      const progress = (elapsed - left.elapsedMs) / (right.elapsedMs - left.elapsedMs);
      return left.multiplier * Math.exp(
        Math.log(right.multiplier / left.multiplier) * progress,
      );
    }
  }

  return anchors[anchors.length - 1].multiplier;
}

export function elapsedAtMultiplier(multiplier, anchors = DEMO_CURVE_ANCHORS) {
  validateAnchors(anchors);
  const target = Number(multiplier);
  if (!Number.isFinite(target)) {
    throw new TypeError('Target multiplier must be finite');
  }

  const first = anchors[0];
  if (target <= first.multiplier) return first.elapsedMs;

  for (let index = 0; index < anchors.length - 1; index += 1) {
    const left = anchors[index];
    const right = anchors[index + 1];
    if (target <= right.multiplier) {
      const progress = Math.log(target / left.multiplier)
        / Math.log(right.multiplier / left.multiplier);
      return left.elapsedMs + progress * (right.elapsedMs - left.elapsedMs);
    }
  }

  return anchors[anchors.length - 1].elapsedMs;
}
