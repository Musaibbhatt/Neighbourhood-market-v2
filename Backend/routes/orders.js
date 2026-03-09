const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

const User = require('../models/User');

// @route   POST /api/orders
// @desc    Create new order
// @access  Public (Optional Auth for user linking)
router.post('/', async (req, res) => {
    try {
        const {
            customerName, phone, address, products, totalPrice,
            orderType, subtotal, deliveryFee, tip, paymentMethod, userId,
            discountAmount, couponCode, notes // Added notes
        } = req.body;

        if (!products || products.length === 0) {
            return res.status(400).json({ message: 'No order items' });
        }

        // Try to get user from token if available
        let linkedUserId = userId;
        const authHeader = req.header('Authorization');
        if (authHeader) {
            try {
                const tokenString = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : authHeader;
                const jwt = require('jsonwebtoken'); // Ensure jwt is available
                const decoded = jwt.verify(tokenString, process.env.JWT_SECRET);
                linkedUserId = decoded.user.id;
            } catch (err) {
                // Ignore invalid tokens for creation
            }
        }

        const order = new Order({
            user: linkedUserId,
            customerName,
            phone,
            address,
            deliveryType: orderType || 'Delivery',
            products,
            subtotal,
            deliveryFee: deliveryFee || 0,
            tipAmount: tip || 0,
            totalPrice,
            discountAmount: discountAmount || 0,
            couponCode: couponCode || null,
            paymentMethod: paymentMethod || 'Cash',
            orderStatus: 'Order Received',
            statusHistory: [{ status: 'Order Received', timestamp: new Date() }],
            notes // Added notes
        });

        const createdOrder = await order.save();

        // Award loyalty points if user is logged in
        if (linkedUserId) {
            const pointsEarned = Math.floor(totalPrice); // 1 point per $1
            await User.findByIdAndUpdate(linkedUserId, {
                $inc: { loyaltyPoints: pointsEarned }
            });
        }

        res.status(201).json(createdOrder);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET /api/orders
// @desc    Get all orders
// @access  Private (SuperAdmin, Manager, Staff)
router.get('/', authMiddleware, roleMiddleware('SuperAdmin', 'Manager', 'Staff'), async (req, res) => {
    try {
        const orders = await Order.find().sort({ createdAt: -1 }).populate('products.product', 'name imageURL');
        res.json(orders);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// IMPORTANT: Declare static sub-routes BEFORE '/:id' to avoid conflicts.
// @route   GET /api/orders/export
// @desc    Export orders as CSV (Admin)
// @access  Private (SuperAdmin, Manager)
router.get('/export', authMiddleware, roleMiddleware('SuperAdmin', 'Manager'), async (req, res) => {
    try {
        const orders = await Order.find().sort({ createdAt: -1 });

        // Simple CSV construction
        let csv = 'Order ID,Date,Customer,Phone,Status,Total,Items,Notes\n';
        orders.forEach(o => {
            const items = o.products.map(p => `${p.name} (x${p.quantity})`).join('; ');
            const date = o.createdAt.toISOString().split('T')[0];
            const row = [
                o._id,
                date,
                `"${o.customerName}"`,
                o.phone,
                o.orderStatus,
                o.totalPrice,
                `"${items}"`,
                `"${o.notes || ''}"`
            ].join(',');
            csv += row + '\n';
        });

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=orders_export.csv');
        res.status(200).send(csv);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// @route   GET /api/orders/my-orders
// @desc    Get current user's orders
// @access  Private
router.get('/my-orders', authMiddleware, async (req, res) => {
    try {
        const orders = await Order.find({ user: req.user.id }).sort({ createdAt: -1 });
        res.json(orders);
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

// @route   GET /api/orders/:id
// @desc    Get order by id
router.get('/:id', async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        if (!order) return res.status(404).json({ message: 'Order not found' });
        res.json(order);
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

// @route   PUT /api/orders/:id/cancel
// @desc    Cancel order (Public/Customer)
router.put('/:id/cancel', async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        if (!order) return res.status(404).json({ message: 'Order not found' });

        // Safety check: only cancel if still "Order Received"
        if (order.orderStatus !== 'Order Received') {
            return res.status(400).json({ message: 'Order cannot be cancelled at this stage.' });
        }

        order.orderStatus = 'Cancelled';
        order.isCancelled = true;
        order.statusHistory.push({ status: 'Cancelled', timestamp: new Date() });

        await order.save();
        res.json(order);
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

// @route   PUT /api/orders/:id
// @desc    Update order status
// @access  Private (SuperAdmin, Manager, Staff)
router.put('/:id', authMiddleware, roleMiddleware('SuperAdmin', 'Manager', 'Staff'), async (req, res) => {
    try {
        const { orderStatus } = req.body;
        const order = await Order.findById(req.params.id);

        if (!order) return res.status(404).json({ message: 'Order not found' });

        order.orderStatus = orderStatus;
        order.statusHistory.push({ status: orderStatus, timestamp: new Date() });

        await order.save();
        res.json(order);
    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ message: 'Order not found' });
        }
        res.status(500).send('Server Error');
    }
});

// @route   POST /api/orders/:id/return-request
// @desc    Submit a refund or replacement request
router.post('/:id/return-request', async (req, res) => {
    try {
        const { requestType, reason } = req.body;
        const order = await Order.findById(req.params.id);

        if (!order) return res.status(404).json({ message: 'Order not found' });
        if (order.orderStatus !== 'Delivered') {
            return res.status(400).json({ message: 'Returns can only be requested for delivered orders.' });
        }

        order.returnRequest = {
            requestType,
            reason,
            status: 'Pending',
            createdAt: new Date()
        };

        await order.save();
        res.json(order);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// @route   PUT /api/orders/:id/return-status
// @desc    Update return request status (Admin)
// @access  Private (SuperAdmin, Manager)
router.put('/:id/return-status', authMiddleware, roleMiddleware('SuperAdmin', 'Manager'), async (req, res) => {
    try {
        const { status, adminNotes } = req.body;
        const order = await Order.findById(req.params.id);

        if (!order) return res.status(404).json({ message: 'Order not found' });
        if (!order.returnRequest) {
            return res.status(400).json({ message: 'No return request found for this order.' });
        }

        order.returnRequest.status = status;
        if (adminNotes) order.returnRequest.adminNotes = adminNotes;

        await order.save();
        res.json(order);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// @route   GET /api/orders/export
// @desc    Export orders as CSV (Admin)
// @access  Private (SuperAdmin, Manager)
module.exports = router;
