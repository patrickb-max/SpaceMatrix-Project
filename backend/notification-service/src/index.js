// backend/notification-service/src/index.js file
require('dotenv').config();
const express = require('express');
const cors = require('cors');

const notificationRoutes = require('./routes/notificationRoutes');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/v1/notifications', notificationRoutes);

const PORT = process.env.PORT || 3004;

app.listen(PORT, () => {
  console.log(`🚀 Notification Service running on port ${PORT}`);
});