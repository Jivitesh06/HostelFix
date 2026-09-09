/**
 * Automated test suite for Phase 3B: Authentication & Protected Routes
 * Tests:
 * 1. Registration (valid, duplicate, validation, security role enforcement)
 * 2. Login (valid demo accounts, wrong password, missing credentials)
 * 3. /me profile endpoint (valid JWT, missing JWT, invalid JWT)
 * 4. Role-based authorization middleware (verifyToken, requireRole)
 */

const http = require('http');

const PORT = process.env.PORT || 5001;
const BASE_URL = `http://localhost:${PORT}`;

function request(method, path, body = null, token = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const headers = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const req = http.request(
      url,
      {
        method,
        headers,
      },
      (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
          try {
            const parsed = JSON.parse(data);
            resolve({ status: res.statusCode, body: parsed });
          } catch {
            resolve({ status: res.statusCode, raw: data });
          }
        });
      }
    );

    req.on('error', reject);

    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

async function runTests() {
  console.log('=== Running Phase 3B Authentication Test Suite ===\n');
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

  // 1. Health Check
  const health = await request('GET', '/api/health');
  assert(health.status === 200 && health.body.success === true, 'Health check endpoint returns 200 OK');

  // 2. Student Registration Tests
  const uniqueTestEmail = `test.student.${Date.now()}@college.edu`;
  const regValid = await request('POST', '/api/auth/register', {
    name: 'New Test Student',
    email: uniqueTestEmail,
    password: 'password123',
    roomNumber: 'C-301',
    hostelBlock: 'Block C',
    role: 'WARDEN', // Security test: should be ignored by backend
  });
  assert(regValid.status === 201 && regValid.body.success === true, 'Valid registration returns 201 Created');
  assert(regValid.body.data.role === 'STUDENT', 'Security: Public registration role forced to STUDENT');
  assert(regValid.body.data.passwordHash === undefined, 'Security: passwordHash is not returned in registration response');

  // Duplicate email registration (409 Conflict)
  const regDup = await request('POST', '/api/auth/register', {
    name: 'Duplicate Student',
    email: uniqueTestEmail,
    password: 'password123',
    roomNumber: 'C-302',
    hostelBlock: 'Block C',
  });
  assert(regDup.status === 409 && regDup.body.success === false, 'Duplicate email registration returns 409 Conflict');

  // Missing fields registration (400 Bad Request)
  const regMissing = await request('POST', '/api/auth/register', {
    email: 'incomplete@college.edu',
    password: 'password123',
  });
  assert(regMissing.status === 400 && regMissing.body.success === false, 'Missing fields registration returns 400 Bad Request');

  // Invalid email format (400 Bad Request)
  const regInvalidEmail = await request('POST', '/api/auth/register', {
    name: 'Bad Email',
    email: 'not-an-email',
    password: 'password123',
    roomNumber: 'A-1',
    hostelBlock: 'A',
  });
  assert(regInvalidEmail.status === 400 && regInvalidEmail.body.success === false, 'Invalid email format returns 400 Bad Request');

  // Short password (400 Bad Request)
  const regShortPass = await request('POST', '/api/auth/register', {
    name: 'Short Pass',
    email: `short.${Date.now()}@college.edu`,
    password: '123',
    roomNumber: 'A-1',
    hostelBlock: 'A',
  });
  assert(regShortPass.status === 400 && regShortPass.body.success === false, 'Password < 6 chars returns 400 Bad Request');

  // 2B. Secure Staff & Warden Registration Tests
  // Missing administrative key -> 403 Forbidden
  const staffRegNoKey = await request('POST', '/api/auth/staff-register', {
    role: 'WARDEN',
    name: 'Unauthorized Warden',
    email: `warden.unauth.${Date.now()}@college.edu`,
    password: 'password123',
    gender: 'MALE',
    hostelName: 'Sarabhai Hostel',
  });
  assert(staffRegNoKey.status === 403 && staffRegNoKey.body.success === false, 'Staff register without adminKey returns 403 Forbidden');

  // Invalid administrative key -> 403 Forbidden
  const staffRegWrongKey = await request('POST', '/api/auth/staff-register', {
    adminKey: 'WrongSecretKey',
    role: 'WARDEN',
    name: 'Unauthorized Warden',
    email: `warden.wrongkey.${Date.now()}@college.edu`,
    password: 'password123',
    gender: 'MALE',
    hostelName: 'Sarabhai Hostel',
  });
  assert(staffRegWrongKey.status === 403 && staffRegWrongKey.body.success === false, 'Staff register with incorrect adminKey returns 403 Forbidden');

  // Invalid role (STUDENT) -> 400 Bad Request
  const staffRegStudentRole = await request('POST', '/api/auth/staff-register', {
    adminKey: 'HostelFix@Admin2026',
    role: 'STUDENT',
    name: 'Student Trying Staff Route',
    email: `fake.student.${Date.now()}@college.edu`,
    password: 'password123',
  });
  assert(staffRegStudentRole.status === 400 && staffRegStudentRole.body.success === false, 'Staff register with role STUDENT returns 400 Bad Request');

  // Valid Warden registration -> 201 Created
  const wardenEmail = `test.warden.${Date.now()}@college.edu`;
  const wardenReg = await request('POST', '/api/auth/staff-register', {
    adminKey: 'HostelFix@Admin2026',
    role: 'WARDEN',
    name: 'Chief Warden Bose',
    email: wardenEmail,
    password: 'password123',
    gender: 'MALE',
    hostelName: 'Bose Hostel',
    mobileNumber: '+91 98765 43210',
  });
  assert(wardenReg.status === 201 && wardenReg.body.success === true, 'Valid Warden registration returns 201 Created');
  assert(wardenReg.body.data.role === 'WARDEN', 'Warden registration sets role to WARDEN');
  assert(wardenReg.body.data.hostelName === 'Bose Hostel', 'Warden registration assigns hostelName');
  assert(wardenReg.body.data.passwordHash === undefined, 'Security: passwordHash is not returned in staff registration');

  // Valid Staff / Worker registration -> 201 Created
  const staffEmail = `test.worker.${Date.now()}@college.edu`;
  const workerReg = await request('POST', '/api/auth/staff-register', {
    adminKey: 'HostelFix@Admin2026',
    role: 'STAFF',
    name: 'Electrician Ramesh',
    email: staffEmail,
    password: 'password123',
    staffCategory: 'Electrician',
    mobileNumber: '+91 91234 56789',
  });
  assert(workerReg.status === 201 && workerReg.body.success === true, 'Valid Staff registration returns 201 Created');
  assert(workerReg.body.data.role === 'STAFF', 'Staff registration sets role to STAFF');
  assert(workerReg.body.data.staffCategory === 'Electrician', 'Staff registration saves staffCategory');

  // Duplicate email on staff register -> 409 Conflict
  const staffRegDup = await request('POST', '/api/auth/staff-register', {
    adminKey: 'HostelFix@Admin2026',
    role: 'STAFF',
    name: 'Duplicate Ramesh',
    email: staffEmail,
    password: 'password123',
    staffCategory: 'Plumber',
  });
  assert(staffRegDup.status === 409 && staffRegDup.body.success === false, 'Duplicate email on staff register returns 409 Conflict');

  // 3. Login Tests
  // Student Login
  const loginStudent = await request('POST', '/api/auth/login', {
    email: 'student@hostelfix.demo',
    password: 'Demo@1234',
  });
  assert(loginStudent.status === 200 && loginStudent.body.success === true, 'Student login returns 200 OK');
  assert(typeof loginStudent.body.data.token === 'string', 'Student login returns JWT token');
  assert(loginStudent.body.data.user.role === 'STUDENT', 'Student login returns user with role STUDENT');
  assert(loginStudent.body.data.user.passwordHash === undefined, 'Security: passwordHash is not returned in login response');
  const studentToken = loginStudent.body.data.token;

  // Warden Login
  const loginWarden = await request('POST', '/api/auth/login', {
    email: 'warden@hostelfix.demo',
    password: 'Demo@1234',
  });
  assert(loginWarden.status === 200 && loginWarden.body.data.user.role === 'WARDEN', 'Warden login returns 200 OK and role WARDEN');
  const wardenToken = loginWarden.body.data.token;

  // Staff Login
  const loginStaff = await request('POST', '/api/auth/login', {
    email: 'staff@hostelfix.demo',
    password: 'Demo@1234',
  });
  assert(loginStaff.status === 200 && loginStaff.body.data.user.role === 'STAFF', 'Staff login returns 200 OK and role STAFF');
  const staffToken = loginStaff.body.data.token;

  // Newly Registered Student Login
  const loginNewStudent = await request('POST', '/api/auth/login', {
    email: uniqueTestEmail,
    password: 'password123',
  });
  assert(loginNewStudent.status === 200 && loginNewStudent.body.data.user.role === 'STUDENT', 'Newly registered student can log in');

  // Wrong password (401 Unauthorized)
  const loginWrongPass = await request('POST', '/api/auth/login', {
    email: 'student@hostelfix.demo',
    password: 'WrongPassword!',
  });
  assert(loginWrongPass.status === 401 && loginWrongPass.body.success === false, 'Wrong password returns 401 Unauthorized');

  // Nonexistent email (401 Unauthorized)
  const loginNoUser = await request('POST', '/api/auth/login', {
    email: 'nonexistent@hostelfix.demo',
    password: 'Demo@1234',
  });
  assert(loginNoUser.status === 401 && loginNoUser.body.success === false, 'Nonexistent email returns 401 Unauthorized');

  // Missing credentials (400 Bad Request)
  const loginMissing = await request('POST', '/api/auth/login', {
    email: 'student@hostelfix.demo',
  });
  assert(loginMissing.status === 400 && loginMissing.body.success === false, 'Missing password returns 400 Bad Request');

  // 4. GET /api/auth/me Tests
  // Valid token
  const meRes = await request('GET', '/api/auth/me', null, studentToken);
  assert(meRes.status === 200 && meRes.body.success === true, 'GET /api/auth/me returns 200 OK with valid token');
  assert(meRes.body.data.role === 'STUDENT', 'GET /api/auth/me returns correct user profile');
  assert(meRes.body.data.passwordHash === undefined, 'Security: /me does not leak passwordHash');

  // Missing token (401 Unauthorized)
  const meNoToken = await request('GET', '/api/auth/me');
  assert(meNoToken.status === 401 && meNoToken.body.success === false, 'GET /api/auth/me without token returns 401 Unauthorized');

  // Invalid token (401 Unauthorized)
  const meBadToken = await request('GET', '/api/auth/me', null, 'this.is.a.bad.token');
  assert(meBadToken.status === 401 && meBadToken.body.success === false, 'GET /api/auth/me with invalid token returns 401 Unauthorized');

  // 5. Role-Based Authorization Tests
  // Student permissions
  const studentOnStudent = await request('GET', '/api/test/student-only', null, studentToken);
  assert(studentOnStudent.status === 200, 'Student accessing student-only route -> 200 ALLOW');

  const studentOnWarden = await request('GET', '/api/test/warden-only', null, studentToken);
  assert(studentOnWarden.status === 403, 'Student accessing warden-only route -> 403 FORBIDDEN');

  const studentOnStaff = await request('GET', '/api/test/staff-only', null, studentToken);
  assert(studentOnStaff.status === 403, 'Student accessing staff-only route -> 403 FORBIDDEN');

  // Warden permissions
  const wardenOnWarden = await request('GET', '/api/test/warden-only', null, wardenToken);
  assert(wardenOnWarden.status === 200, 'Warden accessing warden-only route -> 200 ALLOW');

  const wardenOnStudent = await request('GET', '/api/test/student-only', null, wardenToken);
  assert(wardenOnStudent.status === 403, 'Warden accessing student-only route -> 403 FORBIDDEN');

  // Staff permissions
  const staffOnStaff = await request('GET', '/api/test/staff-only', null, staffToken);
  assert(staffOnStaff.status === 200, 'Staff accessing staff-only route -> 200 ALLOW');

  const staffOnWarden = await request('GET', '/api/test/warden-only', null, staffToken);
  assert(staffOnWarden.status === 403, 'Staff accessing warden-only route -> 403 FORBIDDEN');

  // Unauthenticated on protected route
  const noAuthOnStudent = await request('GET', '/api/test/student-only');
  assert(noAuthOnStudent.status === 401, 'Unauthenticated request on protected route -> 401 UNAUTHORIZED');

  console.log(`\n=== Results: ${passed}/${total} tests passed ===`);
  if (passed === total) {
    console.log('🎉 ALL AUTHENTICATION & AUTHORIZATION TESTS PASSED!\n');
    process.exit(0);
  } else {
    console.error('❌ Some tests failed.');
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error('Test execution error:', err);
  process.exit(1);
});
