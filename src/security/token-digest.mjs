import { createHash } from 'node:crypto';

export function digestToken(token) {
  if (typeof token !== 'string' || token.length === 0) {
    throw new TypeError('A non-empty token is required');
  }
  return createHash('sha256').update(token, 'utf8').digest('hex');
}
