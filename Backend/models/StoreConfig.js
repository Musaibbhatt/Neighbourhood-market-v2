const mongoose = require('mongoose');

const storeConfigSchema = new mongoose.Schema({
    orderingEnabled: {
        type: Boolean,
        default: true
    },
    storeMessage: {
        type: String,
        default: ''
    },
    deliveryEnabled: {
        type: Boolean,
        default: true
    },
    freeDeliveryThreshold: {
        type: Number,
        default: 15
    },
    defaultDeliveryFee: {
        type: Number,
        default: 50
    },
    handlingCharge: {
        type: Number,
        default: 0
    },
    taxRate: {
        type: Number,
        default: 5 // Default 5%
    },
    deliveryZones: [{
        zipCode: String,
        fee: Number
    }],
    openHours: {
        start: String, // e.g., "08:00"
        end: String    // e.g., "21:00"
    },
    instagramUsername: {
        type: String,
        default: 'Neighborhood_market__'
    }
}, { timestamps: true });

module.exports = mongoose.model('StoreConfig', storeConfigSchema);
