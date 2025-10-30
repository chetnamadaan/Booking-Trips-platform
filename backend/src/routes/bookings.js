const express = require('express');
const { body, validationResult } = require('express-validator');
const Experience = require('../models/Experience');
const Booking = require('../models/Booking');
const PromoCode = require('../models/PromoCode');
const router = express.Router();

// POST create booking (without transactions for standalone MongoDB)
router.post('/', [
  body('experienceId').isMongoId(),
  body('slotId').isMongoId(),
  body('customerName').notEmpty().trim(),
  body('customerEmail').isEmail(),
  body('customerPhone').optional().trim(),
  body('participants').isInt({ min: 1 }),
  body('promoCode').optional().trim()
], async (req, res) => {
  try {
    console.log('📦 Received booking request body:', req.body);
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('❌ Validation errors:', errors.array());
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      experienceId,
      slotId,
      customerName,
      customerEmail,
      customerPhone,
      participants,
      promoCode
    } = req.body;

    console.log('🔍 Step 1: Finding experience...');
    // Find experience and specific slot
    const experience = await Experience.findById(experienceId);
    if (!experience) {
      console.log('❌ Experience not found:', experienceId);
      return res.status(404).json({ error: 'Experience not found' });
    }
    console.log('✅ Experience found:', experience.title);

    console.log('🔍 Step 2: Finding slot...');
    const slot = experience.slots.id(slotId);
    if (!slot) {
      console.log('❌ Slot not found:', slotId);
      return res.status(404).json({ error: 'Slot not found' });
    }
    console.log('✅ Slot found:', slot.date, slot.startTime);

    // Check slot availability
    if (slot.availableSpots < participants) {
      console.log('❌ Not enough spots. Available:', slot.availableSpots, 'Requested:', participants);
      return res.status(400).json({ error: 'Not enough available spots' });
    }
    console.log('✅ Slot availability confirmed');

    // Calculate prices
    let totalPrice = experience.price * participants;
    let discountAmount = 0;
    let finalPrice = totalPrice;

    console.log('💰 Price calculation:', { basePrice: experience.price, participants, totalPrice });

    // Apply promo code if provided
    if (promoCode) {
      console.log('🎫 Applying promo code:', promoCode);
      const promo = await PromoCode.findOne({
        code: promoCode.toUpperCase(),
        isActive: true,
        validFrom: { $lte: new Date() },
        validUntil: { $gte: new Date() }
      });

      if (promo) {
        console.log('✅ Promo code found:', promo.code);
        // Check usage limit
        if (promo.usageLimit && promo.usedCount >= promo.usageLimit) {
          console.log('❌ Promo code usage limit reached');
        } else if (totalPrice >= promo.minAmount) {
          if (promo.discountType === 'percentage') {
            discountAmount = (totalPrice * promo.discountValue) / 100;
            if (promo.maxDiscount && discountAmount > promo.maxDiscount) {
              discountAmount = promo.maxDiscount;
            }
          } else if (promo.discountType === 'fixed') {
            discountAmount = promo.discountValue;
          }
          
          finalPrice = totalPrice - discountAmount;

          // Update promo code usage
          promo.usedCount += 1;
          await promo.save();
          console.log('✅ Promo applied. Discount:', discountAmount, 'Final price:', finalPrice);
        } else {
          console.log('❌ Minimum amount not met for promo');
        }
      } else {
        console.log('❌ Promo code not found or invalid');
      }
    }

    // Generate booking reference
    const bookingReference = 'BK' + Date.now() + Math.random().toString(36).substr(2, 5).toUpperCase();
    console.log('📝 Generated booking reference:', bookingReference);

    // Create booking
    console.log('💾 Creating booking document...');
    const booking = new Booking({
      experience: experienceId,
      slotId: slotId,
      customerName,
      customerEmail,
      customerPhone,
      participants,
      totalPrice,
      promoCode: promoCode || undefined,
      discountAmount,
      finalPrice,
      bookingReference
    });

    await booking.save();
    console.log('✅ Booking saved to database');

    // Update available spots
    console.log('🔄 Updating slot availability...');
    slot.availableSpots -= participants;
    await experience.save();
    console.log('✅ Slot availability updated');

    // Populate experience details for response
    console.log('🔍 Populating booking details...');
    const populatedBooking = await Booking.findById(booking._id)
      .populate('experience', 'title location imageUrl');

    console.log('🎉 Booking completed successfully! Reference:', bookingReference);

    res.status(201).json({
      success: true,
      booking: populatedBooking,
      message: 'Booking confirmed successfully'
    });

  } catch (error) {
    console.error('💥 Error creating booking:', error);
    res.status(500).json({ error: 'Internal server error: ' + error.message });
  }
});

module.exports = router;