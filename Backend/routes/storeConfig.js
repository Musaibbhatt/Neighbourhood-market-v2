const express = require('express');
const router = express.Router();
const StoreConfig = require('../models/StoreConfig');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

// @route   GET /api/store-config
// @desc    Get store configuration
// @access  Public
router.get('/', async (req, res) => {
    try {
        let config = await StoreConfig.findOne();
        if (!config) {
            // Create default if not exists
            config = new StoreConfig();
            await config.save();
        }
        res.json(config);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// @route   PUT /api/store-config
// @desc    Update store configuration
// @access  Private (SuperAdmin)
router.put('/', authMiddleware, roleMiddleware('SuperAdmin'), async (req, res) => {
    try {
        let config = await StoreConfig.findOne();
        if (!config) config = new StoreConfig();

        const {
            orderingEnabled, storeMessage, deliveryEnabled,
            freeDeliveryThreshold, defaultDeliveryFee, handlingCharge,
            taxRate, deliveryZones, openHours
        } = req.body;

        if (orderingEnabled !== undefined) config.orderingEnabled = orderingEnabled;
        if (storeMessage !== undefined) config.storeMessage = storeMessage;
        if (deliveryEnabled !== undefined) config.deliveryEnabled = deliveryEnabled;
        if (freeDeliveryThreshold !== undefined) config.freeDeliveryThreshold = freeDeliveryThreshold;
        if (defaultDeliveryFee !== undefined) config.defaultDeliveryFee = defaultDeliveryFee;
        if (handlingCharge !== undefined) config.handlingCharge = handlingCharge;
        if (taxRate !== undefined) config.taxRate = taxRate;
        if (deliveryZones !== undefined) config.deliveryZones = deliveryZones;
        if (openHours !== undefined) config.openHours = openHours;

        await config.save();
        res.json(config);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
