const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const {
  getCart,
  addCartItem,
  updateCartItem,
  removeCartItem
} = require('../controllers/cartController');

// All cart endpoints require authentication
router.use(authMiddleware);

router.get('/', getCart);
router.post('/items', addCartItem);
router.put('/items/:id', updateCartItem);
router.delete('/items/:id', removeCartItem);

module.exports = router;
