const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    name: { type: String, required: true },
    variant: { type: String }, // User selected variant name, if any
    price: { type: Number, required: true },
    quantity: { type: Number, required: true, min: 1 }
});

const orderSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    customerName: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true
    },
    address: {
        type: String,
        required: true
    },
    zipCode: String,
    deliveryType: {
        type: String,
        enum: ['Delivery', 'Pickup'],
        default: 'Delivery'
    },
    products: [orderItemSchema],
    subtotal: {
        type: Number,
        required: true
    },
    deliveryFee: {
        type: Number,
        default: 0
    },
    handlingFee: {
        type: Number,
        default: 0
    },
    tax: {
        type: Number,
        default: 0
    },
    tipAmount: {
        type: Number,
        default: 0
    },
    totalPrice: {
        type: Number,
        required: true
    },
    notes: {
        type: String
    },
    discountAmount: {
        type: Number,
        default: 0
    },
    couponCode: {
        type: String,
        trim: true
    },
    paymentMethod: {
        type: String,
        enum: ['Cash', 'Card', 'UPI', 'PayPal'],
        default: 'Cash'
    },
    orderStatus: {
        type: String,
        enum: ['Pending', 'Order Received', 'Packed', 'Out for Delivery', 'Delivered', 'Cancelled'],
        default: 'Pending'
    },
    statusHistory: [{
        status: String,
        timestamp: { type: Date, default: Date.now }
    }],
    isCancelled: {
        type: Boolean,
        default: false
    },
    returnRequest: {
        requestType: { type: String, enum: ['Refund', 'Replacement'] },
        reason: String,
        status: { type: String, enum: ['Pending', 'Approved', 'Rejected', 'Completed'], default: 'Pending' },
        adminNotes: String,
        createdAt: { type: Date }
    }
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
