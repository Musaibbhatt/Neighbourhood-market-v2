const express = require('express');
const router = express.Router();
const Offer = require('../models/Offer');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

// @route   GET /api/offers
// @desc    Get all offers
// @access  Public
router.get('/', async (req, res) => {
    try {
        const offers = await Offer.find().populate('applicableProducts', 'name');
        res.json(offers);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   POST /api/offers
// @desc    Create an offer
// @access  Private (SuperAdmin, Manager)
router.post('/', authMiddleware, roleMiddleware('SuperAdmin', 'Manager'), async (req, res) => {
    try {
        const { title, description, discountType, discountValue, applicableProducts } = req.body;

        const newOffer = new Offer({
            title, description, discountType, discountValue, applicableProducts
        });

        const offer = await newOffer.save();
        res.status(201).json(offer);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   DELETE /api/offers/:id
// @desc    Delete an offer
// @access  Private (SuperAdmin, Manager)
router.delete('/:id', authMiddleware, roleMiddleware('SuperAdmin', 'Manager'), async (req, res) => {
    try {
        const offer = await Offer.findById(req.params.id);

        if (!offer) {
            return res.status(404).json({ message: 'Offer not found' });
        }

        await offer.deleteOne();
        res.json({ message: 'Offer removed' });
    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ message: 'Offer not found' });
        }
        res.status(500).send('Server Error');
    }
});

module.exports = router;
