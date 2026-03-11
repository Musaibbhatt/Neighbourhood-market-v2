const express = require('express');
const router = express.Router();

const Newsletter = require('../models/Newsletter');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');


// Subscribe to newsletter
router.post('/subscribe', async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ message: "Email is required" });
        }

        const existing = await Newsletter.findOne({ email });

        if (existing) {
            return res.status(400).json({ message: "Already subscribed" });
        }

        const subscriber = new Newsletter({ email });
        await subscriber.save();

        res.status(201).json({ message: "Subscribed successfully" });

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});


// Get subscribers (Admin only)
router.get(
    '/subscribers',
    authMiddleware,
    roleMiddleware('SuperAdmin', 'Manager'),
    async (req, res) => {
        try {

            const subscribers = await Newsletter.find().sort({ subscribedAt: -1 });

            res.json(subscribers);

        } catch (err) {
            res.status(500).json({ message: err.message });
        }
    }
);

module.exports = router;