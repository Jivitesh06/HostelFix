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
    update: {
      mobileNumber: '9876543210',
      universityRollNumber: 'CUH2024CS001',
      branch: 'Computer Science & Engineering',
      year: '3rd Year',
      gender: 'MALE',
      hostelName: 'Sarabhai Hostel',
      roomNumber: 'A-101',
      emailVerified: true,
    },
    create: {
      name: 'Demo Student',
      email: 'student@hostelfix.demo',
      passwordHash,
      role: 'STUDENT',
      roomNumber: 'A-101',
      gender: 'MALE',
      hostelName: 'Sarabhai Hostel',
      mobileNumber: '9876543210',
      universityRollNumber: 'CUH2024CS001',
      branch: 'Computer Science & Engineering',
      year: '3rd Year',
      emailVerified: true,
    },
  });

  const student2 = await prisma.user.upsert({
    where: { email: 'student2@hostelfix.demo' },
    update: {
      mobileNumber: '9876543211',
      universityRollNumber: 'CUH2024EC042',
      branch: 'Electronics & Communication',
      year: '2nd Year',
      gender: 'FEMALE',
      hostelName: 'Gargi Hostel',
      roomNumber: 'B-205',
      emailVerified: true,
    },
    create: {
      name: 'Priya Sharma',
      email: 'student2@hostelfix.demo',
      passwordHash,
      role: 'STUDENT',
      roomNumber: 'B-205',
      gender: 'FEMALE',
      hostelName: 'Gargi Hostel',
      mobileNumber: '9876543211',
      universityRollNumber: 'CUH2024EC042',
      branch: 'Electronics & Communication',
      year: '2nd Year',
      emailVerified: true,
    },
  });

  const warden = await prisma.user.upsert({
    where: { email: 'warden@hostelfix.demo' },
    update: {
      gender: 'MALE',
      hostelName: 'Sarabhai Hostel',
      mobileNumber: '9876543200',
      emailVerified: true,
    },
    create: {
      name: 'Demo Warden',
      email: 'warden@hostelfix.demo',
      passwordHash,
      role: 'WARDEN',
      gender: 'MALE',
      hostelName: 'Sarabhai Hostel',
      mobileNumber: '9876543200',
      emailVerified: true,
    },
  });

  const wardenGirls = await prisma.user.upsert({
    where: { email: 'warden_girls@hostelfix.demo' },
    update: {
      gender: 'FEMALE',
      hostelName: 'Gargi Hostel',
      mobileNumber: '9876543201',
      emailVerified: true,
    },
    create: {
      name: 'Pooja Warden',
      email: 'warden_girls@hostelfix.demo',
      passwordHash,
      role: 'WARDEN',
      gender: 'FEMALE',
      hostelName: 'Gargi Hostel',
      mobileNumber: '9876543201',
      emailVerified: true,
    },
  });

  const staff = await prisma.user.upsert({
    where: { email: 'staff@hostelfix.demo' },
    update: { emailVerified: true },
    create: {
      name: 'Demo Staff',
      email: 'staff@hostelfix.demo',
      passwordHash,
      role: 'STAFF',
      staffCategory: 'Plumber',
      emailVerified: true,
    },
  });

  const staff2 = await prisma.user.upsert({
    where: { email: 'staff2@hostelfix.demo' },
    update: { emailVerified: true },
    create: {
      name: 'Ravi Electrician',
      email: 'staff2@hostelfix.demo',
      passwordHash,
      role: 'STAFF',
      staffCategory: 'Electrician',
      emailVerified: true,
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
    { day: 'Monday',    mealType: 'BREAKFAST', items: 'Aloo Paratha, Butter, Pickle, Tea & Curd' },
    { day: 'Monday',    mealType: 'LUNCH',     items: 'Dal Makhani, Seasonal Vegetable, Boondi Raita, Salad, Rice, Wheat Roti' },
    { day: 'Monday',    mealType: 'SNACKS',    items: 'Tea & Sandwich' },
    { day: 'Monday',    mealType: 'DINNER',    items: 'Chana Dal, Mix Veg, Salad, Jeera Rice, Wheat Roti & Suji Halwa' },
    { day: 'Tuesday',   mealType: 'BREAKFAST', items: 'Poori, Aloo Channa / Bread Butter & Tea' },
    { day: 'Tuesday',   mealType: 'LUNCH',     items: 'Sabut Masoor, Chilli Potato, Salad, Rice, Wheat Roti & Curd' },
    { day: 'Tuesday',   mealType: 'SNACKS',    items: 'Cold Coffee & Veg Pasta / Namkeen' },
    { day: 'Tuesday',   mealType: 'DINNER',    items: 'White Chana, Seasonal Vegetable, Pickle, Plain Rice, Wheat Roti' },
    { day: 'Wednesday', mealType: 'BREAKFAST', items: 'Poha, Sweet Daliya, Black Chana Chat, Tea, Fruit' },
    { day: 'Wednesday', mealType: 'LUNCH',     items: 'Rajma Masala, Aloo Shimla Mirch / Aloo Baingan Masala, Raita, Wheat Roti, Rice & Salad' },
    { day: 'Wednesday', mealType: 'SNACKS',    items: 'Tea & Stuffed Kulcha / Coleslaw Sandwich' },
    { day: 'Wednesday', mealType: 'DINNER',    items: 'Moong Dhuli Dal, Variety of Paneer / Paneer Bhurji, Salad, Jeera Rice, Wheat Roti & Gulab Jamun' },
    { day: 'Thursday',  mealType: 'BREAKFAST', items: 'Pav Bhaji, Tea' },
    { day: 'Thursday',  mealType: 'LUNCH',     items: 'Kadhi Pakora, Aloo Jeera, Wheat Roti, Salad, Rice' },
    { day: 'Thursday',  mealType: 'SNACKS',    items: 'Tea & Biscuits / Veg Macaroni' },
    { day: 'Thursday',  mealType: 'DINNER',    items: 'Dal Arhar, Lauki Kofta / Veg Manchurian, Salad, Jeera Rice / Fried Rice, Wheat Roti & Semiyan Kheer / Rice Kheer' },
    { day: 'Friday',    mealType: 'BREAKFAST', items: 'Plain Paratha / Mix Paratha, Aloo Masala, Pickle & Tea' },
    { day: 'Friday',    mealType: 'LUNCH',     items: 'Black Chana, Hara Kaddu, Poori, Raita, Salad, Rice' },
    { day: 'Friday',    mealType: 'SNACKS',    items: 'Nimbu Pani / Rooh Afza & Bhelpuri (Packed)' },
    { day: 'Friday',    mealType: 'DINNER',    items: 'Sabut Moong, Matar Mushroom / Soya Chaap Masala, Salad, Rice, Wheat Roti' },
    { day: 'Saturday',  mealType: 'BREAKFAST', items: 'Matar Kulcha & Tea' },
    { day: 'Saturday',  mealType: 'LUNCH',     items: 'Rajma Masala & Aloo Nutri Beans, Salad, Raita, Rice, Wheat Roti' },
    { day: 'Saturday',  mealType: 'SNACKS',    items: 'Tea & Samosa' },
    { day: 'Saturday',  mealType: 'DINNER',    items: 'Mix Dal, Matar Aloo, Chilli Potato, Salad, Rice, Wheat Roti & Fruit Custard' },
    { day: 'Sunday',    mealType: 'BREAKFAST', items: 'Poha, Cornflakes With Milk / Sweet Daliya, Tea, Fruit' },
    { day: 'Sunday',    mealType: 'LUNCH',     items: 'Chana Amritsari, Bhature, Rice, Raita, Green Chutney, Pickle & Tea' },
    { day: 'Sunday',    mealType: 'SNACKS',    items: 'Tea & Chips' },
    { day: 'Sunday',    mealType: 'DINNER',    items: 'Chana Mah Dal, Paneer & Egg Curry (2 Pcs) / Egg Bhurji (Once a Month), Salad, Rice, Wheat Roti' },
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
        { messMenuId: mondayBreakfast.id, studentId: student.id,  rating: 4, comment: 'Aloo paratha was fresh and curd was great. Good breakfast!' },
        { messMenuId: mondayBreakfast.id, studentId: student2.id, rating: 3, comment: 'Average. Paratha was good but needed more butter today.' },
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
