#!/usr/bin/env node

/**
 * HostelFix — Idempotent Demo Accounts Provisioning Script
 *
 * Safely creates or updates ONLY the demo accounts in the database:
 *   - warden@hostelfix.demo
 *   - staff@hostelfix.demo
 *   - student@hostelfix.demo
 *   - warden_girls@hostelfix.demo
 *   - staff2@hostelfix.demo
 *
 * Does NOT touch complaints, mess menus, feedback, status logs, or other tables.
 * Safe to run against production (Render Shell) or local development.
 *
 * Usage:
 *   node scripts/seed-demo-accounts.js
 *   # Or with explicit database URL:
 *   DATABASE_URL="postgresql://..." node scripts/seed-demo-accounts.js
 */

const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

const DEMO_PASSWORD = 'Demo@1234';
const SALT_ROUNDS = 10;

const DEMO_ACCOUNTS = [
  {
    email: 'warden@hostelfix.demo',
    role: 'WARDEN',
    name: 'Demo Warden',
    gender: 'MALE',
    hostelName: 'Sarabhai Hostel',
    mobileNumber: '9876543200',
    emailVerified: true,
    isActive: true,
  },
  {
    email: 'warden_girls@hostelfix.demo',
    role: 'WARDEN',
    name: 'Pooja Warden',
    gender: 'FEMALE',
    hostelName: 'Gargi Hostel',
    mobileNumber: '9876543201',
    emailVerified: true,
    isActive: true,
  },
  {
    email: 'staff@hostelfix.demo',
    role: 'STAFF',
    name: 'Demo Staff',
    staffCategory: 'Plumber',
    emailVerified: true,
    isActive: true,
  },
  {
    email: 'staff2@hostelfix.demo',
    role: 'STAFF',
    name: 'Ravi Electrician',
    staffCategory: 'Electrician',
    emailVerified: true,
    isActive: true,
  },
  {
    email: 'student@hostelfix.demo',
    role: 'STUDENT',
    name: 'Demo Student',
    roomNumber: 'A-101',
    gender: 'MALE',
    hostelName: 'Sarabhai Hostel',
    mobileNumber: '9876543210',
    universityRollNumber: 'CUH2024CS001',
    branch: 'Computer Science & Engineering',
    year: '3rd Year',
    emailVerified: true,
    isActive: true,
  },
];

async function main() {
  console.log('\n╔══════════════════════════════════════════════════════════╗');
  console.log('║        HostelFix — Demo Accounts Provisioner            ║');
  console.log('╚══════════════════════════════════════════════════════════╝\n');

  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, SALT_ROUNDS);

  for (const acc of DEMO_ACCOUNTS) {
    const existing = await prisma.user.findUnique({
      where: { email: acc.email },
    });

    let action = 'CREATED';
    let user;

    if (existing) {
      action = 'UPDATED';
      user = await prisma.user.update({
        where: { email: acc.email },
        data: {
          name: acc.name,
          passwordHash,
          role: acc.role,
          emailVerified: acc.emailVerified,
          isActive: acc.isActive,
          ...(acc.gender ? { gender: acc.gender } : {}),
          ...(acc.hostelName ? { hostelName: acc.hostelName } : {}),
          ...(acc.mobileNumber ? { mobileNumber: acc.mobileNumber } : {}),
          ...(acc.staffCategory ? { staffCategory: acc.staffCategory } : {}),
          ...(acc.roomNumber ? { roomNumber: acc.roomNumber } : {}),
          ...(acc.universityRollNumber ? { universityRollNumber: acc.universityRollNumber } : {}),
          ...(acc.branch ? { branch: acc.branch } : {}),
          ...(acc.year ? { year: acc.year } : {}),
        },
      });
    } else {
      user = await prisma.user.create({
        data: {
          email: acc.email,
          name: acc.name,
          passwordHash,
          role: acc.role,
          emailVerified: acc.emailVerified,
          isActive: acc.isActive,
          gender: acc.gender || null,
          hostelName: acc.hostelName || null,
          mobileNumber: acc.mobileNumber || null,
          staffCategory: acc.staffCategory || null,
          roomNumber: acc.roomNumber || null,
          universityRollNumber: acc.universityRollNumber || null,
          branch: acc.branch || null,
          year: acc.year || null,
        },
      });
    }

    // Verify password match using the same bcrypt logic as authController.login
    const isPasswordValid = await bcrypt.compare(DEMO_PASSWORD, user.passwordHash);

    console.log(
      `✓ [${action}] ${acc.email} (${acc.role})` +
      ` | Verified: ${user.emailVerified}` +
      ` | Active: ${user.isActive}` +
      ` | Password Verification: ${isPasswordValid ? 'PASS' : 'FAIL'}`
    );
  }

  console.log('\nAll demo accounts are synchronized and ready for login.\n');
}

main()
  .catch((err) => {
    console.error('Error provisioning demo accounts:', err.message);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
