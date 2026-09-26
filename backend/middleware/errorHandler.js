/**
 * Centralized error-handling middleware for Express.
 * Intercepts errors and produces safe, standardized JSON responses
 * without leaking database credentials, stack traces, or SQL queries.
 */
function errorHandler(err, req, res, next) {
  if (res.headersSent) {
    return next(err);
  }

  // Handle specific PostgreSQL error codes
  if (err.code === '23503') {
    // Foreign key violation
    return res.status(400).json({
      success: false,
      message: 'Specified category does not exist'
    });
  }

  if (err.code === '23514') {
    // Check constraint violation (e.g. price <= 0, stock < 0)
    return res.status(400).json({
      success: false,
      message: 'Validation failed: Price must be greater than 0 and stock cannot be negative'
    });
  }

  if (err.code === '23001') {
    // RESTRICT violation (e.g. trying to delete product referenced in order_items)
    return res.status(409).json({
      success: false,
      message: 'Cannot delete product because it is referenced in customer order history'
    });
  }

  const statusCode = err.statusCode || err.status || 500;
  const message = statusCode < 500 ? err.message : 'Internal server error';

  if (statusCode >= 500) {
    console.error('Unhandled server error:', err.message);
  }

  return res.status(statusCode).json({
    success: false,
    message
  });
}

module.exports = errorHandler;
