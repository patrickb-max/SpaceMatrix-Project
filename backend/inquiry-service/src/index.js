require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const inquiryRoutes = require('./routes/inquiryRoutes');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/v1/inquiries', inquiryRoutes);

const PORT = process.env.PORT || 3002;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/spacematrix';

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('✅ [Inquiry-Service] MongoDB Connected');
    app.listen(PORT, () => console.log(`🚀 Inquiry Service running on port ${PORT}`));
  })
  .catch(err => console.error('❌ Inquiry Service DB Error:', err));