const express = require('express');
const router = express.Router();
const { createOrder, getOrders, updateOrderStatus, deleteOrder } = require('../controllers/orderController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, createOrder);
router.get('/', protect, getOrders);
router.get('/my-orders', protect, getOrders); // Added specific route for my-orders
router.put('/:id/status', protect, updateOrderStatus);
router.delete('/:id', protect, deleteOrder);

module.exports = router;
