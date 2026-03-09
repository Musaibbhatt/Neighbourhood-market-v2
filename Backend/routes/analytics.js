const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Order = require('../models/Order');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

// @route   GET /api/admin/analytics
// @desc    Get dashboard analytics
// @access  Private (Admin)
router.get('/', authMiddleware, roleMiddleware('admin', 'SuperAdmin', 'Manager'), async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const totalOrders = await Order.countDocuments();

        const orders = await Order.find({ orderStatus: { $ne: 'Cancelled' } });
        const revenue = orders.reduce((acc, order) => acc + (order.totalPrice || 0), 0);

        res.json({
            totalUsers,
            totalOrders,
            totalRevenue: revenue,
            recentOrders: await Order.find().sort({ createdAt: -1 }).limit(5)
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
