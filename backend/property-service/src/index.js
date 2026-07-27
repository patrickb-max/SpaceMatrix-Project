require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const propertyRoutes = require('./routes/propertyRoutes');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/v1/properties', propertyRoutes);

const PORT = process.env.PORT || 3001;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/spacematrix';

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('✅ [Property-Service] MongoDB Connected');
    app.listen(PORT, () => console.log(`🚀 Property Service running on port ${PORT}`));
  })
  .catch(err => console.error('❌ Property Service DB Error:', err));