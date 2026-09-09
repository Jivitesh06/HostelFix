/**
 * Global error handling middleware.
 * Must be registered LAST in the Express middleware chain.
 */
const errorHandler = (err, req, res, next) => {
  const isDev = process.env.NODE_ENV === 'development';

  // Log the full error server-side for debugging
  console.error('[Error]', err.message);
  if (isDev) console.error(err.stack);

  // Prisma known request errors (e.g. unique constraint)
  if (err.code === 'P2002') {
    return res.status(409).json({
      success: false,
      message: 'A record with this value already exists.',
    });
  }

  // Prisma not-found error
  if (err.code === 'P2025') {
    return res.status(404).json({
      success: false,
      message: 'Record not found.',
    });
  }

  const status = err.status || err.statusCode || 500;
  const message =
    status < 500
      ? err.message
      : 'An internal server error occurred. Please try again later.';

  return res.status(status).json({
    success: false,
    message,
  });
};

module.exports = errorHandler;
