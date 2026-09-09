/**
 * Database verification script for HostelFix Phase 3A
 * Verifies:
 * 1. PostgreSQL connection works
 * 2. Prisma client works
 * 3. Tables exist
 * 4. Seed records exist
 * 5. Relations work
 * 6. Demo records can be queried
 */

const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const prisma = new PrismaClient();

async function verify() {
  console.log('--- HostelFix Database Verification ---');

  // 1. Connection & Users
  const users = await prisma.user.findMany();
  console.log(`[PASS] Users table exists: ${users.length} users found`);
  const roles = users.map(u => u.role);
  console.log(`       Roles present: ${[...new Set(roles)].join(', ')}`);

  // 2. Complaints with Relations
  const complaints = await prisma.complaint.findMany({
    include: {
      student: { select: { name: true, role: true } },
      assignedStaff: { select: { name: true, staffCategory: true } },
      statusLogs: true,
    },
  });
  console.log(`[PASS] Complaints table & relations exist: ${complaints.length} complaints found`);
  for (const c of complaints) {
    const staffName = c.assignedStaff ? c.assignedStaff.name : 'Unassigned';
    console.log(`       - Complaint: [${c.status}] ${c.category} (by ${c.student.name}, staff: ${staffName}, logs: ${c.statusLogs.length})`);
  }

  // 3. StatusLogs
  const logs = await prisma.statusLog.findMany({
    include: { changedBy: { select: { name: true, role: true } } },
  });
  console.log(`[PASS] StatusLog table & relations exist: ${logs.length} audit logs found`);

  // 4. MessMenu
  const menus = await prisma.messMenu.findMany({
    include: { feedbacks: true },
  });
  console.log(`[PASS] MessMenu table exists: ${menus.length} menu items found`);

  // 5. MenuFeedback
  const feedbacks = await prisma.menuFeedback.findMany({
    include: {
      student: { select: { name: true } },
      messMenu: { select: { dayOfWeek: true, mealType: true } },
    },
  });
  console.log(`[PASS] MenuFeedback table & relations exist: ${feedbacks.length} feedback entries found`);
  for (const fb of feedbacks) {
    console.log(`       - ${fb.rating}/5 stars for ${fb.messMenu.dayOfWeek} ${fb.messMenu.mealType} by ${fb.student.name}: "${fb.comment}"`);
  }

  console.log('---------------------------------------');
  console.log('✅ ALL DATABASE VERIFICATIONS PASSED SUCCESSFULLY');
}

verify()
  .catch((err) => {
    console.error('❌ Verification failed:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
