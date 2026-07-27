const Metric = require('../models/Metric');

exports.trackEvent = async (req, res) => {
  try {
    const metric = await Metric.create(req.body);
    console.log(`📊 [Analytics Logged]: ${req.body.eventType}`);
    res.status(201).json({ status: 'tracked', metric });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};