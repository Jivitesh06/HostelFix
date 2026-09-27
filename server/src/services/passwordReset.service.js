const crypto = require('crypto');

// In-memory test stores strictly for automated test suites in test environment
const testResetOtpStore = new Map();
const testVerificationTokenStore = new Map();

const RESET_OTP_EXPIRY_MINUTES = 10;
const RESET_SESSION_EXPIRY_MINUTES = 10;
const RESET_COOLDOWN_MS = 60 * 1000; // 60 seconds rate-limit cooldown
const MAX_VERIFICATION_ATTEMPTS = 5;

/**
 * Generates a cryptographically secure 6-digit numeric OTP using crypto.randomInt.
 * @returns {string} 6-digit string (100000 - 999999)
 */
const generateResetOtp = () => {
  return crypto.randomInt(100000, 1000000).toString();
};

/**
 * Hashes an OTP using SHA-256 for database persistence.
 * Plaintext OTP is NEVER stored in database.
 * @param {string} otp
 * @returns {string} hex-encoded SHA-256 digest
 */
const hashResetOtp = (otp) => {
  if (!otp || typeof otp !== 'string') return '';
  return crypto.createHash('sha256').update(otp.trim()).digest('hex');
};

/**
 * Constant-time comparison of incoming plain OTP against stored SHA-256 hash.
 * @param {string} plainOtp
 * @param {string} storedHash
 * @returns {boolean}
 */
const verifyResetOtpHash = (plainOtp, storedHash) => {
  if (!plainOtp || !storedHash) return false;
  const incomingHash = hashResetOtp(plainOtp);
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
 * Generates a cryptographically secure random verification session token.
 * Issued after OTP verification to prove to /reset-password that OTP succeeded.
 * @returns {string} 64-char hex string
 */
const generateVerificationToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

/**
 * Hashes a verification token using SHA-256.
 * @param {string} token
 * @returns {string}
 */
const hashVerificationToken = (token) => {
  if (!token || typeof token !== 'string') return '';
  return crypto.createHash('sha256').update(token.trim()).digest('hex');
};

/**
 * Constant-time comparison of verification token against stored hash.
 * @param {string} plainToken
 * @param {string} storedHash
 * @returns {boolean}
 */
const verifyVerificationTokenHash = (plainToken, storedHash) => {
  if (!plainToken || !storedHash) return false;
  const incomingHash = hashVerificationToken(plainToken);
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
 * Records generated reset OTP strictly for automated test assertions in test environment.
 * NEVER leaks in production or logs.
 */
const recordTestResetOtp = (email, otp) => {
  if (process.env.NODE_ENV === 'test' && email) {
    testResetOtpStore.set(email.toLowerCase().trim(), otp);
  }
};

/**
 * Helper for automated testing only.
 */
const __getTestResetOtp = (email) => {
  return testResetOtpStore.get(email.toLowerCase().trim()) || null;
};

/**
 * Records generated verification token strictly for automated test assertions in test environment.
 */
const recordTestVerificationToken = (email, token) => {
  if (process.env.NODE_ENV === 'test' && email) {
    testVerificationTokenStore.set(email.toLowerCase().trim(), token);
  }
};

/**
 * Helper for automated testing only.
 */
const __getTestVerificationToken = (email) => {
  return testVerificationTokenStore.get(email.toLowerCase().trim()) || null;
};

module.exports = {
  RESET_OTP_EXPIRY_MINUTES,
  RESET_SESSION_EXPIRY_MINUTES,
  RESET_COOLDOWN_MS,
  MAX_VERIFICATION_ATTEMPTS,
  generateResetOtp,
  hashResetOtp,
  verifyResetOtpHash,
  generateVerificationToken,
  hashVerificationToken,
  verifyVerificationTokenHash,
  recordTestResetOtp,
  __getTestResetOtp,
  recordTestVerificationToken,
  __getTestVerificationToken,
};

