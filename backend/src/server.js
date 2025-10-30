const express = require('express');
const cors = require('cors');
require('dotenv').config();

const connectDB = require('./config/database');
const experienceRoutes = require('./routes/experiences');
const bookingRoutes = require('./routes/bookings');
const promoRoutes = require('./routes/promo');

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors({
  origin: [
    'https://booking-trips-platform-1.onrender.com',
    'http://localhost:3000'
  ],
  credentials: true
}));
app.use(express.json());

// Routes
app.use('/api/experiences', experienceRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/promo', promoRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Highway Delight API is running',
    database: 'MongoDB'
  });
});

// TEMPORARY: Database seeding endpoint - REMOVE AFTER USE
app.post('/api/seed-database', async (req, res) => {
  try {
    console.log('Starting database seeding...');
    
    // Import models and data directly
    const Experience = require('./models/Experience');
    const PromoCode = require('./models/PromoCode');
    
    // Sample experiences data
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
        slots: generateSlots()
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
        slots: generateSlots()
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
        slots: generateSlots()
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
        slots: generateSlots()
      },
      {
        title: 'Bungee Jumping',
        description: 'Curated small-group experience. Certified guide. Safety first with gear included. Experience the thrill of bungee jumping in Manali with professional safety standards.',
        imageUrl: 'https://images.unsplash.com/photo-1574359411659-619743e1496c?w=500&auto=format&fit=crop',
        location: 'Manali',
        price: 999,
        durationHours: 2,
        maxPeople: 6,
        category: 'Adventure',
        rating: 4.9,
        reviewCount: 278,
        slots: generateSlots()
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
        slots: generateSlots()
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
        slots: generateSlots()
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
        slots: generateSlots()
      }
    ];

    // Sample promo codes
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

    // Clear existing data
    await Experience.deleteMany({});
    await PromoCode.deleteMany({});

    // Insert new data
    await Experience.insertMany(sampleExperiences);
    await PromoCode.insertMany(samplePromoCodes);

    console.log('Database seeded successfully!');
    
    res.json({ 
      success: true, 
      message: 'Database seeded successfully with 8 Indian experiences and 2 promo codes',
      data: {
        experiences: sampleExperiences.length,
        promo_codes: samplePromoCodes.length
      }
    });
  } catch (error) {
    console.error('Seeding error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Helper function to generate slots
function generateSlots() {
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
  }
  return slots;
}

// TEMPORARY: Check if database is seeded - REMOVE AFTER USE
app.get('/api/check-data', async (req, res) => {
  try {
    const Experience = require('./models/Experience');
    const PromoCode = require('./models/PromoCode');
    
    const experienceCount = await Experience.countDocuments();
    const promoCount = await PromoCode.countDocuments();
    
    res.json({
      experiences: experienceCount,
      promo_codes: promoCount,
      status: experienceCount > 0 ? 'Seeded' : 'Empty'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// FIXED: 404 handler - removed the problematic '*' route
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`MongoDB URI: ${process.env.MONGODB_URI}`);
});