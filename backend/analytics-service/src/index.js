require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const analyticsRoutes = require('./routes/analyticsRoutes');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/v1/analytics', analyticsRoutes);

const PORT = process.env.PORT || 3003;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/spacematrix';

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('✅ [Analytics-Service] MongoDB Connected');
    app.listen(PORT, () => console.log(`🚀 Analytics Service running on port ${PORT}`));
  })
  .catch(err => console.error('❌ Analytics Service DB Error:', err));

