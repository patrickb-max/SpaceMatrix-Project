// backend/inquiry-service/src/routes/inquiryRoutes.js
const express = require('express');
const router = express.Router();
const controller = require('../controllers/inquiryController');

router.get('/', controller.getInquiries);
router.post('/', controller.createInquiry);

module.exports = router; // <-- CRITICAL: Make sure this export line is present!