const express = require('express');
const router = express.Router();
const User = require('../models/User');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

// @route   GET /api/admin-users
// @desc    Get all customers
// @access  Private (SuperAdmin, Manager)
router.get('/', authMiddleware, roleMiddleware('SuperAdmin', 'Manager'), async (req, res) => {
    try {
        const users = await User.find().select('-password').sort({ createdAt: -1 });
        res.json(users);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// @route   PUT /api/admin-users/:id
// @desc    Update customer details (loyaltyPoints, etc)
// @access  Private (SuperAdmin)
router.put('/:id', authMiddleware, roleMiddleware('SuperAdmin'), async (req, res) => {
    const { loyaltyPoints, name, mobile } = req.body;
    try {
        let user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        if (loyaltyPoints !== undefined) user.loyaltyPoints = loyaltyPoints;
        if (name) user.name = name;
        if (mobile) user.mobile = mobile;

        await user.save();
        res.json(user);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
