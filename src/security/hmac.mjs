import { createHmac, timingSafeEqual } from 'node:crypto';

function validateInputs(secret, message) {
  if (typeof secret !== 'string' || secret.length === 0) {
    throw new TypeError('A signing secret is required');
  }
  if (typeof message !== 'string') {
    throw new TypeError('The signed message must be a string');
  }
}

export function signMessage(secret, message) {
  validateInputs(secret, message);
  return createHmac('sha256', secret).update(message, 'utf8').digest('hex');
}

export function verifyMessage(secret, message, signatureHex) {
  validateInputs(secret, message);
  if (typeof signatureHex !== 'string' || !/^[a-f0-9]{64}$/i.test(signatureHex)) {
    return false;
  }
  const expected = createHmac('sha256', secret).update(message, 'utf8').digest();
  const received = Buffer.from(signatureHex, 'hex');
  return timingSafeEqual(expected, received);
}
