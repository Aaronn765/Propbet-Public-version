import test from 'node:test';
import assert from 'node:assert/strict';
import { hashPassword, verifyPassword } from '../../src/security/password-kdf.mjs';
import { signMessage, verifyMessage } from '../../src/security/hmac.mjs';
import { digestToken } from '../../src/security/token-digest.mjs';

test('password hashes use a fresh salt and verify without storing the password', async () => {
  const first = await hashPassword('synthetic-test-password');
  const second = await hashPassword('synthetic-test-password');
  assert.notEqual(first, second);
  assert.equal(await verifyPassword('synthetic-test-password', first), true);
  assert.equal(await verifyPassword('incorrect-password', first), false);
  assert.equal(await verifyPassword('synthetic-test-password', 'invalid'), false);
});

test('HMAC accepts a valid message and rejects changed content or malformed digests', () => {
  const secret = 'local-disposable-test-key';
  const message = 'method=POST&path=/demo&body=sample';
  const signature = signMessage(secret, message);
  assert.equal(verifyMessage(secret, message, signature), true);
  assert.equal(verifyMessage(secret, message + '&changed=1', signature), false);
  assert.equal(verifyMessage(secret, message, '00'), false);
  assert.throws(() => signMessage('', message), /secret is required/);
});

test('token digests are stable and do not return the raw token', () => {
  const digest = digestToken('synthetic-one-time-token');
  assert.equal(digest, digestToken('synthetic-one-time-token'));
  assert.notEqual(digest, 'synthetic-one-time-token');
  assert.throws(() => digestToken(''), /token is required/);
});
