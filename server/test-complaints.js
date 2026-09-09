/**
 * Automated test suite for Phase 3C: Complaint Management & Workflow
 * Tests:
 * 1. Normal complaint lifecycle (PENDING -> APPROVED -> ASSIGNED -> IN_PROGRESS -> RESOLVED -> CLOSED)
 * 2. Rejection flow (PENDING -> REJECTED with mandatory reason, terminal checks)
 * 3. Role-based authorization on all endpoints
 * 4. Invalid state transition rejection
 * 5. StatusLog audit timeline completeness
 */

const http = require('http');

const PORT = process.env.PORT || 5001;
const BASE_URL = `http://localhost:${PORT}`;

function request(method, path, body = null, token = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const headers = { 'Content-Type': 'application/json' };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

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
  console.log('=== Running Phase 3C Complaint Workflow Test Suite ===\n');
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

  // 1. Authenticate Actors
  const studentRes = await request('POST', '/api/auth/login', {
    email: 'student@hostelfix.demo',
    password: 'Demo@1234',
  });
  const studentToken = studentRes.body.data.token;
  const studentId = studentRes.body.data.user.id;

  const student2Res = await request('POST', '/api/auth/login', {
    email: 'student2@hostelfix.demo',
    password: 'Demo@1234',
  });
  const student2Token = student2Res.body.data.token;

  const wardenRes = await request('POST', '/api/auth/login', {
    email: 'warden@hostelfix.demo',
    password: 'Demo@1234',
  });
  const wardenToken = wardenRes.body.data.token;

  const staffRes = await request('POST', '/api/auth/login', {
    email: 'staff@hostelfix.demo',
    password: 'Demo@1234',
  });
  const staffToken = staffRes.body.data.token;
  const staffId = staffRes.body.data.user.id;

  const staff2Res = await request('POST', '/api/auth/login', {
    email: 'staff2@hostelfix.demo',
    password: 'Demo@1234',
  });
  const staff2Token = staff2Res.body.data.token;

  assert(studentToken && wardenToken && staffToken, 'Actor tokens obtained');

  // 2. Lifecycle Flow: Normal Complaint
  // 2a. Student creates complaint
  const createRes = await request(
    'POST',
    '/api/complaints',
    {
      category: 'ELECTRICAL',
      description: 'Ceiling fan making loud grinding noise',
      status: 'APPROVED', // Security check: should be ignored
      assignedStaffId: staffId, // Security check: should be ignored
    },
    studentToken
  );
  assert(createRes.status === 201 && createRes.body.success === true, 'Student can create complaint -> 201 Created');
  const complaintId = createRes.body.data.id;
  assert(createRes.body.data.status === 'PENDING', 'Initial status is strictly PENDING');
  assert(createRes.body.data.assignedStaffId === null, 'Initial assignedStaffId is strictly null');

  // Verify initial StatusLog
  const detail1 = await request('GET', `/api/complaints/${complaintId}`, null, studentToken);
  assert(detail1.status === 200, 'Student can view own complaint details');
  assert(detail1.body.data.statusLogs.length === 1, 'Initial StatusLog created on complaint submission');
  assert(detail1.body.data.statusLogs[0].newStatus === 'PENDING', 'Initial StatusLog records PENDING status');

  // 2b. Warden approves complaint
  const approveRes = await request('PATCH', `/api/complaints/${complaintId}/approve`, null, wardenToken);
  assert(approveRes.status === 200 && approveRes.body.data.status === 'APPROVED', 'Warden approves PENDING -> APPROVED');

  // Verify second StatusLog
  const detail2 = await request('GET', `/api/complaints/${complaintId}`, null, wardenToken);
  assert(detail2.body.data.statusLogs.length === 2, 'StatusLog added for APPROVED transition');
  assert(detail2.body.data.statusLogs[1].newStatus === 'APPROVED', 'Second StatusLog records APPROVED');

  // 2c. Staff list endpoint for Warden
  const staffList = await request('GET', '/api/users/staff', null, wardenToken);
  assert(staffList.status === 200 && Array.isArray(staffList.body.data), 'Warden can fetch staff list for assignment dropdown');
  assert(staffList.body.data.some((s) => s.id === staffId), 'Staff list contains staff user');

  // 2d. Warden assigns complaint to staff
  const assignRes = await request(
    'PATCH',
    `/api/complaints/${complaintId}/assign`,
    { staffId },
    wardenToken
  );
  assert(assignRes.status === 200 && assignRes.body.data.status === 'ASSIGNED', 'Warden assigns APPROVED -> ASSIGNED');
  assert(assignRes.body.data.assignedStaffId === staffId, 'assignedStaffId is correctly set to selected staff');

  // 2e. Staff views assigned complaints
  const staffListRes = await request('GET', '/api/complaints', null, staffToken);
  assert(staffListRes.status === 200, 'Staff can fetch assigned complaints list');
  assert(staffListRes.body.data.some((c) => c.id === complaintId), 'Assigned complaint appears in staff complaint list');

  // 2f. Staff updates status: ASSIGNED -> IN_PROGRESS
  const inProgRes = await request(
    'PATCH',
    `/api/complaints/${complaintId}/status`,
    { status: 'IN_PROGRESS' },
    staffToken
  );
  assert(inProgRes.status === 200 && inProgRes.body.data.status === 'IN_PROGRESS', 'Staff updates ASSIGNED -> IN_PROGRESS');

  // 2g. Staff updates status: IN_PROGRESS -> RESOLVED
  const resolveRes = await request(
    'PATCH',
    `/api/complaints/${complaintId}/status`,
    { status: 'RESOLVED' },
    staffToken
  );
  assert(resolveRes.status === 200 && resolveRes.body.data.status === 'RESOLVED', 'Staff updates IN_PROGRESS -> RESOLVED');

  // 2h. Warden closes complaint: RESOLVED -> CLOSED
  const closeRes = await request('PATCH', `/api/complaints/${complaintId}/close`, null, wardenToken);
  assert(closeRes.status === 200 && closeRes.body.data.status === 'CLOSED', 'Warden closes RESOLVED -> CLOSED');

  // 2i. Verify complete chronological timeline
  const finalDetail = await request('GET', `/api/complaints/${complaintId}`, null, studentToken);
  assert(finalDetail.body.data.status === 'CLOSED', 'Final complaint status is CLOSED');
  const logs = finalDetail.body.data.statusLogs;
  assert(logs.length === 6, 'Complete lifecycle created exactly 6 StatusLogs');
  assert(
    logs[0].newStatus === 'PENDING' &&
      logs[1].newStatus === 'APPROVED' &&
      logs[2].newStatus === 'ASSIGNED' &&
      logs[3].newStatus === 'IN_PROGRESS' &&
      logs[4].newStatus === 'RESOLVED' &&
      logs[5].newStatus === 'CLOSED',
    'StatusLog sequence matches exact lifecycle: PENDING -> APPROVED -> ASSIGNED -> IN_PROGRESS -> RESOLVED -> CLOSED'
  );

  // 3. Lifecycle Flow: Rejection Flow
  const createRes2 = await request(
    'POST',
    '/api/complaints',
    {
      category: 'INTERNET',
      description: 'WiFi signal dropped for 1 minute',
    },
    studentToken
  );
  const complaint2Id = createRes2.body.data.id;

  // Rejection without reason (400 Bad Request)
  const rejNoReason = await request('PATCH', `/api/complaints/${complaint2Id}/reject`, {}, wardenToken);
  assert(rejNoReason.status === 400, 'Rejection without reason returns 400 Bad Request');

  // Valid rejection with reason
  const rejRes = await request(
    'PATCH',
    `/api/complaints/${complaint2Id}/reject`,
    { rejectionReason: 'Temporary glitch, service self-restored. Duplicate issue.' },
    wardenToken
  );
  assert(rejRes.status === 200 && rejRes.body.data.status === 'REJECTED', 'Warden rejects PENDING -> REJECTED');
  assert(rejRes.body.data.rejectionReason.length > 0, 'Rejection reason is stored on complaint');

  // Verify rejection is terminal
  const rejApprove = await request('PATCH', `/api/complaints/${complaint2Id}/approve`, null, wardenToken);
  assert(rejApprove.status === 400, 'Rejected complaint cannot be approved (terminal state) -> 400');

  const rejAssign = await request(
    'PATCH',
    `/api/complaints/${complaint2Id}/assign`,
    { staffId },
    wardenToken
  );
  assert(rejAssign.status === 400, 'Rejected complaint cannot be assigned -> 400');

  // 4. Role Authorization Checks
  // Student unauthorized actions
  const studentApprove = await request('PATCH', `/api/complaints/${complaintId}/approve`, null, studentToken);
  assert(studentApprove.status === 403, 'Student cannot approve complaints -> 403');

  const studentReject = await request('PATCH', `/api/complaints/${complaintId}/reject`, { rejectionReason: 'test' }, studentToken);
  assert(studentReject.status === 403, 'Student cannot reject complaints -> 403');

  const studentAssign = await request('PATCH', `/api/complaints/${complaintId}/assign`, { staffId }, studentToken);
  assert(studentAssign.status === 403, 'Student cannot assign complaints -> 403');

  const studentClose = await request('PATCH', `/api/complaints/${complaintId}/close`, null, studentToken);
  assert(studentClose.status === 403, 'Student cannot close complaints -> 403');

  // Student accessing another student's complaint
  const otherStudentDetail = await request('GET', `/api/complaints/${complaintId}`, null, student2Token);
  assert(otherStudentDetail.status === 403, 'Student cannot view another student complaint -> 403');

  // Staff unauthorized actions
  const staffApprove = await request('PATCH', `/api/complaints/${complaintId}/approve`, null, staffToken);
  assert(staffApprove.status === 403, 'Staff cannot approve complaints -> 403');

  const staffClose = await request('PATCH', `/api/complaints/${complaintId}/close`, null, staffToken);
  assert(staffClose.status === 403, 'Staff cannot close complaints -> 403');

  // Staff accessing/modifying complaint assigned to a different staff member
  const otherStaffDetail = await request('GET', `/api/complaints/${complaintId}`, null, staff2Token);
  assert(otherStaffDetail.status === 403, 'Staff cannot view complaints not assigned to them -> 403');

  const otherStaffUpdate = await request(
    'PATCH',
    `/api/complaints/${complaintId}/status`,
    { status: 'IN_PROGRESS' },
    staff2Token
  );
  assert(otherStaffUpdate.status === 403, 'Staff cannot update status of complaints assigned to another staff -> 403');

  // 5. Invalid Transition Checks
  // Create another pending complaint
  const createRes3 = await request(
    'POST',
    '/api/complaints',
    { category: 'PLUMBING', description: 'Water leakage in common washroom' },
    studentToken
  );
  const complaint3Id = createRes3.body.data.id;

  // PENDING -> ASSIGNED (cannot skip APPROVED)
  const invalidAssign = await request('PATCH', `/api/complaints/${complaint3Id}/assign`, { staffId }, wardenToken);
  assert(invalidAssign.status === 400, 'PENDING -> ASSIGNED is rejected (must be APPROVED first) -> 400');

  // PENDING -> CLOSED
  const invalidClose = await request('PATCH', `/api/complaints/${complaint3Id}/close`, null, wardenToken);
  assert(invalidClose.status === 400, 'PENDING -> CLOSED is rejected -> 400');

  // CLOSED -> IN_PROGRESS
  const invalidReopen = await request(
    'PATCH',
    `/api/complaints/${complaintId}/status`,
    { status: 'IN_PROGRESS' },
    staffToken
  );
  assert(invalidReopen.status === 400, 'CLOSED -> IN_PROGRESS is rejected -> 400');

  console.log(`\n=== Results: ${passed}/${total} tests passed ===`);
  if (passed === total) {
    console.log('🎉 ALL COMPLAINT WORKFLOW & PERMISSION TESTS PASSED!\n');
    process.exit(0);
  } else {
    console.error('❌ Some complaint workflow tests failed.');
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error('Test execution error:', err);
  process.exit(1);
});
