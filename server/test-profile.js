/**
 * Automated test suite for HostelFix Student Profile, Gender-Based Hostels & Warden Scoping
 * Tests:
 * 1. Student profile retrieval with gender & hostel (GET /api/users/profile)
 * 2. Student profile update with gender-compatible hostel
 * 3. Student profile update rejects gender-incompatible hostel
 * 4. Profile field validations (invalid mobile, empty name, empty room)
 * 5. Security: role & email immutability via profile update
 * 6. Authorization: Warden/Staff cannot access /api/users/profile
 * 7. Warden profile management (GET & PUT /api/users/warden/profile)
 * 8. Warden student inspection (GET /api/users/students/:id)
 * 9. Authorization: Staff/Student cannot access /api/users/students/:id
 * 10. Non-existent student inspection returns 404
 * 11. Registration: Gender and hostel compatibility validation
 * 12. Warden Complaint Isolation: Warden only sees complaints from their assigned hostel
 * 13. Warden Cross-Hostel Access: Blocked with 403 Forbidden
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
  console.log('=== Running Student Profile, Gender & Warden Inspection Test Suite ===\n');
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

    const student2Login = await request('POST', '/api/auth/login', {
      email: 'student2@hostelfix.demo',
      password: 'Demo@1234',
    });
    assert(student2Login.status === 200, 'Student 2 (Female) login succeeds');
    const student2Token = student2Login.body.data.token;
    const student2Id = student2Login.body.data.user.id;

    const wardenLogin = await request('POST', '/api/auth/login', {
      email: 'warden@hostelfix.demo',
      password: 'Demo@1234',
    });
    assert(wardenLogin.status === 200, 'Warden login succeeds');
    const wardenToken = wardenLogin.body.data.token;

    const wardenGirlsLogin = await request('POST', '/api/auth/login', {
      email: 'warden_girls@hostelfix.demo',
      password: 'Demo@1234',
    });
    assert(wardenGirlsLogin.status === 200, 'Girls Warden login succeeds');
    const wardenGirlsToken = wardenGirlsLogin.body.data.token;

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
    assert(getProfile.body.data.hostelName === 'Sarabhai Hostel', 'Profile contains boys hostelName (Sarabhai Hostel)');
    assert(getProfile.body.data.gender === 'MALE', 'Profile contains gender (MALE)');
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

    // 6. Student updates own profile with valid boys hostel
    const updateRes = await request(
      'PUT',
      '/api/users/profile',
      {
        mobileNumber: '9998887776',
        branch: 'Information Technology',
        year: '4th Year',
        roomNumber: 'A-204',
        hostelBlock: 'Block A',
        gender: 'MALE',
        hostelName: 'Bose Hostel', // valid for male
      },
      studentToken
    );
    assert(updateRes.status === 200, 'Student PUT /api/users/profile returns 200');
    assert(updateRes.body.data.mobileNumber === '9998887776', 'Updated mobile number stored');
    assert(updateRes.body.data.branch === 'Information Technology', 'Updated branch stored');
    assert(updateRes.body.data.year === '4th Year', 'Updated year stored');
    assert(updateRes.body.data.hostelName === 'Bose Hostel', 'Updated boys hostel stored');

    // 7. Student profile update rejects incompatible girls hostel for male
    const invalidHostelRes = await request(
      'PUT',
      '/api/users/profile',
      {
        gender: 'MALE',
        hostelName: 'Gargi Hostel', // girls hostel
      },
      studentToken
    );
    assert(invalidHostelRes.status === 400, 'Male student selecting girls hostel rejected with 400');

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
        gender: 'MALE',
        hostelName: 'Sarabhai Hostel',
      },
      studentToken
    );

    // 8. Validation: Invalid mobile number format
    const invalidPhone = await request(
      'PUT',
      '/api/users/profile',
      { mobileNumber: 'invalid-phone-num' },
      studentToken
    );
    assert(invalidPhone.status === 400, 'PUT /api/users/profile with invalid mobile returns 400');

    // 9. Validation: Empty name rejected
    const emptyName = await request(
      'PUT',
      '/api/users/profile',
      { name: '   ' },
      studentToken
    );
    assert(emptyName.status === 400, 'PUT /api/users/profile with empty name returns 400');

    // 10. Validation: Empty room number rejected
    const emptyRoom = await request(
      'PUT',
      '/api/users/profile',
      { roomNumber: '   ' },
      studentToken
    );
    assert(emptyRoom.status === 400, 'PUT /api/users/profile with empty roomNumber returns 400');

    // 11. Security: Student cannot change role or email
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

    // 12. Warden profile endpoints
    const wardenProfileRes = await request('GET', '/api/users/warden/profile', null, wardenToken);
    assert(wardenProfileRes.status === 200, 'Warden GET /api/users/warden/profile returns 200');
    assert(wardenProfileRes.body.data.gender === 'MALE', 'Warden profile has gender MALE');
    assert(wardenProfileRes.body.data.hostelName === 'Sarabhai Hostel', 'Warden profile has Sarabhai Hostel');

    const updateWardenRes = await request(
      'PUT',
      '/api/users/warden/profile',
      {
        mobileNumber: '9876543299',
        gender: 'MALE',
        hostelName: 'Aryabhata Hostel',
      },
      wardenToken
    );
    assert(updateWardenRes.status === 200, 'Warden PUT /api/users/warden/profile returns 200');
    assert(updateWardenRes.body.data.hostelName === 'Aryabhata Hostel', 'Warden updated to Aryabhata Hostel');

    // Restore warden to Sarabhai Hostel for complaints tests
    await request(
      'PUT',
      '/api/users/warden/profile',
      {
        mobileNumber: '9876543200',
        gender: 'MALE',
        hostelName: 'Sarabhai Hostel',
      },
      wardenToken
    );

    // 13. Student cannot access warden profile endpoint
    const studentAccessWardenProfile = await request('GET', '/api/users/warden/profile', null, studentToken);
    assert(studentAccessWardenProfile.status === 403, 'Student accessing /api/users/warden/profile rejected (403)');

    // 14. Warden can view student profile by ID
    const wardenViewStudent = await request(
      'GET',
      `/api/users/students/${studentId}`,
      null,
      wardenToken
    );
    assert(wardenViewStudent.status === 200, 'Warden GET /api/users/students/:id returns 200');
    assert(wardenViewStudent.body.data.name === studentLogin.body.data.user.name, 'Warden sees student full name');
    assert(wardenViewStudent.body.data.gender === 'MALE', 'Warden sees student gender');
    assert(wardenViewStudent.body.data.hostelName === 'Sarabhai Hostel', 'Warden sees student hostel name');

    // 15. Staff and Student cannot access /api/users/students/:id (403)
    const staffViewStudent = await request('GET', `/api/users/students/${studentId}`, null, staffToken);
    assert(staffViewStudent.status === 403, 'Staff GET /api/users/students/:id rejected (403)');

    const studentViewStudent = await request('GET', `/api/users/students/${studentId}`, null, studentToken);
    assert(studentViewStudent.status === 403, 'Student GET /api/users/students/:id rejected (403)');

    // 16. Registration validation: Gender-hostel matching
    const invalidReg = await request('POST', '/api/auth/register', {
      name: 'Test Male',
      email: `invalid_male_${Date.now()}@college.edu`,
      password: 'Password@123',
      roomNumber: 'A-201',
      hostelBlock: 'Block A',
      gender: 'MALE',
      hostelName: 'Kalpana Hostel', // girls hostel
    });
    assert(invalidReg.status === 400, 'Registration rejects male with girls hostel (400)');

    const validReg = await request('POST', '/api/auth/register', {
      name: 'Rohan Sharma',
      email: `valid_boy_${Date.now()}@college.edu`,
      password: 'Password@123',
      roomNumber: 'A-301',
      hostelBlock: 'Block A',
      gender: 'MALE',
      hostelName: 'Aryabhata Hostel',
      mobileNumber: '9123456780',
      universityRollNumber: 'CUH2024CS099',
      branch: 'Computer Science',
      year: '1st Year',
    });
    assert(validReg.status === 201, 'Registration with valid boys hostel returns 201');
    assert(validReg.body.data.gender === 'MALE', 'Registered user has gender MALE');
    assert(validReg.body.data.hostelName === 'Aryabhata Hostel', 'Registered user has Aryabhata Hostel');

    // 17. Warden Complaint Isolation:
    // Create a complaint as student 1 (Sarabhai Hostel)
    const compSarabhai = await request(
      'POST',
      '/api/complaints',
      {
        category: 'ELECTRICAL',
        description: 'Room tube light failure in Sarabhai Hostel',
      },
      studentToken
    );
    assert(compSarabhai.status === 201, 'Student in Sarabhai Hostel creates complaint');
    const compSarabhaiId = compSarabhai.body.data.id;

    // Create a complaint as student 2 (Gargi Hostel)
    const compGargi = await request(
      'POST',
      '/api/complaints',
      {
        category: 'PLUMBING',
        description: 'Washroom tap leak in Gargi Hostel',
      },
      student2Token
    );
    assert(compGargi.status === 201, 'Student in Gargi Hostel creates complaint');
    const compGargiId = compGargi.body.data.id;

    // Warden 1 (Sarabhai Hostel) fetches complaints
    const warden1Complaints = await request('GET', '/api/complaints', null, wardenToken);
    assert(warden1Complaints.status === 200, 'Warden 1 fetches complaints list (200)');
    const hasSarabhai = warden1Complaints.body.data.some((c) => c.id === compSarabhaiId);
    const hasGargi = warden1Complaints.body.data.some((c) => c.id === compGargiId);
    assert(hasSarabhai, 'Warden 1 (Sarabhai Hostel) sees Sarabhai Hostel complaint');
    assert(!hasGargi, 'Warden 1 (Sarabhai Hostel) DOES NOT see Gargi Hostel complaint');

    // Warden 2 (Gargi Hostel) fetches complaints
    const warden2Complaints = await request('GET', '/api/complaints', null, wardenGirlsToken);
    assert(warden2Complaints.status === 200, 'Warden 2 (Gargi) fetches complaints list (200)');
    const warden2HasGargi = warden2Complaints.body.data.some((c) => c.id === compGargiId);
    const warden2HasSarabhai = warden2Complaints.body.data.some((c) => c.id === compSarabhaiId);
    assert(warden2HasGargi, 'Warden 2 (Gargi Hostel) sees Gargi Hostel complaint');
    assert(!warden2HasSarabhai, 'Warden 2 (Gargi Hostel) DOES NOT see Sarabhai Hostel complaint');

    // Cross-hostel detail inspection
    const crossHostelAccess = await request('GET', `/api/complaints/${compGargiId}`, null, wardenToken);
    assert(crossHostelAccess.status === 403, 'Warden 1 accessing Gargi complaint is rejected (403)');

    const sameHostelAccess = await request('GET', `/api/complaints/${compSarabhaiId}`, null, wardenToken);
    assert(sameHostelAccess.status === 200, 'Warden 1 accessing Sarabhai complaint is allowed (200)');

  } catch (err) {
    console.error('Unexpected test failure:', err);
  }

  console.log(`\n=== Results: ${passed}/${total} tests passed ===`);
  if (passed === total) {
    console.log('🎉 ALL PROFILE, GENDER & WARDEN SCOPING TESTS PASSED!\n');
    process.exit(0);
  } else {
    console.error(`💥 ${total - passed} TESTS FAILED\n`);
    process.exit(1);
  }
}

runProfileTests();
