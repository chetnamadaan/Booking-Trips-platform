const express = require('express');
const PromoCode = require('../models/PromoCode');
const router = express.Router();

// POST validate promo code
router.post('/validate', async (req, res) => {
  try {
    const { code, amount } = req.body;

    if (!code || amount === undefined) {
      return res.status(400).json({ error: 'Code and amount are required' });
    }

    const promo = await PromoCode.findOne({
      code: code.toUpperCase(),
      isActive: true,
      validFrom: { $lte: new Date() },
      validUntil: { $gte: new Date() }
    });

    if (!promo) {
      return res.json({
        valid: false,
        message: 'Invalid or expired promo code'
      });
    }

    // Check usage limit
    if (promo.usageLimit && promo.usedCount >= promo.usageLimit) {
      return res.json({
        valid: false,
        message: 'Promo code usage limit reached'
      });
    }

    const totalAmount = parseFloat(amount);

    if (totalAmount < promo.minAmount) {
      return res.json({
        valid: false,
        message: `Minimum amount of $${promo.minAmount} required for this promo code`
      });
    }

    let discountAmount = 0;

    if (promo.discountType === 'percentage') {
      discountAmount = (totalAmount * promo.discountValue) / 100;
      if (promo.maxDiscount && discountAmount > promo.maxDiscount) {
        discountAmount = promo.maxDiscount;
      }
    } else if (promo.discountType === 'fixed') {
      discountAmount = promo.discountValue;
    }

    const finalAmount = totalAmount - discountAmount;

    res.json({
      valid: true,
      discount_amount: discountAmount,
      final_amount: finalAmount,
      promo_code: promo
    });

  } catch (error) {
    console.error('Error validating promo code:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;