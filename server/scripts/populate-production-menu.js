const https = require('https');
const { CHITKARA_MESS_MENU } = require('./update-mess-menu');

const API_BASE = 'https://hostelfix-api-8qa7.onrender.com';
const WARDEN_EMAIL = 'warden@hostelfix.demo';
const WARDEN_PASS = 'Demo@1234';

function request(method, path, body = null, token = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, API_BASE);
    const headers = { 'Content-Type': 'application/json' };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const req = https.request(
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
            resolve({ status: res.statusCode, data: parsed });
          } catch (e) {
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

async function run() {
  console.log('====================================================');
  console.log(' HostelFix — Production Mess Menu Seeder / Syncer  ');
  console.log('====================================================\n');

  // 1. Authenticate as Warden
  console.log('[1/6] Authenticating as Warden...');
  const loginRes = await request('POST', '/api/auth/login', {
    email: WARDEN_EMAIL,
    password: WARDEN_PASS,
  });

  if (loginRes.status !== 200 || !loginRes.data?.data?.token) {
    throw new Error(`Warden login failed: ${JSON.stringify(loginRes.data)}`);
  }

  const token = loginRes.data.data.token;
  console.log('      ✓ Authenticated successfully as', loginRes.data.data.user.name);

  // 2. Fetch current menu
  console.log('\n[2/6] Checking current production MessMenu records...');
  const initialRes = await request('GET', '/api/mess', null, token);
  if (initialRes.status !== 200) {
    throw new Error(`Failed to fetch current menu: ${JSON.stringify(initialRes.data)}`);
  }
  const currentMenu = initialRes.data.data || [];
  const countBefore = currentMenu.length;
  console.log(`      ✓ Initial MessMenu record count: ${countBefore}`);

  // 3. Compute weekOf (Monday of current week)
  const today = new Date();
  const day = today.getDay();
  const diff = today.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(today.setDate(diff));
  monday.setHours(0, 0, 0, 0);

  // 4. Upsert all 28 records
  console.log(`\n[3/6] Upserting 28 official Chitkara University meal records (week of ${monday.toISOString().split('T')[0]})...`);
  let insertedCount = 0;
  let updatedCount = 0;

  for (const item of CHITKARA_MESS_MENU) {
    const existing = currentMenu.find(
      (m) => m.dayOfWeek.toLowerCase() === item.day.toLowerCase() && m.mealType === item.mealType
    );

    if (existing) {
      const updateRes = await request('PUT', `/api/mess/${existing.id}`, {
        items: item.items,
        dayOfWeek: item.day,
        mealType: item.mealType,
      }, token);

      if (updateRes.status !== 200) {
        throw new Error(`Failed to update ${item.day} ${item.mealType}: ${JSON.stringify(updateRes.data)}`);
      }
      updatedCount++;
      console.log(`      ↻ Updated: [${item.day}] ${item.mealType}`);
    } else {
      const createRes = await request('POST', '/api/mess', {
        dayOfWeek: item.day,
        mealType: item.mealType,
        items: item.items,
        weekOf: monday.toISOString(),
      }, token);

      if (createRes.status !== 201) {
        throw new Error(`Failed to create ${item.day} ${item.mealType}: ${JSON.stringify(createRes.data)}`);
      }
      insertedCount++;
      console.log(`      + Created: [${item.day}] ${item.mealType}`);
    }
  }

  // 5. Verify final records via GET /api/mess
  console.log('\n[4/6] Verifying production GET /api/mess...');
  const finalRes = await request('GET', '/api/mess', null, token);
  if (finalRes.status !== 200) {
    throw new Error(`Failed to fetch final menu: ${JSON.stringify(finalRes.data)}`);
  }
  const finalMenu = finalRes.data.data || [];
  const countAfter = finalMenu.length;
  console.log(`      ✓ Final MessMenu record count: ${countAfter}`);

  // 6. Detailed breakdown per day
  console.log('\n[5/6] Verifying 4 meal records per day:');
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const expectedMeals = ['BREAKFAST', 'LUNCH', 'SNACKS', 'DINNER'];
  let allDaysValid = true;

  for (const d of days) {
    const dayRecords = finalMenu.filter((m) => m.dayOfWeek.toLowerCase() === d.toLowerCase());
    const meals = dayRecords.map((m) => m.mealType);
    const hasAllMeals = expectedMeals.every((m) => meals.includes(m));
    const countOk = dayRecords.length === 4;
    const ok = countOk && hasAllMeals;
    if (!ok) allDaysValid = false;

    console.log(`      ${ok ? '✓' : '✗'} ${d.padEnd(10)}: ${dayRecords.length} meals (${meals.join(', ')})`);
  }

  // 7. Student view verification
  console.log('\n[6/6] Verifying Student login & mess menu view...');
  const studentLogin = await request('POST', '/api/auth/login', {
    email: 'student@hostelfix.demo',
    password: 'Demo@1234',
  });
  if (studentLogin.status === 200 && studentLogin.data?.data?.token) {
    const studentMenuRes = await request('GET', '/api/mess', null, studentLogin.data.data.token);
    console.log(`      ✓ Student GET /api/mess returned ${studentMenuRes.data.data?.length} records.`);
  }

  console.log('\n====================================================');
  console.log(' RESULTS SUMMARY');
  console.log('====================================================');
  console.log(`Count Before:          ${countBefore}`);
  console.log(`Inserted:              ${insertedCount}`);
  console.log(`Updated:               ${updatedCount}`);
  console.log(`Count After:           ${countAfter}`);
  console.log(`All 7 Days Have 4 Meals: ${allDaysValid ? 'YES (All 28 verified)' : 'NO'}`);
  console.log(`API Status:            Healthy & Returning ${countAfter} items`);
  console.log('====================================================\n');
}

run().catch((err) => {
  console.error('\n❌ Execution failed:', err);
  process.exit(1);
});
