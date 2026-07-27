const mongoose = require('mongoose');

const propertySchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  propertyType: { type: String, required: true, enum: ['office', 'warehouse', 'retail'] },
  totalArea: { type: Number, required: true },
  rentPerSqFt: { type: Number, required: true },
  totalMonthlyRent: { type: Number, required: true },
  images: { type: [String], default: [] },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Property', propertySchema);