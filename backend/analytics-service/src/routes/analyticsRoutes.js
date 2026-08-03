// src/routes/analyticsRoutes.js
const express = require('express');
const router = express.Router();
const controller = require('../controllers/analyticsController');

// GET /api/v1/health -> Quick health check
router.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Analytics Service is healthy' });
});

// POST /api/v1/analytics/track --> Track the event
router.post('/track', controller.trackEvent);

module.exports = router;