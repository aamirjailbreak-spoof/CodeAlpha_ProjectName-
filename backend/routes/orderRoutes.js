const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const {
  createOrder,
  getUserOrders,
  getOrderById
} = require('../controllers/orderController');

// All order endpoints require valid JWT authentication
router.use(authMiddleware);

router.post('/', createOrder);
router.get('/', getUserOrders);
router.get('/:id', getOrderById);

module.exports = router;
