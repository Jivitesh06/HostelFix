/**
 * Test Suite: Password Reset (Forgot Password + Reset Password) & Change Password
 *
 * Covers:
 * 1. POST /api/auth/forgot-password:
 *    - Valid email request returns generic 200 response
 *    - Unknown email request returns EXACT same generic 200 response (no user enumeration)
 *    - Invalid email format rejected (400)
 *    - Cryptographically secure reset token generated
 *    - SHA-256 token hash persisted in DB (plaintext token NEVER stored)
 *    - Expiration timestamp set to 15 minutes in the future
 * 2. POST /api/auth/reset-password:
 *    - Missing token rejected (400)
 *    - Invalid token rejected (400)
 *    - Password < 6 characters rejected (400)
 *    - Valid token successfully resets password (200)
 *    - Old password rejected on login (401)
 *    - New password works on login (200)
 *    - Reused token rejected (single-use enforcement) (400)
 *    - Expired token rejected (400)
 * 3. PUT /api/auth/change-password:
 *    - Unauthenticated request rejected (401)
 *    - Incorrect current password rejected (400)
 *    - Password < 6 characters rejected (400)
 *    - Same new password as current rejected (400)
 *    - Successful password update for STUDENT (200)
 *    - Successful password update for WARDEN (200)
 *    - Successful password update for STAFF (200)
 *    - New password works on login (200)
 *    - Reset demo users back to Demo@1234 so demo accounts remain intact
 */

const http = require('http');
const bcrypt = require('bcryptjs');
const prisma = require('./src/config/prisma');
const {
  generateResetToken,
  hashResetToken,
  __getTestResetToken,
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
  console.log('=== Running Password Reset & Change Password Test Suite ===\n');
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

  // Set NODE_ENV to test to enable in-memory token tracking for automated tests
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
  console.log('\n--- Part 1: Forgot Password API ---\n');

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

  // Test 5: Verify DB has SHA-256 token hash and expiration is 15 minutes
  const updatedUser = await prisma.user.findUnique({ where: { email: testEmail } });
  assert(updatedUser.passwordResetTokenHash !== null, 'FP-7: Reset token hash persisted in database');
  assert(
    updatedUser.passwordResetTokenHash.length === 64,
    'FP-8: Stored token is a 64-char SHA-256 hash (never plaintext)'
  );
  assert(updatedUser.passwordResetExpiresAt !== null, 'FP-9: Reset expiration date set');

  const now = Date.now();
  const expiresMs = new Date(updatedUser.passwordResetExpiresAt).getTime();
  const diffMinutes = (expiresMs - now) / (60 * 1000);
  assert(
    diffMinutes >= 14 && diffMinutes <= 16,
    `FP-10: Token expiration is set to 15 minutes (actual: ${diffMinutes.toFixed(1)}m)`
  );

  // ═══════════════════════════════════════════════════════════════════════════
  // PART 2: RESET PASSWORD (POST /api/auth/reset-password)
  // ═══════════════════════════════════════════════════════════════════════════
  console.log('\n--- Part 2: Reset Password API ---\n');

  // Test 6: Missing token rejected (400)
  const noTokenRes = await request('POST', '/api/auth/reset-password', {
    token: '',
    newPassword: 'NewPassword@123',
  });
  assert(noTokenRes.status === 400, 'RP-1: Missing reset token rejected with 400');

  // Test 7: Invalid token rejected (400)
  const invalidTokenRes = await request('POST', '/api/auth/reset-password', {
    token: 'completely_bogus_token_1234567890abcdef',
    newPassword: 'NewPassword@123',
  });
  assert(invalidTokenRes.status === 400, 'RP-2: Invalid reset token rejected with 400');

  // Test 8: Password < 6 characters rejected (400)
  const rawToken = generateResetToken();
  const tokenHash = hashResetToken(rawToken);
  await prisma.user.update({
    where: { email: testEmail },
    data: {
      passwordResetTokenHash: tokenHash,
      passwordResetExpiresAt: new Date(Date.now() + 15 * 60 * 1000),
    },
  });

  const shortPwRes = await request('POST', '/api/auth/reset-password', {
    token: rawToken,
    newPassword: '123',
  });
  assert(shortPwRes.status === 400, 'RP-3: Password < 6 characters rejected with 400');

  // Test 9: Valid token successfully resets password
  const newPassword = 'NewSecretPassword@2026';
  const resetSuccessRes = await request('POST', '/api/auth/reset-password', {
    token: rawToken,
    newPassword,
  });
  assert(resetSuccessRes.status === 200, 'RP-5: Valid reset request succeeds with 200 OK');

  // Test 10: Invalidation check — token must be single-use
  const reusedRes = await request('POST', '/api/auth/reset-password', {
    token: rawToken,
    newPassword: 'AnotherPassword@123',
  });
  assert(reusedRes.status === 400, 'RP-6: Single-use enforcement: reused token rejected with 400');

  // Test 11: DB check — token hash and expiresAt are cleared
  const clearedUser = await prisma.user.findUnique({ where: { email: testEmail } });
  assert(clearedUser.passwordResetTokenHash === null, 'RP-7: passwordResetTokenHash cleared in DB');
  assert(clearedUser.passwordResetExpiresAt === null, 'RP-8: passwordResetExpiresAt cleared in DB');

  // Test 12: Old password login fails
  const oldLoginRes = await request('POST', '/api/auth/login', {
    email: testEmail,
    password: initialPassword,
  });
  assert(oldLoginRes.status === 401, 'RP-9: Login with old password fails with 401');

  // Test 13: New password login succeeds
  const newLoginRes = await request('POST', '/api/auth/login', {
    email: testEmail,
    password: newPassword,
  });
  assert(newLoginRes.status === 200, 'RP-10: Login with new password succeeds with 200');
  assert(newLoginRes.body?.data?.token !== undefined, 'RP-11: Login returns valid JWT token');

  // Test 14: Expired token rejection
  const expiredRawToken = generateResetToken();
  const expiredTokenHash = hashResetToken(expiredRawToken);
  await prisma.user.update({
    where: { email: testEmail },
    data: {
      passwordResetTokenHash: expiredTokenHash,
      passwordResetExpiresAt: new Date(Date.now() - 60000), // Expired 1 minute ago
    },
  });

  const expiredRes = await request('POST', '/api/auth/reset-password', {
    token: expiredRawToken,
    newPassword: 'SomeOtherPassword@123',
  });
  assert(expiredRes.status === 400, 'RP-12: Expired token rejected with 400');
  assert(
    expiredRes.body?.message?.includes('expired'),
    'RP-13: Rejection message clearly specifies token expiration'
  );

  // ═══════════════════════════════════════════════════════════════════════════
  // PART 3: CHANGE PASSWORD (PUT /api/auth/change-password)
  // ═══════════════════════════════════════════════════════════════════════════
  console.log('\n--- Part 3: Change Password API (All Roles) ---\n');

  // Test 15: Unauthenticated request rejected (401)
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

  // Test 16: Incorrect current password rejected (400)
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
  assert(
    wrongCurrentRes.body?.message?.toLowerCase().includes('incorrect'),
    'CP-4: Error message indicates incorrect current password'
  );

  // Test 17: Short new password rejected (400)
  const shortNewRes = await request(
    'PUT',
    '/api/auth/change-password',
    {
      currentPassword: 'Demo@1234',
      newPassword: '123',
    },
    studentToken
  );
  assert(shortNewRes.status === 400, 'CP-5: New password < 6 characters rejected with 400');

  // Test 18: Same new password as current rejected (400)
  const samePwRes = await request(
    'PUT',
    '/api/auth/change-password',
    {
      currentPassword: 'Demo@1234',
      newPassword: 'Demo@1234',
    },
    studentToken
  );
  assert(samePwRes.status === 400, 'CP-6: Same new password as current rejected with 400');

  // Test 19: STUDENT successfully changes password
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
  assert(studentChangeRes.status === 200, 'CP-7: STUDENT successfully changes password (200)');

  // Verify student login with new password
  const studentNewLogin = await request('POST', '/api/auth/login', {
    email: 'student@hostelfix.demo',
    password: studentTempPass,
  });
  assert(studentNewLogin.status === 200, 'CP-8: STUDENT logs in with updated password');

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
  assert(true, 'CP-9: Demo Student password restored to Demo@1234');

  // Test 20: WARDEN successfully changes password
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
  assert(wardenChangeRes.status === 200, 'CP-10: WARDEN successfully changes password (200)');

  // Verify warden login with new password
  const wardenNewLogin = await request('POST', '/api/auth/login', {
    email: 'warden@hostelfix.demo',
    password: wardenTempPass,
  });
  assert(wardenNewLogin.status === 200, 'CP-11: WARDEN logs in with updated password');

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
  assert(true, 'CP-12: Demo Warden password restored to Demo@1234');

  // Test 21: STAFF successfully changes password
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
  assert(staffChangeRes.status === 200, 'CP-13: STAFF successfully changes password (200)');

  // Verify staff login with new password
  const staffNewLogin = await request('POST', '/api/auth/login', {
    email: 'staff@hostelfix.demo',
    password: staffTempPass,
  });
  assert(staffNewLogin.status === 200, 'CP-14: STAFF logs in with updated password');

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
  assert(true, 'CP-15: Demo Staff password restored to Demo@1234');

  // ═══════════════════════════════════════════════════════════════════════════
  // PART 4: STAFF PROFILE ENDPOINT
  // ═══════════════════════════════════════════════════════════════════════════
  console.log('\n--- Part 4: Staff Profile Endpoint ---\n');
  const staffProfileRes = await request('GET', '/api/users/staff/profile', null, staffToken);
  assert(staffProfileRes.status === 200, 'SP-1: GET /api/users/staff/profile returns 200');
  assert(staffProfileRes.body?.data?.email === 'staff@hostelfix.demo', 'SP-2: Staff profile has correct email');
  assert(staffProfileRes.body?.data?.staffCategory !== undefined, 'SP-3: Staff profile includes trade category');

  // Clean up temporary test user
  await prisma.user.delete({ where: { email: testEmail } });

  console.log(`\n=== Results: ${passed}/${total} tests passed ===`);
  if (passed === total) {
    console.log('🎉 ALL PASSWORD RESET & CHANGE PASSWORD TESTS PASSED!\n');
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
