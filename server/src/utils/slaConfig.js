/**
 * SLA Configuration for HostelFix Complaint Categories
 * Defines response time limits (in hours) per complaint category.
 * slaDeadline is computed at complaint creation: createdAt + SLA hours.
 * The SLA cron job fires every 5 minutes and sends a one-time escalation
 * email to the hostel warden when a complaint breaches its SLA deadline.
 */

const SLA_HOURS = {
  ELECTRICAL: 12,
  PLUMBING: 24,
  CLEANING: 24,
  FURNITURE: 72, // GENERAL / non-urgent
  INTERNET: 72,
  OTHER: 72,    // GENERAL — must be 72 hours (3 days)
};

/**
 * Compute the SLA deadline datetime for a new complaint.
 * @param {string} category - ComplaintCategory enum value
 * @param {Date} [baseDate=new Date()] - Reference timestamp (defaults to now)
 * @returns {Date} - The deadline datetime
 */
const computeSlaDeadline = (category, baseDate = new Date()) => {
  const hours = SLA_HOURS[category] ?? SLA_HOURS.OTHER;
  const deadline = new Date(baseDate);
  deadline.setTime(deadline.getTime() + hours * 60 * 60 * 1000);
  return deadline;
};

module.exports = {
  SLA_HOURS,
  computeSlaDeadline,
};
