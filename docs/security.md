# Security and cryptography

## What the source audit verified

- Passwords are processed with Node.js <code>scrypt</code> and a random salt, then checked with a constant-time byte comparison.
- Selected session, verification, and reset tokens are stored as SHA-256 digests so the raw token is not needed for lookup.
- HMAC is used to authenticate selected integration messages; digest comparison is constant-time.

These are different controls. A password KDF derives a one-way verifier. A SHA-256 digest fingerprints a token. HMAC authenticates a message when both sides share a secret. None is encryption, and none proves that the database volume or application fields are encrypted at rest.

## Safe public example

<code>src/security/password-kdf.mjs</code> demonstrates a versioned scrypt encoding with a fresh random salt. <code>src/security/hmac.mjs</code> demonstrates HMAC-SHA-256 and rejects malformed digest lengths before using <code>timingSafeEqual</code>. The values in tests are disposable fixtures.

The live request canonicalization, provider signatures, credentials, rotation process, endpoints, and operational secrets are not included. A production HMAC protocol must define an unambiguous canonical message and protect its key outside source control.

## Scope

This repository is a learning and portfolio artifact, not a security review or production authentication package. It does not claim that the private application encrypts user fields or the database at rest. Review the [Node.js crypto API](https://nodejs.org/api/crypto.html) before adapting these examples.
