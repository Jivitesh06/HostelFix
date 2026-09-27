/**
 * HostelFix — Automated Test Suite: Warden "Update Weekly Menu from Photo" (OCR & Publish)
 *
 * Tests:
 * 1. Health & Server initialization
 * 2. RBAC verification:
 *    - Unauthenticated cannot call extract-menu-photo or publish-weekly-menu (401)
 *    - STUDENT cannot call extract-menu-photo or publish-weekly-menu (403)
 *    - STAFF cannot call extract-menu-photo or publish-weekly-menu (403)
 *    - WARDEN can access both endpoints
 * 3. File validation on extract-menu-photo:
 *    - Missing file rejected (400)
 *    - Invalid file format rejected (400)
 * 4. Image upload & OCR parsing:
 *    - Upload valid PNG/JPEG
 *    - Returns Cloudinary/image URL, 28 structured slots, weekOf, and uncertain count
 * 5. Incomplete / blank image handling:
 *    - Graceful fallback with 28 default template slots and clear feedback
 * 6. Server-side validation on publish-weekly-menu:
 *    - Array length != 28 rejected (400)
 *    - Invalid day rejected (400)
 *    - Invalid meal type rejected (400)
 *    - Empty meal item rejected (400)
 *    - Duplicate meal slot rejected (400)
 * 7. Editing OCR output & Publishing:
 *    - Warden edits extracted items and successfully publishes all 28 slots (200)
 *    - Database has exactly 28 records across all 7 days (4 meals/day)
 * 8. Preservation of MenuFeedback:
 *    - Attaches student feedback to a slot before update
 *    - Re-publishes menu
 *    - Confirms student feedback is preserved intact
 * 9. Idempotent publish:
 *    - Second publish updates in-place without creating duplicate slots
 */

const http = require('http');
const prisma = require('./src/config/prisma');
const app = require('./src/server');
const { parseMenuText, getDefaultEmptyMenu, DAYS, MEALS } = require('./src/services/menuOcr.service');

const TEST_PORT = 5098;
const BASE_URL = `http://localhost:${TEST_PORT}`;

let server;

function request(method, path, body = null, token = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const reqHeaders = { ...headers };
    if (token) reqHeaders['Authorization'] = `Bearer ${token}`;
    if (body && !reqHeaders['Content-Type'] && !(body instanceof Buffer)) {
      reqHeaders['Content-Type'] = 'application/json';
    }

    const req = http.request(url, { method, headers: reqHeaders }, (res) => {
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
    if (body) {
      if (typeof body === 'object' && !(body instanceof Buffer) && !Buffer.isBuffer(body)) {
        req.write(JSON.stringify(body));
      } else {
        req.write(body);
      }
    }
    req.end();
  });
}

// Multipart helper for file upload tests
function sendMultipart(path, filename, mimeType, fileBuffer, token = null) {
  return new Promise((resolve, reject) => {
    const boundary = '----WebKitFormBoundary' + Math.random().toString(36).substring(2);
    const header = `--${boundary}\r\nContent-Disposition: form-data; name="image"; filename="${filename}"\r\nContent-Type: ${mimeType}\r\n\r\n`;
    const footer = `\r\n--${boundary}--\r\n`;

    const payload = Buffer.concat([
      Buffer.from(header, 'utf8'),
      fileBuffer,
      Buffer.from(footer, 'utf8'),
    ]);

    const url = new URL(path, BASE_URL);
    const req = http.request(
      url,
      {
        method: 'POST',
        headers: {
          'Content-Type': `multipart/form-data; boundary=${boundary}`,
          'Content-Length': payload.length,
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      },
      (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
          try {
            resolve({ status: res.statusCode, body: JSON.parse(data) });
          } catch {
            resolve({ status: res.statusCode, raw: data });
          }
        });
      }
    );

    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

async function runTests() {
  console.log('╔══════════════════════════════════════════════════════════════════╗');
  console.log('║  HostelFix — Warden Menu Photo OCR & Publish Test Suite         ║');
  console.log('╚══════════════════════════════════════════════════════════════════╝\n');

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

  // Start test server
  await new Promise((res) => {
    server = app.listen(TEST_PORT, () => {
      console.log(`  [Setup] Test server running on port ${TEST_PORT}\n`);
      res();
    });
  });

  try {
    // ── 1. Unit Test OCR Parsing Algorithm ──────────────────────────────────
    console.log('--- 1. OCR Parsing Algorithm Unit Tests ---');
    const emptyMenu = getDefaultEmptyMenu();
    assert(emptyMenu.length === 28, 'getDefaultEmptyMenu returns exactly 28 slots');
    assert(emptyMenu.every((s) => s.isUncertain === true), 'Empty slots all marked isUncertain');

    const sampleText = `
CHITKARA MESS SCHEDULE
MONDAY
Breakfast: Paneer Paratha, Butter, Pickle, Curd
Lunch: Rajma Masala, Steamed Rice, Salad, Roti
Evening Snacks: Hot Tea and Samosa
Dinner: Dal Makhani, Mixed Veg, Jeera Rice, Gulab Jamun

TUESDAY
Breakfast: Masala Dosa, Sambar, Coconut Chutney
Lunch: Kadhi Pakora, Jeera Aloo, Roti, Rice
Snacks: Cold Coffee and Cookies
Dinner: Chana Masala, Seasonal Sabzi, Rice, Wheat Roti

WEDNESDAY
Breakfast: Poha, Boiled Eggs, Tea
Lunch: Dal Tadka, Seasonal Veg, Rice, Roti
Snacks: Veg Sandwich, Chai
Dinner: Shahi Paneer, Pulao, Roti, Salad

THURSDAY
Breakfast: Pav Bhaji, Tea
Lunch: Chole Chawal, Boondi Raita, Salad
Snacks: Veg Pasta, Juice
Dinner: Moong Dal, Aloo Gobi, Roti, Rice

FRIDAY
Breakfast: Idli Vada, Sambar, Chutney
Lunch: Mix Veg, Dal Fry, Jeera Rice, Roti
Snacks: Bread Pakora, Tea
Dinner: Kadhai Paneer, Rice, Roti, Halwa

SATURDAY
Breakfast: Upma, Banana, Tea
Lunch: Rajma Chawal, Curd, Salad
Snacks: Bhelpuri, Nimbu Pani
Dinner: Dal Arhar, Bhindi Masala, Roti, Rice

SUNDAY
Breakfast: Chole Bhature, Sweet Lassi
Lunch: Dum Biryani, Mint Raita, Salad
Snacks: Ice Cream, Tea
Dinner: Paneer Butter Masala, Roti, Pulao, Kheer
`;

    const parsed = parseMenuText(sampleText);
    assert(parsed.menu.length === 28, 'parseMenuText parses exactly 28 slots');
    assert(parsed.uncertainCount === 0, 'Clean input has 0 uncertain slots');
    assert(
      parsed.menu.find((s) => s.dayOfWeek === 'Monday' && s.mealType === 'BREAKFAST').items.includes('Paneer Paratha'),
      'Monday Breakfast parsed correctly'
    );
    assert(
      parsed.menu.find((s) => s.dayOfWeek === 'Sunday' && s.mealType === 'LUNCH').items.includes('Dum Biryani'),
      'Sunday Lunch parsed correctly'
    );

    // ── 2. Authenticate Users ────────────────────────────────────────────────
    console.log('\n--- 2. Authentication & Tokens ---');
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

    // ── 3. RBAC Endpoint Security ───────────────────────────────────────────
    console.log('\n--- 3. RBAC Endpoint Security Tests ---');
    // Extract endpoint RBAC
    const noAuthExtract = await request('POST', '/api/mess/extract-menu-photo');
    assert(noAuthExtract.status === 401, 'POST /api/mess/extract-menu-photo requires authentication (401)');

    const studentExtract = await request('POST', '/api/mess/extract-menu-photo', {}, studentToken);
    assert(studentExtract.status === 403, 'POST /api/mess/extract-menu-photo forbids STUDENT (403)');

    const staffExtract = await request('POST', '/api/mess/extract-menu-photo', {}, staffToken);
    assert(staffExtract.status === 403, 'POST /api/mess/extract-menu-photo forbids STAFF (403)');

    // Publish endpoint RBAC
    const noAuthPublish = await request('POST', '/api/mess/publish-weekly-menu');
    assert(noAuthPublish.status === 401, 'POST /api/mess/publish-weekly-menu requires authentication (401)');

    const studentPublish = await request('POST', '/api/mess/publish-weekly-menu', {}, studentToken);
    assert(studentPublish.status === 403, 'POST /api/mess/publish-weekly-menu forbids STUDENT (403)');

    const staffPublish = await request('POST', '/api/mess/publish-weekly-menu', {}, staffToken);
    assert(staffPublish.status === 403, 'POST /api/mess/publish-weekly-menu forbids STAFF (403)');

    // ── 4. File Upload & OCR Endpoint Validation ─────────────────────────────
    console.log('\n--- 4. Extract Menu Photo File Validation ---');
    // Valid 1x1 PNG buffer
    const validPngBuffer = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=',
      'base64'
    );

    // Missing file
    const missingFileRes = await request('POST', '/api/mess/extract-menu-photo', {}, wardenToken);
    assert(missingFileRes.status === 400, 'Warden upload without file returns 400');

    // Invalid file type (e.g. .txt)
    const invalidTypeRes = await sendMultipart(
      '/api/mess/extract-menu-photo',
      'menu.txt',
      'text/plain',
      Buffer.from('hello menu'),
      wardenToken
    );
    assert(invalidTypeRes.status === 400, 'Warden upload non-image returns 400');

    // Valid image upload
    const validUploadRes = await sendMultipart(
      '/api/mess/extract-menu-photo',
      'menu.png',
      'image/png',
      validPngBuffer,
      wardenToken
    );
    assert(validUploadRes.status === 200, 'Warden upload valid image returns 200');
    assert(validUploadRes.body.data && Array.isArray(validUploadRes.body.data.menu), 'Returns menu array');
    assert(validUploadRes.body.data.menu.length === 28, 'Returns exactly 28 slots for review');
    assert(Boolean(validUploadRes.body.data.imageUrl), 'Returns uploaded image reference URL');
    assert(Boolean(validUploadRes.body.data.weekOf), 'Returns current week Monday date');

    // ── 5. Server-side Validation on publish-weekly-menu ────────────────────
    console.log('\n--- 5. Server-side Validation on publish-weekly-menu ---');
    // Incomplete menu (not 28 items)
    const incompleteRes = await request('POST', '/api/mess/publish-weekly-menu', {
      menu: [{ dayOfWeek: 'Monday', mealType: 'BREAKFAST', items: 'Poha' }],
    }, wardenToken);
    assert(incompleteRes.status === 400, 'Publishing fewer than 28 items returns 400');

    // Build valid 28 items base
    const valid28Items = [];
    for (const d of DAYS) {
      for (const m of MEALS) {
        valid28Items.push({
          dayOfWeek: d,
          mealType: m,
          items: `Official ${d} ${m} Meal`,
        });
      }
    }

    // Invalid day
    const invalidDayMenu = JSON.parse(JSON.stringify(valid28Items));
    invalidDayMenu[0].dayOfWeek = 'Funday';
    const invalidDayRes = await request('POST', '/api/mess/publish-weekly-menu', {
      menu: invalidDayMenu,
    }, wardenToken);
    assert(invalidDayRes.status === 400, 'Invalid day of week rejected (400)');

    // Invalid meal type
    const invalidMealMenu = JSON.parse(JSON.stringify(valid28Items));
    invalidMealMenu[0].mealType = 'MIDNIGHT_SNACK';
    const invalidMealRes = await request('POST', '/api/mess/publish-weekly-menu', {
      menu: invalidMealMenu,
    }, wardenToken);
    assert(invalidMealRes.status === 400, 'Invalid meal type rejected (400)');

    // Empty meal items
    const emptyItemMenu = JSON.parse(JSON.stringify(valid28Items));
    emptyItemMenu[0].items = '   ';
    const emptyItemRes = await request('POST', '/api/mess/publish-weekly-menu', {
      menu: emptyItemMenu,
    }, wardenToken);
    assert(emptyItemRes.status === 400, 'Empty meal items string rejected (400)');

    // Duplicate meal slot
    const duplicateSlotMenu = JSON.parse(JSON.stringify(valid28Items));
    duplicateSlotMenu[1] = { ...duplicateSlotMenu[0] };
    const duplicateRes = await request('POST', '/api/mess/publish-weekly-menu', {
      menu: duplicateSlotMenu,
    }, wardenToken);
    assert(duplicateRes.status === 400, 'Duplicate meal slot for same day rejected (400)');

    // ── 6. Successful Publish & Feedbacks Preservation ──────────────────────
    console.log('\n--- 6. Publishing 28 Slots & Feedback Preservation ---');
    // Prepare sample menu with custom edited item
    const reviewedMenu = JSON.parse(JSON.stringify(valid28Items));
    reviewedMenu[0].items = 'Reviewed Aloo Paratha, Butter, Pickle, Curd';

    const publishRes = await request('POST', '/api/mess/publish-weekly-menu', {
      menu: reviewedMenu,
      weekOf: '2026-09-28',
      imageUrl: 'https://res.cloudinary.com/demo/image/upload/sample_menu.jpg',
    }, wardenToken);

    assert(publishRes.status === 200, 'Warden successfully publishes 28-slot menu (200)');
    assert(publishRes.body.data.totalSlots === 28, 'Database reports 28 total slots');

    // Retrieve active menu via GET /api/mess
    const getMenuRes = await request('GET', '/api/mess', null, studentToken);
    assert(getMenuRes.status === 200, 'Student retrieves published menu (200)');
    assert(getMenuRes.body.data.length === 28, 'GET /api/mess returns 28 items');

    const firstSlot = getMenuRes.body.data.find(
      (m) => m.dayOfWeek === 'Monday' && m.mealType === 'BREAKFAST'
    );
    assert(firstSlot.items === 'Reviewed Aloo Paratha, Butter, Pickle, Curd', 'Edited slot persisted accurately');

    // Attach student feedback to this slot
    const feedbackRes = await request('POST', `/api/mess/${firstSlot.id}/feedback`, {
      rating: 5,
      comment: 'Delicious breakfast, loved the parathas!',
    }, studentToken);
    assert(feedbackRes.status === 201, 'Student successfully submits feedback on slot');

    // Now re-publish with edited lunch items (simulating next week or menu adjustment)
    const secondEdit = JSON.parse(JSON.stringify(reviewedMenu));
    secondEdit[1].items = 'Updated Lunch: Rajma Chawal Special';

    const republishRes = await request('POST', '/api/mess/publish-weekly-menu', {
      menu: secondEdit,
      weekOf: '2026-09-28',
    }, wardenToken);
    assert(republishRes.status === 200, 'Re-publishing menu succeeds (200)');

    // Verify feedback is PRESERVED on the first slot!
    const verifyFeedbackMenu = await request('GET', '/api/mess', null, studentToken);
    const updatedFirstSlot = verifyFeedbackMenu.body.data.find((m) => m.id === firstSlot.id);
    assert(Boolean(updatedFirstSlot), 'Slot ID preserved');
    assert(updatedFirstSlot.feedbacks && updatedFirstSlot.feedbacks.length >= 1, 'Student feedback was preserved across publish!');
    const foundComment = updatedFirstSlot.feedbacks?.some(f => f.comment === 'Delicious breakfast, loved the parathas!');
    assert(foundComment, 'Feedback comment intact');

    // ── 7. Idempotency & Count Verification ─────────────────────────────────
    console.log('\n--- 7. Idempotency & Row Count Verification ---');
    const dbCount = await prisma.messMenu.count();
    assert(dbCount === 28, `Prisma reports exact row count of 28 (Actual: ${dbCount})`);

    const daysCount = {};
    for (const item of verifyFeedbackMenu.body.data) {
      daysCount[item.dayOfWeek] = (daysCount[item.dayOfWeek] || 0) + 1;
    }
    const allDaysHave4 = DAYS.every((d) => daysCount[d] === 4);
    assert(allDaysHave4, 'All 7 days have exactly 4 meal entries');

    console.log('\n══════════════════════════════════════════════════════════════════');
    console.log(` Results: ${passed}/${total} assertions passed`);
    console.log('══════════════════════════════════════════════════════════════════\n');

    if (passed === total) {
      console.log('🎉 ALL WARDEN MENU PHOTO OCR & PUBLISH TESTS PASSED!\n');
      process.exit(0);
    } else {
      console.error('⚠️ SOME TESTS FAILED.\n');
      process.exit(1);
    }
  } catch (err) {
    console.error('Fatal test execution error:', err);
    process.exit(1);
  } finally {
    if (server) server.close();
    await prisma.$disconnect();
  }
}

runTests();
