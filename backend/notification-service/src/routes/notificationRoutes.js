// backend/notification-service/src/routes/notificationRoutes.js
const express = require('express');
const router = express.Router();
const controller = require('../controllers/notificationController');

router.post('/send', controller.sendNotification);

module.exports = router;