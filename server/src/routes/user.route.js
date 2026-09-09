const express = require('express');
const router = express.Router();
const prisma = require('../config/prisma');
const { verifyToken, requireRole } = require('../middleware/auth.middleware');
const { sendSuccess, sendError, sendNotFound } = require('../utils/response');

const PHONE_REGEX = /^[0-9+\-\s]{7,15}$/;

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
      dataToUpdate.hostelName =
        hostelName && typeof hostelName === 'string' ? hostelName.trim() : null;
    }

    if (roomNumber !== undefined) {
      if (typeof roomNumber !== 'string' || !roomNumber.trim()) {
        return sendError(res, 'Room number cannot be empty', 400);
      }
      dataToUpdate.roomNumber = roomNumber.trim();
    }

    if (hostelBlock !== undefined) {
      if (typeof hostelBlock !== 'string' || !hostelBlock.trim()) {
        return sendError(res, 'Hostel block cannot be empty', 400);
      }
      dataToUpdate.hostelBlock = hostelBlock.trim();
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
 * GET /api/users/students/:id
 * Allows Warden to inspect a specific student's profile details.
 * Access: WARDEN only
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
        mobileNumber: true,
        universityRollNumber: true,
        branch: true,
        year: true,
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
 * Returns available staff members for warden assignment dropdown.
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
        staffCategory: true,
      },
      orderBy: { name: 'asc' },
    });

    return sendSuccess(res, staffMembers);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
