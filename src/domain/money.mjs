export function assertSafeCents(value, label = 'amountCents') {
  if (!Number.isSafeInteger(value)) {
    throw new TypeError(label + ' must be a safe integer number of cents');
  }
  return value;
}

export function assertPositiveCents(value, label = 'amountCents') {
  assertSafeCents(value, label);
  if (value <= 0) {
    throw new RangeError(label + ' must be greater than zero');
  }
  return value;
}

export function assertNonNegativeCents(value, label = 'amountCents') {
  assertSafeCents(value, label);
  if (value < 0) {
    throw new RangeError(label + ' must not be negative');
  }
  return value;
}
