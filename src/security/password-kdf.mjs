import {
  randomBytes,
  scrypt,
  timingSafeEqual,
} from 'node:crypto';

const COST = 32_768;
const BLOCK_SIZE = 8;
const PARALLELISM = 1;
const KEY_LENGTH = 64;
const SALT_LENGTH = 16;
const MAX_MEMORY = 64 * 1024 * 1024;

function derive(password, salt) {
  return new Promise((resolve, reject) => {
    scrypt(
      password,
      salt,
      KEY_LENGTH,
      { N: COST, r: BLOCK_SIZE, p: PARALLELISM, maxmem: MAX_MEMORY },
      (error, key) => {
        if (error) reject(error);
        else resolve(key);
      },
    );
  });
}

export async function hashPassword(password) {
  if (typeof password !== 'string' || password.length === 0) {
    throw new TypeError('A non-empty password is required');
  }
  const salt = randomBytes(SALT_LENGTH);
  const key = await derive(password, salt);
  return [
    'scrypt',
    COST,
    BLOCK_SIZE,
    PARALLELISM,
    salt.toString('base64url'),
    key.toString('base64url'),
  ].join('$');
}

export async function verifyPassword(password, encoded) {
  if (typeof password !== 'string' || typeof encoded !== 'string') return false;
  const parts = encoded.split('$');
  if (parts.length !== 6 || parts[0] !== 'scrypt'
    || Number(parts[1]) !== COST
    || Number(parts[2]) !== BLOCK_SIZE
    || Number(parts[3]) !== PARALLELISM) {
    return false;
  }

  const salt = Buffer.from(parts[4], 'base64url');
  const expected = Buffer.from(parts[5], 'base64url');
  if (salt.length !== SALT_LENGTH || expected.length !== KEY_LENGTH) return false;

  const actual = await derive(password, salt);
  return timingSafeEqual(expected, actual);
}
