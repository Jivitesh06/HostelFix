const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('../config/env');
const prisma = require('../config/prisma');
const {
  sendSuccess,
  sendCreated,
  sendError,
  sendUnauthorized,
  sendForbidden,
  sendNotFound,
} = require('../utils/response');
const {
  GENDERS,
  getHostelsByGender,
  isValidHostelForGender,
} = require('../utils/hostelConfig');
const {
  generateOtp,
  hashOtp,
  verifyOtpHash,
  recordTestOtp,
} = require('../services/otp.service');
const {
  generateResetToken,
  hashResetToken,
  verifyResetTokenHash,
  recordTestResetToken,
  RESET_TOKEN_EXPIRY_MINUTES,
  RESET_COOLDOWN_MS,
} = require('../services/passwordReset.service');
const {
  sendVerificationOtpEmail,
  sendPasswordResetEmail,
  maskEmail,
} = require('../services/email.service');

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const CHITKARA_EMAIL_DOMAIN = '@chitkarauniversity.edu.in';
const PHONE_REGEX = /^[0-9+\-\s]{7,15}$/;
const MIN_PASSWORD_LENGTH = 6;
const SALT_ROUNDS = 10;
const OTP_EXPIRY_MINUTES = 10;
const RESEND_COOLDOWN_MS = 60 * 1000;
const MAX_VERIFICATION_ATTEMPTS = 5;

/**
 * POST /api/auth/register
 * Student self-registration only.
 * Requires institutional @chitkarauniversity.edu.in email.
 * Role is strictly enforced as STUDENT on the backend.
 * Generates single-use 6-digit OTP and dispatches verification email.
 */
const register = async (req, res, next) => {
  try {
    const {
      name,
      email,
      password,
      roomNumber,
      hostelName,
      gender,
      mobileNumber,
      universityRollNumber,
      branch,
      year,
    } = req.body;

    // Validate presence of required fields
    if (!name || !email || !password || !roomNumber) {
      return sendError(
        res,
        'Name, email, password, and room number are required',
        400
      );
    }

    // Validate trimmed lengths
    if (!name.trim() || !roomNumber.trim()) {
      return sendError(res, 'Fields cannot be empty or whitespace only', 400);
    }

    // Validate email format and strict institutional Chitkara domain
    const cleanEmail = email.trim().toLowerCase();
    if (!EMAIL_REGEX.test(cleanEmail)) {
      return sendError(res, 'Please provide a valid email address', 400);
    }

    if (!cleanEmail.endsWith(CHITKARA_EMAIL_DOMAIN)) {
      return sendError(
        res,
        'Registration requires an institutional Chitkara University email address (@chitkarauniversity.edu.in). Personal email accounts are not permitted.',
        400
      );
    }

    // Validate password length
    if (typeof password !== 'string' || password.length < MIN_PASSWORD_LENGTH) {
      return sendError(
        res,
        `Password must be at least ${MIN_PASSWORD_LENGTH} characters long`,
        400
      );
    }

    // Validate mobile number if provided
    if (mobileNumber && typeof mobileNumber === 'string' && mobileNumber.trim()) {
      if (!PHONE_REGEX.test(mobileNumber.trim())) {
        return sendError(
          res,
          'Please provide a valid contact mobile number (7-15 digits)',
          400
        );
      }
    }

    // Validate gender if provided
    let cleanGender = null;
    if (gender) {
      cleanGender = gender.trim().toUpperCase();
      if (!GENDERS.includes(cleanGender)) {
        return sendError(res, 'Invalid gender. Allowed values: MALE, FEMALE', 400);
      }
    }

    // Validate hostel name compatibility with gender if provided
    if (hostelName && cleanGender) {
      if (!isValidHostelForGender(hostelName.trim(), cleanGender)) {
        return sendError(
          res,
          `Selected hostel is not valid for ${cleanGender.toLowerCase()} students. Allowed hostels: ${getHostelsByGender(cleanGender).join(', ')}`,
          400
        );
      }
    }

    // Check for duplicate email (HTTP 409 Conflict)
    const existingUser = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    if (existingUser) {
      return sendError(
        res,
        'An account with this email already exists',
        409
      );
    }

    // Check for duplicate university roll number (HTTP 409 Conflict) if provided
    if (universityRollNumber && typeof universityRollNumber === 'string' && universityRollNumber.trim()) {
      const existingRoll = await prisma.user.findFirst({
        where: { universityRollNumber: universityRollNumber.trim() },
      });
      if (existingRoll) {
        return sendError(
          res,
          'A student with this university roll number is already registered',
          409
        );
      }
    }

    // Hash password with bcrypt
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    // Generate cryptographically secure 6-digit OTP
    const otp = generateOtp();
    const otpHash = hashOtp(otp);
    const otpExpiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);
    const otpLastSentAt = new Date();

    // Create student user - role is ALWAYS STUDENT; emailVerified is false
    const newUser = await prisma.user.create({
      data: {
        name: name.trim(),
        email: cleanEmail,
        passwordHash,
        role: 'STUDENT',
        roomNumber: roomNumber.trim(),
        hostelName: hostelName && typeof hostelName === 'string' ? hostelName.trim() : null,
        gender: cleanGender,
        mobileNumber: mobileNumber && typeof mobileNumber === 'string' ? mobileNumber.trim() : null,
        universityRollNumber: universityRollNumber && typeof universityRollNumber === 'string' ? universityRollNumber.trim() : null,
        branch: branch && typeof branch === 'string' ? branch.trim() : null,
        year: year && typeof year === 'string' ? year.trim() : null,
        staffCategory: null,
        isActive: true,
        emailVerified: false,
        otpHash,
        otpExpiresAt,
        otpAttempts: 0,
        otpLastSentAt,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        roomNumber: true,
        hostelName: true,
        gender: true,
        mobileNumber: true,
        universityRollNumber: true,
        branch: true,
        year: true,
        isActive: true,
        emailVerified: true,
        createdAt: true,
      },
    });

    // Record test OTP strictly for test suites in test environment
    recordTestOtp(cleanEmail, otp);

    // Dispatch verification email (NEVER logs plain OTP)
    await sendVerificationOtpEmail({
      to: cleanEmail,
      otp,
      expiryMinutes: OTP_EXPIRY_MINUTES,
    });

    return sendCreated(res, {
      ...newUser,
      maskedEmail: maskEmail(cleanEmail),
      message: 'Verification code sent to your university email.',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/auth/verify-email
 * Verifies single-use OTP and marks student account as emailVerified = true.
 */
const verifyEmail = async (req, res, next) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return sendError(
        res,
        'Email and 6-digit verification code are required',
        400
      );
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanOtp = otp.toString().trim();

    if (!/^\d{6}$/.test(cleanOtp)) {
      return sendError(res, 'Verification code must be a 6-digit number', 400);
    }

    const user = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    if (!user) {
      return sendError(res, 'Invalid verification request', 400);
    }

    if (user.emailVerified) {
      return sendSuccess(res, {
        message: 'Your email is already verified. You can now sign in.',
        emailVerified: true,
      });
    }

    if (!user.otpHash || !user.otpExpiresAt) {
      return sendError(
        res,
        'No active verification code found. Please request a new code.',
        400
      );
    }

    if (user.otpAttempts >= MAX_VERIFICATION_ATTEMPTS) {
      return sendError(
        res,
        'Maximum verification attempts exceeded. Please request a new verification code.',
        400
      );
    }

    if (new Date() > new Date(user.otpExpiresAt)) {
      return sendError(
        res,
        'Verification code has expired. Please request a new code.',
        400
      );
    }

    // Verify OTP against stored SHA-256 hash
    const isValid = verifyOtpHash(cleanOtp, user.otpHash);
    if (!isValid) {
      // Increment attempt counter
      await prisma.user.update({
        where: { id: user.id },
        data: { otpAttempts: { increment: 1 } },
      });
      return sendError(res, 'Invalid verification code. Please check and try again.', 400);
    }

    // Success: mark emailVerified = true and invalidate OTP
    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: true,
        otpHash: null,
        otpExpiresAt: null,
        otpAttempts: 0,
        otpLastSentAt: null,
      },
    });

    return sendSuccess(res, {
      message: 'University email verified successfully! You can now sign in.',
      email: cleanEmail,
      emailVerified: true,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/auth/resend-verification
 * Resends verification code with 60-second cooldown enforcement.
 * Invalidates previous OTP.
 */
const resendVerification = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return sendError(res, 'Email address is required', 400);
    }

    const cleanEmail = email.trim().toLowerCase();
    const user = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    if (!user) {
      return sendError(res, 'Account not found with this email', 400);
    }

    if (user.emailVerified) {
      return sendError(res, 'Email is already verified. Please sign in.', 400);
    }

    // Enforce 60-second resend cooldown
    if (user.otpLastSentAt) {
      const elapsed = Date.now() - new Date(user.otpLastSentAt).getTime();
      if (elapsed < RESEND_COOLDOWN_MS) {
        const remainingSeconds = Math.ceil((RESEND_COOLDOWN_MS - elapsed) / 1000);
        return sendError(
          res,
          `Please wait ${remainingSeconds} seconds before requesting a new verification code.`,
          429
        );
      }
    }

    // Invalidate previous OTP and generate fresh one
    const otp = generateOtp();
    const otpHash = hashOtp(otp);
    const otpExpiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);
    const otpLastSentAt = new Date();

    await prisma.user.update({
      where: { id: user.id },
      data: {
        otpHash,
        otpExpiresAt,
        otpAttempts: 0,
        otpLastSentAt,
      },
    });

    recordTestOtp(cleanEmail, otp);
    await sendVerificationOtpEmail({
      to: cleanEmail,
      otp,
      expiryMinutes: OTP_EXPIRY_MINUTES,
    });

    return sendSuccess(res, {
      message: 'A new verification code has been dispatched to your email.',
      email: cleanEmail,
      maskedEmail: maskEmail(cleanEmail),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/auth/login
 * Verifies email & password, prevents unverified students from logging in, returns JWT.
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return sendError(res, 'Email and password are required', 400);
    }

    const cleanEmail = email.trim().toLowerCase();

    // Look up user by email
    const user = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    if (!user) {
      return sendUnauthorized(res, 'Invalid email or password');
    }

    // Verify password hash
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      return sendUnauthorized(res, 'Invalid email or password');
    }

    // Login Protection: Student accounts must have verified their institutional email
    if (user.role === 'STUDENT' && !user.emailVerified) {
      return res.status(403).json({
        success: false,
        isUnverified: true,
        email: user.email,
        message: 'Please verify your university email before logging in.',
      });
    }

    // Generate JWT token with userId and role
    const token = jwt.sign(
      {
        userId: user.id,
        role: user.role,
      },
      config.jwt.secret,
      {
        expiresIn: config.jwt.expiresIn || '7d',
      }
    );

    const safeUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      roomNumber: user.roomNumber,
      hostelName: user.hostelName,
      gender: user.gender,
      mobileNumber: user.mobileNumber,
      universityRollNumber: user.universityRollNumber,
      branch: user.branch,
      year: user.year,
      staffCategory: user.staffCategory,
      isActive: user.isActive !== undefined ? user.isActive : true,
      emailVerified: user.emailVerified !== undefined ? user.emailVerified : false,
    };

    return sendSuccess(res, {
      token,
      user: safeUser,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/auth/me
 * Returns current authenticated user profile.
 * Protected by verifyToken middleware.
 */
const getMe = async (req, res, next) => {
  try {
    const safeUser = {
      id: req.user.id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
      roomNumber: req.user.roomNumber,
      hostelName: req.user.hostelName,
      gender: req.user.gender,
      mobileNumber: req.user.mobileNumber,
      universityRollNumber: req.user.universityRollNumber,
      branch: req.user.branch,
      year: req.user.year,
      staffCategory: req.user.staffCategory,
      isActive: req.user.isActive !== undefined ? req.user.isActive : true,
      emailVerified: req.user.emailVerified !== undefined ? req.user.emailVerified : false,
    };

    return sendSuccess(res, {
      ...safeUser,
      user: safeUser,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/auth/staff-register
 * Administrative onboarding for Wardens and Maintenance Staff (Workers).
 * Requires valid administrative authorization key.
 * Students cannot register through this portal.
 */
const staffRegister = async (req, res, next) => {
  try {
    const {
      adminKey,
      role,
      name,
      email,
      password,
      gender,
      hostelName,
      staffCategory,
      mobileNumber,
    } = req.body;

    // 1. Validate administrative authorization key
    const expectedKey = config.adminRegistrationKey;
    if (!adminKey || adminKey.trim() !== expectedKey) {
      return sendForbidden(
        res,
        'Invalid or missing administrative authorization key. Student access to staff registration is prohibited.'
      );
    }

    // 2. Validate role: strictly WARDEN or STAFF
    if (!role || (role !== 'WARDEN' && role !== 'STAFF')) {
      return sendError(
        res,
        'Invalid role. This portal only allows registration for WARDEN or STAFF roles.',
        400
      );
    }

    // 3. Validate common required fields: name, email, password
    if (!name || !email || !password) {
      return sendError(res, 'Name, email, and password are required', 400);
    }

    if (!name.trim()) {
      return sendError(res, 'Name cannot be empty', 400);
    }

    const cleanEmail = email.trim().toLowerCase();
    if (!EMAIL_REGEX.test(cleanEmail)) {
      return sendError(res, 'Please provide a valid email address', 400);
    }

    if (typeof password !== 'string' || password.length < MIN_PASSWORD_LENGTH) {
      return sendError(
        res,
        `Password must be at least ${MIN_PASSWORD_LENGTH} characters long`,
        400
      );
    }

    let cleanGender = null;
    if (gender) {
      cleanGender = gender.trim().toUpperCase();
      if (!GENDERS.includes(cleanGender)) {
        return sendError(res, 'Invalid gender. Allowed values: MALE, FEMALE', 400);
      }
    }

    // 4. Role-specific validation
    let assignedHostel = null;
    let assignedStaffCategory = null;

    if (role === 'WARDEN') {
      if (!cleanGender) {
        return sendError(
          res,
          'Gender is required for Warden registration to assign the appropriate hostel.',
          400
        );
      }
      if (!hostelName || !hostelName.trim()) {
        return sendError(res, 'Assigned Hostel is required for Warden registration.', 400);
      }
      assignedHostel = hostelName.trim();
      if (!isValidHostelForGender(assignedHostel, cleanGender)) {
        return sendError(
          res,
          `Selected hostel "${assignedHostel}" is not valid for ${cleanGender.toLowerCase()} wardens. Allowed hostels: ${getHostelsByGender(cleanGender).join(', ')}`,
          400
        );
      }
    } else if (role === 'STAFF') {
      if (!staffCategory || !staffCategory.trim()) {
        return sendError(
          res,
          'Staff trade/category (e.g. Electrician, Plumber, Cleaning) is required for staff registration.',
          400
        );
      }
      assignedStaffCategory = staffCategory.trim();
    }

    // 5. Check duplicate email
    const existingUser = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    if (existingUser) {
      return sendError(res, 'An account with this email already exists', 409);
    }

    // 6. Hash password
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    // 7. Create user
    const newUser = await prisma.user.create({
      data: {
        name: name.trim(),
        email: cleanEmail,
        passwordHash,
        role,
        gender: cleanGender,
        hostelName: assignedHostel,
        staffCategory: assignedStaffCategory,
        mobileNumber:
          mobileNumber && typeof mobileNumber === 'string' ? mobileNumber.trim() : null,
        roomNumber: null,
        universityRollNumber: null,
        branch: null,
        year: null,
        emailVerified: true,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        gender: true,
        hostelName: true,
        staffCategory: true,
        mobileNumber: true,
        emailVerified: true,
        createdAt: true,
      },
    });

    return sendCreated(res, newUser);
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/auth/forgot-password
 * Public endpoint for password reset initiation (STUDENT, WARDEN, STAFF).
 * Always returns a generic response to prevent user enumeration attacks.
 * Dispatches a password reset link to the user's email if the account exists.
 */
const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    const GENERIC_RESPONSE = 'If an account exists with this email, a password reset link has been sent.';

    if (!email || typeof email !== 'string' || !email.trim()) {
      return sendError(res, 'Email address is required', 400);
    }

    const cleanEmail = email.trim().toLowerCase();
    if (!EMAIL_REGEX.test(cleanEmail)) {
      return sendError(res, 'Please provide a valid email address', 400);
    }

    // Look up user by email
    const user = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    if (!user) {
      // Do not reveal whether user exists - return generic success
      return sendSuccess(res, { message: GENERIC_RESPONSE });
    }

    // Cooldown check: if requested within last 60s, don't spam emails, return generic success
    if (user.passwordResetLastSentAt) {
      const msSinceLast = Date.now() - new Date(user.passwordResetLastSentAt).getTime();
      if (msSinceLast < RESET_COOLDOWN_MS) {
        return sendSuccess(res, { message: GENERIC_RESPONSE });
      }
    }

    // Generate cryptographically secure token & SHA-256 hash
    const rawToken = generateResetToken();
    const tokenHash = hashResetToken(rawToken);
    const expiresAt = new Date(Date.now() + RESET_TOKEN_EXPIRY_MINUTES * 60 * 1000);

    // Persist hash in database
    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordResetTokenHash: tokenHash,
        passwordResetExpiresAt: expiresAt,
        passwordResetLastSentAt: new Date(),
      },
    });

    // Record for tests in test environment
    recordTestResetToken(cleanEmail, rawToken);

    // Build reset URL
    const frontendBaseUrl = config.clientUrl || 'http://localhost:5173';
    const resetUrl = `${frontendBaseUrl}/reset-password?token=${rawToken}`;

    // Send email via Gmail API
    await sendPasswordResetEmail({
      to: user.email,
      userName: user.name,
      resetUrl,
      expiryMinutes: RESET_TOKEN_EXPIRY_MINUTES,
    });

    return sendSuccess(res, { message: GENERIC_RESPONSE });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/auth/reset-password
 * Public endpoint to reset password using a valid, unexpired token.
 * Single-use token: immediately cleared upon successful reset.
 */
const resetPassword = async (req, res, next) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || typeof token !== 'string' || !token.trim()) {
      return sendError(res, 'Reset token is required', 400);
    }

    if (!newPassword || typeof newPassword !== 'string' || newPassword.length < MIN_PASSWORD_LENGTH) {
      return sendError(
        res,
        `Password must be at least ${MIN_PASSWORD_LENGTH} characters long`,
        400
      );
    }

    const cleanToken = token.trim();
    const tokenHash = hashResetToken(cleanToken);

    const user = await prisma.user.findFirst({
      where: {
        passwordResetTokenHash: tokenHash,
      },
    });

    if (!user) {
      return sendError(
        res,
        'Invalid or expired password reset link. Please request a new link.',
        400
      );
    }

    // Check expiration
    if (!user.passwordResetExpiresAt || new Date() > new Date(user.passwordResetExpiresAt)) {
      // Clear expired token
      await prisma.user.update({
        where: { id: user.id },
        data: {
          passwordResetTokenHash: null,
          passwordResetExpiresAt: null,
        },
      });
      return sendError(
        res,
        'Password reset link has expired (valid for 15 minutes). Please request a new link.',
        400
      );
    }

    // Hash new password using bcrypt
    const passwordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);

    // Invalidate token immediately and update password
    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        passwordResetTokenHash: null,
        passwordResetExpiresAt: null,
      },
    });

    return sendSuccess(res, {
      message: 'Password has been successfully reset. You can now log in with your new password.',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/auth/change-password
 * Authenticated endpoint for logged in users (STUDENT, WARDEN, STAFF).
 * Verifies current password before updating to new password.
 */
const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || typeof currentPassword !== 'string') {
      return sendError(res, 'Current password is required', 400);
    }

    if (!newPassword || typeof newPassword !== 'string' || newPassword.length < MIN_PASSWORD_LENGTH) {
      return sendError(
        res,
        `New password must be at least ${MIN_PASSWORD_LENGTH} characters long`,
        400
      );
    }

    // Fetch user with current passwordHash
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
    });

    if (!user) {
      return sendNotFound(res, 'User not found');
    }

    // Verify current password
    const isCurrentValid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isCurrentValid) {
      return sendError(res, 'Incorrect current password. Please try again.', 400);
    }

    // Prevent reusing current password
    const isSamePassword = await bcrypt.compare(newPassword, user.passwordHash);
    if (isSamePassword) {
      return sendError(res, 'New password cannot be the same as your current password.', 400);
    }

    // Hash new password
    const passwordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
      },
    });

    return sendSuccess(res, {
      message: 'Password updated successfully.',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  verifyEmail,
  resendVerification,
  staffRegister,
  login,
  getMe,
  forgotPassword,
  resetPassword,
  changePassword,
};

