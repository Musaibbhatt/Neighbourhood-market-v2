const mongoose = require('mongoose');

const stockNotificationSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    email: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['Pending', 'Notified'],
        default: 'Pending'
    }
}, { timestamps: true });

module.exports = mongoose.model('StockNotification', stockNotificationSchema);
