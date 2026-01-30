const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customerController');
const { auth, authorize } = require('../middleware/auth');

router.get('/restaurants', customerController.getRestaurants);
router.get('/restaurants/:restaurantId/menu', customerController.getRestaurantMenu);
router.post('/promo/validate', auth, authorize(['customer']), customerController.validatePromo);
router.get('/promos', customerController.getAvailablePromos);

module.exports = router;
