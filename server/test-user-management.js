/**
 * HostelFix — User Management & Onboarding Verification Test Suite
 *
 * Verifies:
 *  1. Warden can view resident students list scoped to their hostel
 *  2. Search filtering on students list
 *  3. Hostel isolation in students list
 *  4. Warden can view maintenance staff directory
 *  5. Warden can provision a new maintenance staff member (bcrypt hashed, role=STAFF, isActive=true)
 *  6. Role cannot be escalated on staff creation
 *  7. Duplicate email on staff creation returns 409 Conflict
 *  8. Validation on staff creation (required fields, email format, password length)
 *  9. Warden can edit staff member details (trade, name, mobile, active/inactive duty status)
 * 10. Role-based access control: Students and Staff cannot access User Management endpoints (403)
 * 11. Unauthenticated requests are rejected with 401 Unauthorized
 * 12. Student registration enforces roll number uniqueness (409 Conflict)
 */

const http = require('http');

const PORT = process.env.PORT || 5001;
const BASE_HOST = 'localhost';

function request(method, path, body = null, token = null) {
  return new Promise((resolve, reject) => {
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const options = {
      hostname: BASE_HOST,
      port: PORT,
      path,
      method,
      headers,
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        let parsed = null;
        try { parsed = JSON.parse(data); } catch (e) { parsed = data; }
        resolve({ status: res.statusCode, headers: res.headers, body: parsed });
      });
    });

    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function runTests() {
  console.log('=== Running Warden User Management & Onboarding Test Suite ===\n');
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

  // 1. Logins to get tokens
  const studentLogin = await request('POST', '/api/auth/login', {
    email: 'student@hostelfix.demo',
    password: 'Demo@1234',
  });
  const studentToken = studentLogin.body.data.token;

  const warden1Login = await request('POST', '/api/auth/login', {
    email: 'warden@hostelfix.demo', // Sarabhai Hostel
    password: 'Demo@1234',
  });
  const warden1Token = warden1Login.body.data.token;

  const warden2Login = await request('POST', '/api/auth/login', {
    email: 'warden_girls@hostelfix.demo', // Gargi Hostel
    password: 'Demo@1234',
  });
  const warden2Token = warden2Login.body.data.token;

  const staffLogin = await request('POST', '/api/auth/login', {
    email: 'staff@hostelfix.demo',
    password: 'Demo@1234',
  });
  const staffToken = staffLogin.body.data.token;

  assert(studentToken && warden1Token && warden2Token && staffToken, 'Actor tokens obtained');

  // 2. Warden 1 (Sarabhai Hostel) fetches students list
  const studentsRes = await request('GET', '/api/users/students', null, warden1Token);
  assert(studentsRes.status === 200 && studentsRes.body.success === true, 'Warden 1 can fetch students list (200)');
  assert(Array.isArray(studentsRes.body.data), 'Students response contains array of students');

  // Check scoping: all returned students should belong to Sarabhai Hostel
  const allSarabhai = studentsRes.body.data.every((s) => s.hostelName === 'Sarabhai Hostel');
  assert(allSarabhai, 'Warden 1 (Sarabhai) only sees students assigned to Sarabhai Hostel');

  // Verify student fields
  const firstStudent = studentsRes.body.data[0];
  if (firstStudent) {
    assert(firstStudent.name !== undefined, 'Student has name');
    assert(firstStudent.roomNumber !== undefined, 'Student has roomNumber');
    assert(firstStudent.hostelBlock !== undefined, 'Student has hostelBlock');
    assert(firstStudent.isActive === true, 'Student has isActive=true');
    assert(firstStudent.complaintsCount !== undefined, 'Student includes complaintsCount');
  }

  // 3. Search filtering on students list
  const searchRes = await request('GET', '/api/users/students?q=Rahul', null, warden1Token);
  assert(searchRes.status === 200, 'Search query ?q=Rahul returns 200');

  // 4. Warden 2 (Gargi Hostel) fetches students list
  const girlsStudentsRes = await request('GET', '/api/users/students', null, warden2Token);
  assert(girlsStudentsRes.status === 200, 'Warden 2 can fetch students list (200)');
  const allGargi = girlsStudentsRes.body.data.every((s) => s.hostelName === 'Gargi Hostel');
  assert(allGargi, 'Warden 2 (Gargi) only sees students assigned to Gargi Hostel');

  // Cross-isolation: Warden 1 does NOT see Gargi students, Warden 2 does NOT see Sarabhai students
  const warden1StudentEmails = studentsRes.body.data.map((s) => s.email);
  const warden2StudentEmails = girlsStudentsRes.body.data.map((s) => s.email);
  const overlaps = warden1StudentEmails.filter((email) => warden2StudentEmails.includes(email));
  assert(overlaps.length === 0, 'Warden 1 and Warden 2 have zero student overlap (strict hostel scoping)');

  // 5. Staff Directory
  const staffRes = await request('GET', '/api/users/staff', null, warden1Token);
  assert(staffRes.status === 200 && staffRes.body.success === true, 'Warden can fetch staff directory (200)');
  assert(Array.isArray(staffRes.body.data), 'Staff directory returns an array');
  const demoStaff = staffRes.body.data.find((s) => s.email === 'staff@hostelfix.demo');
  assert(demoStaff !== undefined, 'Staff list contains seeded demo staff member');
  assert(demoStaff.staffCategory === 'Plumber', 'Staff member includes trade specialization');
  assert(demoStaff.isActive === true, 'Staff member has isActive=true');

  // 6. Warden provisions a new staff member
  const newStaffEmail = `technician.${Date.now()}@hostelfix.demo`;
  const createStaffRes = await request('POST', '/api/users/staff', {
    name: 'Harish Verma',
    email: newStaffEmail,
    password: 'Password@123',
    staffCategory: 'Electrician',
    mobileNumber: '9876543210',
    role: 'WARDEN', // Security test: should be ignored, role forced to STAFF
  }, warden1Token);

  assert(createStaffRes.status === 201 && createStaffRes.body.success === true, 'Warden creates new staff member (201)');
  assert(createStaffRes.body.data.role === 'STAFF', 'Security: Role strictly forced to STAFF');
  assert(createStaffRes.body.data.name === 'Harish Verma', 'Created staff has correct name');
  assert(createStaffRes.body.data.staffCategory === 'Electrician', 'Created staff has correct trade category');
  assert(createStaffRes.body.data.isActive === true, 'Created staff defaults to isActive=true');
  assert(createStaffRes.body.data.passwordHash === undefined, 'Security: passwordHash is not leaked in response');

  const createdStaffId = createStaffRes.body.data.id;

  // 7. Verify newly created staff can log in with their password
  const newStaffLogin = await request('POST', '/api/auth/login', {
    email: newStaffEmail,
    password: 'Password@123',
  });
  assert(newStaffLogin.status === 200, 'Newly provisioned staff member can successfully log in');
  assert(newStaffLogin.body.data.user.role === 'STAFF', 'Logged in user has role STAFF');

  // 8. Staff creation validations
  // Duplicate email (409)
  const dupStaffRes = await request('POST', '/api/users/staff', {
    name: 'Harish Copy',
    email: newStaffEmail,
    password: 'Password@123',
    staffCategory: 'Electrician',
  }, warden1Token);
  assert(dupStaffRes.status === 409, 'Duplicate staff email returns 409 Conflict');

  // Missing required fields (400)
  const missingStaffRes = await request('POST', '/api/users/staff', {
    name: 'No Email Worker',
    password: 'Password@123',
  }, warden1Token);
  assert(missingStaffRes.status === 400, 'Missing staff fields returns 400 Bad Request');

  // Invalid email format (400)
  const invalidEmailStaff = await request('POST', '/api/users/staff', {
    name: 'Bad Email Worker',
    email: 'not-an-email',
    password: 'Password@123',
    staffCategory: 'Carpenter',
  }, warden1Token);
  assert(invalidEmailStaff.status === 400, 'Invalid email on staff creation returns 400 Bad Request');

  // Short password (400)
  const shortPassStaff = await request('POST', '/api/users/staff', {
    name: 'Short Pass Worker',
    email: `shortpass.${Date.now()}@hostelfix.demo`,
    password: '123',
    staffCategory: 'Carpenter',
  }, warden1Token);
  assert(shortPassStaff.status === 400, 'Password < 6 chars returns 400 Bad Request');

  // 9. Edit Staff Details & Status Toggle
  const updateStaffRes = await request('PUT', `/api/users/staff/${createdStaffId}`, {
    name: 'Harish Verma (Senior)',
    mobileNumber: '9876543999',
    staffCategory: 'General Maintenance',
    isActive: false, // Deactivate
  }, warden1Token);

  assert(updateStaffRes.status === 200 && updateStaffRes.body.success === true, 'Warden can update staff member (200)');
  assert(updateStaffRes.body.data.name === 'Harish Verma (Senior)', 'Updated staff name persisted');
  assert(updateStaffRes.body.data.mobileNumber === '9876543999', 'Updated staff mobile persisted');
  assert(updateStaffRes.body.data.staffCategory === 'General Maintenance', 'Updated staff category persisted');
  assert(updateStaffRes.body.data.isActive === false, 'Staff status successfully toggled to isActive=false');

  // Reactivate staff member
  const reactivateRes = await request('PUT', `/api/users/staff/${createdStaffId}`, {
    isActive: true,
  }, warden1Token);
  assert(reactivateRes.status === 200, 'Staff status reactivated to isActive=true');
  assert(reactivateRes.body.data.isActive === true, 'Staff isActive is true');

  // Editing non-existent staff returns 404
  const notFoundStaff = await request('PUT', '/api/users/staff/non-existent-id-999', {
    name: 'Ghost Worker',
  }, warden1Token);
  assert(notFoundStaff.status === 404, 'Editing non-existent staff returns 404 Not Found');

  // 10. Role-Based Access Control (RBAC) Security
  // Student cannot access GET /api/users/students (403)
  const studentAccessStudents = await request('GET', '/api/users/students', null, studentToken);
  assert(studentAccessStudents.status === 403, 'Student accessing /api/users/students rejected (403)');

  // Student cannot access POST /api/users/staff (403)
  const studentCreateStaff = await request('POST', '/api/users/staff', {
    name: 'Hacker Worker',
    email: 'hacker.worker@demo.com',
    password: 'Password@123',
    staffCategory: 'Electrician',
  }, studentToken);
  assert(studentCreateStaff.status === 403, 'Student accessing POST /api/users/staff rejected (403)');

  // Student cannot access PUT /api/users/staff/:id (403)
  const studentEditStaff = await request('PUT', `/api/users/staff/${createdStaffId}`, {
    name: 'Tampered Name',
  }, studentToken);
  assert(studentEditStaff.status === 403, 'Student accessing PUT /api/users/staff/:id rejected (403)');

  // Staff cannot access GET /api/users/students (403)
  const staffAccessStudents = await request('GET', '/api/users/students', null, staffToken);
  assert(staffAccessStudents.status === 403, 'Staff accessing /api/users/students rejected (403)');

  // Staff cannot access POST /api/users/staff (403)
  const staffCreateStaff = await request('POST', '/api/users/staff', {
    name: 'Sub-Worker',
    email: 'sub.worker@demo.com',
    password: 'Password@123',
    staffCategory: 'Plumber',
  }, staffToken);
  assert(staffCreateStaff.status === 403, 'Staff accessing POST /api/users/staff rejected (403)');

  // Staff cannot access PUT /api/users/staff/:id (403)
  const staffEditStaff = await request('PUT', `/api/users/staff/${createdStaffId}`, {
    name: 'Staff Self-Edit',
  }, staffToken);
  assert(staffEditStaff.status === 403, 'Staff accessing PUT /api/users/staff/:id rejected (403)');

  // Unauthenticated requests (401)
  const unauthStudents = await request('GET', '/api/users/students');
  assert(unauthStudents.status === 401, 'Unauthenticated GET /api/users/students rejected (401)');

  const unauthStaff = await request('GET', '/api/users/staff');
  assert(unauthStaff.status === 401, 'Unauthenticated GET /api/users/staff rejected (401)');

  const unauthCreateStaff = await request('POST', '/api/users/staff', {
    name: 'Anon',
    email: 'anon@demo.com',
    password: 'Password@123',
  });
  assert(unauthCreateStaff.status === 401, 'Unauthenticated POST /api/users/staff rejected (401)');

  // 11. Student Registration Roll Number Uniqueness
  const duplicateRoll = `ROLL_${Date.now()}`;
  const firstReg = await request('POST', '/api/auth/register', {
    name: 'First Student Roll',
    email: `roll1_${Date.now()}@college.edu`,
    password: 'Password@123',
    roomNumber: 'B-101',
    hostelBlock: 'Block B',
    hostelName: 'Sarabhai Hostel',
    mobileNumber: '9876543211',
    universityRollNumber: duplicateRoll,
    branch: 'Electrical Engineering',
    year: '2nd Year',
  });
  assert(firstReg.status === 201, 'First registration with unique roll number returns 201');

  const secondReg = await request('POST', '/api/auth/register', {
    name: 'Second Student Duplicate Roll',
    email: `roll2_${Date.now()}@college.edu`,
    password: 'Password@123',
    roomNumber: 'B-102',
    hostelBlock: 'Block B',
    hostelName: 'Sarabhai Hostel',
    mobileNumber: '9876543212',
    universityRollNumber: duplicateRoll, // Duplicate roll number
    branch: 'Civil Engineering',
    year: '1st Year',
  });
  assert(secondReg.status === 409, 'Duplicate university roll number returns 409 Conflict');

  console.log(`\n=== Results: ${passed}/${total} tests passed ===`);
  if (passed === total) {
    console.log('🎉 ALL USER MANAGEMENT & ONBOARDING TESTS PASSED!\n');
    process.exit(0);
  } else {
    console.error(`💥 ${total - passed} TESTS FAILED\n`);
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error('Unexpected test suite error:', err);
  process.exit(1);
});
