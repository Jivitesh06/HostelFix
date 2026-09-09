/**
 * Automated test suite for HostelFix Student Profile & Warden Student Details
 * Tests:
 * 1. Student profile retrieval (GET /api/users/profile)
 * 2. Student profile update (PUT /api/users/profile)
 * 3. Profile field validations (invalid mobile, empty name, empty room)
 * 4. Security: role & email immutability via profile update
 * 5. Authorization: Warden/Staff cannot access /api/users/profile
 * 6. Warden student inspection (GET /api/users/students/:id)
 * 7. Authorization: Staff/Student cannot access /api/users/students/:id
 * 8. Non-existent student inspection returns 404
 * 9. Registration with extended profile fields
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

async function runProfileTests() {
  console.log('=== Running Student Profile & Warden Inspection Test Suite ===\n');
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

  try {
    // 1. Authenticate users
    const studentLogin = await request('POST', '/api/auth/login', {
      email: 'student@hostelfix.demo',
      password: 'Demo@1234',
    });
    assert(studentLogin.status === 200, 'Student login succeeds');
    const studentToken = studentLogin.body.data.token;
    const studentId = studentLogin.body.data.user.id;

    const wardenLogin = await request('POST', '/api/auth/login', {
      email: 'warden@hostelfix.demo',
      password: 'Demo@1234',
    });
    assert(wardenLogin.status === 200, 'Warden login succeeds');
    const wardenToken = wardenLogin.body.data.token;

    const staffLogin = await request('POST', '/api/auth/login', {
      email: 'staff@hostelfix.demo',
      password: 'Demo@1234',
    });
    assert(staffLogin.status === 200, 'Staff login succeeds');
    const staffToken = staffLogin.body.data.token;

    // 2. Student retrieves own profile
    const getProfile = await request('GET', '/api/users/profile', null, studentToken);
    assert(getProfile.status === 200, 'Student GET /api/users/profile returns 200');
    assert(getProfile.body.data.email === 'student@hostelfix.demo', 'Profile contains student email');
    assert(getProfile.body.data.role === 'STUDENT', 'Profile contains STUDENT role');
    assert(getProfile.body.data.roomNumber === 'A-101', 'Profile contains roomNumber');
    assert(getProfile.body.data.hostelBlock === 'Block A', 'Profile contains hostelBlock');
    assert(getProfile.body.data.hostelName === 'Aravali Boys Hostel', 'Profile contains hostelName');
    assert(getProfile.body.data.mobileNumber === '9876543210', 'Profile contains mobileNumber');
    assert(getProfile.body.data.universityRollNumber === 'CUH2024CS001', 'Profile contains universityRollNumber');
    assert(getProfile.body.data.branch === 'Computer Science & Engineering', 'Profile contains branch');
    assert(getProfile.body.data.year === '3rd Year', 'Profile contains academic year');

    // 3. Unauthenticated GET /api/users/profile rejected
    const unauthProfile = await request('GET', '/api/users/profile');
    assert(unauthProfile.status === 401, 'Unauthenticated GET /api/users/profile rejected (401)');

    // 4. Warden cannot access student profile endpoint directly
    const wardenAccessOwn = await request('GET', '/api/users/profile', null, wardenToken);
    assert(wardenAccessOwn.status === 403, 'Warden accessing /api/users/profile rejected (403)');

    // 5. Staff cannot access student profile endpoint directly
    const staffAccessOwn = await request('GET', '/api/users/profile', null, staffToken);
    assert(staffAccessOwn.status === 403, 'Staff accessing /api/users/profile rejected (403)');

    // 6. Student updates own profile
    const updateRes = await request(
      'PUT',
      '/api/users/profile',
      {
        mobileNumber: '9998887776',
        branch: 'Information Technology',
        year: '4th Year',
        roomNumber: 'A-204',
        hostelBlock: 'Block A',
        hostelName: 'Aravali Boys Hostel',
      },
      studentToken
    );
    assert(updateRes.status === 200, 'Student PUT /api/users/profile returns 200');
    assert(updateRes.body.data.mobileNumber === '9998887776', 'Updated mobile number stored');
    assert(updateRes.body.data.branch === 'Information Technology', 'Updated branch stored');
    assert(updateRes.body.data.year === '4th Year', 'Updated year stored');
    assert(updateRes.body.data.roomNumber === 'A-204', 'Updated room number stored');

    // Restore original values for clean state
    await request(
      'PUT',
      '/api/users/profile',
      {
        mobileNumber: '9876543210',
        branch: 'Computer Science & Engineering',
        year: '3rd Year',
        roomNumber: 'A-101',
        hostelBlock: 'Block A',
        hostelName: 'Aravali Boys Hostel',
      },
      studentToken
    );

    // 7. Validation: Invalid mobile number format
    const invalidPhone = await request(
      'PUT',
      '/api/users/profile',
      { mobileNumber: 'invalid-phone-num' },
      studentToken
    );
    assert(invalidPhone.status === 400, 'PUT /api/users/profile with invalid mobile returns 400');

    // 8. Validation: Empty name rejected
    const emptyName = await request(
      'PUT',
      '/api/users/profile',
      { name: '   ' },
      studentToken
    );
    assert(emptyName.status === 400, 'PUT /api/users/profile with empty name returns 400');

    // 9. Validation: Empty room number rejected
    const emptyRoom = await request(
      'PUT',
      '/api/users/profile',
      { roomNumber: '   ' },
      studentToken
    );
    assert(emptyRoom.status === 400, 'PUT /api/users/profile with empty roomNumber returns 400');

    // 10. Security: Student cannot change role or email
    const exploitRes = await request(
      'PUT',
      '/api/users/profile',
      {
        role: 'WARDEN',
        email: 'hacker@college.edu',
      },
      studentToken
    );
    assert(exploitRes.status === 200, 'Profile update returns 200');
    assert(exploitRes.body.data.role === 'STUDENT', 'Security: Role remains STUDENT');
    assert(exploitRes.body.data.email === 'student@hostelfix.demo', 'Security: Email remains unchanged');

    // 11. Warden can view student profile by ID
    const wardenViewStudent = await request(
      'GET',
      `/api/users/students/${studentId}`,
      null,
      wardenToken
    );
    assert(wardenViewStudent.status === 200, 'Warden GET /api/users/students/:id returns 200');
    assert(wardenViewStudent.body.data.name === 'Demo Student', 'Warden sees student full name');
    assert(wardenViewStudent.body.data.email === 'student@hostelfix.demo', 'Warden sees student email');
    assert(wardenViewStudent.body.data.mobileNumber === '9876543210', 'Warden sees student mobile');
    assert(wardenViewStudent.body.data.universityRollNumber === 'CUH2024CS001', 'Warden sees student roll number');
    assert(wardenViewStudent.body.data.branch === 'Computer Science & Engineering', 'Warden sees student branch');
    assert(wardenViewStudent.body.data.year === '3rd Year', 'Warden sees student year');
    assert(wardenViewStudent.body.data.hostelName === 'Aravali Boys Hostel', 'Warden sees student hostel name');
    assert(wardenViewStudent.body.data.roomNumber === 'A-101', 'Warden sees student room number');
    assert(typeof wardenViewStudent.body.data.complaintsCount === 'number', 'Warden sees complaints count');

    // 12. Staff cannot view student profile by ID (403)
    const staffViewStudent = await request(
      'GET',
      `/api/users/students/${studentId}`,
      null,
      staffToken
    );
    assert(staffViewStudent.status === 403, 'Staff GET /api/users/students/:id rejected (403)');

    // 13. Student cannot view other students via /api/users/students/:id (403)
    const studentViewStudent = await request(
      'GET',
      `/api/users/students/${studentId}`,
      null,
      studentToken
    );
    assert(studentViewStudent.status === 403, 'Student GET /api/users/students/:id rejected (403)');

    // 14. Non-existent student ID returns 404
    const nonexistentStudent = await request(
      'GET',
      '/api/users/students/cuidnonexistent999',
      null,
      wardenToken
    );
    assert(nonexistentStudent.status === 404, 'Nonexistent student ID returns 404');

    // 15. Registration with new profile fields
    const testEmail = `newprofile_${Date.now()}@college.edu`;
    const regRes = await request('POST', '/api/auth/register', {
      name: 'Rohan Verma',
      email: testEmail,
      password: 'Password@123',
      roomNumber: 'D-401',
      hostelBlock: 'Block D',
      hostelName: 'Shivalik Hostel',
      mobileNumber: '9123456780',
      universityRollNumber: 'CUH2024ME088',
      branch: 'Mechanical Engineering',
      year: '1st Year',
    });
    assert(regRes.status === 201, 'Registration with profile fields returns 201');
    assert(regRes.body.data.mobileNumber === '9123456780', 'Registered mobile number persisted');
    assert(regRes.body.data.universityRollNumber === 'CUH2024ME088', 'Registered roll number persisted');
    assert(regRes.body.data.branch === 'Mechanical Engineering', 'Registered branch persisted');
    assert(regRes.body.data.year === '1st Year', 'Registered year persisted');
    assert(regRes.body.data.hostelName === 'Shivalik Hostel', 'Registered hostelName persisted');

    // 16. Login with new student returns profile fields
    const newStudentLogin = await request('POST', '/api/auth/login', {
      email: testEmail,
      password: 'Password@123',
    });
    assert(newStudentLogin.status === 200, 'New student logs in successfully');
    assert(newStudentLogin.body.data.user.branch === 'Mechanical Engineering', 'Login returns branch');
    assert(newStudentLogin.body.data.user.mobileNumber === '9123456780', 'Login returns mobileNumber');

  } catch (err) {
    console.error('Unexpected test failure:', err);
  }

  console.log(`\n=== Results: ${passed}/${total} tests passed ===`);
  if (passed === total) {
    console.log('🎉 ALL STUDENT PROFILE & WARDEN INSPECTION TESTS PASSED!\n');
    process.exit(0);
  } else {
    console.error(`💥 ${total - passed} TESTS FAILED\n`);
    process.exit(1);
  }
}

runProfileTests();
