/**
 * 404 Not Found middleware.
 * Catches requests to routes that do not exist.
 */
const notFound = (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
};

module.exports = notFound;
