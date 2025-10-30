require('dotenv').config();
const mongoose = require('mongoose');
const Experience = require('../models/Experience');
const PromoCode = require('../models/PromoCode');

const connectDB = require('./database');

const sampleExperiences = [
  {
    title: 'Kayaking',
    description: 'Curated small-group experience. Certified guide. Safety first with gear included. Enjoy kayaking through the beautiful waters of Udupi with expert guidance and all necessary safety equipment.',
    imageUrl: 'https://images.unsplash.com/photo-1509477887414-681937645173?w=500&auto=format&fit=crop',
    location: 'Udupi, Karnataka',
    price: 999,
    durationHours: 3,
    maxPeople: 8,
    category: 'Adventure',
    rating: 4.7,
    reviewCount: 156,
    slots: []
  },
  {
    title: 'Nandi Hills Sunrise',
    description: 'Curated small-group experience. Certified guide. Safety first with gear included. Witness breathtaking sunrise views from Nandi Hills with guided tour and photography opportunities.',
    imageUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=500&auto=format&fit=crop',
    location: 'Bangalore',
    price: 899,
    durationHours: 4,
    maxPeople: 12,
    category: 'Nature',
    rating: 4.8,
    reviewCount: 234,
    slots: []
  },
  {
    title: 'Coffee Trail',
    description: 'Curated small-group experience. Certified guide. Safety first with gear included. Explore the coffee plantations of Coorg with tasting sessions and plantation walk.',
    imageUrl: 'https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=500&auto=format&fit=crop',
    location: 'Coorg',
    price: 1299,
    durationHours: 5,
    maxPeople: 10,
    category: 'Cultural',
    rating: 4.6,
    reviewCount: 189,
    slots: []
  },
  {
    title: 'Boat Cruise',
    description: 'Curated small-group experience. Certified guide. Safety first with gear included. Enjoy a scenic boat cruise through the mangroves of Sunderbans with wildlife spotting.',
    imageUrl: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=500&auto=format&fit=crop',
    location: 'Sunderbans',
    price: 999,
    durationHours: 6,
    maxPeople: 15,
    category: 'Nature',
    rating: 4.5,
    reviewCount: 143,
    slots: []
  },
  {
    title: 'Bungee Jumping',
    description: 'Curated small-group experience. Certified guide. Safety first with gear included. Experience the thrill of bungee jumping in Manali with professional safety standards.',
    imageUrl: 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=500&auto=format&fit=crop',
    location: 'Manali',
    price: 999,
    durationHours: 2,
    maxPeople: 6,
    category: 'Adventure',
    rating: 4.9,
    reviewCount: 278,
    slots: []
  },
  {
    title: 'Heritage Walk',
    description: 'Curated small-group experience. Certified guide. Safety first with gear included. Explore the rich heritage of Hampi with guided tour of ancient ruins and temples.',
    imageUrl: 'https://images.unsplash.com/photo-1596176530529-78163a4f7af2?w=500&auto=format&fit=crop',
    location: 'Hampi',
    price: 799,
    durationHours: 4,
    maxPeople: 20,
    category: 'Heritage',
    rating: 4.7,
    reviewCount: 167,
    slots: []
  },
  {
    title: 'Wildlife Safari',
    description: 'Curated small-group experience. Certified guide. Safety first with gear included. Jungle safari in Jim Corbett National Park with wildlife spotting and nature photography.',
    imageUrl: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?w=500&auto=format&fit=crop',
    location: 'Jim Corbett',
    price: 1499,
    durationHours: 8,
    maxPeople: 8,
    category: 'Wildlife',
    rating: 4.8,
    reviewCount: 198,
    slots: []
  },
  {
    title: 'Beach Camping',
    description: 'Curated small-group experience. Certified guide. Safety first with gear included. Overnight beach camping in Gokarna with bonfire, music, and water activities.',
    imageUrl: 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=500&auto=format&fit=crop',
    location: 'Gokarna',
    price: 1799,
    durationHours: 24,
    maxPeople: 12,
    category: 'Adventure',
    rating: 4.6,
    reviewCount: 134,
    slots: []
  }
];

const samplePromoCodes = [
  {
    code: 'SAVE10',
    discountType: 'percentage',
    discountValue: 10,
    minAmount: 2000,
    maxDiscount: 500,
    validFrom: new Date('2024-01-01'),
    validUntil: new Date('2024-12-31'),
    usageLimit: 1000
  },
  {
    code: 'FLAT500',
    discountType: 'fixed',
    discountValue: 500,
    minAmount: 3000,
    maxDiscount: 500,
    validFrom: new Date('2024-01-01'),
    validUntil: new Date('2024-12-31'),
    usageLimit: 500
  }
];

const generateSlots = () => {
  const slots = [];
  for (let i = 1; i <= 7; i++) {
    const date = new Date();
    date.setDate(date.getDate() + i);
    
    slots.push({
      date: date.toISOString().split('T')[0],
      startTime: '06:00',
      endTime: '09:00',
      availableSpots: 8,
      isActive: true
    });
    
    slots.push({
      date: date.toISOString().split('T')[0],
      startTime: '14:00',
      endTime: '17:00',
      availableSpots: 8,
      isActive: true
    });
    
    slots.push({
      date: date.toISOString().split('T')[0],
      startTime: '18:00',
      endTime: '21:00',
      availableSpots: 8,
      isActive: true
    });
  }
  return slots;
};

const seedDatabase = async () => {
  try {
    await connectDB();

    // Clear existing data
    await Experience.deleteMany({});
    await PromoCode.deleteMany({});

    // Add slots to experiences
    sampleExperiences.forEach(exp => {
      exp.slots = generateSlots();
    });

    // Insert sample data
    await Experience.insertMany(sampleExperiences);
    await PromoCode.insertMany(samplePromoCodes);

    console.log('Database seeded successfully with 8 Indian experiences');
    console.log('All images updated with reliable Unsplash URLs');

    const experienceCount = await Experience.countDocuments();
    const promoCount = await PromoCode.countDocuments();
    
    console.log(`Experiences: ${experienceCount}`);
    console.log(`Promo Codes: ${promoCount}`);

    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();