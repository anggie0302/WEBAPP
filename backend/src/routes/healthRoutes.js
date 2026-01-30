const express = require('express');
const router = express.Router();
const healthController = require('../controllers/healthController');

router.get('/db', healthController.db);

module.exports = router;
