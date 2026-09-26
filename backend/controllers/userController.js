const db = require('../db');

/**
 * GET /api/users/me
 * Retrieve profile information for the authenticated user.
 */
async function getCurrentUser(req, res, next) {
  try {
    const userId = req.user && req.user.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const result = await db.query(
      'SELECT id, name, email, created_at, updated_at FROM users WHERE id = $1;',
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    return res.status(200).json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  getCurrentUser
};
