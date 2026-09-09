const jwt = require('jsonwebtoken');
const config = require('../config/env');
const prisma = require('../config/prisma');
const { sendUnauthorized, sendForbidden } = require('../utils/response');

/**
 * Middleware: verifyToken
 * Validates the JWT from the Authorization: Bearer <token> header.
 * Attaches the verified user from the database to req.user.
 */
const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return sendUnauthorized(res, 'Authentication token is required');
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return sendUnauthorized(res, 'Authentication token is required');
    }

    let decoded;
    try {
      decoded = jwt.verify(token, config.jwt.secret);
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        return sendUnauthorized(res, 'Session expired. Please log in again');
      }
      return sendUnauthorized(res, 'Invalid authentication token');
    }

    if (!decoded.userId) {
      return sendUnauthorized(res, 'Invalid token payload');
    }

    // Retrieve active user from database to ensure fresh role and state
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
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
        staffCategory: true,
      },
    });

    if (!user) {
      return sendUnauthorized(res, 'User account no longer exists');
    }

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Middleware factory: requireRole
 * Restricts access to one or more specified roles.
 * Must be placed AFTER verifyToken in the middleware pipeline.
 *
 * @param  {...string} roles Allowed roles (e.g. 'STUDENT', 'WARDEN', 'STAFF')
 */
const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return sendUnauthorized(res, 'Authentication required');
    }

    if (!roles.includes(req.user.role)) {
      return sendForbidden(
        res,
        `Access denied. Requires role: ${roles.join(' or ')}`
      );
    }

    next();
  };
};

module.exports = {
  verifyToken,
  requireRole,
};
