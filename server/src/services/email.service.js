/**
 * Transactional Email Service
 * Uses HTTPS API (Resend / transactional REST provider) suitable for Render deployment.
 * Does NOT depend on blocked outbound SMTP ports (25, 465, 587).
 */

const maskEmail = (email) => {
  if (!email || !email.includes('@')) return '***@***';
  const [local, domain] = email.split('@');
  if (local.length <= 2) {
    return `${local[0]}*@${domain}`;
  }
  return `${local[0]}${'*'.repeat(Math.min(local.length - 2, 4))}${local[local.length - 1]}@${domain}`;
};

/**
 * Sends 6-digit verification OTP email to Chitkara university student.
 * @param {object} params
 * @param {string} params.to - Recipient student email (@chitkarauniversity.edu.in)
 * @param {string} params.otp - Plain 6-digit OTP code (NEVER logged)
 * @param {number} params.expiryMinutes - Expiry time in minutes (default: 10)
 */
const sendVerificationOtpEmail = async ({ to, otp, expiryMinutes = 10 }) => {
  const apiKey = process.env.EMAIL_PROVIDER_API_KEY;
  const fromEmail = process.env.EMAIL_FROM || 'HostelFix <onboarding@resend.dev>';
  const subject = 'HostelFix — Verify Your University Email';

  const htmlBody = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; color: #1e293b; margin: 0; padding: 24px; }
    .container { max-width: 520px; margin: 0 auto; background: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; padding: 32px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); }
    .header { text-align: center; margin-bottom: 24px; }
    .badge { display: inline-block; background: #eff6ff; color: #3b82f6; font-size: 12px; font-weight: 700; text-transform: uppercase; padding: 4px 12px; border-radius: 9999px; letter-spacing: 0.05em; }
    .title { font-size: 20px; font-weight: 800; color: #0f172a; margin-top: 12px; margin-bottom: 8px; }
    .subtitle { font-size: 14px; color: #64748b; line-height: 1.5; margin: 0 0 24px 0; }
    .otp-card { background: #f1f5f9; border-radius: 10px; border: 1px dashed #cbd5e1; text-align: center; padding: 20px; margin-bottom: 24px; }
    .otp-code { font-size: 34px; font-weight: 800; letter-spacing: 8px; color: #4f46e5; font-family: 'Courier New', Courier, monospace; }
    .expiry { font-size: 13px; color: #64748b; margin-top: 8px; font-weight: 500; }
    .warning { font-size: 12px; color: #94a3b8; line-height: 1.5; border-top: 1px solid #f1f5f9; padding-top: 16px; text-align: center; }
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

  // If no production API key configured, safely simulate transactional delivery
  if (!apiKey) {
    // SECURITY: Plain OTP is NEVER logged to console or stored in log files
    console.log(`[Email Service] Mock delivery: verification email dispatched to ${maskEmail(to)} (provider API key not configured)`);
    return { success: true, simulated: true };
  }

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: fromEmail,
        to: [to],
        subject,
        html: htmlBody,
        text: textBody,
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error(`[Email Service] Provider responded with HTTP ${res.status}: ${errText}`);
      return { success: false, error: errText };
    }

    console.log(`[Email Service] Verification email successfully delivered via HTTPS to ${maskEmail(to)}`);
    return { success: true };
  } catch (err) {
    console.error(`[Email Service] Network error dispatching email to ${maskEmail(to)}:`, err.message);
    return { success: false, error: err.message };
  }
};

module.exports = {
  sendVerificationOtpEmail,
  maskEmail,
};
