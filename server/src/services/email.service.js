/**
 * Transactional Email Service
 * Uses Gmail API (OAuth 2.0) for OTP email delivery.
 * Does NOT depend on blocked outbound SMTP ports (25, 465, 587).
 */

const { google } = require('googleapis');

const maskEmail = (email) => {
  if (!email || !email.includes('@')) return '***@***';
  const [local, domain] = email.split('@');
  if (local.length <= 2) {
    return `${local[0]}*@${domain}`;
  }
  return `${local[0]}${'*'.repeat(Math.min(local.length - 2, 4))}${local[local.length - 1]}@${domain}`;
};

/**
 * Creates a Gmail API client using OAuth 2.0 refresh token credentials.
 * Access tokens are automatically refreshed by the googleapis library.
 */
const createGmailClient = () => {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3000/oauth2callback'
  );

  oauth2Client.setCredentials({
    refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
  });

  return google.gmail({ version: 'v1', auth: oauth2Client });
};

/**
 * Builds an RFC 2822 MIME message string.
 * @param {object} params
 * @param {string} params.from - Sender email address
 * @param {string} params.to - Recipient email address
 * @param {string} params.subject - Email subject
 * @param {string} params.htmlBody - HTML content
 * @param {string} params.textBody - Plain text fallback
 * @returns {string} Base64url-encoded MIME message
 */
const buildMimeMessage = ({ from, to, subject, htmlBody, textBody }) => {
  const boundary = `boundary_${Date.now()}_${Math.random().toString(36).slice(2)}`;

  const mimeMessage = [
    `From: ${from}`,
    `To: ${to}`,
    `Subject: ${subject}`,
    'MIME-Version: 1.0',
    `Content-Type: multipart/alternative; boundary="${boundary}"`,
    '',
    `--${boundary}`,
    'Content-Type: text/plain; charset="UTF-8"',
    'Content-Transfer-Encoding: 7bit',
    '',
    textBody,
    '',
    `--${boundary}`,
    'Content-Type: text/html; charset="UTF-8"',
    'Content-Transfer-Encoding: 7bit',
    '',
    htmlBody,
    '',
    `--${boundary}--`,
  ].join('\r\n');

  return Buffer.from(mimeMessage)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
};

/**
 * Sends 6-digit verification OTP email to Chitkara university student.
 * @param {object} params
 * @param {string} params.to - Recipient student email (@chitkarauniversity.edu.in)
 * @param {string} params.otp - Plain 6-digit OTP code (NEVER logged)
 * @param {number} params.expiryMinutes - Expiry time in minutes (default: 10)
 */
const sendVerificationOtpEmail = async ({ to, otp, expiryMinutes = 10 }) => {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const refreshToken = process.env.GOOGLE_REFRESH_TOKEN;
  const fromEmail = process.env.EMAIL_FROM;
  const subject = 'HostelFix — Verify Your University Email';

  const htmlBody = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8f8f8; color: #171717; margin: 0; padding: 24px; }
    .container { max-width: 520px; margin: 0 auto; background: #ffffff; border-radius: 12px; border: 1px solid #e5e7eb; padding: 32px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); }
    .header { text-align: center; margin-bottom: 24px; }
    .badge { display: inline-block; background: #FDECEF; color: #C8102E; font-size: 12px; font-weight: 700; text-transform: uppercase; padding: 4px 12px; border-radius: 9999px; letter-spacing: 0.05em; }
    .title { font-size: 20px; font-weight: 800; color: #171717; margin-top: 12px; margin-bottom: 8px; }
    .subtitle { font-size: 14px; color: #6b7280; line-height: 1.5; margin: 0 0 24px 0; }
    .otp-card { background: #fef2f2; border-radius: 10px; border: 1px dashed #fecdd3; text-align: center; padding: 20px; margin-bottom: 24px; }
    .otp-code { font-size: 34px; font-weight: 800; letter-spacing: 8px; color: #C8102E; font-family: 'Courier New', Courier, monospace; }
    .expiry { font-size: 13px; color: #6b7280; margin-top: 8px; font-weight: 500; }
    .warning { font-size: 12px; color: #9ca3af; line-height: 1.5; border-top: 1px solid #f3f4f6; padding-top: 16px; text-align: center; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <span class="badge">Chitkara University Residence</span>
      <h1 class="title">HostelFix Email Verification</h1>
      <p class="subtitle">Use the verification code below to verify your student account and access hostel operations and maintenance services.</p>
    </div>
    <div class="otp-card">
      <div class="otp-code">${otp}</div>
      <div class="expiry">Valid for ${expiryMinutes} minutes only &bull; Single use</div>
    </div>
    <div class="warning">
      If you did not request this verification code, please ignore this email or contact your hostel warden. Do not share this code with anyone.
    </div>
  </div>
</body>
</html>
`;

  const textBody = `HostelFix — Verify Your University Email\n\nYour 6-digit verification code is: ${otp}\n\nThis code will expire in ${expiryMinutes} minutes.\nIf you did not request this, please ignore this email.`;

  // If Gmail API credentials are not configured, safely simulate delivery
  if (!clientId || !clientSecret || !refreshToken) {
    // SECURITY: Plain OTP is NEVER logged to console or stored in log files
    console.log(`[Email Service] Mock delivery: verification email dispatched to ${maskEmail(to)} (Gmail API credentials not configured)`);
    return { success: true, simulated: true };
  }

  if (!fromEmail) {
    console.error('[Email Service] EMAIL_FROM environment variable is not set. Cannot send email.');
    return { success: false, error: 'EMAIL_FROM not configured' };
  }

  try {
    const gmail = createGmailClient();
    const raw = buildMimeMessage({
      from: `HostelFix <${fromEmail}>`,
      to,
      subject,
      htmlBody,
      textBody,
    });

    await gmail.users.messages.send({
      userId: 'me',
      requestBody: { raw },
    });

    console.log(`[Email Service] Verification email successfully delivered via Gmail API to ${maskEmail(to)}`);
    return { success: true };
  } catch (err) {
    // Log safe error info — NEVER log tokens, OTPs, or full error objects that may contain credentials
    const safeMessage = err.message || 'Unknown Gmail API error';
    console.error(`[Email Service] Gmail API error dispatching email to ${maskEmail(to)}: ${safeMessage}`);
    return { success: false, error: safeMessage };
  }
};

module.exports = {
  sendVerificationOtpEmail,
  maskEmail,
};
