/**
 * HostelFix Database Seed Script
 * Creates demo accounts and sample data for development and evaluation.
 *
 * Demo accounts:
 *   student@hostelfix.demo  / Demo@1234
 *   warden@hostelfix.demo   / Demo@1234
 *   staff@hostelfix.demo    / Demo@1234
 *
 * Run: node prisma/seed.js  (from server/ directory)
 */

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const prisma = new PrismaClient();

const DEMO_PASSWORD = 'Demo@1234';
const SALT_ROUNDS = 10;

async function main() {
  console.log('[Seed] Starting database seed...');

  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, SALT_ROUNDS);

  // ── 1. Demo Users ───────────────────────────────────────────────────────────
  console.log('[Seed] Creating demo users...');

  const student = await prisma.user.upsert({
    where: { email: 'student@hostelfix.demo' },
    update: {},
    create: {
      name: 'Demo Student',
      email: 'student@hostelfix.demo',
      passwordHash,
      role: 'STUDENT',
      roomNumber: 'A-101',
      hostelBlock: 'Block A',
    },
  });

  const student2 = await prisma.user.upsert({
    where: { email: 'student2@hostelfix.demo' },
    update: {},
    create: {
      name: 'Priya Sharma',
      email: 'student2@hostelfix.demo',
      passwordHash,
      role: 'STUDENT',
      roomNumber: 'B-205',
      hostelBlock: 'Block B',
    },
  });

  const warden = await prisma.user.upsert({
    where: { email: 'warden@hostelfix.demo' },
    update: {},
    create: {
      name: 'Demo Warden',
      email: 'warden@hostelfix.demo',
      passwordHash,
      role: 'WARDEN',
    },
  });

  const staff = await prisma.user.upsert({
    where: { email: 'staff@hostelfix.demo' },
    update: {},
    create: {
      name: 'Demo Staff',
      email: 'staff@hostelfix.demo',
      passwordHash,
      role: 'STAFF',
      staffCategory: 'Plumber',
    },
  });

  const staff2 = await prisma.user.upsert({
    where: { email: 'staff2@hostelfix.demo' },
    update: {},
    create: {
      name: 'Ravi Electrician',
      email: 'staff2@hostelfix.demo',
      passwordHash,
      role: 'STAFF',
      staffCategory: 'Electrician',
    },
  });

  console.log('[Seed] Users created:', student.email, warden.email, staff.email);

  // ── 2. Demo Complaints ──────────────────────────────────────────────────────
  console.log('[Seed] Creating demo complaints...');

  // Complaint 1: PENDING — just submitted
  const complaint1 = await prisma.complaint.create({
    data: {
      studentId: student.id,
      category: 'ELECTRICAL',
      description: 'The tube light in my room A-101 is flickering and needs replacement.',
      status: 'PENDING',
    },
  });
  await prisma.statusLog.create({
    data: {
      complaintId: complaint1.id,
      oldStatus: null,
      newStatus: 'PENDING',
      changedById: student.id,
      note: 'Complaint submitted by student',
    },
  });

  // Complaint 2: IN_PROGRESS — approved, assigned, staff working on it
  const complaint2 = await prisma.complaint.create({
    data: {
      studentId: student.id,
      category: 'PLUMBING',
      description: 'Bathroom tap is leaking continuously since two days. Water is being wasted.',
      status: 'IN_PROGRESS',
      assignedStaffId: staff.id,
    },
  });
  await prisma.statusLog.createMany({
    data: [
      { complaintId: complaint2.id, oldStatus: null,       newStatus: 'PENDING',     changedById: student.id,  note: 'Complaint submitted' },
      { complaintId: complaint2.id, oldStatus: 'PENDING',  newStatus: 'APPROVED',    changedById: warden.id,   note: 'Complaint verified and approved' },
      { complaintId: complaint2.id, oldStatus: 'APPROVED', newStatus: 'ASSIGNED',    changedById: warden.id,   note: 'Assigned to Demo Staff (Plumber)' },
      { complaintId: complaint2.id, oldStatus: 'ASSIGNED', newStatus: 'IN_PROGRESS', changedById: staff.id,    note: 'Work started' },
    ],
  });

  // Complaint 3: CLOSED — full lifecycle completed
  const complaint3 = await prisma.complaint.create({
    data: {
      studentId: student2.id,
      category: 'CLEANING',
      description: 'The corridor on second floor of Block B has not been cleaned for 3 days.',
      status: 'CLOSED',
      assignedStaffId: staff.id,
    },
  });
  await prisma.statusLog.createMany({
    data: [
      { complaintId: complaint3.id, oldStatus: null,          newStatus: 'PENDING',     changedById: student2.id, note: 'Complaint submitted' },
      { complaintId: complaint3.id, oldStatus: 'PENDING',     newStatus: 'APPROVED',    changedById: warden.id,   note: 'Approved' },
      { complaintId: complaint3.id, oldStatus: 'APPROVED',    newStatus: 'ASSIGNED',    changedById: warden.id,   note: 'Assigned to Demo Staff' },
      { complaintId: complaint3.id, oldStatus: 'ASSIGNED',    newStatus: 'IN_PROGRESS', changedById: staff.id,    note: 'Cleaning started' },
      { complaintId: complaint3.id, oldStatus: 'IN_PROGRESS', newStatus: 'RESOLVED',    changedById: staff.id,    note: 'Corridor fully cleaned' },
      { complaintId: complaint3.id, oldStatus: 'RESOLVED',    newStatus: 'CLOSED',      changedById: warden.id,   note: 'Verified and closed' },
    ],
  });

  // Complaint 4: REJECTED
  const complaint4 = await prisma.complaint.create({
    data: {
      studentId: student2.id,
      category: 'INTERNET',
      description: 'WiFi is slow in my room.',
      status: 'REJECTED',
      rejectionReason: 'This is a network provider issue outside hostel jurisdiction. Please contact the ISP helpdesk.',
    },
  });
  await prisma.statusLog.createMany({
    data: [
      { complaintId: complaint4.id, oldStatus: null,      newStatus: 'PENDING',  changedById: student2.id, note: 'Complaint submitted' },
      { complaintId: complaint4.id, oldStatus: 'PENDING', newStatus: 'REJECTED', changedById: warden.id,   note: 'Network provider issue — outside hostel scope' },
    ],
  });

  // Complaint 5: RESOLVED — awaiting warden closure
  const complaint5 = await prisma.complaint.create({
    data: {
      studentId: student.id,
      category: 'FURNITURE',
      description: 'Study table chair is broken. One leg is cracked and it wobbles badly.',
      status: 'RESOLVED',
      assignedStaffId: staff2.id,
    },
  });
  await prisma.statusLog.createMany({
    data: [
      { complaintId: complaint5.id, oldStatus: null,          newStatus: 'PENDING',     changedById: student.id,  note: 'Complaint submitted' },
      { complaintId: complaint5.id, oldStatus: 'PENDING',     newStatus: 'APPROVED',    changedById: warden.id,   note: 'Approved' },
      { complaintId: complaint5.id, oldStatus: 'APPROVED',    newStatus: 'ASSIGNED',    changedById: warden.id,   note: 'Assigned to Ravi (Electrician/Carpenter)' },
      { complaintId: complaint5.id, oldStatus: 'ASSIGNED',    newStatus: 'IN_PROGRESS', changedById: staff2.id,   note: 'Repair work started' },
      { complaintId: complaint5.id, oldStatus: 'IN_PROGRESS', newStatus: 'RESOLVED',    changedById: staff2.id,   note: 'Chair repaired and stabilized' },
    ],
  });

  console.log('[Seed] 5 complaints created with status logs');

  // ── 3. Mess Menu (current week) ──────────────────────────────────────────────
  console.log('[Seed] Creating weekly mess menu...');

  // Get the Monday of the current week
  const today = new Date();
  const day = today.getDay();
  const diff = today.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(today.setDate(diff));
  monday.setHours(0, 0, 0, 0);

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const menu = [
    { day: 'Monday',    mealType: 'BREAKFAST', items: 'Idli (3), Sambar, Coconut Chutney, Tea/Coffee' },
    { day: 'Monday',    mealType: 'LUNCH',     items: 'Rice, Dal Tadka, Aloo Sabzi, Roti (2), Salad, Buttermilk' },
    { day: 'Monday',    mealType: 'SNACKS',    items: 'Vada Pav, Chai' },
    { day: 'Monday',    mealType: 'DINNER',    items: 'Roti (3), Paneer Butter Masala, Dal, Rice, Salad' },
    { day: 'Tuesday',   mealType: 'BREAKFAST', items: 'Poha, Boiled Eggs (2), Banana, Tea/Coffee' },
    { day: 'Tuesday',   mealType: 'LUNCH',     items: 'Rajma Chawal, Roti (2), Cucumber Raita, Pickle' },
    { day: 'Tuesday',   mealType: 'SNACKS',    items: 'Bread Pakora, Chai' },
    { day: 'Tuesday',   mealType: 'DINNER',    items: 'Jeera Rice, Chicken Curry / Mix Veg, Dal, Roti (2)' },
    { day: 'Wednesday', mealType: 'BREAKFAST', items: 'Upma, Banana, Boiled Egg (1), Tea/Coffee' },
    { day: 'Wednesday', mealType: 'LUNCH',     items: 'Rice, Sambhar, Rasam, Papad, Curd, Pickle' },
    { day: 'Wednesday', mealType: 'SNACKS',    items: 'Samosa (2), Chai' },
    { day: 'Wednesday', mealType: 'DINNER',    items: 'Roti (3), Chole Masala, Rice, Dal Fry, Salad' },
    { day: 'Thursday',  mealType: 'BREAKFAST', items: 'Paratha (2), Curd, Pickle, Tea/Coffee' },
    { day: 'Thursday',  mealType: 'LUNCH',     items: 'Rice, Dal, Bhindi Masala, Roti (2), Salad' },
    { day: 'Thursday',  mealType: 'SNACKS',    items: 'Maggi / Noodles, Chai' },
    { day: 'Thursday',  mealType: 'DINNER',    items: 'Roti (3), Egg Curry / Dal Makhani, Rice, Raita' },
    { day: 'Friday',    mealType: 'BREAKFAST', items: 'Dosa (2), Sambar, Chutney, Tea/Coffee' },
    { day: 'Friday',    mealType: 'LUNCH',     items: 'Biryani (Veg / Chicken), Raita, Salad, Papad' },
    { day: 'Friday',    mealType: 'SNACKS',    items: 'Fruit Bowl, Chai' },
    { day: 'Friday',    mealType: 'DINNER',    items: 'Roti (3), Mix Veg, Dal, Rice, Sweet (Halwa)' },
    { day: 'Saturday',  mealType: 'BREAKFAST', items: 'Bread Toast, Butter, Jam, Boiled Eggs (2), Tea/Coffee' },
    { day: 'Saturday',  mealType: 'LUNCH',     items: 'Rice, Kadhi, Aloo Gobi, Roti (2), Salad' },
    { day: 'Saturday',  mealType: 'SNACKS',    items: 'Bhel Puri, Chai' },
    { day: 'Saturday',  mealType: 'DINNER',    items: 'Roti (3), Palak Paneer / Egg Bhurji, Dal, Rice' },
    { day: 'Sunday',    mealType: 'BREAKFAST', items: 'Chole Bhature (Special), Lassi, Tea/Coffee' },
    { day: 'Sunday',    mealType: 'LUNCH',     items: 'Rice, Dal, Chicken Curry / Rajma, Roti (2), Sweet, Salad' },
    { day: 'Sunday',    mealType: 'SNACKS',    items: 'Ice Cream / Cold Drink' },
    { day: 'Sunday',    mealType: 'DINNER',    items: 'Roti (3), Aloo Matar, Dal, Rice, Salad' },
  ];

  for (const item of menu) {
    await prisma.messMenu.create({
      data: {
        dayOfWeek: item.day,
        mealType: item.mealType,
        items: item.items,
        weekOf: monday,
      },
    });
  }

  console.log('[Seed] Mess menu created (28 entries for the week)');

  // ── 4. Sample Feedback ──────────────────────────────────────────────────────
  console.log('[Seed] Creating sample feedback...');

  const mondayBreakfast = await prisma.messMenu.findFirst({
    where: { dayOfWeek: 'Monday', mealType: 'BREAKFAST' },
  });

  if (mondayBreakfast) {
    await prisma.menuFeedback.createMany({
      data: [
        { messMenuId: mondayBreakfast.id, studentId: student.id,  rating: 4, comment: 'Idli was soft and sambar was well made. Good breakfast!' },
        { messMenuId: mondayBreakfast.id, studentId: student2.id, rating: 3, comment: 'Average. Chutney was good but sambar was too salty today.' },
      ],
    });
  }

  console.log('[Seed] Sample feedback created');

  // ── Done ────────────────────────────────────────────────────────────────────
  console.log('');
  console.log('[Seed] ✅ Database seed complete!');
  console.log('');
  console.log('[Seed] Demo accounts (password for all: Demo@1234)');
  console.log('  Student : student@hostelfix.demo');
  console.log('  Warden  : warden@hostelfix.demo');
  console.log('  Staff   : staff@hostelfix.demo');
}

main()
  .catch((e) => {
    console.error('[Seed] Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
