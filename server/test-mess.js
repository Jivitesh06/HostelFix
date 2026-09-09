/**
 * Automated test suite for Phase 3D: Mess Management & Student Feedback
 * Tests:
 * 1. Health check
 * 2. Role-based access control (Student vs Warden vs Staff)
 * 3. Menu retrieval with computed ratings
 * 4. Menu slot creation, update, and deletion (Warden)
 * 5. Student meal feedback submission and rating validation
 * 6. Warden feedback list retrieval with relations
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
  console.log('=== Running Phase 3D Mess & Feedback Test Suite ===\n');
  let passed = 0;
  let total = 0;

  function assert(condition, name) {
    total++;
    if (condition) {
      console.log(`  ✅ [PASS] ${name}`);
      passed++;
    } else {
      console.error(`  ❌ [FAIL] ${name}`);
    }
  }

  try {
    // 1. Health check
    const health = await request('GET', '/api/health');
    assert(health.status === 200 && health.body.success === true, 'GET /api/health returns 200');

    // 2. Authenticate demo users
    const studentLogin = await request('POST', '/api/auth/login', {
      email: 'student@hostelfix.demo',
      password: 'Demo@1234',
    });
    assert(studentLogin.status === 200, 'Student login succeeds');
    const studentToken = studentLogin.body.data.token;

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

    // 3. Menu retrieval
    const noAuthMenu = await request('GET', '/api/mess');
    assert(noAuthMenu.status === 401, 'GET /api/mess rejects unauthenticated request (401)');

    const studentMenu = await request('GET', '/api/mess', null, studentToken);
    assert(studentMenu.status === 200 && Array.isArray(studentMenu.body.data), 'Student can retrieve mess menu (200)');
    assert(studentMenu.body.data.length > 0, 'Menu contains seeded meal entries');
    const firstMeal = studentMenu.body.data[0];
    assert('averageRating' in firstMeal && 'feedbackCount' in firstMeal, 'Menu entries include computed averageRating & feedbackCount');

    // 4. Role Authorization Checks
    const studentCreateAttempt = await request('POST', '/api/mess', {
      dayOfWeek: 'Friday',
      mealType: 'SNACKS',
      items: 'Pakora & Chai',
    }, studentToken);
    assert(studentCreateAttempt.status === 403, 'Student cannot create menu slot (403)');

    const staffCreateAttempt = await request('POST', '/api/mess', {
      dayOfWeek: 'Friday',
      mealType: 'SNACKS',
      items: 'Pakora & Chai',
    }, staffToken);
    assert(staffCreateAttempt.status === 403, 'Staff cannot create menu slot (403)');

    const studentFeedbackListAttempt = await request('GET', '/api/mess/feedback', null, studentToken);
    assert(studentFeedbackListAttempt.status === 403, 'Student cannot view warden feedback list (403)');

    // 5. Input validation on Warden creation
    const invalidMealType = await request('POST', '/api/mess', {
      dayOfWeek: 'Friday',
      mealType: 'MIDNIGHT_SNACK',
      items: 'Maggi',
    }, wardenToken);
    assert(invalidMealType.status === 400, 'Warden creation rejects invalid mealType (400)');

    const missingItems = await request('POST', '/api/mess', {
      dayOfWeek: 'Friday',
      mealType: 'DINNER',
      items: '   ',
    }, wardenToken);
    assert(missingItems.status === 400, 'Warden creation rejects empty items (400)');

    // 6. Warden Creates Valid Menu Entry
    const createRes = await request('POST', '/api/mess', {
      dayOfWeek: 'Saturday',
      mealType: 'SNACKS',
      items: 'Hot Samosas with Green Chutney and Masala Chai',
    }, wardenToken);
    assert(createRes.status === 201 && createRes.body.success === true, 'Warden creates new menu entry (201)');
    const createdSlot = createRes.body.data;
    assert(createdSlot.items.includes('Hot Samosas'), 'Created slot contains correct food items');

    // 7. Student Submits Feedback
    const invalidRatingLow = await request('POST', `/api/mess/${createdSlot.id}/feedback`, {
      rating: 0,
      comment: 'Bad',
    }, studentToken);
    assert(invalidRatingLow.status === 400, 'Feedback rejects rating < 1 (400)');

    const invalidRatingHigh = await request('POST', `/api/mess/${createdSlot.id}/feedback`, {
      rating: 6,
      comment: 'Awesome',
    }, studentToken);
    assert(invalidRatingHigh.status === 400, 'Feedback rejects rating > 5 (400)');

    const wardenFeedbackAttempt = await request('POST', `/api/mess/${createdSlot.id}/feedback`, {
      rating: 5,
    }, wardenToken);
    assert(wardenFeedbackAttempt.status === 403, 'Warden cannot submit student feedback (403)');

    const validFeedback = await request('POST', `/api/mess/${createdSlot.id}/feedback`, {
      rating: 5,
      comment: 'Delicious samosas! Very crispy and fresh.',
    }, studentToken);
    assert(validFeedback.status === 201 && validFeedback.body.success === true, 'Student submits valid 5-star feedback (201)');

    // Verify rating reflected on GET /api/mess
    const updatedMenu = await request('GET', '/api/mess', null, studentToken);
    const checkedSlot = updatedMenu.body.data.find((m) => m.id === createdSlot.id);
    assert(checkedSlot && checkedSlot.averageRating === 5 && checkedSlot.feedbackCount === 1, 'Computed average rating and feedback count accurately reflect new review');

    // 8. Warden Retrieves All Feedback
    const feedbackList = await request('GET', '/api/mess/feedback', null, wardenToken);
    assert(feedbackList.status === 200 && Array.isArray(feedbackList.body.data), 'Warden retrieves all feedback (200)');
    const foundFeedback = feedbackList.body.data.find((f) => f.messMenuId === createdSlot.id);
    assert(foundFeedback && foundFeedback.student && foundFeedback.student.name, 'Feedback record contains student details');
    assert(foundFeedback && foundFeedback.messMenu && foundFeedback.messMenu.mealType === 'SNACKS', 'Feedback record contains messMenu relation');

    // 9. Warden Updates Menu Entry
    const updateRes = await request('PUT', `/api/mess/${createdSlot.id}`, {
      items: 'Hot Samosas with Green Chutney, Jalebi, and Masala Chai',
    }, wardenToken);
    assert(updateRes.status === 200 && updateRes.body.data.items.includes('Jalebi'), 'Warden updates menu items (200)');

    // 10. Warden Deletes Menu Entry
    const deleteRes = await request('DELETE', `/api/mess/${createdSlot.id}`, null, wardenToken);
    assert(deleteRes.status === 200 && deleteRes.body.success === true, 'Warden deletes menu entry and associated feedbacks (200)');

    const finalMenu = await request('GET', '/api/mess', null, studentToken);
    const deletedSlotFound = finalMenu.body.data.some((m) => m.id === createdSlot.id);
    assert(!deletedSlotFound, 'Deleted slot no longer exists in menu');

    console.log(`\n=== Results: ${passed}/${total} passed ===\n`);
    if (passed === total) {
      console.log('🎉 ALL MESS MANAGEMENT & FEEDBACK TESTS PASSED!\n');
      process.exit(0);
    } else {
      console.error('⚠️ SOME TESTS FAILED.\n');
      process.exit(1);
    }
  } catch (err) {
    console.error('Fatal test error:', err);
    process.exit(1);
  }
}

runTests();
