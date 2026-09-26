const db = require('../db');

/**
 * GET /api/products
 * Retrieve all products joined with category names.
 * Supports query parameters: category_id, search, page, limit.
 */
async function getAllProducts(req, res, next) {
  try {
    const { category_id, search, page = 1, limit = 20 } = req.query;

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);

    if (isNaN(pageNum) || pageNum < 1) {
      return res.status(400).json({
        success: false,
        message: 'Page parameter must be an integer greater than or equal to 1'
      });
    }

    if (isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
      return res.status(400).json({
        success: false,
        message: 'Limit parameter must be an integer between 1 and 100'
      });
    }

    const conditions = [];
    const params = [];

    if (category_id !== undefined && category_id !== '') {
      if (!/^[1-9]\d*$/.test(category_id)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid category ID'
        });
      }
      params.push(parseInt(category_id, 10));
      conditions.push(`p.category_id = $${params.length}`);
    }

    if (search !== undefined && search.trim() !== '') {
      params.push(`%${search.trim()}%`);
      conditions.push(`(p.name ILIKE $${params.length} OR p.description ILIKE $${params.length})`);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    const offset = (pageNum - 1) * limitNum;

    params.push(limitNum);
    const limitIndex = params.length;

    params.push(offset);
    const offsetIndex = params.length;

    const queryText = `
      SELECT 
        p.id,
        p.category_id,
        c.name AS category_name,
        p.name,
        p.description,
        p.price,
        p.stock_quantity,
        p.image_url,
        p.created_at,
        p.updated_at
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      ${whereClause}
      ORDER BY p.id ASC
      LIMIT $${limitIndex} OFFSET $${offsetIndex};
    `;

    const result = await db.query(queryText, params);

    return res.status(200).json({
      success: true,
      count: result.rows.length,
      page: pageNum,
      limit: limitNum,
      data: result.rows
    });
  } catch (error) {
    return next(error);
  }
}

/**
 * GET /api/products/:id
 * Retrieve a single product by numeric ID.
 */
async function getProductById(req, res, next) {
  try {
    const { id } = req.params;

    if (!/^[1-9]\d*$/.test(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID'
      });
    }

    const result = await db.query(
      `SELECT 
        p.id,
        p.category_id,
        c.name AS category_name,
        p.name,
        p.description,
        p.price,
        p.stock_quantity,
        p.image_url,
        p.created_at,
        p.updated_at
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.id = $1;`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
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

/**
 * POST /api/products
 * Create a new product.
 */
async function createProduct(req, res, next) {
  try {
    const { category_id, name, description, price, stock_quantity, image_url } = req.body;

    if (!name || typeof name !== 'string' || name.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Product name is required'
      });
    }

    if (name.trim().length > 255) {
      return res.status(400).json({
        success: false,
        message: 'Product name must not exceed 255 characters'
      });
    }

    const parsedPrice = parseFloat(price);
    if (price === undefined || isNaN(parsedPrice) || parsedPrice <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Price must be a number greater than 0'
      });
    }

    let parsedStock = 0;
    if (stock_quantity !== undefined) {
      parsedStock = parseInt(stock_quantity, 10);
      if (isNaN(parsedStock) || parsedStock < 0) {
        return res.status(400).json({
          success: false,
          message: 'Stock quantity must be a non-negative integer'
        });
      }
    }

    let parsedCategoryId = null;
    if (category_id !== undefined && category_id !== null) {
      if (!/^[1-9]\d*$/.test(String(category_id))) {
        return res.status(400).json({
          success: false,
          message: 'Category ID must be a positive integer'
        });
      }
      parsedCategoryId = parseInt(category_id, 10);

      // Verify category exists
      const catCheck = await db.query('SELECT id FROM categories WHERE id = $1;', [parsedCategoryId]);
      if (catCheck.rows.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Specified category does not exist'
        });
      }
    }

    const trimmedDescription = typeof description === 'string' ? description.trim() : null;
    const trimmedImageUrl = typeof image_url === 'string' ? image_url.trim() : null;

    if (trimmedImageUrl && trimmedImageUrl.length > 500) {
      return res.status(400).json({
        success: false,
        message: 'Image URL must not exceed 500 characters'
      });
    }

    const insertResult = await db.query(
      `INSERT INTO products (category_id, name, description, price, stock_quantity, image_url)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, category_id, name, description, price, stock_quantity, image_url, created_at, updated_at;`,
      [parsedCategoryId, name.trim(), trimmedDescription, parsedPrice, parsedStock, trimmedImageUrl]
    );

    return res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: insertResult.rows[0]
    });
  } catch (error) {
    return next(error);
  }
}

/**
 * PUT /api/products/:id
 * Update an existing product.
 */
async function updateProduct(req, res, next) {
  try {
    const { id } = req.params;

    if (!/^[1-9]\d*$/.test(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID'
      });
    }

    const existingCheck = await db.query('SELECT id FROM products WHERE id = $1;', [id]);
    if (existingCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    const { category_id, name, description, price, stock_quantity, image_url } = req.body;

    const updates = [];
    const params = [];

    if (name !== undefined) {
      if (typeof name !== 'string' || name.trim() === '') {
        return res.status(400).json({
          success: false,
          message: 'Product name cannot be empty'
        });
      }
      if (name.trim().length > 255) {
        return res.status(400).json({
          success: false,
          message: 'Product name must not exceed 255 characters'
        });
      }
      params.push(name.trim());
      updates.push(`name = $${params.length}`);
    }

    if (price !== undefined) {
      const parsedPrice = parseFloat(price);
      if (isNaN(parsedPrice) || parsedPrice <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Price must be a number greater than 0'
        });
      }
      params.push(parsedPrice);
      updates.push(`price = $${params.length}`);
    }

    if (stock_quantity !== undefined) {
      const parsedStock = parseInt(stock_quantity, 10);
      if (isNaN(parsedStock) || parsedStock < 0) {
        return res.status(400).json({
          success: false,
          message: 'Stock quantity must be a non-negative integer'
        });
      }
      params.push(parsedStock);
      updates.push(`stock_quantity = $${params.length}`);
    }

    if (category_id !== undefined) {
      if (category_id === null) {
        updates.push('category_id = NULL');
      } else {
        if (!/^[1-9]\d*$/.test(String(category_id))) {
          return res.status(400).json({
            success: false,
            message: 'Category ID must be a positive integer'
          });
        }
        const parsedCategoryId = parseInt(category_id, 10);
        const catCheck = await db.query('SELECT id FROM categories WHERE id = $1;', [parsedCategoryId]);
        if (catCheck.rows.length === 0) {
          return res.status(400).json({
            success: false,
            message: 'Specified category does not exist'
          });
        }
        params.push(parsedCategoryId);
        updates.push(`category_id = $${params.length}`);
      }
    }

    if (description !== undefined) {
      const descVal = typeof description === 'string' ? description.trim() : null;
      params.push(descVal);
      updates.push(`description = $${params.length}`);
    }

    if (image_url !== undefined) {
      const urlVal = typeof image_url === 'string' ? image_url.trim() : null;
      if (urlVal && urlVal.length > 500) {
        return res.status(400).json({
          success: false,
          message: 'Image URL must not exceed 500 characters'
        });
      }
      params.push(urlVal);
      updates.push(`image_url = $${params.length}`);
    }

    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No fields provided for update'
      });
    }

    updates.push('updated_at = CURRENT_TIMESTAMP');
    params.push(id);
    const idIndex = params.length;

    const queryText = `
      UPDATE products
      SET ${updates.join(', ')}
      WHERE id = $${idIndex}
      RETURNING id, category_id, name, description, price, stock_quantity, image_url, created_at, updated_at;
    `;

    const updateResult = await db.query(queryText, params);

    return res.status(200).json({
      success: true,
      message: 'Product updated successfully',
      data: updateResult.rows[0]
    });
  } catch (error) {
    return next(error);
  }
}

/**
 * DELETE /api/products/:id
 * Delete a product by ID.
 * If the product is referenced in customer orders, PostgreSQL RESTRICT
 * constraint will block it, caught by errorHandler to return 409 Conflict.
 */
async function deleteProduct(req, res, next) {
  try {
    const { id } = req.params;

    if (!/^[1-9]\d*$/.test(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID'
      });
    }

    const existingCheck = await db.query('SELECT id FROM products WHERE id = $1;', [id]);
    if (existingCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    await db.query('DELETE FROM products WHERE id = $1;', [id]);

    return res.status(200).json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct
};
