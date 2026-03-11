const express = require('express');
const router = express.Router();
const Coupon = require('../models/Coupon');
const authMiddleware = require('../middleware/authMiddleware');

// @route   GET /api/coupons/validate
// @desc    Validate a coupon code
// @access  Private
router.get('/validate', authMiddleware, async (req, res) => {
    const { code, subtotal } = req.query;

    try {
        const coupon = await Coupon.findOne({
            code: code.toUpperCase(),
            isActive: true,
            expiryDate: { $gt: new Date() }
        });

        if (!coupon) {
            return res.status(404).json({ message: 'Invalid or expired coupon code' });
        }

        if (subtotal < coupon.minPurchase) {
            return res.status(400).json({
                message: `Minimum purchase of $${coupon.minPurchase} required for this coupon`
            });
        }

        let discount = 0;
        if (coupon.discountType === 'percentage') {
            discount = (subtotal * coupon.discountAmount) / 100;
        } else {
            discount = coupon.discountAmount;
        }

        res.json({
            code: coupon.code,
            discountType: coupon.discountType,
            discountAmount: coupon.discountAmount,
            calculatedDiscount: discount
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   POST /api/coupons/seed
// @desc    Seed some test coupons
// @access  Public (for dev)
router.post('/seed', async (req, res) => {
    try {
        await Coupon.deleteMany();
        const coupons = [
            {
                code: 'WELCOME10',
                discountType: 'percentage',
                discountAmount: 10,
                minPurchase: 50,
                expiryDate: new Date('2026-12-31')
            },
            {
                code: 'FRESH5',
                discountType: 'fixed',
                discountAmount: 5,
                minPurchase: 30,
                expiryDate: new Date('2026-12-31')
            }
        ];
        await Coupon.insertMany(coupons);
        res.json({ message: 'Coupons seeded' });
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

module.exports = router;
