const mongoose = require('mongoose');

const offerSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String
    },
    discountType: {
        type: String,
        enum: ['percentage', 'fixed', 'bogo'], // bogo = buy one get one
        required: true
    },
    discountValue: {
        type: Number,
        required: true // percentage or fixed amount
    },
    applicableProducts: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
    }] // If empty, could apply to all
}, { timestamps: true });

module.exports = mongoose.model('Offer', offerSchema);
