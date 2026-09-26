const db = require('../db');

/**
 * GET /api/categories
 * Retrieve all categories ordered by ID.
 */
async function getAllCategories(req, res, next) {
  try {
    const result = await db.query(
      'SELECT id, name, description, created_at FROM categories ORDER BY id ASC;'
    );
    return res.status(200).json({
      success: true,
      count: result.rows.length,
      data: result.rows
    });
  } catch (error) {
    return next(error);
  }
}

/**
 * GET /api/categories/:id
 * Retrieve a single category by numeric ID.
 */
async function getCategoryById(req, res, next) {
  try {
    const { id } = req.params;

    if (!/^[1-9]\d*$/.test(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid category ID'
      });
    }

    const result = await db.query(
      'SELECT id, name, description, created_at FROM categories WHERE id = $1;',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
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
  getAllCategories,
  getCategoryById
};
