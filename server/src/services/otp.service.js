const crypto = require('crypto');

// In-memory test store strictly for automated test suites
const testOtpStore = new Map();

/**
 * Generates a cryptographically secure 6-digit numeric OTP.
 * Range: 100000 - 999999
 */
const generateOtp = () => {
  return crypto.randomInt(100000, 1000000).toString();
};

/**
 * Hashes an OTP token using SHA-256 for secure database persistence.
 * Plaintext OTP is NEVER stored in database.
 * @param {string} otp
 * @returns {string} hex-encoded SHA-256 digest
 */
const hashOtp = (otp) => {
  return crypto.createHash('sha256').update(otp.trim()).digest('hex');
};

/**
 * Compares an incoming plain OTP against the stored SHA-256 hash.
 * @param {string} plainOtp
 * @param {string} storedHash
 * @returns {boolean}
 */
const verifyOtpHash = (plainOtp, storedHash) => {
  if (!plainOtp || !storedHash) return false;
  const incomingHash = hashOtp(plainOtp);
  // Constant-time comparison to prevent timing side-channels
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
 * Records generated OTP strictly for automated test assertions in test environment.
 * NEVER leaks in production or logs.
 */
const recordTestOtp = (email, otp) => {
  if (process.env.NODE_ENV === 'test' && email) {
    testOtpStore.set(email.toLowerCase().trim(), otp);
  }
};

/**
 * Helper for automated testing only.
 */
const __getTestOtp = (email) => {
  return testOtpStore.get(email.toLowerCase().trim()) || null;
};

module.exports = {
  generateOtp,
  hashOtp,
  verifyOtpHash,
  recordTestOtp,
  __getTestOtp,
};
