const mongoose = require('mongoose');

const inquirySchema = new mongoose.Schema({
  propertyId: { type: String, default: null },
  propertyName: { type: String, required: true },
  inquirerName: { type: String, required: true },
  inquirerEmail: { type: String, required: true },
  phone: { type: String, required: true },
  message: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Inquiry', inquirySchema);