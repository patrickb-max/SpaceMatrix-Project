// database/seed.js
const mongoose = require('mongoose');

// Connect directly to your local MongoDB instance
const MONGO_URI = 'mongodb://127.0.0.1:27017/spacematrix';

const propertySchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  propertyType: { type: String, required: true, enum: ['office', 'warehouse', 'retail'] },
  totalArea: { type: Number, required: true },
  rentPerSqFt: { type: Number, required: true },
  totalMonthlyRent: { type: Number, required: true },
  images: { type: [String], default: [] },
  createdAt: { type: Date, default: Date.now }
});

const Property = mongoose.model('Property', propertySchema);

const sampleProperties = [
  {
    name: 'Silicon Hub Tower',
    description: 'Prime corporate office space in downtown financial district.',
    propertyType: 'office',
    totalArea: 5500,
    rentPerSqFt: 4.5,
    totalMonthlyRent: 24750,
    images: ['https://images.unsplash.com/photo-1486406146926-c627a92ad1ab']
  },
  {
    name: 'LogiPark Depot West',
    description: 'High-ceiling logistics warehouse near major expressways.',
    propertyType: 'warehouse',
    totalArea: 25000,
    rentPerSqFt: 1.2,
    totalMonthlyRent: 30000,
    images: ['https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d']
  },
  {
    name: 'Metro Walk Galleria',
    description: 'High foot-traffic retail storefront space in central shopping district.',
    propertyType: 'retail',
    totalArea: 3200,
    rentPerSqFt: 6.0,
    totalMonthlyRent: 19200,
    images: ['https://images.unsplash.com/photo-1555396273-367ea4eb4db5']
  }
];

async function runSeed() {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected successfully!');

    // Clear existing records so we don't create duplicate properties
    await Property.deleteMany({});
    console.log('🗑️  Cleared existing properties.');

    // Insert new sample records
    const inserted = await Property.insertMany(sampleProperties);
    console.log(`🌱 Successfully seeded ${inserted.length} properties into MongoDB!`);

    process.exit(0);
  } catch (err) {
    console.error('❌ Seeding failed:', err);
    process.exit(1);
  }
}

runSeed();