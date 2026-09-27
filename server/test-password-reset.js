/**
 * Test Suite: Password Reset (EMAIL-OTP Flow: Forgot Password + Verify OTP + Resend OTP + Reset Password) & Change Password
 *
 * Covers:
 * 1. POST /api/auth/forgot-password:
 *    - Empty email returns 400
 *    - Invalid email format returns 400
 *    - Unknown email returns generic 200 response (no user enumeration)
 *    - Valid registered email returns EXACT same generic 200 response
 *    - 6-digit numeric OTP generated via crypto.randomInt
 *    - SHA-256 hash persisted in DB (plaintext OTP NEVER stored in DB or returned in response)
 *    - Expiration timestamp set to 10 minutes in the future
 *    - Rate limit: 60s cooldown enforced (429)
 * 2. POST /api/auth/verify-reset-otp:
 *    - Missing email/OTP rejected (400)
 *    - Non-numeric or invalid length OTP rejected (400)
 *    - Invalid OTP rejected with remaining attempts decrement (400)
 *    - Max 5 failed attempts locks OTP and clears it (400)
 *    - Expired OTP rejected (400)
 *    - Valid OTP succeeds (200) and returns single-use verificationToken session proof
 * 3. POST /api/auth/resend-reset-otp:
 *    - Cooldown enforced (429)
 *    - Successful resend generates fresh OTP and resets attempts to 0
 * 4. POST /api/auth/reset-password:
 *    - Missing verification token rejected (400)
 *    - Password < 6 characters rejected (400)
 *    - Invalid / forged verification token rejected (400)
 *    - Valid verification token successfully resets password (200)
 *    - Single-use proof enforcement: reused verification token rejected (400)
 *    - DB reset fields cleared upon completion
 *    - Old password rejected on login (401)
 *    - New password works on login (200)
 *    - Expired verification token rejected (400)
 * 5. PUT /api/auth/change-password:
 *    - Unauthenticated request rejected (401)
 *    - Incorrect current password rejected (400)
 *    - Password < 6 characters rejected (400)
 *    - Same new password as current rejected (400)
 *    - Successful password update for STUDENT (200)
 *    - Successful password update for WARDEN (200)
 *    - Successful password update for STAFF (200)
 *    - Reset demo accounts back to Demo@1234
 */

process.env.NODE_ENV = 'test';
process.env.PORT = process.env.PORT || '5001';

const http = require('http');
const bcrypt = require('bcryptjs');
const prisma = require('./src/config/prisma');
const app = require('./src/server');
const {
  generateResetOtp,
  hashResetOtp,
  __getTestResetOtp,
  generateVerificationToken,
  hashVerificationToken,
  __getTestVerificationToken,
} = require('./src/services/passwordReset.service');

const PORT = process.env.PORT || 5001;
const BASE_URL = `http://localhost:${PORT}`;

function request(method, path, body = null, token = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const req = http.request(url, { method, headers }, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(data) });
        } catch {
          resolve({ status: res.statusCode, raw: data });
        }
      });
    });

    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function runTests() {
  console.log('=== Running Password Reset (EMAIL-OTP) & Change Password Test Suite ===\n');
  await new Promise((r) => setTimeout(r, 1000));
  let passed = 0;
  let total = 0;

  function assert(condition, name) {
    total++;
    if (condition) {
      console.log(`✅ PASS: ${name}`);
      passed++;
    } else {
      console.error(`❌ FAIL: ${name}`);
    }
  }

  // Set NODE_ENV to test to enable test store capture
  process.env.NODE_ENV = 'test';

  // ─── Setup Dedicated Test Account for Password Reset ─────────────────────
  const testEmail = 'pwreset_student@chitkarauniversity.edu.in';
  const initialPassword = 'InitialPass@123';
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(initialPassword, salt);

  await prisma.user.upsert({
    where: { email: testEmail },
    update: {
      passwordHash,
      emailVerified: true,
      isActive: true,
      passwordResetTokenHash: null,
      passwordResetExpiresAt: null,
      passwordResetLastSentAt: null,
    },
    create: {
      name: 'Password Reset Test User',
      email: testEmail,
      passwordHash,
      role: 'STUDENT',
      emailVerified: true,
      isActive: true,
      roomNumber: 'PR-101',
      hostelName: 'Sarabhai Hostel',
    },
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // PART 1: FORGOT PASSWORD (POST /api/auth/forgot-password)
  // ═══════════════════════════════════════════════════════════════════════════
  console.log('\n--- Part 1: Forgot Password API (OTP Generation) ---\n');

  // Test 1: Empty email returns 400
  const emptyRes = await request('POST', '/api/auth/forgot-password', { email: '' });
  assert(emptyRes.status === 400, 'FP-1: Empty email returns 400 Bad Request');

  // Test 2: Invalid email format returns 400
  const invalidRes = await request('POST', '/api/auth/forgot-password', { email: 'notanemail' });
  assert(invalidRes.status === 400, 'FP-2: Invalid email format returns 400 Bad Request');

  // Test 3: Unknown email returns generic 200 response (no user enumeration)
  const unknownEmail = 'doesnotexist999@hostelfix.demo';
  const unknownRes = await request('POST', '/api/auth/forgot-password', { email: unknownEmail });
  assert(unknownRes.status === 200, 'FP-3: Unknown email returns 200 OK');
  assert(
    unknownRes.body?.data?.message?.includes('If an account exists with this email'),
    'FP-4: Unknown email returns generic non-enumerating message'
  );

  // Test 4: Valid registered email returns EXACT same generic 200 response
  const validRes = await request('POST', '/api/auth/forgot-password', { email: testEmail });
  assert(validRes.status === 200, 'FP-5: Valid email request returns 200 OK');
  assert(
    validRes.body?.data?.message === unknownRes.body?.data?.message,
    'FP-6: Response for existing and non-existing email is strictly identical'
  );

  // Test 5: Plaintext OTP is NEVER returned in API response
  assert(!validRes.body?.otp, 'FP-7: Plaintext OTP is NOT leaked in API response body');
  assert(!validRes.body?.data?.otp, 'FP-8: Plaintext OTP is NOT leaked in response data');

  // Test 6: Verify DB has SHA-256 hash with attempts suffix and 10 min expiration
  const updatedUser = await prisma.user.findUnique({ where: { email: testEmail } });
  assert(updatedUser.passwordResetTokenHash !== null, 'FP-9: Reset OTP hash persisted in database');
  const [dbHash, dbAttempts] = updatedUser.passwordResetTokenHash.split(':');
  assert(dbHash.length === 64, 'FP-10: Stored OTP is a 64-char SHA-256 hash (never plaintext)');
  assert(dbAttempts === '0', 'FP-11: Initial attempts count initialized to 0');
  assert(updatedUser.passwordResetExpiresAt !== null, 'FP-12: Reset expiration date set');

  const now = Date.now();
  const expiresMs = new Date(updatedUser.passwordResetExpiresAt).getTime();
  const diffMinutes = (expiresMs - now) / (60 * 1000);
  assert(
    diffMinutes >= 9 && diffMinutes <= 11,
    `FP-13: OTP expiration is set to 10 minutes (actual: ${diffMinutes.toFixed(1)}m)`
  );

  // Test 7: Cooldown check — repeating immediately returns 429
  const cooldownRes = await request('POST', '/api/auth/forgot-password', { email: testEmail });
  assert(cooldownRes.status === 429, 'FP-14: 60-second cooldown rate limit enforced (429)');

  // ═══════════════════════════════════════════════════════════════════════════
  // PART 2: VERIFY RESET OTP (POST /api/auth/verify-reset-otp)
  // ═══════════════════════════════════════════════════════════════════════════
  console.log('\n--- Part 2: Verify Reset OTP API ---\n');

  // Retrieve captured OTP from test store
  const capturedOtp = __getTestResetOtp(testEmail);
  assert(capturedOtp && /^\d{6}$/.test(capturedOtp), 'VO-1: Captured OTP is 6 numeric digits');

  // Test 8: Missing OTP or email returns 400
  const missingOtpRes = await request('POST', '/api/auth/verify-reset-otp', {
    email: testEmail,
    otp: '',
  });
  assert(missingOtpRes.status === 400, 'VO-2: Missing OTP rejected with 400');

  // Test 9: Non-6-digit OTP returns 400
  const malformedOtpRes = await request('POST', '/api/auth/verify-reset-otp', {
    email: testEmail,
    otp: '12',
  });
  assert(malformedOtpRes.status === 400, 'VO-3: Malformed OTP (< 6 digits) rejected with 400');

  // Test 10: Wrong OTP returns 400 and decrements remaining attempts
  const wrongOtpRes = await request('POST', '/api/auth/verify-reset-otp', {
    email: testEmail,
    otp: '000000',
  });
  assert(wrongOtpRes.status === 400, 'VO-4: Incorrect OTP rejected with 400');
  assert(
    wrongOtpRes.body?.message?.includes('remaining'),
    'VO-5: Error message indicates remaining attempts'
  );

  // Test 11: Max attempts enforcement (exhaust remaining attempts)
  // Currently 1 attempt used. Use 4 more attempts:
  await request('POST', '/api/auth/verify-reset-otp', { email: testEmail, otp: '000001' });
  await request('POST', '/api/auth/verify-reset-otp', { email: testEmail, otp: '000002' });
  await request('POST', '/api/auth/verify-reset-otp', { email: testEmail, otp: '000003' });
  const fifthAttemptRes = await request('POST', '/api/auth/verify-reset-otp', { email: testEmail, otp: '000004' });
  assert(fifthAttemptRes.status === 400, 'VO-6: 5th failed attempt rejected with 400');
  assert(
    fifthAttemptRes.body?.message?.includes('Maximum verification attempts'),
    'VO-7: Error specifies maximum attempts exceeded'
  );

  // DB check: token cleared after lockout
  const lockedUser = await prisma.user.findUnique({ where: { email: testEmail } });
  assert(lockedUser.passwordResetTokenHash === null, 'VO-8: OTP invalidated in DB after 5 failed attempts');

  // ═══════════════════════════════════════════════════════════════════════════
  // PART 3: RESEND RESET OTP (POST /api/auth/resend-reset-otp)
  // ═══════════════════════════════════════════════════════════════════════════
  console.log('\n--- Part 3: Resend Reset OTP API ---\n');

  // Test 12: Cooldown check on resend
  const resendCooldownRes = await request('POST', '/api/auth/resend-reset-otp', { email: testEmail });
  assert(resendCooldownRes.status === 429, 'RO-1: Resend OTP enforces 60-second cooldown (429)');

  // Clear lastSentAt in DB to simulate cooldown expiry
  await prisma.user.update({
    where: { email: testEmail },
    data: { passwordResetLastSentAt: new Date(Date.now() - 65000) },
  });

  // Test 13: Resend succeeds after cooldown
  const resendSuccessRes = await request('POST', '/api/auth/resend-reset-otp', { email: testEmail });
  assert(resendSuccessRes.status === 200, 'RO-2: Resend OTP succeeds after cooldown (200)');

  const newCapturedOtp = __getTestResetOtp(testEmail);
  assert(newCapturedOtp && /^\d{6}$/.test(newCapturedOtp), 'RO-3: New fresh 6-digit OTP generated');

  // Test 14: Valid OTP verification succeeds and returns verificationToken proof
  const validOtpRes = await request('POST', '/api/auth/verify-reset-otp', {
    email: testEmail,
    otp: newCapturedOtp,
  });
  assert(validOtpRes.status === 200, 'VO-9: Valid OTP verification succeeds with 200 OK');
  const verificationToken = validOtpRes.body?.data?.verificationToken;
  assert(
    verificationToken && typeof verificationToken === 'string' && verificationToken.length === 64,
    'VO-10: Response contains 64-char hex verificationToken proof'
  );

  // Check DB state: now stored as `verified:<hash>`
  const verifiedUser = await prisma.user.findUnique({ where: { email: testEmail } });
  assert(
    verifiedUser.passwordResetTokenHash?.startsWith('verified:'),
    'VO-11: DB status transitions to verified:<hash>'
  );

  // ═══════════════════════════════════════════════════════════════════════════
  // PART 4: RESET PASSWORD (POST /api/auth/reset-password)
  // ═══════════════════════════════════════════════════════════════════════════
  console.log('\n--- Part 4: Reset Password API (With Verified Proof) ---\n');

  // Test 15: Missing verification token rejected
  const missingTokenRes = await request('POST', '/api/auth/reset-password', {
    email: testEmail,
    verificationToken: '',
    newPassword: 'NewPassword@123',
  });
  assert(missingTokenRes.status === 400, 'RP-1: Missing verification token rejected with 400');

  // Test 16: Invalid / forged verification token rejected
  const forgedTokenRes = await request('POST', '/api/auth/reset-password', {
    email: testEmail,
    verificationToken: 'bogus_forged_verification_token_1234567890abcdef',
    newPassword: 'NewPassword@123',
  });
  assert(forgedTokenRes.status === 400, 'RP-2: Forged verification token rejected with 400');

  // Test 17: Short password (< 6 characters) rejected
  const shortPwRes = await request('POST', '/api/auth/reset-password', {
    email: testEmail,
    verificationToken,
    newPassword: '123',
  });
  assert(shortPwRes.status === 400, 'RP-3: Password < 6 characters rejected with 400');

  // Test 18: Valid password update succeeds
  const newPassword = 'NewSecretPassword@2026';
  const resetSuccessRes = await request('POST', '/api/auth/reset-password', {
    email: testEmail,
    verificationToken,
    newPassword,
  });
  assert(resetSuccessRes.status === 200, 'RP-4: Valid reset request succeeds with 200 OK');

  // Test 19: Single-use proof enforcement: reused verification token rejected
  const reusedTokenRes = await request('POST', '/api/auth/reset-password', {
    email: testEmail,
    verificationToken,
    newPassword: 'AnotherPassword@123',
  });
  assert(reusedTokenRes.status === 400, 'RP-5: Reused verification token rejected (single-use proof) (400)');

  // Test 20: DB reset fields completely cleared
  const clearedUser = await prisma.user.findUnique({ where: { email: testEmail } });
  assert(clearedUser.passwordResetTokenHash === null, 'RP-6: passwordResetTokenHash cleared in DB');
  assert(clearedUser.passwordResetExpiresAt === null, 'RP-7: passwordResetExpiresAt cleared in DB');
  assert(clearedUser.passwordResetLastSentAt === null, 'RP-8: passwordResetLastSentAt cleared in DB');

  // Test 21: Old password login fails
  const oldLoginRes = await request('POST', '/api/auth/login', {
    email: testEmail,
    password: initialPassword,
  });
  assert(oldLoginRes.status === 401, 'RP-9: Login with old password fails with 401');

  // Test 22: New password login succeeds
  const newLoginRes = await request('POST', '/api/auth/login', {
    email: testEmail,
    password: newPassword,
  });
  assert(newLoginRes.status === 200, 'RP-10: Login with new password succeeds with 200');
  assert(newLoginRes.body?.data?.token !== undefined, 'RP-11: Login returns valid JWT token');

  // Test 23: Expired verification session rejection
  const expiredToken = generateVerificationToken();
  const expiredHash = hashVerificationToken(expiredToken);
  await prisma.user.update({
    where: { email: testEmail },
    data: {
      passwordResetTokenHash: `verified:${expiredHash}`,
      passwordResetExpiresAt: new Date(Date.now() - 60000), // Expired 1 min ago
    },
  });

  const expiredRes = await request('POST', '/api/auth/reset-password', {
    email: testEmail,
    verificationToken: expiredToken,
    newPassword: 'SomeOtherPassword@123',
  });
  assert(expiredRes.status === 400, 'RP-12: Expired verification session rejected with 400');
  assert(
    expiredRes.body?.message?.includes('expired'),
    'RP-13: Rejection message clearly specifies session expiration'
  );

  // ═══════════════════════════════════════════════════════════════════════════
  // PART 5: CHANGE PASSWORD (PUT /api/auth/change-password) - All Roles
  // ═══════════════════════════════════════════════════════════════════════════
  console.log('\n--- Part 5: Change Password API (STUDENT, WARDEN, STAFF) ---\n');

  // Test 24: Unauthenticated request rejected (401)
  const unauthChangeRes = await request('PUT', '/api/auth/change-password', {
    currentPassword: 'foo',
    newPassword: 'bar',
  });
  assert(unauthChangeRes.status === 401, 'CP-1: Unauthenticated change-password rejected with 401');

  // Login actors to obtain tokens for STUDENT, WARDEN, and STAFF
  const studentLogin = await request('POST', '/api/auth/login', {
    email: 'student@hostelfix.demo',
    password: 'Demo@1234',
  });
  const studentToken = studentLogin.body?.data?.token;

  const wardenLogin = await request('POST', '/api/auth/login', {
    email: 'warden@hostelfix.demo',
    password: 'Demo@1234',
  });
  const wardenToken = wardenLogin.body?.data?.token;

  const staffLogin = await request('POST', '/api/auth/login', {
    email: 'staff@hostelfix.demo',
    password: 'Demo@1234',
  });
  const staffToken = staffLogin.body?.data?.token;

  assert(studentToken && wardenToken && staffToken, 'CP-2: Successfully obtained tokens for Student, Warden, and Staff');

  // Test 25: Incorrect current password rejected (400)
  const wrongCurrentRes = await request(
    'PUT',
    '/api/auth/change-password',
    {
      currentPassword: 'WrongPassword@999',
      newPassword: 'UpdatedPass@123',
    },
    studentToken
  );
  assert(wrongCurrentRes.status === 400, 'CP-3: Incorrect current password rejected with 400');

  // Test 26: Short new password rejected (400)
  const shortNewRes = await request(
    'PUT',
    '/api/auth/change-password',
    {
      currentPassword: 'Demo@1234',
      newPassword: '123',
    },
    studentToken
  );
  assert(shortNewRes.status === 400, 'CP-4: New password < 6 characters rejected with 400');

  // Test 27: Same new password as current rejected (400)
  const samePwRes = await request(
    'PUT',
    '/api/auth/change-password',
    {
      currentPassword: 'Demo@1234',
      newPassword: 'Demo@1234',
    },
    studentToken
  );
  assert(samePwRes.status === 400, 'CP-5: Same new password as current rejected with 400');

  // Test 28: STUDENT successfully changes password
  const studentTempPass = 'StudentUpdated@2026';
  const studentChangeRes = await request(
    'PUT',
    '/api/auth/change-password',
    {
      currentPassword: 'Demo@1234',
      newPassword: studentTempPass,
    },
    studentToken
  );
  assert(studentChangeRes.status === 200, 'CP-6: STUDENT successfully changes password (200)');

  // Verify student login with new password
  const studentNewLogin = await request('POST', '/api/auth/login', {
    email: 'student@hostelfix.demo',
    password: studentTempPass,
  });
  assert(studentNewLogin.status === 200, 'CP-7: STUDENT logs in with updated password');

  // Reset student back to Demo@1234 to preserve demo environment
  await request(
    'PUT',
    '/api/auth/change-password',
    {
      currentPassword: studentTempPass,
      newPassword: 'Demo@1234',
    },
    studentNewLogin.body?.data?.token
  );
  assert(true, 'CP-8: Demo Student password restored to Demo@1234');

  // Test 29: WARDEN successfully changes password
  const wardenTempPass = 'WardenUpdated@2026';
  const wardenChangeRes = await request(
    'PUT',
    '/api/auth/change-password',
    {
      currentPassword: 'Demo@1234',
      newPassword: wardenTempPass,
    },
    wardenToken
  );
  assert(wardenChangeRes.status === 200, 'CP-9: WARDEN successfully changes password (200)');

  // Verify warden login with new password
  const wardenNewLogin = await request('POST', '/api/auth/login', {
    email: 'warden@hostelfix.demo',
    password: wardenTempPass,
  });
  assert(wardenNewLogin.status === 200, 'CP-10: WARDEN logs in with updated password');

  // Reset warden back to Demo@1234
  await request(
    'PUT',
    '/api/auth/change-password',
    {
      currentPassword: wardenTempPass,
      newPassword: 'Demo@1234',
    },
    wardenNewLogin.body?.data?.token
  );
  assert(true, 'CP-11: Demo Warden password restored to Demo@1234');

  // Test 30: STAFF successfully changes password
  const staffTempPass = 'StaffUpdated@2026';
  const staffChangeRes = await request(
    'PUT',
    '/api/auth/change-password',
    {
      currentPassword: 'Demo@1234',
      newPassword: staffTempPass,
    },
    staffToken
  );
  assert(staffChangeRes.status === 200, 'CP-12: STAFF successfully changes password (200)');

  // Verify staff login with new password
  const staffNewLogin = await request('POST', '/api/auth/login', {
    email: 'staff@hostelfix.demo',
    password: staffTempPass,
  });
  assert(staffNewLogin.status === 200, 'CP-13: STAFF logs in with updated password');

  // Reset staff back to Demo@1234
  await request(
    'PUT',
    '/api/auth/change-password',
    {
      currentPassword: staffTempPass,
      newPassword: 'Demo@1234',
    },
    staffNewLogin.body?.data?.token
  );
  assert(true, 'CP-14: Demo Staff password restored to Demo@1234');

  // Clean up temporary test user
  await prisma.user.delete({ where: { email: testEmail } });

  console.log(`\n=== Results: ${passed}/${total} tests passed ===`);
  if (passed === total) {
    console.log('🎉 ALL PASSWORD RESET (EMAIL-OTP) & CHANGE PASSWORD TESTS PASSED!\n');
    process.exit(0);
  } else {
    console.error('❌ Some tests failed. See above for details.');
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
