const crypto = require('crypto');

// In-memory test store strictly for automated test suites
const testResetTokenStore = new Map();

const RESET_TOKEN_EXPIRY_MINUTES = 15;
const RESET_COOLDOWN_MS = 60 * 1000; // 60 seconds rate-limit cooldown

/**
 * Generates a cryptographically secure random reset token.
 * 32 bytes -> 64 hex characters.
 * @returns {string}
 */
const generateResetToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

/**
 * Hashes a password reset token using SHA-256 for database persistence.
 * Plaintext token is NEVER stored in database.
 * @param {string} token
 * @returns {string} hex-encoded SHA-256 digest
 */
const hashResetToken = (token) => {
  if (!token || typeof token !== 'string') return '';
  return crypto.createHash('sha256').update(token.trim()).digest('hex');
};

/**
 * Constant-time comparison of incoming plain token against stored SHA-256 hash.
 * @param {string} plainToken
 * @param {string} storedHash
 * @returns {boolean}
 */
const verifyResetTokenHash = (plainToken, storedHash) => {
  if (!plainToken || !storedHash) return false;
  const incomingHash = hashResetToken(plainToken);
  try {
    return crypto.timingSafeEqual(
      Buffer.from(incomingHash, 'hex'),
      Buffer.from(storedHash, 'hex')
    );
  } catch (err) {
    return false;
  }
};

/**
 * Records generated reset token strictly for automated test assertions in test environment.
 * NEVER leaks in production or logs.
 */
const recordTestResetToken = (email, token) => {
  if (process.env.NODE_ENV === 'test' && email) {
    testResetTokenStore.set(email.toLowerCase().trim(), token);
  }
};

/**
 * Helper for automated testing only.
 */
const __getTestResetToken = (email) => {
  return testResetTokenStore.get(email.toLowerCase().trim()) || null;
};

module.exports = {
  RESET_TOKEN_EXPIRY_MINUTES,
  RESET_COOLDOWN_MS,
  generateResetToken,
  hashResetToken,
  verifyResetTokenHash,
  recordTestResetToken,
  __getTestResetToken,
};
