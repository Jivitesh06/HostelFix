const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('../config/env');
const prisma = require('../config/prisma');
const {
  sendSuccess,
  sendCreated,
  sendError,
  sendUnauthorized,
} = require('../utils/response');
const {
  GENDERS,
  getHostelsByGender,
  isValidHostelForGender,
} = require('../utils/hostelConfig');

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 6;
const SALT_ROUNDS = 10;

/**
 * POST /api/auth/register
 * Student self-registration only.
 * Role is strictly enforced as STUDENT on the backend.
 */
const register = async (req, res, next) => {
  try {
    const {
      name,
      email,
      password,
      roomNumber,
      hostelBlock,
      hostelName,
      gender,
      mobileNumber,
      universityRollNumber,
      branch,
      year,
    } = req.body;

    // Validate presence of required fields
    if (!name || !email || !password || !roomNumber || !hostelBlock) {
      return sendError(
        res,
        'Name, email, password, room number, and hostel block are required',
        400
      );
    }

    // Validate trimmed lengths
    if (!name.trim() || !roomNumber.trim() || !hostelBlock.trim()) {
      return sendError(res, 'Fields cannot be empty or whitespace only', 400);
    }

    // Validate email format
    const cleanEmail = email.trim().toLowerCase();
    if (!EMAIL_REGEX.test(cleanEmail)) {
      return sendError(res, 'Please provide a valid email address', 400);
    }

    // Validate password length
    if (typeof password !== 'string' || password.length < MIN_PASSWORD_LENGTH) {
      return sendError(
        res,
        `Password must be at least ${MIN_PASSWORD_LENGTH} characters long`,
        400
      );
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

    // Hash password with bcrypt
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    // Create student user - role is ALWAYS STUDENT regardless of any client input
    const newUser = await prisma.user.create({
      data: {
        name: name.trim(),
        email: cleanEmail,
        passwordHash,
        role: 'STUDENT',
        roomNumber: roomNumber.trim(),
        hostelBlock: hostelBlock.trim(),
        hostelName: hostelName && typeof hostelName === 'string' ? hostelName.trim() : null,
        gender: cleanGender,
        mobileNumber: mobileNumber && typeof mobileNumber === 'string' ? mobileNumber.trim() : null,
        universityRollNumber: universityRollNumber && typeof universityRollNumber === 'string' ? universityRollNumber.trim() : null,
        branch: branch && typeof branch === 'string' ? branch.trim() : null,
        year: year && typeof year === 'string' ? year.trim() : null,
        staffCategory: null,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        roomNumber: true,
        hostelBlock: true,
        hostelName: true,
        gender: true,
        mobileNumber: true,
        universityRollNumber: true,
        branch: true,
        year: true,
        createdAt: true,
      },
    });

    return sendCreated(res, newUser);
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/auth/login
 * Verifies email & password, returns JWT token and safe user profile.
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
      hostelBlock: user.hostelBlock,
      hostelName: user.hostelName,
      gender: user.gender,
      mobileNumber: user.mobileNumber,
      universityRollNumber: user.universityRollNumber,
      branch: user.branch,
      year: user.year,
      staffCategory: user.staffCategory,
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
      hostelBlock: req.user.hostelBlock,
      hostelName: req.user.hostelName,
      gender: req.user.gender,
      mobileNumber: req.user.mobileNumber,
      universityRollNumber: req.user.universityRollNumber,
      branch: req.user.branch,
      year: req.user.year,
      staffCategory: req.user.staffCategory,
    };

    return sendSuccess(res, {
      ...safeUser,
      user: safeUser,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  getMe,
};
