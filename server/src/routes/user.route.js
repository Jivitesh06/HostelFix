const express = require('express');
const router = express.Router();
const prisma = require('../config/prisma');
const { verifyToken, requireRole } = require('../middleware/auth.middleware');
const { sendSuccess } = require('../utils/response');

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
