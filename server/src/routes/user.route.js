const express = require('express');
const router = express.Router();
const prisma = require('../config/prisma');
const { verifyToken, requireRole } = require('../middleware/auth.middleware');
const bcrypt = require('bcryptjs');
const {
  sendSuccess,
  sendCreated,
  sendError,
  sendForbidden,
  sendNotFound,
} = require('../utils/response');
const {
  GENDERS,
  getHostelsByGender,
  isValidHostelForGender,
} = require('../utils/hostelConfig');

const PHONE_REGEX = /^[0-9+\-\s]{7,15}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 6;
const SALT_ROUNDS = 10;

/**
 * GET /api/users/profile
 * Returns the current authenticated student's full profile.
 * Access: STUDENT only
 */
router.get('/profile', verifyToken, requireRole('STUDENT'), async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
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

    if (!user) {
      return sendNotFound(res, 'Student profile not found');
    }

    return sendSuccess(res, user);
  } catch (error) {
    next(error);
  }
});

/**
 * PUT /api/users/profile
 * Updates the current authenticated student's editable profile fields.
 * Access: STUDENT only
 */
router.put('/profile', verifyToken, requireRole('STUDENT'), async (req, res, next) => {
  try {
    const {
      name,
      gender,
      mobileNumber,
      universityRollNumber,
      branch,
      year,
      hostelName,
      roomNumber,
      hostelBlock,
    } = req.body;

    const dataToUpdate = {};

    // Validate name if provided
    if (name !== undefined) {
      if (typeof name !== 'string' || !name.trim()) {
        return sendError(res, 'Name cannot be empty', 400);
      }
      dataToUpdate.name = name.trim();
    }

    // Validate gender if provided
    let effectiveGender = req.user.gender;
    if (gender !== undefined) {
      if (gender !== null && gender !== '') {
        const cleanGender = gender.toString().trim().toUpperCase();
        if (!GENDERS.includes(cleanGender)) {
          return sendError(res, 'Invalid gender. Allowed values: MALE, FEMALE', 400);
        }
        dataToUpdate.gender = cleanGender;
        effectiveGender = cleanGender;
      } else {
        dataToUpdate.gender = null;
        effectiveGender = null;
      }
    }

    // Validate mobile number if provided
    if (mobileNumber !== undefined) {
      if (mobileNumber !== null && mobileNumber !== '') {
        if (typeof mobileNumber !== 'string' || !PHONE_REGEX.test(mobileNumber.trim())) {
          return sendError(res, 'Please provide a valid contact mobile number (7-15 digits)', 400);
        }
        dataToUpdate.mobileNumber = mobileNumber.trim();
      } else {
        dataToUpdate.mobileNumber = null;
      }
    }

    // Academic information
    if (universityRollNumber !== undefined) {
      dataToUpdate.universityRollNumber =
        universityRollNumber && typeof universityRollNumber === 'string'
          ? universityRollNumber.trim()
          : null;
    }

    if (branch !== undefined) {
      dataToUpdate.branch =
        branch && typeof branch === 'string' ? branch.trim() : null;
    }

    if (year !== undefined) {
      dataToUpdate.year =
        year && typeof year === 'string' ? year.trim() : null;
    }

    // Hostel information
    if (hostelName !== undefined) {
      if (hostelName !== null && hostelName !== '') {
        const cleanHostel = hostelName.toString().trim();
        if (!isValidHostelForGender(cleanHostel, effectiveGender)) {
          return sendError(
            res,
            `Selected hostel is not valid for ${effectiveGender ? effectiveGender.toLowerCase() : 'all'} students. Allowed hostels: ${getHostelsByGender(effectiveGender).join(', ')}`,
            400
          );
        }
        dataToUpdate.hostelName = cleanHostel;
      } else {
        dataToUpdate.hostelName = null;
      }
    }

    if (roomNumber !== undefined) {
      if (typeof roomNumber !== 'string' || !roomNumber.trim()) {
        return sendError(res, 'Room number cannot be empty', 400);
      }
      dataToUpdate.roomNumber = roomNumber.trim();
    }

    if (hostelBlock !== undefined) {
      dataToUpdate.hostelBlock =
        hostelBlock && typeof hostelBlock === 'string' && hostelBlock.trim()
          ? hostelBlock.trim()
          : null;
    }

    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: dataToUpdate,
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

    return sendSuccess(res, updatedUser);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/users/warden/profile
 * Returns the current authenticated warden's profile.
 * Access: WARDEN only
 */
router.get('/warden/profile', verifyToken, requireRole('WARDEN'), async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        gender: true,
        hostelName: true,
        mobileNumber: true,
        createdAt: true,
      },
    });

    if (!user) {
      return sendNotFound(res, 'Warden profile not found');
    }

    return sendSuccess(res, user);
  } catch (error) {
    next(error);
  }
});

/**
 * PUT /api/users/warden/profile
 * Updates the current authenticated warden's editable profile fields.
 * Access: WARDEN only
 */
router.put('/warden/profile', verifyToken, requireRole('WARDEN'), async (req, res, next) => {
  try {
    const { name, gender, hostelName, mobileNumber } = req.body;

    const dataToUpdate = {};

    if (name !== undefined) {
      if (typeof name !== 'string' || !name.trim()) {
        return sendError(res, 'Name cannot be empty', 400);
      }
      dataToUpdate.name = name.trim();
    }

    let effectiveGender = req.user.gender;
    if (gender !== undefined) {
      if (gender !== null && gender !== '') {
        const cleanGender = gender.toString().trim().toUpperCase();
        if (!GENDERS.includes(cleanGender)) {
          return sendError(res, 'Invalid gender. Allowed values: MALE, FEMALE', 400);
        }
        dataToUpdate.gender = cleanGender;
        effectiveGender = cleanGender;
      } else {
        dataToUpdate.gender = null;
        effectiveGender = null;
      }
    }

    if (mobileNumber !== undefined) {
      if (mobileNumber !== null && mobileNumber !== '') {
        if (typeof mobileNumber !== 'string' || !PHONE_REGEX.test(mobileNumber.trim())) {
          return sendError(res, 'Please provide a valid contact mobile number (7-15 digits)', 400);
        }
        dataToUpdate.mobileNumber = mobileNumber.trim();
      } else {
        dataToUpdate.mobileNumber = null;
      }
    }

    if (hostelName !== undefined) {
      if (hostelName !== null && hostelName !== '') {
        const cleanHostel = hostelName.toString().trim();
        if (!isValidHostelForGender(cleanHostel, effectiveGender)) {
          return sendError(
            res,
            `Selected hostel is not valid for ${effectiveGender ? effectiveGender.toLowerCase() : 'all'} wardens. Allowed hostels: ${getHostelsByGender(effectiveGender).join(', ')}`,
            400
          );
        }
        dataToUpdate.hostelName = cleanHostel;
      } else {
        dataToUpdate.hostelName = null;
      }
    }

    const updatedWarden = await prisma.user.update({
      where: { id: req.user.id },
      data: dataToUpdate,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        gender: true,
        hostelName: true,
        mobileNumber: true,
        createdAt: true,
      },
    });

    return sendSuccess(res, updatedWarden);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/users/students
 * Returns a list of students scoped to the warden's assigned hostel.
 * Access: WARDEN only
 */
router.get('/students', verifyToken, requireRole('WARDEN'), async (req, res, next) => {
  try {
    const { q } = req.query;

    const where = {
      role: 'STUDENT',
    };

    // Scoping: If warden is assigned to a hostel, restrict to students of that hostel
    if (req.user.hostelName) {
      where.hostelName = req.user.hostelName;
    }

    // Optional search filter
    if (q && typeof q === 'string' && q.trim()) {
      const searchTerm = q.trim();
      where.OR = [
        { name: { contains: searchTerm, mode: 'insensitive' } },
        { email: { contains: searchTerm, mode: 'insensitive' } },
        { universityRollNumber: { contains: searchTerm, mode: 'insensitive' } },
        { roomNumber: { contains: searchTerm, mode: 'insensitive' } },
        { branch: { contains: searchTerm, mode: 'insensitive' } },
      ];
    }

    const students = await prisma.user.findMany({
      where,
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
        isActive: true,
        createdAt: true,
        _count: {
          select: {
            complaintsSubmitted: true,
          },
        },
      },
      orderBy: [
        { roomNumber: 'asc' },
        { name: 'asc' },
      ],
    });

    const formatted = students.map((s) => ({
      ...s,
      complaintsCount: s._count?.complaintsSubmitted || 0,
      _count: undefined,
    }));

    return sendSuccess(res, formatted);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/users/students/:id
 * Allows Warden to inspect a specific student's profile details.
 * Access: WARDEN only (strictly scoped to warden's hostel)
 */
router.get('/students/:id', verifyToken, requireRole('WARDEN'), async (req, res, next) => {
  try {
    const { id } = req.params;

    const student = await prisma.user.findFirst({
      where: {
        id,
        role: 'STUDENT',
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
        isActive: true,
        createdAt: true,
        _count: {
          select: {
            complaintsSubmitted: true,
          },
        },
      },
    });

    if (!student) {
      return sendNotFound(res, 'Student profile not found');
    }

    // Hostel scoping check: if warden is assigned to Hostel A and student is in Hostel B
    if (req.user.hostelName && student.hostelName && student.hostelName !== req.user.hostelName) {
      return sendForbidden(
        res,
        `Access denied. This student is in ${student.hostelName}. You are assigned to ${req.user.hostelName}.`
      );
    }

    const formatted = {
      ...student,
      complaintsCount: student._count?.complaintsSubmitted || 0,
    };
    delete formatted._count;

    return sendSuccess(res, formatted);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/users/staff
 * Returns available staff members for warden directory and assignment dropdown.
 * Access: WARDEN only
 */
router.get('/staff', verifyToken, requireRole('WARDEN'), async (req, res, next) => {
  try {
    const staffMembers = await prisma.user.findMany({
      where: { role: 'STAFF' },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        mobileNumber: true,
        staffCategory: true,
        isActive: true,
        createdAt: true,
        _count: {
          select: {
            complaintsAssigned: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    });

    const formatted = staffMembers.map((s) => ({
      ...s,
      assignedCount: s._count?.complaintsAssigned || 0,
      _count: undefined,
    }));

    return sendSuccess(res, formatted);
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/users/staff
 * Allows Warden to provision a new Maintenance Worker / Staff account.
 * Access: WARDEN only
 */
router.post('/staff', verifyToken, requireRole('WARDEN'), async (req, res, next) => {
  try {
    const { name, email, password, mobileNumber, staffCategory } = req.body;

    // Validate required fields
    if (!name || !email || !password || !staffCategory) {
      return sendError(
        res,
        'Name, email, password, and specialization trade are required',
        400
      );
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

    if (!staffCategory.trim()) {
      return sendError(res, 'Specialization trade category cannot be empty', 400);
    }

    if (mobileNumber && typeof mobileNumber === 'string' && mobileNumber.trim()) {
      if (!PHONE_REGEX.test(mobileNumber.trim())) {
        return sendError(res, 'Please provide a valid contact mobile number (7-15 digits)', 400);
      }
    }

    // Check duplicate email
    const existing = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });
    if (existing) {
      return sendError(res, 'An account with this email already exists', 409);
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    // Create staff user - role is strictly forced to STAFF
    const newStaff = await prisma.user.create({
      data: {
        name: name.trim(),
        email: cleanEmail,
        passwordHash,
        role: 'STAFF',
        staffCategory: staffCategory.trim(),
        mobileNumber: mobileNumber && typeof mobileNumber === 'string' ? mobileNumber.trim() : null,
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        mobileNumber: true,
        staffCategory: true,
        isActive: true,
        createdAt: true,
      },
    });

    return sendCreated(res, newStaff);
  } catch (error) {
    next(error);
  }
});

/**
 * PUT /api/users/staff/:id
 * Allows Warden to edit basic staff member details and active status.
 * Access: WARDEN only
 */
router.put('/staff/:id', verifyToken, requireRole('WARDEN'), async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, mobileNumber, staffCategory, isActive } = req.body;

    // Check target user exists and has role STAFF
    const existingStaff = await prisma.user.findFirst({
      where: {
        id,
        role: 'STAFF',
      },
    });

    if (!existingStaff) {
      return sendNotFound(res, 'Staff member not found');
    }

    const dataToUpdate = {};

    if (name !== undefined) {
      if (typeof name !== 'string' || !name.trim()) {
        return sendError(res, 'Name cannot be empty', 400);
      }
      dataToUpdate.name = name.trim();
    }

    if (staffCategory !== undefined) {
      if (typeof staffCategory !== 'string' || !staffCategory.trim()) {
        return sendError(res, 'Specialization trade category cannot be empty', 400);
      }
      dataToUpdate.staffCategory = staffCategory.trim();
    }

    if (mobileNumber !== undefined) {
      if (mobileNumber !== null && mobileNumber !== '') {
        if (typeof mobileNumber !== 'string' || !PHONE_REGEX.test(mobileNumber.trim())) {
          return sendError(res, 'Please provide a valid contact mobile number (7-15 digits)', 400);
        }
        dataToUpdate.mobileNumber = mobileNumber.trim();
      } else {
        dataToUpdate.mobileNumber = null;
      }
    }

    if (isActive !== undefined) {
      if (typeof isActive !== 'boolean') {
        return sendError(res, 'isActive must be a boolean (true or false)', 400);
      }
      dataToUpdate.isActive = isActive;
    }

    const updatedStaff = await prisma.user.update({
      where: { id },
      data: dataToUpdate,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        mobileNumber: true,
        staffCategory: true,
        isActive: true,
        createdAt: true,
      },
    });

    return sendSuccess(res, updatedStaff);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
