const express = require('express');
const router = express.Router();
const controller = require('../controllers/analyticsController');

router.post('/track', controller.trackEvent);

module.exports = router;