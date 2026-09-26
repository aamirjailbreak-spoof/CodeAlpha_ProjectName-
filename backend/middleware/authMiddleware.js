const jwt = require('jsonwebtoken');

/**
 * Authentication middleware for protecting private Express routes.
 * Requires: Authorization: Bearer <JWT>
 * Verifies JWT signature and attaches authenticated user info to req.user.
 */
function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || typeof authHeader !== 'string') {
    return res.status(401).json({
      success: false,
      message: 'Authentication token required'
    });
  }

  const parts = authHeader.trim().split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer' || !parts[1]) {
    return res.status(401).json({
      success: false,
      message: 'Malformed authorization header. Expected format: Bearer <token>'
    });
  }

  const token = parts[1];
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    console.error('JWT_SECRET is not configured in environment variables');
    return res.status(500).json({
      success: false,
      message: 'Authentication service configuration error'
    });
  }

  try {
    const decoded = jwt.verify(token, secret);

    if (!decoded || !decoded.userId) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token payload'
      });
    }

    req.user = {
      id: decoded.userId
    };

    return next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token'
    });
  }
}

module.exports = authMiddleware;
