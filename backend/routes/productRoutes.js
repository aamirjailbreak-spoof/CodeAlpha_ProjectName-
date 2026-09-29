const express = require('express');
const router = express.Router();
const {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct
} = require('../controllers/productController');

function requireAdmin(req, res, next) {
  const adminKey = req.headers['x-admin-key'];
  if (process.env.ADMIN_API_KEY && adminKey === process.env.ADMIN_API_KEY) {
    return next();
  }
  return res.status(403).json({
    success: false,
    message: 'Access denied: Admin authorization required'
  });
}

// Public catalog browsing
router.get('/', getAllProducts);
router.get('/:id', getProductById);

// Admin-only catalog mutations (blocked for ordinary public/customers)
router.post('/', requireAdmin, createProduct);
router.put('/:id', requireAdmin, updateProduct);
router.delete('/:id', requireAdmin, deleteProduct);

module.exports = router;

