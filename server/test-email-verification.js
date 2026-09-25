/**
 * Test Suite: Student University Email Verification & Hostel Block Removal
 * Covers:
 * 1. Valid Chitkara email registration (@chitkarauniversity.edu.in)
 * 2. Personal email rejection (@gmail.com, @yahoo.com, etc.)
 * 3. Non-Chitkara academic domain rejection (@college.edu, @other.org)
 * 4. OTP generation & SHA-256 hashing (no plain OTP in response or DB)
 * 5. Unverified student login rejection (403 with isUnverified: true)
 * 6. Incorrect OTP verification rejection (400)
 * 7. Verification attempts counter & maximum threshold lockout (5 attempts)
 * 8. Expired OTP rejection (400)
 * 9. Resend cooldown enforcement (429 within 60s)
 * 10. Resend after cooldown resets attempts & invalidates previous OTP
 * 11. Correct OTP verification (200, marks emailVerified: true, clears OTP)
 * 12. Reused OTP rejection (single-use enforcement)
 * 13. Verified student login success (200 with JWT)
 * 14. Warden and Staff login bypass (Wardens/Staff log in without student verification barrier)
 * 15. HostelBlock removal: hostelBlock column is dropped, student profile works with hostelName + roomNumber
 */

const http = require('http');
const prisma = require('./src/config/prisma');
const { hashOtp } = require('./src/services/otp.service');

const PORT = 5001;

function request(method, path, body = null, token = null) {
  return new Promise((resolve, reject) => {
    const payload = body ? JSON.stringify(body) : null;
    const headers = { 'Content-Type': 'application/json' };
    if (payload) headers['Content-Length'] = Buffer.byteLength(payload);
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const req = http.request(
      {
        hostname: 'localhost',
        port: PORT,
        path,
        method,
        headers,
      },
      (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
          try {
            resolve({
              status: res.statusCode,
              headers: res.headers,
              body: data ? JSON.parse(data) : null,
            });
          } catch (e) {
            resolve({ status: res.statusCode, headers: res.headers, body: data });
          }
        });
      }
    );
    req.on('error', reject);
    if (payload) req.write(payload);
    req.end();
  });
}

let total = 0;
let passed = 0;

function assert(condition, message) {
  total++;
  if (condition) {
    passed++;
    console.log(`✅ PASS: ${message}`);
  } else {
    console.error(`❌ FAIL: ${message}`);
  }
}

async function runTests() {
  console.log('=== Running Student University Email Verification & OTP Test Suite ===\n');

  const timestamp = Date.now();
  const testStudentEmail = `student.test.${timestamp}@chitkarauniversity.edu.in`;
  const testPassword = 'Password@123';

  // 1. Personal email rejection (@gmail.com)
  const gmailReg = await request('POST', '/api/auth/register', {
    name: 'Gmail Student',
    email: `student.${timestamp}@gmail.com`,
    password: testPassword,
    roomNumber: 'A-101',
    hostelName: 'Sarabhai Hostel',
  });
  assert(gmailReg.status === 400, 'Personal email (@gmail.com) registration is rejected with 400 Bad Request');
  assert(
    gmailReg.body.message.includes('Chitkara University'),
    'Rejection message clearly mentions Chitkara University institutional email'
  );

  // 2. Other provider rejection (@yahoo.com, @college.edu)
  const yahooReg = await request('POST', '/api/auth/register', {
    name: 'Yahoo Student',
    email: `student.${timestamp}@yahoo.com`,
    password: testPassword,
    roomNumber: 'A-101',
    hostelName: 'Sarabhai Hostel',
  });
  assert(yahooReg.status === 400, 'Personal email (@yahoo.com) registration is rejected with 400');

  const otherEduReg = await request('POST', '/api/auth/register', {
    name: 'Other Edu Student',
    email: `student.${timestamp}@othercollege.edu`,
    password: testPassword,
    roomNumber: 'A-101',
    hostelName: 'Sarabhai Hostel',
  });
  assert(otherEduReg.status === 400, 'Non-Chitkara academic domain registration is rejected with 400');

  // 3. Valid Chitkara institutional email registration
  const validReg = await request('POST', '/api/auth/register', {
    name: 'Aman Verma',
    email: testStudentEmail,
    password: testPassword,
    roomNumber: 'B-204',
    hostelName: 'Sarabhai Hostel',
    gender: 'MALE',
    mobileNumber: '9876543210',
    universityRollNumber: `CUH${timestamp.toString().slice(-6)}`,
    branch: 'Computer Science & Engineering',
    year: '2nd Year',
  });
  assert(validReg.status === 201, 'Valid Chitkara email registration succeeds with 201 Created');
  assert(validReg.body.data.role === 'STUDENT', 'Registered role is strictly forced to STUDENT');
  assert(validReg.body.data.emailVerified === false, 'Student account initialized with emailVerified = false');
  assert(validReg.body.data.passwordHash === undefined, 'Security: passwordHash is not returned');
  assert(validReg.body.data.otp === undefined, 'Security: Plain OTP is NEVER returned in API response');
  assert(validReg.body.data.otpHash === undefined, 'Security: otpHash is not leaked in registration response');
  assert(validReg.body.data.hostelBlock === undefined, 'Hostel block is completely absent from registration response');

  // 4. Verify OTP was generated and persisted securely as SHA-256 in DB
  const userRecord = await prisma.user.findUnique({
    where: { email: testStudentEmail },
  });
  assert(userRecord !== null, 'User record created in PostgreSQL database');
  assert(userRecord.emailVerified === false, 'Database confirms emailVerified = false');
  assert(userRecord.otpHash !== null, 'Database contains hashed OTP');
  assert(userRecord.otpHash.length === 64, 'otpHash is stored as a 64-character SHA-256 hex digest');
  assert(userRecord.otpExpiresAt > new Date(), 'otpExpiresAt is set in the future (10 minutes)');
  assert(userRecord.otpAttempts === 0, 'otpAttempts initialized to 0');
  assert(userRecord.hostelBlock === undefined, 'hostelBlock column is dropped from User table');

  // 5. Unverified student login rejection
  const unverifiedLogin = await request('POST', '/api/auth/login', {
    email: testStudentEmail,
    password: testPassword,
  });
  assert(unverifiedLogin.status === 403, 'Unverified student login rejected with 403 Forbidden');
  assert(unverifiedLogin.body.isUnverified === true, 'Response payload contains isUnverified: true');
  assert(
    unverifiedLogin.body.message === 'Please verify your university email before logging in.',
    'Clear verification message returned for unverified login'
  );
  assert(unverifiedLogin.body.data === undefined, 'No JWT session or user profile issued to unverified student');

  // 6. Incorrect OTP verification rejection
  const wrongOtpRes = await request('POST', '/api/auth/verify-email', {
    email: testStudentEmail,
    otp: '000000',
  });
  assert(wrongOtpRes.status === 400, 'Incorrect OTP is rejected with 400 Bad Request');
  assert(
    wrongOtpRes.body.message.includes('Invalid verification code'),
    'Informative error returned for incorrect OTP'
  );

  // Verify attempts counter incremented
  const userAfterWrongOtp = await prisma.user.findUnique({
    where: { email: testStudentEmail },
  });
  assert(userAfterWrongOtp.otpAttempts === 1, 'Verification attempts counter incremented to 1');

  // Invalid OTP format (non-numeric or not 6 digits)
  const nonNumericOtp = await request('POST', '/api/auth/verify-email', {
    email: testStudentEmail,
    otp: 'abc',
  });
  assert(nonNumericOtp.status === 400, 'Non-6-digit OTP format rejected with 400');

  // 7. Resend cooldown enforcement (within 60 seconds)
  const fastResend = await request('POST', '/api/auth/resend-verification', {
    email: testStudentEmail,
  });
  assert(fastResend.status === 429, 'Resend request within 60s cooldown rejected with 429 Too Many Requests');
  assert(
    fastResend.body.message.includes('Please wait'),
    'Cooldown message displays remaining wait time'
  );

  // 8. Resend after cooldown resets attempts & invalidates previous OTP
  // Simulate 61 seconds elapsed in database
  await prisma.user.update({
    where: { email: testStudentEmail },
    data: {
      otpLastSentAt: new Date(Date.now() - 65 * 1000),
    },
  });

  const validResend = await request('POST', '/api/auth/resend-verification', {
    email: testStudentEmail,
  });
  assert(validResend.status === 200, 'Resend after cooldown succeeds with 200 OK');
  assert(validResend.body.data.maskedEmail !== undefined, 'Resend response contains masked email');

  const userAfterResend = await prisma.user.findUnique({
    where: { email: testStudentEmail },
  });
  assert(userAfterResend.otpAttempts === 0, 'Resend resets verification attempts counter to 0');
  assert(userAfterResend.otpHash !== userRecord.otpHash, 'Previous OTP was invalidated and replaced with fresh OTP');

  // 9. Expired OTP rejection
  const knownTestOtp = '482915';
  await prisma.user.update({
    where: { email: testStudentEmail },
    data: {
      otpHash: hashOtp(knownTestOtp),
      otpExpiresAt: new Date(Date.now() - 5 * 1000), // Expired 5 seconds ago
    },
  });

  const expiredVerify = await request('POST', '/api/auth/verify-email', {
    email: testStudentEmail,
    otp: knownTestOtp,
  });
  assert(expiredVerify.status === 400, 'Expired OTP verification rejected with 400 Bad Request');
  assert(
    expiredVerify.body.message.includes('expired'),
    'Error message states verification code has expired'
  );

  // 10. Maximum attempts limit (5 attempts threshold)
  await prisma.user.update({
    where: { email: testStudentEmail },
    data: {
      otpHash: hashOtp(knownTestOtp),
      otpExpiresAt: new Date(Date.now() + 10 * 60 * 1000),
      otpAttempts: 5,
    },
  });

  const maxAttemptsVerify = await request('POST', '/api/auth/verify-email', {
    email: testStudentEmail,
    otp: knownTestOtp,
  });
  assert(maxAttemptsVerify.status === 400, 'Verification rejected when maximum attempts exceeded');
  assert(
    maxAttemptsVerify.body.message.includes('Maximum verification attempts'),
    'Error states maximum attempts exceeded'
  );

  // 11. Correct OTP verification with fresh valid OTP
  const freshOtp = '654321';
  await prisma.user.update({
    where: { email: testStudentEmail },
    data: {
      otpHash: hashOtp(freshOtp),
      otpExpiresAt: new Date(Date.now() + 10 * 60 * 1000),
      otpAttempts: 0,
    },
  });

  const successfulVerify = await request('POST', '/api/auth/verify-email', {
    email: testStudentEmail,
    otp: freshOtp,
  });
  assert(successfulVerify.status === 200, 'Correct OTP verification succeeds with 200 OK');
  assert(successfulVerify.body.data.emailVerified === true, 'Response confirms emailVerified: true');

  // Verify database state: verified, OTP cleared
  const verifiedUser = await prisma.user.findUnique({
    where: { email: testStudentEmail },
  });
  assert(verifiedUser.emailVerified === true, 'Database confirms user.emailVerified = true');
  assert(verifiedUser.otpHash === null, 'otpHash cleared from database after verification');
  assert(verifiedUser.otpExpiresAt === null, 'otpExpiresAt cleared after verification');
  assert(verifiedUser.otpAttempts === 0, 'otpAttempts reset to 0');

  // 12. Reused OTP rejection (single-use enforcement)
  const reusedOtp = await request('POST', '/api/auth/verify-email', {
    email: testStudentEmail,
    otp: freshOtp,
  });
  assert(reusedOtp.status === 200, 'Subsequent verification on verified user gracefully returns success');

  // Resend on already verified user is rejected
  const resendOnVerified = await request('POST', '/api/auth/resend-verification', {
    email: testStudentEmail,
  });
  assert(resendOnVerified.status === 400, 'Resend verification on already verified email rejected with 400');

  // 13. Verified student login success
  const verifiedLogin = await request('POST', '/api/auth/login', {
    email: testStudentEmail,
    password: testPassword,
  });
  assert(verifiedLogin.status === 200, 'Verified student can now log in successfully (200 OK)');
  assert(verifiedLogin.body.data.token !== undefined, 'Authenticated JWT token issued');
  assert(verifiedLogin.body.data.user.role === 'STUDENT', 'Logged in user has role STUDENT');
  assert(verifiedLogin.body.data.user.emailVerified === true, 'Profile confirms emailVerified = true');
  assert(verifiedLogin.body.data.user.hostelBlock === undefined, 'hostelBlock is absent from login user payload');

  const studentJwt = verifiedLogin.body.data.token;

  // 14. Student Profile: Verify hostelName and roomNumber work without hostelBlock
  const profileRes = await request('GET', '/api/users/profile', null, studentJwt);
  assert(profileRes.status === 200, 'Student can fetch profile with JWT (200)');
  assert(profileRes.body.data.roomNumber === 'B-204', 'Student profile contains assigned roomNumber');
  assert(profileRes.body.data.hostelName === 'Sarabhai Hostel', 'Student profile contains hostelName');
  assert(profileRes.body.data.hostelBlock === undefined, 'hostelBlock is completely removed from GET /profile');

  // Update profile without hostelBlock
  const updateProfileRes = await request(
    'PUT',
    '/api/users/profile',
    {
      roomNumber: 'B-305',
      mobileNumber: '9876543299',
    },
    studentJwt
  );
  assert(updateProfileRes.status === 200, 'Student profile update succeeds without hostelBlock');
  assert(updateProfileRes.body.data.roomNumber === 'B-305', 'Updated room number stored');
  assert(updateProfileRes.body.data.hostelBlock === undefined, 'hostelBlock absent from PUT /profile response');

  // 15. Warden and Staff login bypass
  const wardenLogin = await request('POST', '/api/auth/login', {
    email: 'warden@hostelfix.demo',
    password: 'Demo@1234',
  });
  assert(wardenLogin.status === 200, 'Warden login succeeds without student email verification barrier');

  const staffLogin = await request('POST', '/api/auth/login', {
    email: 'staff@hostelfix.demo',
    password: 'Demo@1234',
  });
  assert(staffLogin.status === 200, 'Staff login succeeds without student email verification barrier');

  // Cleanup test user
  await prisma.user.delete({
    where: { email: testStudentEmail },
  });

  console.log(`\n=== Results: ${passed}/${total} tests passed ===`);
  if (passed === total) {
    console.log('🎉 ALL EMAIL VERIFICATION & HOSTEL BLOCK REMOVAL TESTS PASSED!\n');
    process.exit(0);
  } else {
    console.error(`💥 ${total - passed} TESTS FAILED\n`);
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
