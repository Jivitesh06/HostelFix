/**
 * SLA Escalation Cron Service
 * Runs every 5 minutes. Finds overdue complaints that have not yet had an
 * escalation email sent, and notifies the relevant hostel warden(s) via Gmail API.
 *
 * Rules:
 * - Only complaints where slaDeadline < NOW and status NOT IN [RESOLVED, CLOSED] and slaAlertSentAt IS NULL
 * - Warden must be active (isActive = true) and hostel-scoped to the complaint's student hostel
 * - slaAlertSentAt is set ONLY after a successful email delivery — failed sends are retried next run
 * - Server crashes and cron errors are caught and logged; they never crash the server
 */

const cron = require('node-cron');
const prisma = require('../config/prisma');
const { sendSlaEscalationEmail } = require('./email.service');

const TERMINAL_STATUSES = ['RESOLVED', 'CLOSED'];
const FRONTEND_BASE_URL = process.env.FRONTEND_URL || process.env.CLIENT_URL || 'http://localhost:5173';

/**
 * Core SLA check logic. Separated from the cron wrapper for testability.
 * Can be injected with a mock prisma/emailService in tests.
 *
 * @param {object} [deps] - Optional dependency injection for tests
 * @param {object} [deps.prismaClient] - Prisma client override
 * @param {Function} [deps.emailFn] - Email send function override
 */
const runSlaCheck = async (deps = {}) => {
  const db = deps.prismaClient || prisma;
  const emailFn = deps.emailFn || sendSlaEscalationEmail;

  const now = new Date();

  // Find all complaints that have breached SLA and haven't been alerted yet
  let overdueComplaints;
  try {
    overdueComplaints = await db.complaint.findMany({
      where: {
        slaDeadline: { lt: now },
        status: { notIn: TERMINAL_STATUSES },
        slaAlertSentAt: null,
      },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            email: true,
            hostelName: true,
          },
        },
      },
    });
  } catch (err) {
    console.error('[SLA Cron] Failed to query overdue complaints:', err.message);
    return;
  }

  if (overdueComplaints.length === 0) {
    return; // Nothing to do
  }

  console.log(`[SLA Cron] Found ${overdueComplaints.length} overdue complaint(s) to escalate`);

  for (const complaint of overdueComplaints) {
    const hostelName = complaint.student?.hostelName;

    if (!hostelName) {
      console.warn(`[SLA Cron] Complaint #${complaint.id.slice(-6).toUpperCase()} has no hostel — skipping escalation`);
      continue;
    }

    // Find active wardens for this hostel
    let wardens;
    try {
      wardens = await db.user.findMany({
        where: {
          role: 'WARDEN',
          isActive: true,
          hostelName,
        },
        select: {
          id: true,
          name: true,
          email: true,
        },
      });
    } catch (err) {
      console.error(`[SLA Cron] Failed to fetch wardens for ${hostelName}:`, err.message);
      continue;
    }

    if (wardens.length === 0) {
      console.warn(`[SLA Cron] No active wardens found for hostel "${hostelName}" — skipping complaint #${complaint.id.slice(-6).toUpperCase()}`);
      continue;
    }

    // Send email to each warden (deduplicated by email)
    const sentEmails = new Set();
    let allSent = true;

    for (const warden of wardens) {
      if (sentEmails.has(warden.email)) continue;
      sentEmails.add(warden.email);

      try {
        const result = await emailFn({
          to: warden.email,
          wardenName: warden.name,
          complaint,
          frontendBaseUrl: FRONTEND_BASE_URL,
        });

        if (!result.success) {
          console.error(`[SLA Cron] Email failed for warden ${warden.email} on complaint #${complaint.id.slice(-6).toUpperCase()}: ${result.error}`);
          allSent = false;
        }
      } catch (emailErr) {
        console.error(`[SLA Cron] Exception sending SLA alert to ${warden.email}:`, emailErr.message);
        allSent = false;
      }
    }

    // Only mark slaAlertSentAt if ALL warden emails succeeded
    if (allSent) {
      try {
        await db.complaint.update({
          where: { id: complaint.id },
          data: { slaAlertSentAt: new Date() },
        });
        console.log(`[SLA Cron] Escalation completed for complaint #${complaint.id.slice(-6).toUpperCase()} — ${sentEmails.size} warden(s) notified`);
      } catch (updateErr) {
        console.error(`[SLA Cron] Failed to set slaAlertSentAt for complaint #${complaint.id.slice(-6).toUpperCase()}:`, updateErr.message);
        // Non-fatal: will retry on next cron run (idempotent)
      }
    } else {
      console.warn(`[SLA Cron] Partial email failure for complaint #${complaint.id.slice(-6).toUpperCase()} — NOT marking slaAlertSentAt; will retry next run`);
    }
  }
};

/**
 * Starts the SLA escalation cron job.
 * Schedule: every 5 minutes (cron expression: star/5 star star star star)
 * Safe: never throws, never crashes the server.
 *
 * @returns {object} node-cron task instance (for testing/cleanup)
 */
const startSlaCron = () => {
  const task = cron.schedule('*/5 * * * *', async () => {
    try {
      await runSlaCheck();
    } catch (err) {
      // Belt-and-suspenders safety: runSlaCheck already handles internal errors
      console.error('[SLA Cron] Unexpected error in cron tick:', err.message);
    }
  });

  console.log('[SLA Cron] SLA escalation job started — runs every 5 minutes');
  return task;
};

module.exports = {
  startSlaCron,
  runSlaCheck, // exported for unit testing
};
