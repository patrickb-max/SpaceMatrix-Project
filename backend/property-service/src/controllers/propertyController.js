const Property = require('../models/Property');

exports.getProperties = async (req, res) => {
  try {
    const filter = {};
    if (req.query.propertyType) filter.propertyType = req.query.propertyType;
    const properties = await Property.find(filter).sort({ createdAt: -1 });
    res.status(200).json(properties);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createProperty = async (req, res) => {
  try {
    const property = await Property.create(req.body);
    res.status(201).json(property);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};