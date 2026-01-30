const express = require('express');
const router = express.Router();
const restaurantController = require('../controllers/restaurantController');
const { auth, authorize } = require('../middleware/auth');

router.get('/profile', auth, authorize(['restaurant']), restaurantController.getRestaurantProfile);
router.get('/menu', auth, authorize(['restaurant']), restaurantController.getMenu);
router.post('/menu', auth, authorize(['restaurant']), restaurantController.addMenuItem);
router.put('/menu/:id', auth, authorize(['restaurant']), restaurantController.updateMenuItem);
router.delete('/menu/:id', auth, authorize(['restaurant']), restaurantController.deleteMenuItem);
router.get('/orders', auth, authorize(['restaurant']), restaurantController.getOrders);
router.put('/orders/:orderId/status', auth, authorize(['restaurant']), restaurantController.updateOrderStatus);
router.patch('/orders/:orderId/pay', auth, authorize(['restaurant']), restaurantController.updateOrderPayment);
router.post('/toggle-open', auth, authorize(['restaurant']), restaurantController.toggleOpen);
router.get('/stats', auth, authorize(['restaurant']), restaurantController.getStats);

module.exports = router;
