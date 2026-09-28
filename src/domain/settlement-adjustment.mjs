import { assertNonNegativeCents } from './money.mjs';

export function calculateSettlementAdjustment(previousPayoutCents, correctedPayoutCents) {
  assertNonNegativeCents(previousPayoutCents, 'previousPayoutCents');
  assertNonNegativeCents(correctedPayoutCents, 'correctedPayoutCents');
  return correctedPayoutCents - previousPayoutCents;
}
