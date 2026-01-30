const express = require('express');
const router = express.Router();
const driverController = require('../controllers/driverController');
const { auth, authorize } = require('../middleware/auth');

router.get('/profile', auth, authorize(['driver']), driverController.getDriverProfile);
router.post('/toggle-availability', auth, authorize(['driver']), driverController.toggleAvailability);
router.get('/stats', auth, authorize(['driver']), driverController.getStats);

module.exports = router;
