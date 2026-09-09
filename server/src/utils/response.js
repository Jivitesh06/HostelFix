/**
 * Standardized API response helpers.
 * Every controller should use these instead of raw res.json() calls.
 */

const sendSuccess = (res, data = null, statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    data,
  });
};

const sendCreated = (res, data) => sendSuccess(res, data, 201);

const sendError = (res, message, statusCode = 400) => {
  return res.status(statusCode).json({
    success: false,
    message,
  });
};

const sendUnauthorized = (res, message = 'Authentication required') =>
  sendError(res, message, 401);

const sendForbidden = (res, message = 'You do not have permission to perform this action') =>
  sendError(res, message, 403);

const sendNotFound = (res, message = 'Resource not found') =>
  sendError(res, message, 404);

module.exports = {
  sendSuccess,
  sendCreated,
  sendError,
  sendUnauthorized,
  sendForbidden,
  sendNotFound,
};
