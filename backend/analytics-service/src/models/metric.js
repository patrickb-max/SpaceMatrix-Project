const mongoose = require('mongoose');

const metricSchema = new mongoose.Schema({
  eventType: { type: String, required: true },
  metadata: { type: Object, default: {} },
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Metric', metricSchema);