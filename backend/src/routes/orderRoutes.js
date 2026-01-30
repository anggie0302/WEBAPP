const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { auth, authorize } = require('../middleware/auth');

// Customer
router.post('/', auth, authorize(['customer']), orderController.createOrder);
router.get('/my-orders', auth, authorize(['customer']), orderController.getMyOrders);
// Driver
router.get('/ready', auth, authorize(['driver']), orderController.getReadyOrders);
router.get('/active-deliveries', auth, authorize(['driver']), orderController.getDriverActiveOrders);
router.get('/history', auth, authorize(['driver']), orderController.getDriverOrderHistory);
router.post('/:orderId/accept', auth, authorize(['driver']), orderController.driverAcceptOrder);
router.post('/:orderId/complete', auth, authorize(['driver']), orderController.driverCompleteOrder);

// Specific Order (Must be last to avoid conflict)
router.get('/:id', auth, orderController.getOrder);

module.exports = router;
